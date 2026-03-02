import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { AppColors } from "../../constants/colors";
import { useTheme } from "../../context/ThemeContext";

interface GuruEmptyStateProps {
  onSelectSuggestion: (text: string) => void;
}

export const GuruEmptyState = ({ onSelectSuggestion }: GuruEmptyStateProps) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const suggestions = (t("guru.suggestions", { returnObjects: true }) || []) as string[];

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="restaurant-outline" size={48} color={colors.primary} />
      </View>
      <Text style={styles.title}>{t("guru.emptyState.title")}</Text>
      <Text style={styles.subtitle}>{t("guru.emptyState.subtitle")}</Text>

      <View style={styles.suggestionsContainer}>
        {suggestions.map((suggestion, index) => (
          <Pressable key={index} style={styles.suggestionChip} onPress={() => onSelectSuggestion(suggestion)}>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 30,
    },
    iconContainer: {
      width: 92,
      height: 92,
      borderRadius: 46,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.gray[100],
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
    subtitle: {
      marginTop: 6,
      fontSize: 13,
      color: colors.textMuted,
      textAlign: "center",
    },
    suggestionsContainer: {
      marginTop: 16,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 10,
    },
    suggestionChip: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    suggestionText: {
      fontSize: 12,
      color: colors.text,
      fontWeight: "500",
    },
  });


