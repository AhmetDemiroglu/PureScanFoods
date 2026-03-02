import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AppColors } from "../../constants/colors";
import { useTheme } from "../../context/ThemeContext";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatBubble = ({ role, content }: ChatBubbleProps) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const isUser = role === "user";

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>{content}</Text>
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
  });


