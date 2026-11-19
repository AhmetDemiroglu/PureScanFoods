// "Profilim" penceresinin bölümleri (AuthModal.renderProfile). Ayarlar'daki profil kartıyla aynı dil:
// köşeli avatar, serif ad, üyelik hapı; altında beyaz, ince kenarlı kartlarda beslenme planı ve alerjenler.
// Yalnız görünüm: veri ve durum (alerjen listesinin açık/kapalı hali) AuthModal'dan gelir.
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text } from "../ui/AppText";
import { useTheme } from "../../context/ThemeContext";
import type { AppColors } from "../../constants/colors";
import { Radii } from "../../constants/design";
import { DIET_DEFINITIONS, DietType } from "../../lib/diets";
import { currentLanguage } from "../../lib/language";

/** Kapalı halde gösterilen alerjen sayısı; fazlası "Tümünü göster (n)" ile açılır. */
const ALLERGEN_PREVIEW = 6;

// Premium altın tonları (üst bardaki üyelik rozetiyle aynı geçiş).
const GOLD = ["#FDE68A", "#FBBF24", "#D97706"] as const;
const GOLD_INK = "#5B3505";

function useSectionStyles() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  return { styles, colors, isDark };
}

export function MemberPill({ isPremium }: { isPremium: boolean }) {
  const { t } = useTranslation();
  const { styles } = useSectionStyles();

  if (isPremium) {
    return (
      <View style={[styles.memberPill, styles.memberPillPremium]}>
        <LinearGradient
          colors={GOLD}
          locations={[0, 0.45, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.goldEdge} />
        <MaterialCommunityIcons name="crown" size={12} color={GOLD_INK} />
        <Text style={styles.memberTextPremium} numberOfLines={1}>
          {t("profile.premium_member")}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.memberPill, styles.memberPillFree]}>
      <Text style={styles.memberText} numberOfLines={1}>
        {t("profile.free_member")}
      </Text>
    </View>
  );
}

export function ProfileHeader({
  name,
  email,
  avatarColor,
  avatarIcon,
  isPremium,
}: {
  name?: string | null;
  email?: string | null;
  avatarColor: string;
  avatarIcon: string;
  isPremium: boolean;
}) {
  const { styles } = useSectionStyles();

  return (
    <View style={styles.header}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <MaterialCommunityIcons name={avatarIcon as any} size={30} color="#FFF" />
        {isPremium && (
          <View style={styles.crownBadge}>
            <MaterialCommunityIcons name="crown" size={12} color="#D97706" />
          </View>
        )}
      </View>
      <View style={styles.headerInfo}>
        <Text variant="display" style={styles.name} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
          {name}
        </Text>
        {!!email && (
          <Text style={styles.email} numberOfLines={2}>
            {email}
          </Text>
        )}
        <MemberPill isPremium={isPremium} />
      </View>
    </View>
  );
}

export function DietCard({ diet }: { diet?: string | null }) {
  const { t, i18n } = useTranslation();
  const { styles, colors } = useSectionStyles();

  // Kısa "analiz kapsamı" metni mevcut diyet tanımından (Beslenme ekranındakiyle aynı kaynak).
  const def = diet ? DIET_DEFINITIONS[diet as DietType] : undefined;
  const lang = currentLanguage(i18n.language);
  const scope = def ? (lang === "tr" ? def.aiExplanationTr : lang === "es" ? def.aiExplanationEs : def.aiExplanation) : null;

  return (
    <View style={[styles.card, styles.row]}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="silverware-fork-knife" size={18} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text variant="display" style={styles.cardTitle} numberOfLines={2}>
          {t("profile.diet_plan")}
        </Text>
        {diet ? (
          <>
            <Text style={styles.value}>{t(`diets.${diet}` as any)}</Text>
            {!!scope && <Text style={styles.hint}>{scope}</Text>}
          </>
        ) : (
          <Text style={styles.valueMuted}>{t("profile.no_diet")}</Text>
        )}
      </View>
    </View>
  );
}

