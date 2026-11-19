// Turun görsel katmanı. Ekran karartılır, hedef yuvarlatılmış bir delikle açılır.
// Hareket dili açılış animasyonuyla ortak: tarama köşeleri hedefe oturur, tarama çizgisi hedefin
// üstünden geçer, çevresinde nefes alan halka ve dışa yayılan dalga var. Delik adımdan adıma yayla akar.

import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Text } from "../ui/AppText";
import { useTheme } from "../../context/ThemeContext";
import * as haptics from "../../lib/haptics";
import type { TourRect } from "./TourContext";
import type { TourStep } from "./tours";
import { clampHoleX, placeCard } from "./tourGeometry";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SPRING = { damping: 19, stiffness: 170, mass: 0.9 };
const CARD_GAP = 18;
const BRACKET = 16; // tarama köşesi kolu
const DIM = "rgba(14,9,5,0.74)";

type Props = {
  step: TourStep;
  index: number;
  total: number;
  rect: TourRect;
  /** Tur katmanının kendi boyutu. rect bu katmana göredir (pencere ölçüsü kullanılmaz). */
  frame: { w: number; h: number };
  onNext: () => void;
  onSkip: () => void;
};

export default function SpotlightOverlay({ step, index, total, rect, frame, onNext, onSkip }: Props) {
  const { w: W, h: H } = frame;
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  // Kartın gerçek yüksekliği (ölçülür; adım değişince yeniden ölçülür). Yerleşim buna göre yapılır,
  // kart hedefi örtmez; sığmazsa delik kırpılır.
  const [cardH, setCardH] = useState(0);
  useEffect(() => {
    setCardH(0);
  }, [index]);

  // Delik ölçüsü (padding ve şekil uygulanmış)
  const pad = step.padding ?? 8;
  const baseHole = useMemo(() => {
    const g = step.grow ?? {};
    let x = rect.x - pad - (g.left ?? 0);
    let y = rect.y - pad - (g.top ?? 0);
    let w = rect.w + pad * 2 + (g.left ?? 0) + (g.right ?? 0);
    let h = rect.h + pad * 2 + (g.top ?? 0) + (g.bottom ?? 0);
    if (step.shape === "circle") {
      const d = Math.max(w, h);
      x -= (d - w) / 2;
      y -= (d - h) / 2;
      w = d;
      h = d;
    }
    const clamped = step.shape === "circle" ? { x, y, w, h } : clampHoleX({ x, y, w, h }, W);
    return clamped;
  }, [rect, pad, step.shape, step.grow, W]);

  const placement = useMemo(
    () => placeCard({ hole: baseHole, cardH, H, insetTop: insets.top, insetBottom: insets.bottom, gap: CARD_GAP }),
    [baseHole, cardH, H, insets.top, insets.bottom],
  );
  const hole = useMemo(() => {
    const ph = placement.hole;
    const r = step.shape === "circle" ? ph.w / 2 : Math.min(20, ph.h / 2);
    return { ...ph, r };
  }, [placement.hole, step.shape]);

  // --- Paylaşılan değerler ---
  const hx = useSharedValue(hole.x);
  const hy = useSharedValue(hole.y);
  const hw = useSharedValue(hole.w);
  const hh = useSharedValue(hole.h);
  const hr = useSharedValue(hole.r);
  const dim = useSharedValue(0);
  const breathe = useSharedValue(0);
  const ripple = useSharedValue(0);
  const scan = useSharedValue(0);
  const corners = useSharedValue(0);

  useEffect(() => {
    dim.value = withTiming(1, { duration: 280 });
    if (!reduce) {
      breathe.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }), -1, true);
      ripple.value = withRepeat(
        withSequence(withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }), withTiming(0, { duration: 0 })),
        -1,
      );
    }
    return () => {
      cancelAnimation(breathe);
      cancelAnimation(ripple);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Delik yayla yeni ölçüye akar (adım değişimi ya da canlı izlemede hedefin yer değiştirmesi).
  useEffect(() => {
    const go = (v: { value: number }, to: number) => {
      v.value = reduce ? withTiming(to, { duration: 180 }) : withSpring(to, SPRING);
    };
    go(hx, hole.x);
    go(hy, hole.y);
    go(hw, hole.w);
    go(hh, hole.h);
    go(hr, hole.r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hole]);

  // Köşeler ve tarama çizgisi yalnız ADIM değişince yeniden oynar. Hedef canlı izlendiği için delik
  // ölçüsü adım içinde de değişebilir (banner gelir, düzen oturur); o zaman yalnız konum akar.
  useEffect(() => {
    corners.value = 0;
    corners.value = withDelay(reduce ? 0 : 160, withSpring(1, { damping: 13, stiffness: 190 }));
    scan.value = 0;
    if (!reduce) scan.value = withDelay(260, withTiming(1, { duration: 760, easing: Easing.inOut(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, step.target]);

  // Karartma: dış dikdörtgen + yuvarlatılmış delik, evenodd ile.
  const dimProps = useAnimatedProps(() => {
    const x = hx.value, y = hy.value, w = hw.value, h = hh.value;
    const r = Math.min(hr.value, w / 2, h / 2);
    const k = 0.5523 * r;
    const d =
      `M0 0H${W}V${H}H0Z` +
      `M${x + r} ${y}H${x + w - r}C${x + w - r + k} ${y} ${x + w} ${y + r - k} ${x + w} ${y + r}` +
      `V${y + h - r}C${x + w} ${y + h - r + k} ${x + w - r + k} ${y + h} ${x + w - r} ${y + h}` +
      `H${x + r}C${x + r - k} ${y + h} ${x} ${y + h - r + k} ${x} ${y + h - r}` +
      `V${y + r}C${x} ${y + r - k} ${x + r - k} ${y} ${x + r} ${y}Z`;
    return { d };
  });

  const dimStyle = useAnimatedStyle(() => ({ opacity: dim.value }));

  // ÖNEMLİ (performans): konum/boyut (left, top, width, height) yalnız adım geçişindeki yaylarla değişir.
  // Sürekli dönen nefes ve dalga animasyonları yalnız transform ve opacity değiştirir: bunlar UI
  // thread'de doğrudan uygulanır. Önceden sonsuz animasyon her karede konum/boyutu da yazıyordu;
  // telefonda her karede tüm ağacın yerleşimi yeniden hesaplanıyor, React güncellemeleri sıraya
  // giriyordu ve tur kapandıktan sonra dokunuşlar saniyelerce gecikiyordu.
  const frameStyle = useAnimatedStyle(() => ({
    left: hx.value,
    top: hy.value,
    width: hw.value,
    height: hh.value,
  }));
  const radiusStyle = useAnimatedStyle(() => ({ borderRadius: hr.value }));
  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * 0.025 }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    opacity: (1 - ripple.value) * 0.55,
    transform: [{ scale: 1 + ripple.value * 0.16 }],
  }));

  const scanStyle = useAnimatedStyle(() => ({
    opacity: scan.value > 0 && scan.value < 1 ? 1 : 0,
    transform: [{ translateY: -24 + scan.value * (hh.value + 24) }],
  }));

  // Tarama köşeleri: dışarıdan içeri kayarak hedefin köşelerine oturur.
  const cornerStyle = (cx: 0 | 1, cy: 0 | 1) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => {
      const off = (1 - corners.value) * 14;
      const inset = -5;
      const left = cx === 0 ? hx.value + inset - off : hx.value + hw.value - BRACKET - inset + off;
      const top = cy === 0 ? hy.value + inset - off : hy.value + hh.value - BRACKET - inset + off;
      return { left, top, opacity: corners.value };
    });
  const tl = cornerStyle(0, 0);
  const tr = cornerStyle(1, 0);
  const bl = cornerStyle(0, 1);
  const br = cornerStyle(1, 1);

  // --- Kart yerleşimi ---
  const cardW = Math.min(W - 32, 380);
  const placeBelow = placement.below;
  const cardLeft = (W - cardW) / 2;
  const cardPos = { top: placement.top };
  const arrowX = Math.max(22, Math.min(cardW - 22, hole.x + hole.w / 2 - cardLeft)) - 8;

  const last = index === total - 1;
  const title = t(`tour.${step.key}.title`);
  const desc = t(`tour.${step.key}.desc`);

  const handleNext = () => {
    if (last) haptics.success();
    else haptics.selection();
    onNext();
  };

  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      {/* Karartma: dokunuşları tutar ama ilerletmez. Yalnız "İleri" ve "Geç" ilerletir (yanlışlıkla adım atlanmasın). */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => {}} accessible={false}>
        <Animated.View style={[StyleSheet.absoluteFill, dimStyle]} pointerEvents="none">
          <Svg width={W} height={H}>
            <AnimatedPath animatedProps={dimProps} fill={DIM} fillRule="evenodd" />
          </Svg>
        </Animated.View>
      </Pressable>

      {/* Dalga, halka, tarama çizgisi, köşeler */}
      <Animated.View pointerEvents="none" style={[styles.frame, frameStyle]}>
        <Animated.View style={[styles.ripple, radiusStyle, rippleStyle]} />
        <Animated.View style={[styles.ring, radiusStyle, breatheStyle]} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.clip, frameStyle, radiusStyle]}>
        <Animated.View style={[styles.scanWrap, scanStyle]}>
          <LinearGradient
            colors={["rgba(242,96,12,0)", "rgba(242,96,12,0.28)", "rgba(242,96,12,0)"]}
            style={styles.scanBand}
          />
          <LinearGradient
            colors={["rgba(255,255,255,0)", "#FFB27A", colors.primary, "#FFB27A", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.scanLine}
          />
        </Animated.View>
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.corner, styles.cTL, tl]} />
      <Animated.View pointerEvents="none" style={[styles.corner, styles.cTR, tr]} />
      <Animated.View pointerEvents="none" style={[styles.corner, styles.cBL, bl]} />
      <Animated.View pointerEvents="none" style={[styles.corner, styles.cBR, br]} />

      {/* Açıklama kartı. Kapanış (exiting) animasyonu BİLEREK yok: Reanimated, çıkış animasyonu süren
          çocuğu yüzünden kaldırılan tur katmanını (tam ekran dokunma alanı dahil) görünmez halde ekranda
          tutuyordu; tur bitince dokunuşlar saniyelerce yutuluyordu. */}
      <Animated.View
        key={`${index}`}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (Math.abs(h - cardH) > 1) setCardH(h);
        }}
        entering={
          reduce
            ? FadeIn.duration(150)
            : (placeBelow ? FadeInDown : FadeInUp).springify().damping(16).stiffness(170).delay(120)
        }
        style={[styles.card, { width: cardW, left: cardLeft }, cardPos]}
      >
        <View
          style={[
            styles.arrow,
            { left: arrowX },
            placeBelow ? { top: -7 } : { bottom: -7 },
          ]}
        />
        <View style={styles.cardHead}>
          <LinearGradient colors={[colors.primary, colors.primaryDeep]} style={styles.iconBubble}>
            <Ionicons name={step.icon} size={20} color="#FFF" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {index + 1}/{total}
            </Text>
          </View>
        </View>
        <Text style={styles.desc}>{desc}</Text>

        {step.items?.length ? (
          <View style={styles.items}>
            {step.items.map((it) => (
              <View key={it.key} style={styles.itemRow}>
                <View style={styles.itemIcon}>
                  <Ionicons name={it.icon} size={16} color={colors.primary} />
                </View>
                <Text style={styles.itemText}>{t(`tour.${step.key}.items.${it.key}`)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.progressRow}>
          {Array.from({ length: total }).map((_, k) => (
            <View key={k} style={[styles.seg, k <= index ? styles.segOn : null, k === index ? styles.segNow : null]} />
          ))}
        </View>

        <View style={styles.actions}>
          {!last ? (
            <Pressable onPress={onSkip} hitSlop={10} style={styles.skipBtn} accessibilityRole="button">
              <Text style={styles.skipText}>{t("tour.skip")}</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable onPress={handleNext} accessibilityRole="button" style={({ pressed }) => [pressed && { transform: [{ scale: 0.96 }] }]}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextBtn}
            >
              <Text style={styles.nextText}>{last ? t("tour.done") : t("tour.next")}</Text>
              <Ionicons name={last ? "checkmark" : "arrow-forward"} size={16} color="#FFF" />
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    frame: {
      position: "absolute",
    },
    // Halka yalnız çizgi: iOS'ta gölge içeri de yayılıp hedefi soluk turuncuya boyuyordu.
    ring: {
      ...StyleSheet.absoluteFillObject,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    ripple: {
      ...StyleSheet.absoluteFillObject,
      borderWidth: 2,
      borderColor: "#FFB27A",
    },
    clip: {
      position: "absolute",
      overflow: "hidden",
    },
    scanWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: 24,
    },
    scanBand: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: 22,
    },
    scanLine: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 21,
      height: 2.5,
      borderRadius: 2,
    },
    corner: {
      position: "absolute",
      width: BRACKET,
      height: BRACKET,
      borderColor: "#FFFFFF",
    },
    cTL: { borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 },
    cTR: { borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 },
    cBL: { borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 },
    cBR: { borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 },
    card: {
      position: "absolute",
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 18,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.5 : 0.22,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 10 },
      elevation: 14,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    arrow: {
      position: "absolute",
      width: 16,
      height: 16,
      backgroundColor: colors.card,
      transform: [{ rotate: "45deg" }],
      borderRadius: 3,
    },
    cardHead: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconBubble: {
      width: 38,
      height: 38,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },
    counter: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(255,139,61,0.16)" : "rgba(242,96,12,0.10)",
    },
    counterText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
    },
    items: {
      marginTop: 12,
      gap: 8,
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    itemIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,139,61,0.16)" : "#FFF1E6",
    },
    itemText: {
      flex: 1,
      fontSize: 13.5,
      lineHeight: 18,
      color: colors.text,
    },
    desc: {
      marginTop: 10,
      fontSize: 14.5,
      lineHeight: 21,
      color: colors.gray?.[600] ?? colors.text,
    },
    progressRow: {
      flexDirection: "row",
      gap: 5,
      marginTop: 14,
    },
    seg: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "#F1E7DC",
    },
    segOn: {
      backgroundColor: isDark ? "rgba(255,139,61,0.5)" : "rgba(242,96,12,0.35)",
    },
    segNow: {
      backgroundColor: colors.primary,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 14,
    },
    skipBtn: {
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    skipText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.gray?.[500] ?? colors.text,
    },
    nextBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 18,
      height: 42,
      borderRadius: 14,
    },
    nextText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#FFF",
    },
  });
