// "Yazarak" kartından açılan pencere: içindekiler metnini yapıştır ya da barkod numarasını gir.
// Pencere ekranın ÜSTÜNDEN iner (Spotlight arama kartı gibi): klavye alttan açıldığı için hiçbir
// telefonda kartın üstüne binmez. (Modal ayrı pencere; iOS'ta klavye bilgisi oraya gelmiyor,
// alttan açılan pencere klavyenin altında kalıyordu.)
// Önceden ana ekranda "Metin" ve "Barkod" sekmelerinin içindeydi. Doğrulama burada yapılır: geçersiz
// girişte pencere kapanmaz, altında uyarı çıkar. Geçerliyse pencere kapanır ve index.tsx'teki aynı
// analiz fonksiyonu çalışır (onSubmit, pencere tamamen kapandıktan sonra).
import React, { useEffect, useRef, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { SlideInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Text } from "../ui/AppText";
import SegmentedControl from "../ui/SegmentedControl";
import { useTheme } from "../../context/ThemeContext";
import { FONT_SCALE_CAP } from "../../constants/design";
import * as haptics from "../../lib/haptics";

export type TypeMode = "text" | "barcode";

type Props = {
  visible: boolean;
  mode: TypeMode;
  onModeChange: (m: TypeMode) => void;
  text: string;
  onTextChange: (v: string) => void;
  barcode: string;
  onBarcodeChange: (v: string) => void;
  onClose: () => void;
  /** Giriş geçerliyse çağrılır; pencere kapandıktan sonra analiz başlatılır. */
  onSubmit: (mode: TypeMode) => void;
};

export default function TypeEntrySheet({
  visible,
  mode,
  onModeChange,
  text,
  onTextChange,
  barcode,
  onBarcodeChange,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);
  // Pencere kapandıktan sonra çalışacak iş: iOS iki Modal'ı aynı anda göstermiyor, analiz akışı
  // (limit penceresi, hata penceresi) bu pencere tamamen kapanınca başlamalı.
  const pending = useRef<TypeMode | null>(null);

  useEffect(() => {
    if (visible) setError(null);
  }, [visible, mode]);

  const flushPending = () => {
    const m = pending.current;
    pending.current = null;
    if (m) onSubmit(m);
  };

  const submit = () => {
    if (mode === "text" && text.trim().length < 10) {
      haptics.warning();
      setError(t("scan.textTooShort", { defaultValue: "Lütfen analiz için yeterli içerik girin." }));
      return;
    }
    if (mode === "barcode" && barcode.trim().length < 3) {
      haptics.warning();
      setError(t("scan.enterValidBarcode"));
      return;
    }
    pending.current = mode;
    onClose();
    // Android'de Modal onDismiss çağrılmayabiliyor: kapanış animasyonu kadar bekle.
    if (Platform.OS !== "ios") setTimeout(flushPending, 320);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onDismiss={Platform.OS === "ios" ? flushPending : undefined}
    >
      <View style={[styles.flex, { paddingTop: insets.top + 10 }]}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose} />
        {visible ? (
          <Animated.View
            entering={SlideInUp.springify().damping(18).stiffness(180)}
            style={[styles.sheet, { backgroundColor: colors.card }]}
          >
            <View style={styles.headRow}>
              <Text variant="display" style={[styles.title, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                {t("home.typeSheet.title", { defaultValue: "Yazarak analiz et" })}
              </Text>
              <Pressable onPress={onClose} hitSlop={10} style={[styles.close, { backgroundColor: colors.gray[100] }]} accessibilityLabel="Close">
                <Ionicons name="close" size={18} color={colors.gray[600]} />
              </Pressable>
            </View>

            <SegmentedControl
              value={mode}
              onChange={onModeChange}
              items={[
                { key: "text", label: t("home.typeSheet.ingredients", { defaultValue: "İçindekiler" }), icon: "document-text-outline", iconActive: "document-text" },
                { key: "barcode", label: t("home.typeSheet.barcode", { defaultValue: "Barkod no" }), icon: "barcode-outline", iconActive: "barcode" },
              ]}
            />

            {mode === "text" ? (
              <View style={[styles.inputBox, styles.textBox, { backgroundColor: colors.gray[50], borderColor: error ? colors.error : colors.gray[200] }]}>
                <TextInput
                  maxFontSizeMultiplier={FONT_SCALE_CAP}
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder={t("home.actions.enterText")}
                  placeholderTextColor={colors.gray[400]}
                  multiline
                  textAlignVertical="top"
                  value={text}
                  onChangeText={(v) => {
                    onTextChange(v);
                    if (error) setError(null);
                  }}
                  autoFocus
                />
                {text.length > 0 ? (
                  <Pressable onPress={() => onTextChange("")} style={styles.clearTop} hitSlop={8}>
                    <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <View style={[styles.inputBox, styles.barcodeBox, { backgroundColor: colors.gray[50], borderColor: error ? colors.error : colors.gray[200] }]}>
                <Ionicons name="barcode-outline" size={20} color={colors.gray[400]} />
                <TextInput
                  maxFontSizeMultiplier={FONT_SCALE_CAP}
                  style={[styles.barcodeInput, { color: colors.text }]}
                  placeholder={t("home.placeholders.barcode")}
                  placeholderTextColor={colors.gray[400]}
                  keyboardType="numeric"
                  value={barcode}
                  onChangeText={(v) => {
                    onBarcodeChange(v);
                    if (error) setError(null);
                  }}
                  returnKeyType="search"
                  onSubmitEditing={submit}
                  autoFocus
                />
                {barcode.length > 0 ? (
                  <Pressable onPress={() => onBarcodeChange("")} hitSlop={8}>
                    <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
                  </Pressable>
                ) : null}
              </View>
            )}

            {error ? (
              <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
            ) : mode === "barcode" ? (
              <Text style={[styles.note, { color: colors.gray[400] }]}>{t("home.disclaimer.off")}</Text>
            ) : null}

            <Pressable
              onPress={submit}
              accessibilityRole="button"
              style={({ pressed }) => [styles.submit, { backgroundColor: colors.primary }, pressed && { transform: [{ scale: 0.98 }] }]}
            >
              <Text style={styles.submitText}>
                {mode === "text" ? t("home.actions.analyzeText") : t("home.actions.search")}
              </Text>
              <Ionicons name={mode === "text" ? "arrow-forward" : "search"} size={18} color="#FFF" />
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sheet: {
    marginHorizontal: 12,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    lineHeight: 30,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  inputBox: {
    borderRadius: 16,
    borderWidth: 1,
  },
  textBox: {
    height: 128,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    padding: 14,
    paddingRight: 36,
    fontFamily: "Inter-Regular",
  },
  clearTop: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  barcodeBox: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  barcodeInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Inter-Medium",
    letterSpacing: 1,
  },
  error: {
    fontSize: 13,
    marginTop: -6,
  },
  note: {
    fontSize: 11.5,
    marginTop: -6,
    textAlign: "center",
  },
  submit: {
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
