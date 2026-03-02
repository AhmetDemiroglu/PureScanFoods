import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, Image, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { AppColors } from "../../constants/colors";
import { ScanResult } from "../../lib/firestore";
import { useTheme } from "../../context/ThemeContext";

interface ScanSelectorProps {
  scans: ScanResult[];
  onSelect: (scan: ScanResult) => void;
  isLoading: boolean;
}

export const ScanSelector = ({ scans, onSelect, isLoading }: ScanSelectorProps) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  if (isLoading || scans.length === 0) return null;

  const getScoreColor = (score: number) => {
    if (score >= 70) return colors.success;
    if (score >= 40) return colors.warning;
    return colors.error;
  };

  const getDisplayName = (scan: ScanResult) => scan.productName?.trim() || scan.brand?.trim() || "Bilinmeyen Ürün";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("guru.recentScans", { defaultValue: "Son Taramalar" })}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {scans.map((scan) => {
          const scoreColor = getScoreColor(scan.score);
          const displayName = getDisplayName(scan);

          return (
            <Pressable key={scan.id} style={styles.card} onPress={() => onSelect(scan)}>
              <Image source={scan.imageUrl ? { uri: scan.imageUrl } : require("../../assets/placeholder.png")} style={styles.image} />
              <View style={[styles.scoreChip, { backgroundColor: scoreColor }]}>
                <Text style={styles.scoreText}>{scan.score}</Text>
              </View>
              <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingTop: 10,
    },
    title: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 8,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    scrollContent: {
      gap: 10,
      paddingRight: 12,
    },
    card: {
      width: 88,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 6,
      alignItems: "center",
    },
    image: {
      width: 74,
      height: 54,
      borderRadius: 8,
      backgroundColor: colors.gray[100],
      marginBottom: 6,
    },
    scoreChip: {
      position: "absolute",
      top: 8,
      right: 8,
      borderRadius: 8,
      minWidth: 24,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 6,
    },
    scoreText: {
      fontSize: 10,
      color: colors.white,
      fontWeight: "800",
    },
    name: {
      fontSize: 11,
      color: colors.text,
      fontWeight: "600",
      width: "100%",
      textAlign: "center",
    },
  });


