import React, { useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text } from "../ui/AppText";
import { AppColors } from "../../constants/colors";
import { useTheme } from "../../context/ThemeContext";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  /** Gönderilemeyen kullanıcı mesajı */
  failed?: boolean;
  onRetry?: () => void;
}

export const ChatBubble = ({ role, content, failed, onRetry }: ChatBubbleProps) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const isUser = role === "user";

  const bubble = (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer, failed && styles.failedContainer]}>
      <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>{content}</Text>
    </View>
  );

  if (!failed) return bubble;

  return (
    <View style={styles.failedWrap}>
      {bubble}
      <Pressable
        onPress={onRetry}
        hitSlop={8}
        style={styles.retryRow}
        accessibilityRole="button"
        accessibilityLabel={t("guru.retry")}
      >
        <Ionicons name="alert-circle" size={14} color={colors.error} />
        <Text style={styles.failedText}>{t("guru.sendFailed")}</Text>
        <Ionicons name="refresh" size={14} color={colors.primary} />
        <Text style={styles.retryText}>{t("guru.retry")}</Text>
      </Pressable>
    </View>
  );
};

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      maxWidth: "85%",
      padding: 14,
      borderRadius: 16,
      marginBottom: 8,
    },
    userContainer: {
      alignSelf: "flex-end",
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    assistantContainer: {
      alignSelf: "flex-start",
      backgroundColor: colors.card,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    text: {
      fontSize: 14,
      lineHeight: 20,
    },
    userText: {
      color: colors.white,
    },
    assistantText: {
      color: colors.text,
    },
    failedWrap: {
      alignSelf: "flex-end",
      alignItems: "flex-end",
      maxWidth: "85%",
      marginBottom: 8,
    },
    failedContainer: {
      maxWidth: "100%",
      marginBottom: 4,
      opacity: 0.7,
    },
    retryRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      justifyContent: "flex-end",
      gap: 4,
    },
    failedText: {
      fontSize: 12,
      color: colors.error,
    },
    retryText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
    },
  });


