// Vurgulamalı kullanım turu (ipuçları). Sayfa karşılama ekranlarının yerine ilk girişte çalışır;
// karşılama ekranları info simgesinden açılmaya devam eder.
//
// Kullanım:
//   const t = useTourTarget("home.tabs");   <View ref={t.ref} collapsable={false}>...</View>
//   useTour("home", HOME_STEPS, { ready: isFocused });
// Hedef ölçüsü measureInWindow ile tur anında alınır. Ekran dışındaki hedef için ekran
// useTourScroll ile kaydırma kabını bildirir; tur hedefi görünür alana kaydırır.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SpotlightOverlay from "./SpotlightOverlay";
import type { TourStep } from "./tours";

export type TourRect = { x: number; y: number; w: number; h: number };

const seenKey = (id: string) => `@tour_seen_${id}_v1`;
const ALL_TOURS_KEY = "@tour_ids_v1";

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

const measure = (node: View | null): Promise<TourRect | null> =>
  new Promise((resolve) => {
    if (!node) return resolve(null);
    try {
      node.measureInWindow((x, y, w, h) => {
        if (!w || !h) return resolve(null);
        resolve({ x, y, w, h });
      });
    } catch {
      resolve(null);
    }
  });

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function TourProvider({ children, gateOpen }: { children: React.ReactNode; gateOpen: boolean }) {
  const targets = useRef(new Map<string, View>());
  const scrollers = useRef(new Map<string, Scroller>());
  const { height: H } = useWindowDimensions();

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

  const start = useCallback((id: string, steps: TourStep[]) => {
    setTour((cur) => cur ?? { id, steps });
    setIndex(0);
  }, []);

  const finish = useCallback(async () => {
    if (tour) {
      await AsyncStorage.setItem(seenKey(tour.id), "1").catch(() => {});
      const list = JSON.parse((await AsyncStorage.getItem(ALL_TOURS_KEY).catch(() => null)) || "[]");
      if (!list.includes(tour.id)) {
        await AsyncStorage.setItem(ALL_TOURS_KEY, JSON.stringify([...list, tour.id])).catch(() => {});
      }
    }
    setTour(null);
    setRect(null);
    setIndex(0);
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
            r = await measure(node);
          }
        }
        if (cancelled) return;
        if (r) {
          // Uzun hedefler ekranın %42'siyle sınırlanır: açıklama kartı görünür kalsın.
          const top = Math.max(r.y, 8);
          const bottom = Math.min(r.y + r.h, top + H * 0.42);
          setRect({ x: r.x, y: top, w: r.w, h: Math.max(36, bottom - top) });
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
      {tour && rect ? (
        <SpotlightOverlay
          step={tour.steps[index]}
          index={index}
          total={tour.steps.length}
          rect={rect}
          onNext={next}
          onSkip={finish}
        />
      ) : null}
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
  await AsyncStorage.multiRemove([...ids].map(seenKey)).catch(() => {});
}
