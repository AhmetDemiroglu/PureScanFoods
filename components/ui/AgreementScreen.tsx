// İlk açılış sözleşmesi. Eski 4 slaytlık karşılamanın yerine yalnız bu ekran gelir.
// Native düzen: başlık üstte, onay ve düğme altta sabit; metin ortada kendi içinde kayar.
// Bölümler iOS Ayarlar tarzı gruplanmış listedir. Kabul edilmeden kapatılamaz.

import React, { useMemo, useState } from "react";
import { Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Text } from "./AppText";
import BrandLogo from "../brand/BrandLogo";
import { useTheme } from "../../context/ThemeContext";
import * as haptics from "../../lib/haptics";

const TERMS_URL = "https://purescan-foods.septimuslab.com/terms/";
const PRIVACY_URL = "https://purescan-foods.septimuslab.com/privacy-policy/";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const SECTIONS: { key: string; icon: IconName; tint: string }[] = [
  { key: "analysis", icon: "sparkles", tint: "#F2600C" },
  { key: "medical", icon: "medkit", tint: "#DC2626" },
  { key: "allergens", icon: "alert-circle", tint: "#D97706" },
  { key: "experts", icon: "person", tint: "#2563EB" },
  { key: "data", icon: "lock-closed", tint: "#16A34A" },
];

type Props = {
  visible: boolean;
  onAccept: () => Promise<void> | void;
};

export function AgreementScreen({ visible, onAccept }: Props) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggle = () => {
    haptics.selection();
    setChecked((c) => !c);
  };

  const accept = async () => {
    if (!checked || busy) return;
    setBusy(true);
    haptics.success();
    try {
      await onAccept();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <View style={styles.column}>
          {/* Başlık */}
          <View style={styles.header}>
            <BrandLogo variant="mark" size={52} />
            <Text style={styles.title}>{t("agreement.title")}</Text>
            <Text style={styles.subtitle}>{t("agreement.subtitle")}</Text>
          </View>

          {/* Metin: yalnız burası kayar */}
          <View style={styles.scrollWrap}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator
              indicatorStyle={isDark ? "white" : "black"}
            >
              <View style={styles.group}>
                {SECTIONS.map((s, i) => (
                  <View key={s.key}>
                    {i > 0 ? <View style={styles.separator} /> : null}
                    <View style={styles.row}>
                      <View style={[styles.iconBox, { backgroundColor: s.tint }]}>
                        <Ionicons name={s.icon} size={16} color="#FFF" />
                      </View>
                      <View style={styles.rowText}>
                        <Text style={styles.rowTitle}>{t(`agreement.sections.${s.key}.title`)}</Text>
                        <Text style={styles.rowBody}>{t(`agreement.sections.${s.key}.body`)}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <Text style={styles.groupLabel}>{t("agreement.documents")}</Text>
              <View style={styles.group}>
                <Pressable
                  style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
                  onPress={() => Linking.openURL(TERMS_URL)}
                  accessibilityRole="link"
                >
                  <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                  <Text style={styles.linkText}>{t("agreement.terms")}</Text>
                  <Ionicons name="open-outline" size={16} color={colors.gray[400]} />
                </Pressable>
                <View style={[styles.separator, { marginLeft: 48 }]} />
                <Pressable
                  style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
                  onPress={() => Linking.openURL(PRIVACY_URL)}
                  accessibilityRole="link"
                >
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                  <Text style={styles.linkText}>{t("agreement.privacy")}</Text>
                  <Ionicons name="open-outline" size={16} color={colors.gray[400]} />
                </Pressable>
              </View>
              <Text style={styles.footnote}>{t("agreement.footnote")}</Text>
            </ScrollView>
            {/* Alt kenarda içeriğin devam ettiğini gösteren yumuşak geçiş */}
            <LinearGradient
              pointerEvents="none"
              colors={[`${colors.surface}00`, colors.surface]}
              style={styles.fade}
            />
          </View>

          {/* Onay: sabit */}
          <View style={styles.footer}>
            <Pressable
              onPress={toggle}
              style={styles.checkRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              hitSlop={6}
            >
              <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                {checked ? <Ionicons name="checkmark" size={16} color="#FFF" /> : null}
              </View>
              <Text style={styles.checkText}>{t("agreement.accept")}</Text>
            </Pressable>

            <Pressable
              onPress={accept}
              disabled={!checked || busy}
              accessibilityRole="button"
              accessibilityState={{ disabled: !checked || busy }}
              style={({ pressed }) => [styles.cta, !checked && styles.ctaDisabled, pressed && checked && { transform: [{ scale: 0.98 }] }]}
            >
              <Text style={[styles.ctaText, !checked && styles.ctaTextDisabled]}>{t("agreement.cta")}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    column: {
      flex: 1,
      width: "100%",
      maxWidth: 560,
      alignSelf: "center",
    },
    header: {
      alignItems: "center",
      paddingTop: Platform.OS === "android" ? 28 : 16,
      paddingHorizontal: 28,
      paddingBottom: 14,
    },
    title: {
      marginTop: 14,
      fontSize: 26,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
      letterSpacing: -0.3,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 15,
      lineHeight: 21,
      color: colors.textMuted,
      textAlign: "center",
    },
    scrollWrap: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 8,
      paddingBottom: 28,
    },
    group: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: isDark ? StyleSheet.hairlineWidth : 0,
      borderColor: colors.border,
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 14,
      paddingHorizontal: 14,
      gap: 12,
    },
    iconBox: {
      width: 30,
      height: 30,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    rowText: {
      flex: 1,
    },
    rowTitle: {
      fontSize: 15.5,
      fontWeight: "700",
      color: colors.text,
    },
    rowBody: {
      marginTop: 4,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textMuted,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: 56,
    },
    groupLabel: {
      marginTop: 22,
      marginBottom: 8,
      marginLeft: 14,
      fontSize: 12.5,
      fontWeight: "600",
      letterSpacing: 0.4,
      textTransform: "uppercase",
      color: colors.textMuted,
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 13,
      paddingHorizontal: 14,
    },
    linkRowPressed: {
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    },
    linkText: {
      flex: 1,
      fontSize: 15.5,
      color: colors.text,
    },
    footnote: {
      marginTop: 10,
      marginHorizontal: 14,
      fontSize: 12.5,
      lineHeight: 18,
      color: colors.textMuted,
    },
    fade: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 28,
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Platform.OS === "android" ? 16 : 6,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    checkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 6,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: isDark ? "rgba(255,255,255,0.3)" : "#D6C8BA",
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxOn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "600",
      color: colors.text,
    },
    cta: {
      marginTop: 12,
      height: 52,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    ctaDisabled: {
      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#EFE4D8",
    },
    ctaText: {
      fontSize: 17,
      fontWeight: "700",
      color: "#FFF",
    },
    ctaTextDisabled: {
      color: isDark ? "rgba(255,255,255,0.35)" : "#A8998A",
    },
  });
