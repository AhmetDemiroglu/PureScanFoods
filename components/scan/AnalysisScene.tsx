// Analiz beklerken oynayan hikayeli sahne (8,4 sn, sonra baştan). Gıda paketinin içini tarayıp analiz etme:
//   1. (0.00 - 0.09) Paket tezgaha gelir; arkasında içindekiler etiketi var.
//   2. (0.09 - 0.17) Marka tarama köşeleri etikete oturur.
//   3. (0.17 - 0.40) Tarama çizgisi iki kez geçer; geçtiği satır turuncu parlar (satırlar okunuyor).
//   4. (0.38 - 0.47) Büyüteç sağdan gelir.
//   5. (0.46 - 0.64) Okunan maddeler (buğday, şeker, yağ, katkı) satırlardan büyütecin içine uçar.
//   6. (0.62 - 0.75) Her maddeye karar düşer: uygun (yeşil), dikkat (sarı), riskli (kırmızı).
//   7. (0.75 - 0.92) Maddeler merceğin ortasında toplanır, puan halkası dolar, puan belirir.
//   8. (0.92 - 1.00) Sahne söner, baştan başlar.
// Yalnız transform, opacity ve strokeDashoffset canlandırılır (UI thread, reanimated).
// Azaltılmış harekette sahnenin bitmiş hali durağan gösterilir.

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  Easing,
  Extrapolation,
  SharedValue,
  cancelAnimation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Text } from "../ui/AppText";
import { useTheme } from "../../context/ThemeContext";

export const SCENE_MS = 8400;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type IconName = React.ComponentProps<typeof Ionicons>["name"];

// Etiket satırları: [y, genişlik] (sahne kenarına göre oran).
const LINES: [number, number][] = [
  [0.4, 0.24],
  [0.48, 0.2],
  [0.56, 0.25],
  [0.64, 0.17],
];
const LABEL_X = 0.15;
const LABEL_TOP = 0.3;
const LABEL_BOTTOM = 0.72;

// Büyüteç: merkez ve yarıçap (oran).
const LENS = { x: 0.72, y: 0.42, r: 0.2 };

// Okunan maddeler: simge, renk, karar.
type Verdict = "ok" | "mid" | "high";
const ITEMS: { icon: IconName; tint: string; verdict: Verdict; from: number; to: [number, number] }[] = [
  { icon: "leaf", tint: "#2E9E5B", verdict: "ok", from: 0, to: [-0.075, -0.07] },
  { icon: "cube", tint: "#D97706", verdict: "mid", from: 1, to: [0.075, -0.07] },
  { icon: "water", tint: "#2E9E5B", verdict: "ok", from: 2, to: [-0.075, 0.07] },
  { icon: "flask", tint: "#DC2626", verdict: "high", from: 3, to: [0.075, 0.07] },
];
const VERDICT_STYLE: Record<Verdict, { bg: string; icon: IconName }> = {
  ok: { bg: "#16A34A", icon: "checkmark" },
  mid: { bg: "#F59E0B", icon: "alert" },
  high: { bg: "#DC2626", icon: "close" },
};
const SCORE = 72;

const easeOut = (p: number) => {
  "worklet";
  return 1 - Math.pow(1 - p, 3);
};
const iv = (t: number, input: number[], output: number[]) => {
  "worklet";
  return interpolate(t, input, output, Extrapolation.CLAMP);
};

type PartProps = { t: SharedValue<number>; S: number };

function Package({ t, S }: PartProps) {
  const { colors, isDark } = useTheme();
  const style = useAnimatedStyle(() => {
    const p = easeOut(iv(t.value, [0, 0.09], [0, 1]));
    return { opacity: p, transform: [{ translateY: (1 - p) * S * 0.14 }] };
  });
  return (
    <Animated.View
      style={[
        styles.abs,
        {
          left: S * 0.1,
          top: S * 0.14,
          width: S * 0.38,
          height: S * 0.72,
          borderRadius: S * 0.06,
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: isDark ? colors.border : "rgba(42,31,24,0.12)",
          overflow: "hidden",
        },
        style,
      ]}
    >
      {/* Kapak bandı ve küçük mandalina */}
      <View style={{ height: S * 0.12, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            width: S * 0.06,
            height: S * 0.06,
            borderRadius: S * 0.03,
            backgroundColor: "rgba(255,255,255,0.92)",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: S * 0.022,
            left: S * 0.19 - S * 0.0,
            width: S * 0.035,
            height: S * 0.02,
            borderTopRightRadius: S * 0.02,
            borderBottomLeftRadius: S * 0.02,
            backgroundColor: "#2E9E5B",
          }}
        />
      </View>
      {/* Etiket başlığı */}
      <View
        style={{
          position: "absolute",
          left: S * (LABEL_X - 0.1),
          top: S * (LABEL_TOP + 0.02 - 0.14),
          width: S * 0.13,
          height: S * 0.03,
          borderRadius: S * 0.015,
          backgroundColor: isDark ? colors.gray[500] : colors.gray[700],
        }}
      />
    </Animated.View>
  );
}

