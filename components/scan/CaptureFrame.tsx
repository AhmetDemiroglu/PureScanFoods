// Fotoğraf çekim çerçevesi. Arayüz dikey kilitli kalır; telefonun FİZİKSEL tutuşu yerçekiminden
// okunur, çerçeve ona göre şekil değiştirir ve yazılar kullanıcıya döner. Böylece telefondaki
// ekran döndürme kilidi açık da olsa kapalı da olsa kamera aynı davranır.
//
// Hareket dili SpotlightOverlay ile ortak: ölçü değişimi tek seferlik yayla akar, sürekli dönen
// animasyonlar (tarama ışığı, telefon ipucu) YALNIZ transform ve opacity yazar. Sürekli animasyonun
// konum ya da ölçü yazması her karede tüm ağacın yerleşimini yeniden hesaplatıyor ve dokunuşları
// geciktiriyor (bkz. SpotlightOverlay'deki performans notu).

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Animated, {
  Easing,
  SensorType,
  cancelAnimation,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedSensor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Text } from "../ui/AppText";
import { useTheme } from "../../context/ThemeContext";
import {
  GAP,
  MIN_H,
  MIN_W,
  clamp,
  geometry,
  isSide,
  spinFor,
  turnFromGravity,
  type Box,
  type Frame,
  type Geo,
  type Size,
  type Turn,
} from "./captureGeometry";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SPRING = { damping: 19, stiffness: 170, mass: 0.9 };
const DIM = "rgba(0,0,0,0.5)";
const HANDLE = 44;
const BRACKET = 38;
const SIDE_LINE = 26;
/** Yerçekimi ~8 Hz okunur: tutuş değişimi anında görünür, pil ve köprü yükü düşük kalır. */
const SENSOR_INTERVAL = 120;

type Props = {
  /** Kameranın canlı olup olmadığı: tarama ışığı yalnız canlıyken döner. */
  live: boolean;
  /** Üst başlık satırının bittiği y (kapsayıcıya göre). */
  topOffset: number;
  /** Alt kontrollerin kapladığı yükseklik (kapsayıcının altından). */
  bottomOffset: number;
  /** Deklanşör anında okunacak çerçeve. Kırpma bundan hesaplanır. */
  geoRef: React.MutableRefObject<Frame | null>;
  /** Tutuş değişince üst ekran da simgelerini döndürsün diye bildirilir. */
  onTurnChange: (turn: Turn) => void;
};

/**
 * Telefonun fiziksel tutuşunu yerçekiminden okur. Yalnız bu bileşen ekrandayken kayıtlıdır:
 * barkod sekmesinde ve kamera kapalıyken sensör çalışmaz.
 */
function useDeviceTurn(): Turn {
  const [turn, setTurn] = useState<Turn>(0);
  const gravity = useAnimatedSensor(SensorType.GRAVITY, {
    interval: SENSOR_INTERVAL,
    adjustToInterfaceOrientation: false,
  });
  const last = useSharedValue<Turn>(0);

  useAnimatedReaction(
    () => {
      const { x, y } = gravity.sensor.value;
      // Sensör yoksa (simülatör) değerler 0 kalır: ölü bölge kuralı dik tutuşta tutar.
      return turnFromGravity(x, y, last.value);
    },
    (next) => {
      if (next !== last.value) {
        last.value = next;
        runOnJS(setTurn)(next);
      }
    },
  );

  // Geliştirme kolaylığı: simülatörde yerçekimi yok, çerçeve dik kalır. Konsoldan
  // __setTurn(90) ya da __setTurn(270) ile şekil değişimi denenir. Sensör okuması 0
  // geldiği sürece (simülatör) elle verilen tutuş korunur.
  useEffect(() => {
    if (!__DEV__) return;
    const g = globalThis as Record<string, unknown>;
    g.__setTurn = (v: number) => setTurn(v === 90 || v === 270 ? v : 0);
    return () => {
      delete g.__setTurn;
    };
  }, []);

  return turn;
}

