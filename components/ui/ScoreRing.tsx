import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  type?: "safety" | "compatibility";
}

export default function ScoreRing({ score, label, type = "safety" }: ScoreRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { colors, isDark } = useTheme();

  const getColor = (val: number) => {
    if (val >= 80) return "#10B981";
    if (val >= 60) return "#84CC16";
    if (val >= 40) return "#F59E0B";
    if (val >= 20) return "#F97316";
    return "#EF4444";
  };

  const getGradient = (val: number): [string, string] => {
    if (val >= 80) return ["#059669", "#34D399"];
    if (val >= 60) return ["#65A30D", "#A3E635"];
    if (val >= 40) return ["#D97706", "#FBBF24"];
    if (val >= 20) return ["#EA580C", "#FB923C"];
    return ["#DC2626", "#F87171"];
  };

  const color = getColor(score);
  const gradient = getGradient(score);
  const icon: keyof typeof Ionicons.glyphMap = type === "safety" ? "shield-checkmark" : "people";

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score]);

  const barWidth = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
            <Ionicons name={icon} size={16} color={color} />
          </View>
          <Text style={[styles.label, { color: isDark ? colors.gray[600] : colors.gray[500] }]}>
            {label}
          </Text>
        </View>
        <Text style={[styles.scoreText, { color }]}>{score}</Text>
      </View>
      <View style={[styles.barTrack, {
        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
      }]}>
        <Animated.View style={[styles.barFill, { width: barWidth as any }]}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.barGradient}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barGradient: {
    flex: 1,
  },
});