function LabelLine({ t, S, index }: PartProps & { index: number }) {
  const { colors, isDark } = useTheme();
  const [y, w] = LINES[index];
  // Tarama çizgisinin bu satırdan geçtiği anlar (iniş ve çıkış).
  const yNorm = (y - LABEL_TOP) / (LABEL_BOTTOM - LABEL_TOP);
  const down = 0.17 + yNorm * 0.115;
  const up = 0.285 + (1 - yNorm) * 0.115;
  const enter = useAnimatedStyle(() => {
    const p = easeOut(iv(t.value, [0.02, 0.1], [0, 1]));
    return { opacity: p, transform: [{ translateY: (1 - p) * S * 0.14 }] };
  });
  const glow = useAnimatedStyle(() => ({
    opacity: Math.max(
      iv(t.value, [down - 0.02, down, down + 0.05], [0, 1, 0.35]),
      iv(t.value, [up - 0.02, up, up + 0.05], [0, 1, 0.35]),
      iv(t.value, [0.42, 0.46, 0.92], [0, 0.35, 0.35]),
    ),
  }));
  const base = { left: S * LABEL_X, top: S * y, width: S * w, height: S * 0.026, borderRadius: S * 0.013 };
  return (
    <Animated.View style={[styles.abs, base, { backgroundColor: isDark ? colors.gray[300] : colors.gray[200] }, enter]}>
      <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: S * 0.013, backgroundColor: colors.primary }, glow]} />
    </Animated.View>
  );
}

function Corner({ t, S, cx, cy }: PartProps & { cx: 0 | 1; cy: 0 | 1 }) {
  const { colors } = useTheme();
  const L = S * 0.07;
  const x0 = S * (LABEL_X - 0.04);
  const x1 = S * (LABEL_X + 0.29);
  const y0 = S * (LABEL_TOP - 0.02);
  const y1 = S * (LABEL_BOTTOM + 0.01);
  const style = useAnimatedStyle(() => {
    const p = easeOut(iv(t.value, [0.09, 0.17], [0, 1]));
    const off = (1 - p) * S * 0.08;
    const pulse = 1 + Math.sin(t.value * Math.PI * 14) * 0.04 * iv(t.value, [0.17, 0.2, 0.38, 0.42], [0, 1, 1, 0]);
    return {
      opacity: p * iv(t.value, [0.42, 0.5], [1, 0.25]),
      transform: [{ translateX: cx === 0 ? -off : off }, { translateY: cy === 0 ? -off : off }, { scale: pulse }],
    };
  });
  const pos = {
    left: cx === 0 ? x0 : x1 - L,
    top: cy === 0 ? y0 : y1 - L,
    width: L,
    height: L,
    borderColor: colors.primary,
    borderTopWidth: cy === 0 ? 3 : 0,
    borderBottomWidth: cy === 1 ? 3 : 0,
    borderLeftWidth: cx === 0 ? 3 : 0,
    borderRightWidth: cx === 1 ? 3 : 0,
    borderTopLeftRadius: cx === 0 && cy === 0 ? 8 : 0,
    borderTopRightRadius: cx === 1 && cy === 0 ? 8 : 0,
    borderBottomLeftRadius: cx === 0 && cy === 1 ? 8 : 0,
    borderBottomRightRadius: cx === 1 && cy === 1 ? 8 : 0,
  };
  return <Animated.View style={[styles.abs, pos, style]} />;
}

function ScanLine({ t, S }: PartProps) {
  const { colors } = useTheme();
  const top = S * (LABEL_TOP - 0.01);
  const travel = S * (LABEL_BOTTOM - LABEL_TOP);
  const style = useAnimatedStyle(() => {
    const down = iv(t.value, [0.17, 0.285], [0, 1]);
    const up = iv(t.value, [0.285, 0.4], [0, 1]);
    const pos = t.value < 0.285 ? down : 1 - up;
    return {
      opacity: iv(t.value, [0.16, 0.18, 0.39, 0.41], [0, 1, 1, 0]),
      transform: [{ translateY: top + pos * travel }],
    };
  });
  return (
    <Animated.View
      style={[
        styles.abs,
        {
          left: S * (LABEL_X - 0.04),
          top: 0,
          width: S * 0.33,
          height: 3,
          borderRadius: 2,
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          shadowOpacity: 0.9,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
          elevation: 4,
        },
        style,
      ]}
    />
  );
}

