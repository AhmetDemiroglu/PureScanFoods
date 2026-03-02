import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { AppColors } from "../../constants/colors";
import { useTheme } from "../../context/ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  type?: "safety" | "compatibility";
}

export default function ScoreRing({ score, size = 120, strokeWidth = 10, label, type = "safety" }: ScoreRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const getColor = (val: number) => {
    if (val >= 80) return "#10B981";
    if (val >= 60) return "#84CC16";
    if (val >= 40) return "#F59E0B";
    if (val >= 20) return "#F97316";
    return "#EF4444";
  };

  const color = getColor(score);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score, animatedValue]);

  const animatedStrokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, { width: size, height: size + 34 }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.gray[200]} strokeWidth={strokeWidth} fill="transparent" />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={animatedStrokeDashoffset as any}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      <View style={styles.textContainer}>
        <Text style={[styles.scoreText, { color }]}>{score}</Text>
        <Text style={styles.scoreSub}>/100</Text>
      </View>

      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
    },
    textContainer: {
      position: "absolute",
      top: "33%",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 2,
    },
    scoreText: {
      fontSize: 30,
      fontWeight: "800",
    },
    scoreSub: {
      fontSize: 14,
      color: colors.gray[400],
      fontWeight: "500",
      marginTop: 8,
    },
    label: {
      fontSize: 13,
      color: colors.gray[600],
      fontWeight: "700",
      marginTop: 8,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
  });
