import React, { useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "../ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { AppColors } from "../../constants/colors";
import { ActiveProduct } from "../../context/GuruContext";
import { useTheme } from "../../context/ThemeContext";

interface ProductContextCardProps {
  product: ActiveProduct;
  onClose: () => void;
}

export const ProductContextCard = ({ product, onClose }: ProductContextCardProps) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return colors.success;
    if (score >= 40) return colors.warning;
    return colors.error;
  };

  const scoreColor = getScoreColor(product.score);
  const displayName = product.name?.trim() || product.brand?.trim() || "Bilinmeyen Ürün";

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onClose}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
      >
        <Ionicons name="close" size={18} color={colors.gray[500]} />
      </Pressable>

      <Text upper style={styles.label}>{t("guru.activeProduct", { defaultValue: "Aktif Ürün" })}</Text>

      <View style={styles.contentRow}>
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreText}>{product.score}</Text>
        </View>

        <View style={styles.metaWrap}>
          <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
          {!!product.brand && <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>}
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginTop: 10,
      marginBottom: 8,
      borderRadius: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      paddingRight: 44,
      position: "relative",
    },
    closeBtn: {
      position: "absolute",
      right: 6,
      top: 6,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      elevation: 3,
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    },
    label: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.textMuted,
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    contentRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    scoreBadge: {
      minWidth: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
    },
    scoreText: {
      color: colors.white,
      fontWeight: "800",
      fontSize: 14,
    },
    metaWrap: {
      flex: 1,
    },
    name: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "700",
    },
    brand: {
      marginTop: 2,
      fontSize: 12,
      color: colors.textMuted,
    },
  });