export default function CaptureFrame({ live, topOffset, bottomOffset, geoRef, onTurnChange }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const reduce = useReducedMotion();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const turn = useDeviceTurn();
  const side = isSide(turn);

  const [box, setBox] = useState<{ W: number; H: number } | null>(null);
  const [titleH, setTitleH] = useState(72);
  // Dik ve yan tutuş kendi ölçüsünü hatırlar: telefonu çevirip geri getirince çerçeve bozulmaz.
  const [sizes, setSizes] = useState<{ p: Size | null; s: Size | null }>({ p: null, s: null });

  const fx = useSharedValue(0);
  const fy = useSharedValue(0);
  const fw = useSharedValue(0);
  const fh = useSharedValue(0);
  const sideness = useSharedValue(0);
  const sweep = useSharedValue(0);
  const nudge = useSharedValue(0);

  const area: Box | null = box ? { W: box.W, H: box.H, top: topOffset, bottom: box.H - bottomOffset } : null;
  const geo: Geo | null = area ? geometry(area, turn, side ? sizes.s : sizes.p, titleH) : null;

  // Çerçeveyi paylaşılan değerlere yazar. animate=false sürükleme sırasında kullanılır:
  // parmak takip etmesi gerektiği için yay araya girmez ve React yeniden çizilmez.
  const applyGeo = useCallback(
    (g: Geo, W: number, H: number, animate: boolean) => {
      const put = (v: typeof fx, to: number) => {
        if (!animate) {
          cancelAnimation(v);
          v.value = to;
        } else {
          v.value = reduce ? withTiming(to, { duration: 180 }) : withSpring(to, SPRING);
        }
      };
      put(fx, g.x);
      put(fy, g.y);
      put(fw, g.w);
      put(fh, g.h);
      geoRef.current = { x: g.x, y: g.y, w: g.w, h: g.h, W, H };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reduce],
  );

  // İlk ölçümde çerçeve yaysız oturur: aksi halde kamera açılırken sol üst köşeden
  // büyüyerek geliyor ve karartma bir an tüm ekranı kaplıyor.
  const seeded = useRef(false);
  useEffect(() => {
    if (!geo || !box) return;
    applyGeo(geo, box.W, box.H, seeded.current);
    seeded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo?.x, geo?.y, geo?.w, geo?.h, box?.W, box?.H, applyGeo]);

  useEffect(() => {
    sideness.value = reduce ? withTiming(side ? 1 : 0, { duration: 180 }) : withSpring(side ? 1 : 0, SPRING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side, reduce]);

  useEffect(() => {
    onTurnChange(turn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn]);

  // Tarama ışığı ve "yan çevir" ipucundaki telefon: sonsuz, yalnız transform.
  useEffect(() => {
    if (reduce || !live) {
      sweep.value = 0.5;
      nudge.value = 0;
      return;
    }
    sweep.value = 0;
    sweep.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true);
    nudge.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 520 }),
        withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 780 }),
        withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) }),
      ),
      -1,
    );
    return () => {
      cancelAnimation(sweep);
      cancelAnimation(nudge);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, live]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    // Modal içinde pencere ölçüsü ve güvenli alan Android'de güvenilmez: katman kendini ölçer.
    const { width, height } = e.nativeEvent.layout;
    setBox((prev) => (prev && prev.W === width && prev.H === height ? prev : { W: width, H: height }));
  }, []);

  // --- Köşe sürükleme: çerçeve içeriğe göre büyütülüp küçültülür ---
  const dragBase = useRef<{ w: number; h: number; maxW: number; maxH: number } | null>(null);
  const handlers = useMemo(() => {
    const make = (sx: 1 | -1, sy: 1 | -1) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          if (geo) dragBase.current = { w: geo.w, h: geo.h, maxW: geo.maxW, maxH: geo.maxH };
        },
        onPanResponderMove: (_e, gs) => {
          const base = dragBase.current;
          if (!base || !area) return;
          const w = clamp(base.w + 2 * sx * gs.dx, MIN_W, base.maxW);
          const h = clamp(base.h + 2 * sy * gs.dy, MIN_H, base.maxH);
          applyGeo(geometry(area, turn, { w, h }, titleH), area.W, area.H, false);
        },
        onPanResponderRelease: () => {
          const base = dragBase.current;
          dragBase.current = null;
          if (!base) return;
          const next = geoRef.current;
          if (next) setSizes((s) => ({ ...s, [side ? "s" : "p"]: { w: next.w, h: next.h } }));
        },
        onPanResponderTerminate: () => {
          dragBase.current = null;
        },
      });
    return { tl: make(-1, -1), tr: make(1, -1), bl: make(-1, 1), br: make(1, 1) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo?.w, geo?.h, geo?.maxW, geo?.maxH, area?.W, area?.H, area?.top, area?.bottom, turn, titleH, side, applyGeo]);

  // --- Animasyonlu katmanlar ---
  const W = box?.W ?? 0;
  const H = box?.H ?? 0;

  const dimProps = useAnimatedProps(() => {
    const x = fx.value;
    const y = fy.value;
    const w = fw.value;
    const h = fh.value;
    const r = Math.min(18, w / 2, h / 2);
    const k = 0.5523 * r;
    const d =
      `M0 0H${W}V${H}H0Z` +
      `M${x + r} ${y}H${x + w - r}C${x + w - r + k} ${y} ${x + w} ${y + r - k} ${x + w} ${y + r}` +
      `V${y + h - r}C${x + w} ${y + h - r + k} ${x + w - r + k} ${y + h} ${x + w - r} ${y + h}` +
      `H${x + r}C${x + r - k} ${y + h} ${x} ${y + h - r + k} ${x} ${y + h - r}` +
      `V${y + r}C${x} ${y + r - k} ${x + r - k} ${y} ${x + r} ${y}Z`;
    return { d };
  });

  const frameStyle = useAnimatedStyle(() => ({
    left: fx.value,
    top: fy.value,
    width: fw.value,
    height: fh.value,
  }));

  const cornerStyle = (cx: 0 | 1, cy: 0 | 1) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({
      left: cx === 0 ? fx.value - 2 : fx.value + fw.value - BRACKET + 2,
      top: cy === 0 ? fy.value - 2 : fy.value + fh.value - BRACKET + 2,
    }));
  const cTL = cornerStyle(0, 0);
  const cTR = cornerStyle(1, 0);
  const cBL = cornerStyle(0, 1);
  const cBR = cornerStyle(1, 1);

  const handleStyle = (cx: 0 | 1, cy: 0 | 1) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({
      left: (cx === 0 ? fx.value : fx.value + fw.value) - HANDLE / 2,
      top: (cy === 0 ? fy.value : fy.value + fh.value) - HANDLE / 2,
    }));
  const hTL = handleStyle(0, 0);
  const hTR = handleStyle(1, 0);
  const hBL = handleStyle(0, 1);
  const hBR = handleStyle(1, 1);

  // Tarama ışığı: dik tutuşta yatay çizgi aşağı iner, yan tutuşta dikey çizgi yana kayar.
  const laserH = useAnimatedStyle(() => ({
    opacity: (1 - sideness.value) * (live ? 1 : 0),
    transform: [{ translateY: (0.08 + sweep.value * 0.84) * fh.value }],
  }));
  const laserV = useAnimatedStyle(() => ({
    opacity: sideness.value * (live ? 1 : 0),
    transform: [{ translateX: (0.08 + sweep.value * 0.84) * fw.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({ opacity: 1 - sideness.value }));
  // spin ve onRight render'da hesaplanır: worklet içinden worklet olmayan işlev çağrılamaz.
  const spin = spinFor(turn);
  const onRight = turn === 270;
  const sideTitleStyle = useAnimatedStyle(() => {
    const margin = Math.max(0, fx.value);
    const centerX = onRight ? fx.value + fw.value + margin / 2 : margin / 2;
    return {
      opacity: sideness.value,
      left: centerX - fh.value / 2,
      top: fy.value + fh.value / 2 - SIDE_LINE / 2,
      width: fh.value,
      height: SIDE_LINE,
      transform: [{ rotate: `${spin}deg` }],
    };
  });
  const pillStyle = useAnimatedStyle(() => ({
    opacity: 1 - sideness.value,
    top: fy.value + fh.value + GAP,
  }));
  const phoneStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${nudge.value * 90}deg` }] }));

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="box-none">
      {box ? (
        <>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={W} height={H}>
              <AnimatedPath animatedProps={dimProps} fill={DIM} fillRule="evenodd" />
            </Svg>
          </View>

          <Animated.View style={[styles.frame, frameStyle]} pointerEvents="none">
            <Animated.View style={[styles.laserH, laserH]} />
            <Animated.View style={[styles.laserV, laserV]} />
          </Animated.View>

          <Animated.View style={[styles.bracket, styles.bTL, cTL]} pointerEvents="none" />
          <Animated.View style={[styles.bracket, styles.bTR, cTR]} pointerEvents="none" />
          <Animated.View style={[styles.bracket, styles.bBL, cBL]} pointerEvents="none" />
          <Animated.View style={[styles.bracket, styles.bBR, cBR]} pointerEvents="none" />

          <Animated.View style={[styles.handle, hTL]} {...handlers.tl.panHandlers} />
          <Animated.View style={[styles.handle, hTR]} {...handlers.tr.panHandlers} />
          <Animated.View style={[styles.handle, hBL]} {...handlers.bl.panHandlers} />
          <Animated.View style={[styles.handle, hBR]} {...handlers.br.panHandlers} />

          <Animated.View
            style={[styles.titleBlock, { top: topOffset }, titleStyle]}
            pointerEvents="none"
            onLayout={(e) => setTitleH(Math.round(e.nativeEvent.layout.height))}
          >
            <Text style={styles.title}>{t("scan.frameTitle")}</Text>
            <Text style={styles.subtitle}>{t("scan.frameHint")}</Text>
          </Animated.View>

          <Animated.View style={[styles.sideTitle, sideTitleStyle]} pointerEvents="none">
            <Text style={styles.title} numberOfLines={1}>
              {t("scan.frameTitleShort")}
            </Text>
          </Animated.View>

          <Animated.View style={[styles.pillRow, pillStyle]} pointerEvents="none">
            <View style={styles.pill}>
              <Animated.View style={phoneStyle}>
                <Ionicons name="phone-portrait-outline" size={16} color={colors.primary} />
              </Animated.View>
              <Text style={styles.pillText}>{t("scan.turnSideways")}</Text>
            </View>
          </Animated.View>
        </>
      ) : null}
    </View>
  );
}

/**
 * Arayüz dikey kilitli olduğu için düğme ve simgeler kullanıcıya dönsün diye bu kapla sarılır.
 * Yalnız transform yazar: yerleşim yeniden hesaplanmaz.
 */
export function TurnSpin({
  turn,
  style,
  children,
}: {
  turn: Turn;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const to = spinFor(turn);
  const deg = useSharedValue(to);

  useEffect(() => {
    deg.value = reduce ? withTiming(to, { duration: 180 }) : withSpring(to, SPRING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, reduce]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${deg.value}deg` }] }));
  return <Animated.View style={[style, spinStyle]}>{children}</Animated.View>;
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    frame: {
      position: "absolute",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.28)",
      overflow: "hidden",
    },
    laserH: {
      position: "absolute",
      left: "6%",
      right: "6%",
      top: 0,
      height: 2,
      borderRadius: 2,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 10,
    },
    laserV: {
      position: "absolute",
      top: "6%",
      bottom: "6%",
      left: 0,
      width: 2,
      borderRadius: 2,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 10,
    },
    bracket: {
      position: "absolute",
      width: BRACKET,
      height: BRACKET,
      borderColor: colors.primary,
    },
    bTL: { borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 18 },
    bTR: { borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 18 },
    bBL: { borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 18 },
    bBR: { borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 18 },
    handle: {
      position: "absolute",
      width: HANDLE,
      height: HANDLE,
    },
    titleBlock: {
      position: "absolute",
      left: 0,
      right: 0,
      paddingHorizontal: 32,
      alignItems: "center",
    },
    sideTitle: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "700",
      textAlign: "center",
      textShadowColor: "rgba(0,0,0,0.6)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    subtitle: {
      marginTop: 4,
      color: "rgba(255,255,255,0.85)",
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
      textShadowColor: "rgba(0,0,0,0.6)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    pillRow: {
      position: "absolute",
      left: 0,
      right: 0,
      alignItems: "center",
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.16)",
    },
    pillText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "600",
    },
  });
