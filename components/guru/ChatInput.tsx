import React, { useMemo, useState } from "react";
import { View, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { AppColors } from "../../constants/colors";
import { useTheme } from "../../context/ThemeContext";

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export const ChatInput = ({ value, onChangeText, onSend, isLoading }: ChatInputProps) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.focused]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={t("guru.placeholder", { defaultValue: "Bir şey sorun..." })}
        placeholderTextColor={colors.gray[400]}
        multiline
        maxLength={500}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <Pressable style={[styles.sendButton, !value.trim() && styles.disabled]} onPress={onSend} disabled={!value.trim() || isLoading}>
        {isLoading ? <ActivityIndicator size="small" color={colors.white} /> : <Ionicons name="send" size={20} color={colors.white} />}
      </Pressable>
    </View>
  );
};

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    focused: {
      borderTopColor: colors.primary,
    },
    input: {
      flex: 1,
      minHeight: 42,
      maxHeight: 120,
      backgroundColor: colors.gray[100],
      borderWidth: 1,
      borderColor: isDark ? colors.gray[300] : colors.gray[200],
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 14,
    },
    sendButton: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    disabled: {
      opacity: 0.45,
    },
  });




