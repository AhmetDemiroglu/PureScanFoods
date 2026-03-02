import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  type?: "safety" | "compatibility";
}

export default function ScoreRing({ 
  score, 
  label, 
  size = 100, 
  strokeWidth = 10 
}: ScoreRingProps) {
  const { colors, isDark } = useTheme();

  const getColor = (val: number) => {
    if (val >= 80) return "#10B981";
    if (val >= 60) return "#84CC16";
    if (val >= 40) return "#F59E0B";
    if (val >= 20) return "#F97316";
    return "#EF4444";
  };

  const color = getColor(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;
  const strokeDashoffset = halfCircumference - (score / 100) * halfCircumference;

  return (
    <View style={styles.container}>
      <View style={[styles.gaugeWrapper, { width: size, height: size * 0.65 }]}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background arc - bottom half */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
            strokeWidth={strokeWidth}
            strokeDasharray={`${halfCircumference} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            rotation={180}
            origin={`${size / 2}, ${size / 2}`}
          />
          {/* Progress arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${halfCircumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={180}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        {/* Score positioned higher */}
        <View style={[styles.scoreContainer, { bottom: size * 0.12 }]}>
          <Text style={[styles.score, { color }]}>{score}</Text>
        </View>
      </View>
      <Text style={[styles.label, { color: colors.gray[500] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  svg: {
    position: "absolute",
    top: 0,
  },
  scoreContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 8,
  },
});
