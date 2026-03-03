import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  type?: "safety" | "compatibility";
  arcDegrees?: number;  // 360 = full circle, 240 = gauge arc
  showOutOf?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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
  const animProgress = useRef(new Animated.Value(0)).current;
  const animScale = useRef(new Animated.Value(0.88)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  const getGradient = (val: number): [string, string] => {
    if (val >= 80) return ["#34D399", "#10B981"];
    if (val >= 60) return ["#A3E635", "#65A30D"];
    if (val >= 40) return ["#FCD34D", "#F59E0B"];
    if (val >= 20) return ["#FB923C", "#EA580C"];
    return ["#FCA5A5", "#EF4444"];
  };

  const getColor = (val: number): string => {
    if (val >= 80) return "#10B981";
    if (val >= 60) return "#65A30D";
    if (val >= 40) return "#F59E0B";
    if (val >= 20) return "#EA580C";
    return "#EF4444";
  };

  useEffect(() => {
    animProgress.setValue(0);
    Animated.parallel([
      Animated.timing(animProgress, {
        toValue: score,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(animScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [score]);

  const [gradStart, gradEnd] = getGradient(score);
  const mainColor = getColor(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gradientId = `grad_${type}`;

  const isPartial = arcDegrees < 360;
  const arcLen = (arcDegrees / 360) * circumference;
  const gapLen = circumference - arcLen;

  // Gap at the bottom: SVG 0° = 3 o'clock.
  // rotation = 90 + gapAngle/2 centres the gap at 6 o'clock.
  // For 240°: rotation = 90 + 60 = 150 (arc runs from ~8 o'clock to ~4 o'clock).
  const arcRotation = isPartial ? 90 + (360 - arcDegrees) / 2 : -90;

  // ── Correct animation approach ────────────────────────────────────────────
  // Animate strokeDasharray from "0 C" (empty) → "fillLen C-fillLen" (score% filled).
  // strokeDashoffset stays at 0 so the fill always starts at the rotation point.
  // This avoids the dash-pattern wrap-around bug that afflicts strokeDashoffset alone.
  const fillTarget = isPartial
    ? (score / 100) * arcLen
    : (score / 100) * circumference;

  // inputRange must match toValue so the interpolation reaches its target exactly.
  const safeScore = Math.max(score, 1);
  const animatedDashArray = animProgress.interpolate({
    inputRange: [0, safeScore],
    outputRange: [
      `0 ${circumference}`,
      `${fillTarget} ${circumference - fillTarget}`,
    ],
  });

  return (
    <Animated.View style={[styles.container, { opacity: animOpacity, transform: [{ scale: animScale }] }]}>
      <View style={[styles.ringOuter, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            <SvgGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradStart} />
              <Stop offset="100%" stopColor={gradEnd} />
            </SvgGradient>
          </Defs>

          {/* Track (gray background arc) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={isPartial ? `${arcLen} ${gapLen}` : undefined}
            strokeDashoffset={0}
            rotation={arcRotation}
            origin={`${size / 2}, ${size / 2}`}
          />

          {/* Progress (animated fill) */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={animatedDashArray as any}
            strokeDashoffset={0}
            rotation={arcRotation}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={[styles.scoreNumber, { color: mainColor }]}>{score}</Text>
          {showOutOf && (
            <Text style={[styles.outOf, { color: colors.gray[400] }]}>/100</Text>
          )}
        </View>
      </View>

      {label ? (
        <Text style={[styles.label, { color: colors.gray[500] }]}>{label}</Text>
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
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: 38,
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
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 6,
    textAlign: "center",
  },
});
