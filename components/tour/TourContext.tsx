// Vurgulamalı kullanım turu (ipuçları). Sayfa karşılama ekranlarının yerine ilk girişte çalışır;
// karşılama ekranları info simgesinden açılmaya devam eder.
//
// Kullanım:
//   const t = useTourTarget("home.tabs");   <View ref={t.ref} collapsable={false}>...</View>
//   useTour("home", HOME_STEPS, { ready: isFocused });
// Hedef ölçüsü tur katmanının KENDİ köküne göre alınır (hedef ve katman aynı anda measureInWindow
// ile ölçülür, fark alınır). Android'de measureInWindow durum çubuğu kadar kayık değer döndürebiliyor
// (kenardan kenara çizim, kesik, gezinme çubuğu türüne göre değişir); iki ölçüm aynı sistemde olduğu
// için kayma birbirini götürür. Tur açıkken hedef 250 ms'de bir yeniden ölçülür: banner gelmesi,
// yazı tipi yüklenmesi, klavye gibi sonradan olan düzen değişimlerinde vurgu hedefi izler.
// Ekran dışındaki hedef için ekran useTourScroll ile kaydırma kabını bildirir; tur hedefi görünür alana kaydırır.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions, LayoutChangeEvent, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SpotlightOverlay from "./SpotlightOverlay";
import type { TourStep } from "./tours";

export type TourRect = { x: number; y: number; w: number; h: number };

const seenKey = (id: string) => `@tour_seen_${id}_v1`;
const ALL_TOURS_KEY = "@tour_ids_v1";
// Bu oturumda bitirilen turlar: kayıt arkada yazılırken tur yeniden başlamasın.
const seenThisSession = new Set<string>();

type Scroller = { ref: React.RefObject<ScrollView | null>; offset: { current: number } };

type Ctx = {
  /** Uygulama tur göstermeye hazır mı (açılış animasyonu ve sorumluluk onayı bitti). */
  gateOpen: boolean;
  registerTarget: (id: string, node: View | null) => void;
  registerScroller: (tourId: string, s: Scroller | null) => void;
  start: (tourId: string, steps: TourStep[]) => void;
  activeTourId: string | null;
};

const TourCtx = createContext<Ctx | null>(null);

// Ekrandan ayrılmış görünümde measureInWindow geri dönüşü hiç çağrılmayabiliyor:
// 400 ms içinde cevap gelmezse hedef yok sayılır (tur takılıp dokunuşları yutmasın).
const measureWindow = (node: View | null): Promise<TourRect | null> =>
  new Promise((resolve) => {
    if (!node) return resolve(null);
    let done = false;
    const finishWith = (r: TourRect | null) => {
      if (done) return;
      done = true;
      resolve(r);
    };
    const timer = setTimeout(() => finishWith(null), 400);
    try {
      node.measureInWindow((x, y, w, h) => {
        clearTimeout(timer);
        finishWith(w && h ? { x, y, w, h } : null);
      });
    } catch {
      clearTimeout(timer);
      finishWith(null);
    }
  });

/** Hedefin, tur katmanının köküne göre konumu. İki ölçüm aynı anda alınır, sistem kayması birbirini götürür. */
const measureIn = async (node: View | null, host: View | null): Promise<TourRect | null> => {
  const [r, h] = await Promise.all([measureWindow(node), measureWindow(host)]);
  if (!r) return null;
  return { x: r.x - (h?.x ?? 0), y: r.y - (h?.y ?? 0), w: r.w, h: r.h };
};

