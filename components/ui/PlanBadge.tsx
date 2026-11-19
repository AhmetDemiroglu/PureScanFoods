// Üst bardaki üyelik rozeti. Premium: altın geçişli kapsül, taç, ara ara üstünden ışık geçer.
// Ücretsiz: sade kapsül, yükseltme okuyla. Cam kapsülün DIŞINDA durur: camın içindeki animasyon
// cam katmanını her karede yeniden çizdirip yanındaki düğmeleri titretiyordu.
import React, { useEffect } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Text } from "./AppText";
import { useTheme } from "../../context/ThemeContext";

type Props = {
  premium: boolean;
  onPress?: () => void;
  /** Dar ekranda yalnız simge. */
  compact?: boolean;
};

const H = 34;

function Shine({ width }: { width: number }) {
  const reduce = useReducedMotion();
  const x = useSharedValue(0);
  useEffect(() => {
    if (reduce || !width) return;
    x.value = withRepeat(
      withSequence(withDelay(3400, withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) })), withTiming(0, { duration: 0 })),
      -1,
    );
    return () => cancelAnimation(x);
  }, [reduce, width, x]);
  const style = useAnimatedStyle(() => ({
    opacity: x.value > 0 && x.value < 1 ? 1 : 0,
    transform: [{ translateX: -30 + x.value * (width + 60) }, { skewX: "-20deg" }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.shine, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.65)", "rgba(255,255,255,0)"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

export default function PlanBadge({ premium, onPress, compact = false }: Props) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [w, setW] = React.useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  if (premium) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Premium"
        style={({ pressed }) => [styles.shadowGold, pressed && styles.pressed]}
      >
        <View style={[styles.pill, compact && styles.pillCompact]} onLayout={onLayout}>
          <LinearGradient
            colors={["#FDE68A", "#FBBF24", "#D97706"]}
            locations={[0, 0.45, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.goldEdge} pointerEvents="none" />
          <MaterialCommunityIcons name="crown" size={17} color="#5B3505" />
          {!compact ? (
            <Text style={styles.goldText} maxFontSizeMultiplier={1.1} numberOfLines={1}>
              Premium
            </Text>
          ) : null}
          <Shine width={w} />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t("header.plan.free", { defaultValue: "Ücretsiz" })}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View
        style={[
          styles.pill,
          compact && styles.pillCompact,
          {
            backgroundColor: isDark ? colors.gray[100] : colors.card,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: isDark ? colors.border : "rgba(42,31,24,0.12)",
          },
        ]}
      >
        <Ionicons name="leaf-outline" size={15} color={colors.textMuted} />
        {!compact ? (
          <Text style={[styles.freeText, { color: colors.text }]} maxFontSizeMultiplier={1.1} numberOfLines={1}>
            {t("header.plan.free", { defaultValue: "Ücretsiz" })}
          </Text>
        ) : null}
        <View style={[styles.upDot, { backgroundColor: colors.primary }]}>
          <Ionicons name="arrow-up" size={10} color="#FFF" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: H,
    borderRadius: H / 2,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    overflow: "hidden",
  },
  pillCompact: {
    paddingHorizontal: 9,
  },
  shadowGold: {
    borderRadius: H / 2,
    shadowColor: "#B45309",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  goldEdge: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: H / 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  goldText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5B3505",
    letterSpacing: 0.3,
  },
  freeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  upDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  shine: {
    position: "absolute",
    top: -6,
    bottom: -6,
    left: 0,
    width: 26,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
