import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Modal, Pressable, Animated, PanResponder, Dimensions, ScrollView } from "react-native";
import { Text } from "../ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { AppColors } from "../../constants/colors";
import { useTheme } from "../../context/ThemeContext";

interface FullIngredientsSheetProps {
  visible: boolean;
  onClose: () => void;
  fullText: string;
  source?: string; // "openfoodfacts" | "text" | "pack"
}

/**
 * Taranan ürünün TAM (verbatim) içindekiler metnini gösteren bottomsheet.
 * Kullanıcı AI'ın doğru okuyup okumadığını teyit edebilir.
 * KENDİ panY/PanResponder'ını taşır (mevcut sheet'lerin paylaşılan panY'sine dokunmaz).
 */
export default function FullIngredientsSheet({ visible, onClose, fullText, source }: FullIngredientsSheetProps) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;
  const panY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) panY.setValue(0);
  }, [visible]);

  const close = () => {
    Animated.timing(panY, { toValue: screenHeight, duration: 240, useNativeDriver: true }).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) panY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.6) close();
        else Animated.spring(panY, { toValue: 0, bounciness: 4, useNativeDriver: true }).start();
      },
    })
  ).current;

  const styles = createStyles(colors, isDark);
  const sourceLabel =
    source === "openfoodfacts"
      ? t("results.ingredients_full.source_off")
      : source
        ? t("results.ingredients_full.source_pack")
        : "";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={styles.dismiss} onPress={close} />
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 30, transform: [{ translateY: panY }] },
          ]}
        >
          <View style={styles.handleWrap} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>
          <View style={styles.header}>
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            <Text style={styles.title}>{t("results.ingredients_full.title")}</Text>
          </View>
          {!!sourceLabel && <Text style={styles.source}>{sourceLabel}</Text>}
          <ScrollView
            style={{ maxHeight: screenHeight * 0.55 }}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator
          >
            <Text selectable style={styles.body}>{fullText}</Text>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
    dismiss: { flex: 1 },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    handleWrap: { alignItems: "center", paddingVertical: 8, marginBottom: 4 },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
    },
    header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    title: { fontSize: 16, fontWeight: "700", color: colors.text },
    source: { fontSize: 11, color: colors.gray[400], marginBottom: 10 },
    body: { fontSize: 14, lineHeight: 21, color: colors.text },
  });