const sameRect = (a: TourRect | null, b: TourRect | null) =>
  !!a && !!b && Math.abs(a.x - b.x) < 0.75 && Math.abs(a.y - b.y) < 0.75 && Math.abs(a.w - b.w) < 0.75 && Math.abs(a.h - b.h) < 0.75;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function TourProvider({ children, gateOpen }: { children: React.ReactNode; gateOpen: boolean }) {
  const targets = useRef(new Map<string, View>());
  const scrollers = useRef(new Map<string, Scroller>());
  const win = useWindowDimensions();
  // Tur katmanının kökü: her zaman ekranda (dokunuş almaz), ölçümlerin başvuru noktası ve boyutu.
  const host = useRef<View | null>(null);
  const [frame, setFrame] = useState<{ w: number; h: number } | null>(null);
  const onHostLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setFrame((f) => (f && Math.abs(f.w - width) < 0.5 && Math.abs(f.h - height) < 0.5 ? f : { w: width, h: height }));
  }, []);
  const W = frame?.w ?? win.width;
  const H = frame?.h ?? win.height;
  const measure = useCallback((node: View | null) => measureIn(node, host.current), []);
  // Uzun hedefler ekranın %42'siyle sınırlanır: açıklama kartı görünür kalsın.
  const clampRect = useCallback(
    (r: TourRect): TourRect => {
      const top = Math.max(r.y, 8);
      const bottom = Math.min(r.y + r.h, top + H * 0.42);
      return { x: r.x, y: top, w: r.w, h: Math.max(36, bottom - top) };
    },
    [H],
  );

  const [tour, setTour] = useState<{ id: string; steps: TourStep[] } | null>(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<TourRect | null>(null);
  const [measuring, setMeasuring] = useState(false);

  const registerTarget = useCallback((id: string, node: View | null) => {
    if (node) targets.current.set(id, node);
    else targets.current.delete(id);
  }, []);

  const registerScroller = useCallback((tourId: string, s: Scroller | null) => {
    if (s) scrollers.current.set(tourId, s);
    else scrollers.current.delete(tourId);
  }, []);

  // Tur başlarken hedefler yoklanır: kayıtlı olmayan ya da boyutu sıfır olan adım (ör. tüketim görseli
  // olmayan ürün) baştan çıkarılır. Böylece sayaç doğru olur ("4/5"te biten tur görünmez).
  const starting = useRef(false);
  const start = useCallback(
    (id: string, steps: TourStep[]) => {
      if (starting.current) return;
      starting.current = true;
      (async () => {
        const present = await Promise.all(steps.map((st) => measure(targets.current.get(st.target) ?? null)));
        const available = steps.filter((_, i) => !!present[i]);
        starting.current = false;
        if (!available.length) return;
        setTour((cur) => cur ?? { id, steps: available });
        setIndex(0);
      })();
    },
    [measure],
  );

  // Katman ANINDA kalkar, "görüldü" kaydı arkada yazılır. Önceden kayıt bitmeden katman
  // kalkmıyordu; depolama yavaşken görünmez katman saniyelerce dokunuşları yutuyordu.
  const finish = useCallback(() => {
    const id = tour?.id;
    if (id) seenThisSession.add(id);
    setTour(null);
    setRect(null);
    setIndex(0);
    setMeasuring(false);
    if (!id) return;
    (async () => {
      await AsyncStorage.setItem(seenKey(id), "1").catch(() => {});
      const list = JSON.parse((await AsyncStorage.getItem(ALL_TOURS_KEY).catch(() => null)) || "[]");
      if (!list.includes(id)) {
        await AsyncStorage.setItem(ALL_TOURS_KEY, JSON.stringify([...list, id])).catch(() => {});
      }
    })();
  }, [tour]);

  // Adım değişince hedefi bul, gerekirse kaydır, ölç. Bulunamayan hedef atlanır.
  useEffect(() => {
    if (!tour) return;
    let cancelled = false;
    (async () => {
      setMeasuring(true);
      let i = index;
      while (i < tour.steps.length) {
        const step = tour.steps[i];
        const node = targets.current.get(step.target) ?? null;
        let r = await measure(node);
        if (r) {
          const scroller = scrollers.current.get(tour.id);
          const outOfView = r.y < 90 || r.y + Math.min(r.h, H * 0.4) > H - 120;
          if (scroller && outOfView) {
            const dy = r.y - H * 0.3;
            scroller.ref.current?.scrollTo({ y: Math.max(0, scroller.offset.current + dy), animated: true });
            await wait(420);
            // Kaydırmadan sonraki ölçüm boşa düşerse ilk ölçüm kullanılır (adım atlanmasın).
            const after = await measure(node);
            if (after) r = after;
          }
        }
        if (cancelled) return;
        if (r) {
          setRect(clampRect(r));
          if (i !== index) setIndex(i);
          break;
        }
        i++;
      }
      if (!cancelled) {
        setMeasuring(false);
        if (i >= tour.steps.length) finish();
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour, index]);

  // Canlı izleme: adım ekrandayken hedef yeniden ölçülür, yeri ya da boyutu değiştiyse delik oraya akar.
  // Ekran boyutu değişince (döndürme, bölünmüş ekran) de aynı döngü yeni ölçüyü alır.
  useEffect(() => {
    if (!tour || measuring) return;
    const node = targets.current.get(tour.steps[index]?.target) ?? null;
    if (!node) return;
    let cancelled = false;
    let busy = false;
    const tick = async () => {
      if (busy) return;
      busy = true;
      const r = await measure(node);
      busy = false;
      if (cancelled || !r) return;
      const nextRect = clampRect(r);
      setRect((cur) => (sameRect(cur, nextRect) ? cur : nextRect));
    };
    const id = setInterval(tick, 250);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [tour, index, measuring, measure, clampRect]);

  const next = useCallback(() => {
    if (!tour || measuring) return;
    if (index < tour.steps.length - 1) setIndex(index + 1);
    else finish();
  }, [tour, index, measuring, finish]);

  const value = useMemo<Ctx>(
    () => ({ gateOpen, registerTarget, registerScroller, start, activeTourId: tour?.id ?? null }),
    [gateOpen, registerTarget, registerScroller, start, tour?.id],
  );

  return (
    <TourCtx.Provider value={value}>
      {children}
      <View
        ref={host}
        collapsable={false}
        onLayout={onHostLayout}
        style={StyleSheet.absoluteFill}
        pointerEvents={tour && rect ? "box-none" : "none"}
      >
        {tour && rect ? (
          <SpotlightOverlay
            step={tour.steps[index]}
            index={index}
            total={tour.steps.length}
            rect={rect}
            frame={{ w: W, h: H }}
            onNext={next}
            onSkip={finish}
          />
        ) : null}
      </View>
    </TourCtx.Provider>
  );
}

const useTourCtx = () => useContext(TourCtx);

/** Bir öğeyi tur hedefi yapar. Dönen ref, collapsable={false} olan bir View'a verilir. */
export function useTourTarget(id: string) {
  const ctx = useTourCtx();
  const ref = useCallback((node: View | null) => ctx?.registerTarget(id, node), [ctx, id]);
  return { ref, collapsable: false as const };
}

/** Turun hedefleri kaydırılabilir bir sayfadaysa: ScrollView'a bu prop'ları ver. */
export function useTourScroll(tourId: string) {
  const ctx = useTourCtx();
  const ref = useRef<ScrollView | null>(null);
  const offset = useRef(0);
  useEffect(() => {
    ctx?.registerScroller(tourId, { ref, offset });
    return () => ctx?.registerScroller(tourId, null);
  }, [ctx, tourId]);
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offset.current = e.nativeEvent.contentOffset.y;
  }, []);
  return { ref, onScroll, scrollEventThrottle: 32 };
}

/**
 * Sayfa hazır olduğunda (odakta, içerik çizilmiş) turu bir kez başlatır.
 * delay: sayfa geçiş animasyonu bitsin diye bekleme.
 */
export function useTour(tourId: string, steps: TourStep[], { ready, delay = 650 }: { ready: boolean; delay?: number }) {
  const ctx = useTourCtx();
  const gateOpen = ctx?.gateOpen ?? false;
  const busy = ctx?.activeTourId != null;
  useEffect(() => {
    if (!ctx || !ready || !gateOpen || busy) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (seenThisSession.has(tourId)) return;
      const seen = await AsyncStorage.getItem(seenKey(tourId)).catch(() => "1");
      if (!cancelled && !seen) ctx.start(tourId, steps);
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, ready, gateOpen, busy, tourId]);
}

/**
 * Sayfanın info simgesi için: turu, daha önce görülmüş olsa da hemen başlatır.
 * Karşılama ekranlarının yerini alır (aynı bilgiyi sayfanın kendi üstünde gösterir).
 */
export function useTourReplay(tourId: string, steps: TourStep[]) {
  const ctx = useTourCtx();
  return useCallback(() => {
    if (!ctx || ctx.activeTourId) return;
    ctx.start(tourId, steps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, tourId]);
}

/** Ayarlar: tüm turları yeniden göster. */
export async function resetAllTours() {
  const list: string[] = JSON.parse((await AsyncStorage.getItem(ALL_TOURS_KEY).catch(() => null)) || "[]");
  const ids = new Set([...list, "home", "result", "guru", "nutrition", "encyclopedia"]);
  seenThisSession.clear();
  await AsyncStorage.multiRemove([...ids].map(seenKey)).catch(() => {});
}
