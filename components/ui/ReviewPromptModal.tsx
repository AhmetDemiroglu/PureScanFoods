import React, { useMemo, useState, useEffect } from "react";
import { View, Modal, Pressable, StyleSheet } from "react-native";
import { Text } from "./AppText";
import { Ionicons } from "@expo/vector-icons";
import { AppColors } from "../../constants/colors";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import * as haptics from "../../lib/haptics";

interface ReviewPromptModalProps {
  visible: boolean;
  /** Pozitif: native mağaza yorumu istenir. */
  onRate: () => void;
  /** Negatif: özel geri bildirim (e-posta). */
  onFeedback: () => void;
  /** "Daha sonra" / backdrop / kapat: cooldown sonrası tekrar sorulabilir. */
  onSnooze: () => void;
  /** "Bir daha sorma": kalıcı kapat. */
  onNever: () => void;
}

export default function ReviewPromptModal({
  visible,
  onRate,
  onFeedback,
  onSnooze,
  onNever,
}: ReviewPromptModalProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [step, setStep] = useState<"ask" | "feedback">("ask");

  // Kapanınca bir sonraki açılış için adımı sıfırla (fade biterken flicker olmasın).
  useEffect(() => {
    if (!visible) {
      const id = setTimeout(() => setStep("ask"), 250);
      return () => clearTimeout(id);
    }
  }, [visible]);

  const handlePositive = () => {
    haptics.success();
    onRate();
  };

  const handleNegative = () => {
    haptics.selection();
    setStep("feedback");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSnooze}>
      <View style={styles.overlay}>
        {/* Backdrop kazara dokunuşta kapatmasın — yalnızca açık buton seçimleri kapatır.
            (Android donanım geri tuşu onRequestClose ile yine snooze yapar; bilinçli aksiyon.) */}
        <View style={styles.backdrop} />
        <View style={styles.container}>
          {step === "ask" ? (
            <>
              <View style={styles.iconCircle}>
                <Ionicons name="heart" size={30} color={colors.primary} />
              </View>

              <Text style={styles.title}>{t("appReview.title")}</Text>
              <Text style={styles.subtitle}>{t("appReview.subtitle")}</Text>

              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
                onPress={handlePositive}
              >
                <Ionicons name="star" size={16} color="#FFF" />
                <Text style={styles.primaryBtnText}>{t("appReview.positive")}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                onPress={handleNegative}
              >
                <Text style={styles.secondaryBtnText}>{t("appReview.negative")}</Text>
              </Pressable>

              <View style={styles.linkRow}>
                <Pressable onPress={onSnooze} hitSlop={10}>
                  <Text style={styles.linkText}>{t("appReview.later")}</Text>
                </Pressable>
                <View style={styles.linkDivider} />
                <Pressable onPress={onNever} hitSlop={10}>
                  <Text style={styles.linkTextMuted}>{t("appReview.never")}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.iconCircle, styles.iconCircleNeg]}>
                <Ionicons name="chatbubble-ellipses" size={28} color={colors.warning} />
              </View>

              <Text style={styles.title}>{t("appReview.neg_title")}</Text>
              <Text style={styles.subtitle}>{t("appReview.neg_subtitle")}</Text>

              <Pressable
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
                onPress={() => {
                  haptics.impactLight();
                  onFeedback();
                }}
              >
                <Ionicons name="mail" size={16} color="#FFF" />
                <Text style={styles.primaryBtnText}>{t("appReview.neg_feedback_btn")}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                onPress={onSnooze}
              >
                <Text style={styles.secondaryBtnText}>{t("appReview.neg_close")}</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    container: {
      width: "88%",
      maxWidth: 400,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 10,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.35 : 0.15,
      shadowRadius: 20,
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary + "15",
      marginBottom: 16,
    },
    iconCircleNeg: {
      backgroundColor: colors.warning + "15",
    },
    title: {
      fontSize: 19,
      fontWeight: "700",
      color: colors.secondary,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 13,
      color: colors.gray[500],
      lineHeight: 20,
      textAlign: "center",
      marginBottom: 22,
    },
    primaryBtn: {
      flexDirection: "row",
      gap: 8,
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    primaryBtnText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#FFF",
    },
    secondaryBtn: {
      height: 48,
      borderRadius: 14,
      backgroundColor: isDark ? colors.gray[100] : colors.gray[100],
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryBtnText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.gray[600],
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      marginTop: 16,
    },
    linkDivider: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.gray[300],
    },
    linkText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.gray[500],
    },
    linkTextMuted: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.gray[400],
    },
  });
