// Analiz bekleme ekranı: hikayeli sahne (components/scan/AnalysisScene), başlık, kademeler ve kısa bilgi.
//
// Kademeler gerçek ilerlemeyi izler (stage: index.tsx'te analiz aşamalarında güncellenir) ama ona kadar
// tek tek, göz izleyebilsin diye kısa beklemelerle işaretlenir. Gerçek ilerlemeyi asla geçmez: analiz
// uzarsa o kademe "sürüyor" kalır. Sonuç gelince (PROCESSING_DONE) kalan kademeler hızla kapanır, son
// kademe de işaretlendikten sonra onDone çağrılır ve sonuç ekranı açılır. Böylece analiz hızlı bittiğinde
// ekran kademeler yarımdayken kaybolmaz.
//
// Ekran kaymaz: sahne kalan yüksekliğe göre büyüyüp küçülür, kısa ekranda bilgi kartı gizlenir.

import React, { useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  ZoomIn,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Text } from "./AppText";
import { AppColors } from "../../constants/colors";
import { useTheme } from "../../context/ThemeContext";
import AnalysisScene from "../scan/AnalysisScene";

export type ProcessingMode = "camera" | "text" | "barcode" | "ad" | "image";
/** Sonuç hazır: kalan kademeler kapanır, sonra onDone. */
export const PROCESSING_DONE = 99;

interface ProcessingViewProps {
  mode?: ProcessingMode;
  /** Sürmekte olan aşamanın sırası (0'dan). Verilmezse kademeler süreye göre ilerler, sonuncusu kapanmaz. */
  stage?: number;
  /** Sonuç geldikten sonra tüm kademeler işaretlenince çağrılır. */
  onDone?: () => void;
}

const FIRST_STEP_MS = 650;
const STEP_MS = 1050;
const FINISH_STEP_MS = 190;

const stripDots = (s: string) => s.replace(/[.…]+\s*$/, "");

