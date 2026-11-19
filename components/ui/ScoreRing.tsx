// Puan halkası. Yay UI thread'de (reanimated) dolar, ortadaki sayı aynı sürede sayarak yükselir.
// Renkler tek kaynaktan (lib/scoreLevel.ts). Props önceki sürümle aynı.
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Text } from "./AppText";
import { useTheme } from "../../context/ThemeContext";
import { getScoreColor, getScoreGradient } from "../../lib/scoreLevel";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  type?: "safety" | "compatibility";
  arcDegrees?: number; // 360 = tam daire, 240 = gösterge yayı
  showOutOf?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const DURATION = 1200;

/** Sayıyı yay ile aynı sürede ve aynı eğriyle yükseltir (JS tarafında, kısa süreli ve hafif). */
function useCountUp(target: number, enabled: boolean) {
  const [value, setValue] = useState(enabled ? 0 : target);
  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled]);
  return value;
}

export default function ScoreRing({
  score,
  label,
  size = 110,
  strokeWidth = 8,
  type = "safety",
  arcDegrees = 360,
  showOutOf = false,
}: ScoreRingProps) {
  const { colors, isDark } = useTheme();
  const reduce = useReducedMotion();
  const safe = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));

  const [gradStart, gradEnd] = getScoreGradient(safe);
  const mainColor = getScoreColor(safe);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gradientId = `grad_${type}`;

  const isPartial = arcDegrees < 360;
  const arcLen = (arcDegrees / 360) * circumference;
  const gapLen = circumference - arcLen;
  // Boşluk altta ortalanır: SVG 0° = saat 3. 240° için dönüş 150.
  const arcRotation = isPartial ? 90 + (360 - arcDegrees) / 2 : -90;
  const fullLen = isPartial ? arcLen : circumference;

  const progress = useSharedValue(reduce ? safe : 0);
  const scale = useSharedValue(reduce ? 1 : 0.9);
  const opacity = useSharedValue(reduce ? 1 : 0);

  useEffect(() => {
    if (reduce) {
      progress.value = safe;
      scale.value = 1;
      opacity.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(safe, { duration: DURATION, easing: Easing.out(Easing.cubic) });
    scale.value = withSpring(1, { damping: 14, stiffness: 160 });
    opacity.value = withTiming(1, { duration: 420 });
  }, [safe, reduce, progress, scale, opacity]);

  // Yay "0 C"den "dolu C-dolu"ya: dashoffset hep 0, dolgu dönüş noktasından başlar (dash sarma hatası yok).
  const arcProps = useAnimatedProps(() => {
    const fill = (progress.value / 100) * fullLen;
    return { strokeDasharray: [fill, circumference - fill] };
  });
  const wrapStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  const shown = useCountUp(safe, !reduce);
  const numberSize = Math.round(size * 0.29);

  return (
    <Animated.View style={[styles.container, wrapStyle]}>
      <View style={[styles.ringOuter, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            <SvgGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradStart} />
              <Stop offset="100%" stopColor={gradEnd} />
            </SvgGradient>
          </Defs>

          {/* İz (gri arka yay) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(42,31,24,0.07)"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={isPartial ? `${arcLen} ${gapLen}` : undefined}
            strokeDashoffset={0}
            transform={`rotate(${arcRotation}, ${size / 2}, ${size / 2})`}
          />

          {/* Dolgu */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            animatedProps={arcProps}
            strokeDashoffset={0}
            transform={`rotate(${arcRotation}, ${size / 2}, ${size / 2})`}
          />
        </Svg>

        <View style={styles.centerContent}>
          <Text
            variant="display"
            maxFontSizeMultiplier={1.1}
            style={[styles.scoreNumber, { color: mainColor, fontSize: numberSize, lineHeight: Math.round(numberSize * 1.12) }]}
          >
            {shown}
          </Text>
          {showOutOf && (
            <Text style={[styles.outOf, { color: colors.gray[400] }]} maxFontSizeMultiplier={1.1}>
              /100
            </Text>
          )}
        </View>
      </View>

      {label ? (
        <Text upper style={[styles.label, { color: colors.gray[500] }]} numberOfLines={1} maxFontSizeMultiplier={1.15}>
          {label}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  ringOuter: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    letterSpacing: -0.5,
  },
  outOf: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginTop: -2,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 4,
    textAlign: "center",
  },
});