function Lens({ t, S }: PartProps) {
  const { colors, isDark } = useTheme();
  const r = S * LENS.r;
  const ring = S * 0.028;
  const style = useAnimatedStyle(() => {
    const p = easeOut(iv(t.value, [0.38, 0.47], [0, 1]));
    return { opacity: p, transform: [{ translateX: (1 - p) * S * 0.14 }, { scale: 0.7 + p * 0.3 }] };
  });
  return (
    <Animated.View
      style={[
        styles.abs,
        { left: S * LENS.x - r - ring, top: S * LENS.y - r - ring, width: (r + ring) * 2, height: (r + ring) * 2 },
        style,
      ]}
    >
      {/* Sap */}
      <View
        style={{
          position: "absolute",
          left: (r + ring) * 2 - S * 0.06,
          top: (r + ring) * 2 - S * 0.06,
          width: S * 0.055,
          height: S * 0.17,
          borderRadius: S * 0.03,
          backgroundColor: isDark ? colors.gray[600] : colors.secondary,
          transform: [{ rotate: "-45deg" }],
        }}
      />
      {/* Cam */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          borderRadius: r + ring,
          borderWidth: ring,
          borderColor: isDark ? colors.gray[600] : colors.secondary,
          backgroundColor: isDark ? "rgba(255,139,61,0.08)" : "#FFF6EE",
          overflow: "hidden",
        }}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="lensShine" cx="30%" cy="25%" r="70%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={isDark ? 0.12 : 0.7} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="50%" cy="50%" r="50%" fill="url(#lensShine)" />
        </Svg>
      </View>
    </Animated.View>
  );
}

function Item({ t, S, index }: PartProps & { index: number }) {
  const { colors, isDark } = useTheme();
  const it = ITEMS[index];
  const size = S * 0.11;
  const fromX = S * (LABEL_X + LINES[it.from][1] * 0.6);
  const fromY = S * LINES[it.from][0];
  const toX = S * (LENS.x + it.to[0]);
  const toY = S * (LENS.y + it.to[1]);
  const start = 0.46 + index * 0.035;
  const end = start + 0.08;
  const vStart = 0.62 + index * 0.03;
  const style = useAnimatedStyle(() => {
    const born = iv(t.value, [start - 0.02, start], [0, 1]);
    const p = easeOut(iv(t.value, [start, end], [0, 1]));
    const arc = Math.sin(p * Math.PI) * S * 0.1;
    const gather = easeOut(iv(t.value, [0.75, 0.81], [0, 1]));
    const x = fromX + (toX - fromX) * p;
    const y = fromY + (toY - fromY) * p - arc;
    const cx = S * LENS.x;
    const cy = S * LENS.y;
    return {
      opacity: born * (1 - gather),
      transform: [
        { translateX: x + (cx - x) * gather - size / 2 },
        { translateY: y + (cy - y) * gather - size / 2 },
        { scale: (0.4 + born * 0.6) * (1 - gather * 0.6) },
      ],
    };
  });
  const badge = useAnimatedStyle(() => {
    const p = iv(t.value, [vStart, vStart + 0.03], [0, 1]);
    const overshoot = p < 1 ? p * 1.25 : 1;
    return { opacity: p, transform: [{ scale: Math.min(overshoot, 1.15) - (p >= 1 ? 0.15 : 0) }] };
  });
  const v = VERDICT_STYLE[it.verdict];
  const b = size * 0.48;
  return (
    <Animated.View style={[styles.abs, { left: 0, top: 0, width: size, height: size }, style]}>
      <View
        style={{
          flex: 1,
          borderRadius: size / 2,
          backgroundColor: isDark ? colors.gray[200] : "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: it.tint + "55",
          shadowColor: "#2A1A0E",
          shadowOpacity: isDark ? 0 : 0.12,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          elevation: 3,
        }}
      >
        <Ionicons name={it.icon} size={size * 0.48} color={it.tint} />
      </View>
      <Animated.View
        style={[
          {
            position: "absolute",
            right: -b * 0.25,
            top: -b * 0.25,
            width: b,
            height: b,
            borderRadius: b / 2,
            backgroundColor: v.bg,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: isDark ? colors.gray[100] : "#FFFFFF",
          },
          badge,
        ]}
      >
        <Ionicons name={v.icon} size={b * 0.68} color="#FFFFFF" />
      </Animated.View>
    </Animated.View>
  );
}