function Spinner({ color }: { color: string }) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(r);
  }, [r]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value * 360}deg` }] }));
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { borderRadius: 999, borderWidth: 2, borderColor: "transparent", borderTopColor: color, borderRightColor: color },
        style,
      ]}
    />
  );
}

function StepRow({
  label,
  done,
  current,
  last,
  colors,
  isDark,
}: {
  label: string;
  done: boolean;
  current: boolean;
  last: boolean;
  colors: AppColors;
  isDark: boolean;
}) {
  const fill = useSharedValue(done ? 1 : 0);
  useEffect(() => {
    fill.value = withTiming(done ? 1 : 0, { duration: 420, easing: Easing.out(Easing.cubic) });
  }, [done, fill]);
  const lineStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: fill.value }] }));

  return (
    <View style={styles.stepRow}>
      {!last ? (
        <View style={[styles.stepLine, { backgroundColor: isDark ? colors.gray[200] : colors.gray[200] }]}>
          <Animated.View style={[styles.stepLineFill, { backgroundColor: colors.primary, transformOrigin: "top" }, lineStyle]} />
        </View>
      ) : null}
      <View
        style={[
          styles.stepDot,
          {
            backgroundColor: done ? colors.primary : current ? (isDark ? "rgba(255,139,61,0.16)" : "#FFF1E6") : isDark ? colors.gray[200] : colors.gray[100],
          },
        ]}
      >
        {done ? (
          <Animated.View entering={ZoomIn.springify().damping(12)}>
            <Ionicons name="checkmark" size={15} color="#FFF" />
          </Animated.View>
        ) : current ? (
          <>
            <Spinner color={colors.primary} />
            <View style={[styles.stepCore, { backgroundColor: colors.primary }]} />
          </>
        ) : (
          <View style={[styles.stepIdle, { backgroundColor: colors.gray[400] }]} />
        )}
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        maxFontSizeMultiplier={1.2}
        style={[
          styles.stepText,
          { color: current ? colors.text : done ? colors.textMuted : colors.gray[400] },
          current && styles.stepTextCurrent,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function ProcessingView({ mode = "camera", stage, onDone }: ProcessingViewProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  // Alt bar içeriğin üstünde yüzer: alttaki içerik barın altında kalmasın.
  const tabBarHeight = useBottomTabBarHeight();
  const { width, height } = useWindowDimensions();

  const titleKeyByMode: Record<ProcessingMode, string> = {
    camera: "processing.titles.camera",
    text: "processing.titles.text",
    barcode: "processing.titles.barcode",
    ad: "processing.titles.ad",
    image: "processing.titles.image",
  };
  const titleDefaultByMode: Record<ProcessingMode, string> = {
    camera: "Analyzing Image...",
    text: "Analyzing Text...",
    barcode: "Reading Barcode...",
    ad: "Preparing Result...",
    image: "Creating Visual...",
  };

  const steps = useMemo(() => {
    const keys =
      mode === "text"
        ? ["processing.textSteps", ["Text received", "AI is analyzing", "Extracting nutrition", "Preparing results"]]
        : mode === "barcode"
          ? ["processing.barcodeSteps", ["Barcode detected", "Fetching product data", "AI validation", "Preparing results"]]
          : mode === "ad"
            ? ["processing.adSteps", ["Loading ad", "Finalizing result"]]
            : mode === "image"
              ? ["processing.imageSteps", ["Calculating ratios", "Building layers", "Generating visual", "Preparing"]]
              : ["processing.steps", ["Processing image", "Extracting text", "Analyzing nutrition", "Preparing results"]];
    const [prefix, defaults] = keys as [string, string[]];
    return defaults.map((d, i) => stripDots(t(`${prefix}.${i + 1}`, { defaultValue: d })));
  }, [mode, t]);

  const facts = useMemo(() => {
    const raw = t("processing.facts", { returnObjects: true });
    return Array.isArray(raw) && raw.length > 0 ? (raw as string[]) : [];
  }, [t]);
  const waitMessages = useMemo(() => {
    const raw = t("processing.waitMessages", { returnObjects: true });
    return Array.isArray(raw) && raw.length > 0 ? (raw as string[]) : [];
  }, [t]);

  // --- Kademeler ---
  const [shown, setShown] = useState(0);
  const total = steps.length;
  const tracked = typeof stage === "number";
  // Gerçek ilerleme: verilmediyse süreye göre, ama son kademe hiç kapanmaz.
  const [fallbackStage, setFallbackStage] = useState(0);
  useEffect(() => {
    if (tracked) return;
    const id = setInterval(() => setFallbackStage((s) => Math.min(total - 1, s + 1)), 1800);
    return () => clearInterval(id);
  }, [tracked, total]);
  const real = tracked ? (stage! >= PROCESSING_DONE ? total : Math.min(stage!, total - 1)) : fallbackStage;
  const finishing = tracked && stage! >= PROCESSING_DONE;

  useEffect(() => {
    if (shown >= total) {
      const id = setTimeout(() => onDone?.(), 260);
      return () => clearTimeout(id);
    }
    if (shown >= real) return;
    const delay = finishing ? FINISH_STEP_MS : shown === 0 ? FIRST_STEP_MS : STEP_MS;
    const id = setTimeout(() => setShown((s) => Math.min(real, s + 1)), delay);
    return () => clearTimeout(id);
  }, [shown, real, total, finishing, onDone]);

  // --- Bilgi kartı ve uzun bekleme ---
  const [factIndex, setFactIndex] = useState(() => (facts.length ? Math.floor(Math.random() * facts.length) : 0));
  useEffect(() => {
    if (facts.length <= 1) return;
    const id = setInterval(() => setFactIndex((i) => (i + 1) % facts.length), 6000);
    return () => clearInterval(id);
  }, [facts.length]);
  const [waitIndex, setWaitIndex] = useState(-1);
  useEffect(() => {
    if (!waitMessages.length) return;
    const start = setTimeout(() => setWaitIndex(0), 10000);
    return () => clearTimeout(start);
  }, [waitMessages.length]);
  useEffect(() => {
    if (waitIndex < 0 || waitMessages.length <= 1) return;
    const id = setInterval(() => setWaitIndex((i) => (i + 1) % waitMessages.length), 3200);
    return () => clearInterval(id);
  }, [waitIndex, waitMessages.length]);

  // --- Yerleşim: sahne kalan alana göre ---
  const available = height - insets.top - tabBarHeight;
  const showFact = available >= 640 && facts.length > 0;
  const [sceneBox, setSceneBox] = useState({ w: 0, h: 0 });
  const onSceneLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setSceneBox((b) => (Math.abs(b.w - w) < 1 && Math.abs(b.h - h) < 1 ? b : { w, h }));
  };
  const sceneSize = Math.max(120, Math.min(sceneBox.w, sceneBox.h, 330, width - 40));

  const styles2 = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={[styles2.container, { paddingTop: insets.top + 8, paddingBottom: tabBarHeight + 14 }]}>
      <View style={styles2.sceneArea} onLayout={onSceneLayout}>
        {sceneBox.h > 0 ? <AnalysisScene size={sceneSize} /> : null}
      </View>

      <Text variant="display" style={styles2.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
        {stripDots(t(titleKeyByMode[mode], { defaultValue: titleDefaultByMode[mode] }))}
      </Text>
      <View style={styles2.subtitleBox}>
        {waitIndex >= 0 ? (
          <Animated.View key={waitIndex} entering={FadeIn.duration(260)} exiting={FadeOut.duration(160)}>
            <Text style={styles2.subtitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
              {waitMessages[waitIndex]}
            </Text>
          </Animated.View>
        ) : null}
      </View>

      <View style={styles2.steps}>
        {steps.map((label, i) => (
          <StepRow
            key={`${mode}-${i}`}
            label={label}
            done={i < shown}
            current={i === shown}
            last={i === total - 1}
            colors={colors}
            isDark={isDark}
          />
        ))}
      </View>

      {showFact ? (
        <Animated.View key={factIndex} entering={FadeInDown.duration(380)} style={styles2.fact}>
          <View style={styles2.factHead}>
            <Ionicons name="bulb-outline" size={15} color={isDark ? "#FBBF24" : "#D97706"} />
            <Text upper style={styles2.factTitle} maxFontSizeMultiplier={1.15}>
              {t("processing.didYouKnow", { defaultValue: "DID YOU KNOW?" })}
            </Text>
          </View>
          <Text style={styles2.factText} numberOfLines={2} maxFontSizeMultiplier={1}>
            {facts[factIndex]}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
  },
  stepLine: {
    position: "absolute",
    left: 13,
    top: 28,
    bottom: 0,
    width: 2,
    borderRadius: 1,
    overflow: "hidden",
  },
  stepLineFill: {
    ...StyleSheet.absoluteFillObject,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepIdle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.5,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
  },
  stepTextCurrent: {
    fontWeight: "600",
  },
});

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingHorizontal: 24,
      alignItems: "center",
    },
    sceneArea: {
      flex: 1,
      minHeight: 120,
      alignSelf: "stretch",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      marginTop: 6,
      fontSize: 26,
      lineHeight: 32,
      color: colors.text,
      textAlign: "center",
    },
    subtitleBox: {
      height: 22,
      marginTop: 2,
      alignSelf: "stretch",
      alignItems: "center",
      justifyContent: "center",
    },
    subtitle: {
      fontSize: 13.5,
      color: colors.textMuted,
      textAlign: "center",
    },
    steps: {
      marginTop: 12,
      width: "100%",
      maxWidth: 300,
    },
    fact: {
      marginTop: 6,
      alignSelf: "stretch",
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? colors.border : "rgba(42,31,24,0.08)",
    },
    factHead: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    factTitle: {
      fontSize: 11.5,
      fontWeight: "700",
      letterSpacing: 0.6,
      color: isDark ? "#FBBF24" : "#B45309",
    },
    // İki satırlık sabit yükseklik: bilgi değişince kart boyu oynamaz, başlık ve sahne kaymaz.
    factText: {
      marginTop: 6,
      fontSize: 14,
      lineHeight: 20,
      height: 40,
      color: colors.textMuted,
    },
  });
