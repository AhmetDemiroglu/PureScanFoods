// Ana ekran üst barı: solda üyelik rozeti (Premium / Ücretsiz), sağda profil ve geçmiş tek cam kapsülde.
// Rozet camın DIŞINDA: camın içindeki animasyon cam katmanını yeniden çizdirip düğmeleri titretiyordu.
// Dil ve tema Ayarlar'a taşındı ("Görünüm ve dil" kartı).
import { View, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { Text } from "./AppText";
import { useMemo, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AppColors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../profile/AuthModal";
import { useTourTarget } from "../tour/TourContext";
import { useTheme } from "../../context/ThemeContext";
import GlassSurface from "./GlassSurface";
import PlanBadge from "./PlanBadge";

interface HeaderProps {
  onHistoryPress?: () => void;
}

export default function Header({ onHistoryPress }: HeaderProps) {
  const { isPremium, user, userProfile } = useAuth();
  const { colors, isDark } = useTheme();
  const [showAuth, setShowAuth] = useState(false);
  const historyTarget = useTourTarget("home.history");
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const isLoggedIn = user && !user.isAnonymous;
  // Dar ekranda (ör. 320 pt) kapsülde yalnız avatar, rozette yalnız simge.
  const { width } = useWindowDimensions();
  const narrow = width < 360;

  return (
    <View style={styles.header}>
      <PlanBadge premium={!!isPremium} compact={narrow && !!isLoggedIn} onPress={() => setShowAuth(true)} />
      <GlassSurface radius={26} elevation="sm" contentStyle={styles.capsule}>

        <Pressable
          style={({ pressed }) => [styles.profileButton, isLoggedIn && !narrow && styles.profileButtonExpanded, pressed && styles.pressed]}
          onPress={() => setShowAuth(true)}
          accessibilityRole="button"
          accessibilityLabel={isLoggedIn ? userProfile?.displayName || user?.email || "Profile" : "Profile"}
        >
          {isLoggedIn ? (
            <>
              {!narrow ? (
                <View style={styles.profileText}>
                  <Text style={styles.profileName} numberOfLines={1} maxFontSizeMultiplier={1.15}>
                    {userProfile?.displayName || user.email?.split("@")[0]}
                  </Text>
                </View>
              ) : null}
              <View style={[styles.avatarMini, { backgroundColor: userProfile?.color || colors.primary }]}>
                <MaterialCommunityIcons name={(userProfile?.avatarIcon || "account") as any} size={16} color="#FFF" />
              </View>
            </>
          ) : (
            <Ionicons name="person-outline" size={19} color={colors.secondary} />
          )}
        </Pressable>

        <View style={styles.divider} />

        <View {...historyTarget}>
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            onPress={onHistoryPress}
            accessibilityRole="button"
            accessibilityLabel="History"
          >
            <MaterialCommunityIcons name="history" size={22} color={colors.secondary} />
          </Pressable>
        </View>
      </GlassSurface>

      <AuthModal visible={showAuth} onClose={() => setShowAuth(false)} />
    </View>
  );
}

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 20,
      marginTop: 10,
      zIndex: 10,
    },
    capsule: {
      flexDirection: "row",
      alignItems: "center",
      padding: 4,
      gap: 2,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.95 }],
    },
    premiumBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(251,191,36,0.14)" : "rgba(253,230,138,0.45)",
    },
    profileButton: {
      height: 40,
      minWidth: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    profileButtonExpanded: {
      flexDirection: "row",
      paddingLeft: 10,
      paddingRight: 4,
      gap: 8,
    },
    profileText: {
      alignItems: "flex-end",
      maxWidth: 96,
    },
    profileName: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.text,
      lineHeight: 15,
    },
    profileRole: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.textMuted,
      lineHeight: 13,
    },
    profileRolePremium: {
      color: isDark ? "#FBBF24" : "#D97706",
    },
    avatarMini: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    divider: {
      width: StyleSheet.hairlineWidth,
      height: 22,
      backgroundColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(42,31,24,0.14)",
      marginHorizontal: 2,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
  });