function ScoreRing({ t, S }: PartProps) {
  const { colors, isDark } = useTheme();
  const r = S * 0.12;
  const stroke = S * 0.026;
  const box = (r + stroke) * 2;
  const C = 2 * Math.PI * r;
  const props = useAnimatedProps(() => {
    const p = easeOut(iv(t.value, [0.8, 0.9], [0, 1]));
    return { strokeDashoffset: C * (1 - (SCORE / 100) * p) };
  });
  const wrap = useAnimatedStyle(() => ({
    opacity: iv(t.value, [0.78, 0.81], [0, 1]),
    transform: [{ scale: 0.85 + easeOut(iv(t.value, [0.78, 0.84], [0, 1])) * 0.15 }],
  }));
  const num = useAnimatedStyle(() => ({ opacity: iv(t.value, [0.84, 0.88], [0, 1]) }));
  return (
    <Animated.View
      style={[styles.abs, { left: S * LENS.x - box / 2, top: S * LENS.y - box / 2, width: box, height: box }, wrap]}
    >
      <Svg width={box} height={box}>
        <Circle cx={box / 2} cy={box / 2} r={r} stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(42,31,24,0.08)"} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={box / 2}
          cy={box / 2}
          r={r}
          stroke="#65A30D"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${C} ${C}`}
          animatedProps={props}
          transform={`rotate(-90 ${box / 2} ${box / 2})`}
        />
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, styles.center, num]}>
        <Text variant="display" maxFontSizeMultiplier={1} style={{ fontSize: S * 0.1, lineHeight: S * 0.115, color: "#65A30D" }}>
          {SCORE}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

function Mote({ t, S, i }: PartProps & { i: number }) {
  const { colors } = useTheme();
  const seeds = [
    [0.55, 0.16, 0],
    [0.9, 0.24, 0.33],
    [0.62, 0.74, 0.66],
  ][i];
  const style = useAnimatedStyle(() => {
    const local = (t.value * 2 + seeds[2]) % 1;
    return {
      opacity: Math.sin(local * Math.PI) * 0.7,
      transform: [{ translateX: S * seeds[0] }, { translateY: S * seeds[1] - local * S * 0.08 }, { scale: 0.6 + local * 0.6 }],
    };
  });
  return <Animated.View style={[styles.abs, { left: 0, top: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }, style]} />;
}

export default function AnalysisScene({ size, active = true }: { size: number; active?: boolean }) {
  const { colors, isDark } = useTheme();
  const reduce = useReducedMotion();
  const t = useSharedValue(reduce ? 0.9 : 0);

  useEffect(() => {
    if (reduce || !active) {
      cancelAnimation(t);
      t.value = 0.9;
      return;
    }
    t.value = 0;
    t.value = withRepeat(withTiming(1, { duration: SCENE_MS, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(t);
  }, [reduce, active, t]);

  const fade = useAnimatedStyle(() => ({
    opacity: reduce ? 1 : iv(t.value, [0, 0.03, 0.93, 1], [0, 1, 1, 0]),
  }));

  const S = size;
  return (
    <View style={{ width: S, height: S }} pointerEvents="none" accessible={false}>
      {/* Zemin: sıcak ışık halesi ve tezgah gölgesi */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width={S} height={S}>
          <Defs>
            <RadialGradient id="sceneGlow" cx="50%" cy="48%" r="52%">
              <Stop offset="0" stopColor={colors.primary} stopOpacity={isDark ? 0.18 : 0.12} />
              <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={S / 2} cy={S * 0.48} r={S * 0.5} fill="url(#sceneGlow)" />
        </Svg>
        <View
          style={{
            position: "absolute",
            left: S * 0.1,
            top: S * 0.885,
            width: S * 0.38,
            height: S * 0.035,
            borderRadius: S * 0.02,
            backgroundColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(42,31,24,0.08)",
          }}
        />
      </View>
      <Animated.View style={[StyleSheet.absoluteFill, fade]}>
        <Package t={t} S={S} />
        {LINES.map((_, i) => (
          <LabelLine key={i} t={t} S={S} index={i} />
        ))}
        <Corner t={t} S={S} cx={0} cy={0} />
        <Corner t={t} S={S} cx={1} cy={0} />
        <Corner t={t} S={S} cx={0} cy={1} />
        <Corner t={t} S={S} cx={1} cy={1} />
        <ScanLine t={t} S={S} />
        <Lens t={t} S={S} />
        {ITEMS.map((_, i) => (
          <Item key={i} t={t} S={S} index={i} />
        ))}
        <ScoreRing t={t} S={S} />
        {[0, 1, 2].map((i) => (
          <Mote key={i} t={t} S={S} i={i} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: "absolute" },
  center: { alignItems: "center", justifyContent: "center" },
});
