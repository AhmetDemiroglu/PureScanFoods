// Ana ekranda tarama kartının altındaki son tarama şeridi. Yalnız yer varsa görünür (sayfa kaymaz).
// Dokununca geçmiş çekmecesindeki kayıtla aynı yoldan sonuç ekranı açılır.
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Text } from "../ui/AppText";
import { useTheme } from "../../context/ThemeContext";
import { getScoreBg, getScoreColor } from "../../lib/scoreLevel";
import type { ScanResult } from "../../lib/firestore";

export const LAST_SCAN_STRIP_HEIGHT = 52;

export default function LastScanStrip({ item, onPress }: { item: ScanResult; onPress: () => void }) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const color = getScoreColor(item.score);

  return (
    <Animated.View entering={FadeIn.duration(260)}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${t("home.lastScan", { defaultValue: "Last scan" })}: ${item.productName}`}
        style={({ pressed }) => [
          styles.strip,
          {
            backgroundColor: isDark ? colors.gray[100] : "rgba(255,255,255,0.7)",
            borderColor: isDark ? colors.border : "rgba(42,31,24,0.07)",
          },
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <View style={[styles.thumb, { backgroundColor: colors.gray[100] }]}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
          ) : (
            <Ionicons name="nutrition-outline" size={18} color={colors.gray[400]} />
          )}
        </View>
        <View style={styles.text}>
          <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={1} maxFontSizeMultiplier={1.15}>
            {t("home.lastScan", { defaultValue: "Last scan" })}
          </Text>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1} maxFontSizeMultiplier={1.15}>
            {item.productName || item.brand || "-"}
          </Text>
        </View>
        <View style={[styles.score, { backgroundColor: getScoreBg(item.score, isDark) }]}>
          <Text style={[styles.scoreText, { color }]} maxFontSizeMultiplier={1.1}>
            {Math.round(item.score)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  strip: {
    height: LAST_SCAN_STRIP_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: 11,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 1,
  },
  score: {
    minWidth: 38,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