export function AllergenCard({
  allergens,
  expanded,
  onToggle,
}: {
  allergens: string[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const { styles, colors, isDark } = useSectionStyles();
  const safeGreen = isDark ? "#4CC07A" : "#2E9E5B";

  // Boş durum: tek satırlık sakin kart, yeşil kalkan.
  if (allergens.length === 0) {
    return (
      <View style={[styles.card, styles.row]}>
        <View style={[styles.iconCircle, styles.iconCircleSafe]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={safeGreen} />
        </View>
        <View style={styles.flex}>
          <Text variant="display" style={styles.cardTitle} numberOfLines={2}>
            {t("profile.allergens_title")}
          </Text>
          <Text style={[styles.value, { color: safeGreen }]}>{t("profile.no_allergen")}</Text>
          <Text style={styles.hint}>
            {t("profile.no_allergen_hint", {
              defaultValue: "Alerjen eklersen, onu içeren ürünlerde seni uyarırız.",
            })}
          </Text>
        </View>
      </View>
    );
  }

  const canCollapse = allergens.length > ALLERGEN_PREVIEW;
  const shown = canCollapse && !expanded ? allergens.slice(0, ALLERGEN_PREVIEW) : allergens;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Ionicons name="warning-outline" size={18} color={colors.primary} />
        </View>
        <Text variant="display" style={[styles.cardTitle, styles.flex]} numberOfLines={2}>
          {t("profile.allergens_title")}
        </Text>
        <View style={styles.countPill}>
          <Text style={styles.countText} maxFontSizeMultiplier={1.15}>
            {allergens.length}
          </Text>
        </View>
      </View>

      <View style={styles.pills}>
        {shown.map((a) => (
          <View key={a} style={styles.pill}>
            <Ionicons name="warning" size={11} color={isDark ? colors.primary : colors.primaryDeep} />
            <Text style={styles.pillText}>{t(`allergens.${a}` as any)}</Text>
          </View>
        ))}
      </View>

      {canCollapse && (
        <Pressable
          onPress={onToggle}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          style={({ pressed }) => [styles.toggle, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.toggleText}>
            {expanded ? t("profile.show_less") : `${t("profile.show_all")} (${allergens.length})`}
          </Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={14} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    flex: { flex: 1, minWidth: 0 },
    row: { flexDirection: "row", alignItems: "center", gap: 12 },

    // Başlık: Ayarlar profil kartıyla aynı ölçüler
    header: { flexDirection: "row", alignItems: "center", gap: 14 },
    avatar: { width: 60, height: 60, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    crownBadge: {
      position: "absolute",
      bottom: -4,
      right: -4,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: isDark ? "rgba(251,191,36,0.45)" : "#F6D58A",
    },
    // Sağdaki kapatma düğmesi adın üstüne binmesin.
    headerInfo: { flex: 1, minWidth: 0, paddingRight: 18 },
    name: { fontSize: 22, lineHeight: 27, color: colors.text },
    email: { fontSize: 13, color: colors.textMuted, marginTop: 1 },

    memberPill: {
      alignSelf: "flex-start",
      maxWidth: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: Radii.pill,
      marginTop: 8,
      overflow: "hidden",
    },
    memberPillPremium: { paddingHorizontal: 11 },
    goldEdge: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: Radii.pill,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.55)",
    },
    memberPillFree: {
      backgroundColor: colors.gray[100],
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.gray[200],
    },
    memberText: { fontSize: 11, fontWeight: "700", color: colors.gray[600], letterSpacing: 0.2, flexShrink: 1 },
    memberTextPremium: { fontSize: 11, fontWeight: "700", color: GOLD_INK, letterSpacing: 0.2, flexShrink: 1 },

    // Kartlar
    card: {
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : colors.card,
      borderRadius: Radii.card,
      borderWidth: 1,
      borderColor: isDark ? colors.border : colors.gray[200],
      padding: 14,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,139,61,0.16)" : "#FFF1E6",
      alignSelf: "flex-start",
    },
    iconCircleSafe: { backgroundColor: isDark ? "rgba(76,192,122,0.16)" : "#E8F6EE" },
    cardTitle: { fontSize: 17, lineHeight: 22, color: colors.text },
    value: { fontSize: 14.5, fontWeight: "600", color: isDark ? colors.primary : colors.primaryDeep, marginTop: 2 },
    valueMuted: { fontSize: 14, fontWeight: "500", color: colors.textMuted, marginTop: 2 },
    hint: { fontSize: 12.5, lineHeight: 17, color: colors.textMuted, marginTop: 3 },

    countPill: {
      minWidth: 26,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: Radii.pill,
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,139,61,0.16)" : "#FFF1E6",
    },
    countText: { fontSize: 12, fontWeight: "700", color: colors.primary },

    pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
    pill: {
      maxWidth: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: Radii.pill,
      backgroundColor: isDark ? "rgba(255,139,61,0.13)" : "#FFF4EC",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,139,61,0.28)" : "rgba(242,96,12,0.18)",
    },
    pillText: { fontSize: 12.5, fontWeight: "600", color: colors.text, flexShrink: 1 },

    toggle: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 4, marginTop: 12 },
    toggleText: { fontSize: 13, fontWeight: "600", color: colors.primary },
  });
