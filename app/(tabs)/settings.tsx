import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable, StatusBar, Linking, LayoutAnimation, Platform, UIManager, TextInput, ActivityIndicator, TouchableOpacity, Alert, Image } from "react-native";
import { Text } from "../../components/ui/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors } from "../../constants/colors";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../lib/firebase"
import * as Application from "expo-application";
import PremiumCompareModal from "../../components/ui/PremiumCompareModal";
import { useShell } from "../../context/ShellContext";
import * as haptics from "../../lib/haptics";
import PaywallModal from "../../components/ui/PaywallModal";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";
import AuthModal from "../../components/profile/AuthModal";
import { useTheme } from "../../context/ThemeContext";
import { SeptimusSignature } from "../../components/brand/SeptimusSignature";
import { resetAllTours } from "../../components/tour/TourContext";
import { FONT_SCALE_CAP, Radii } from "../../constants/design";
import PageHeader from "../../components/ui/PageHeader";
import ThemeToggle from "../../components/ui/ThemeToggle";
import UsageRings, { buildWeeklyRights } from "../../components/ui/UsageRings";
import { APP_LANGUAGES, currentLanguage, setAppLanguage } from "../../lib/language";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";


if (Platform.OS === "android" && !(global as any).nativeFabricUIManager && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const APP_VERSION = Application.nativeApplicationVersion || "1.0.0";
const PRIVACY_URL = "https://purescan-foods.septimuslab.com/privacy-policy/";
const SUPPORT_EMAIL = "info@septimuslab.com";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];
type SettingsStyles = ReturnType<typeof createStyles>;

/**
 * Gruplu listenin tek satırı. Tek vurgu rengi (turuncu); silme satırları kırmızı.
 * trailing: chevron (alt ekran/onay), external (dış bağlantı), refresh, expand (açılır panel).
 */
function MenuRow({
  styles,
  colors,
  isDark,
  icon,
  title,
  subtitle,
  onPress,
  trailing = "chevron",
  expanded,
  tone = "default",
}: {
  styles: SettingsStyles;
  colors: AppColors;
  isDark: boolean;
  icon: IoniconName;
  title: string;
  subtitle?: string;
  onPress: () => void | Promise<void>;
  trailing?: "chevron" | "external" | "refresh" | "expand";
  expanded?: boolean;
  tone?: "default" | "caution" | "danger";
}) {
  const destructive = tone !== "default";
  const tint = destructive ? colors.error : colors.primary;
  const iconBg = destructive
    ? isDark ? "rgba(248,113,113,0.16)" : "rgba(239,68,68,0.10)"
    : isDark ? "rgba(255,139,61,0.16)" : "rgba(242,96,12,0.10)";
  const trailingIcon: IoniconName =
    trailing === "expand"
      ? expanded ? "chevron-up" : "chevron-down"
      : trailing === "external"
        ? "open-outline"
        : trailing === "refresh"
          ? "refresh"
          : "chevron-forward";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityState={trailing === "expand" ? { expanded: !!expanded } : undefined}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={17} color={tint} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, tone === "danger" && { color: colors.error }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Ionicons name={trailingIcon} size={trailing === "external" || trailing === "refresh" ? 17 : 18} color={colors.gray[400]} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, isDark, toggleTheme } = useTheme();
  const activeLang = currentLanguage(i18n.language);
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { user, userProfile, isPremium, usageStats, logout, deleteUserData, deleteAccount } = useAuth();
  const { familyMembers } = useUser();
  const router = useRouter();
  // Alt bar içeriğin üstünde yüzer: son kart barın altında kalmasın.
  const tabBarHeight = useBottomTabBarHeight();

  const [passwordSectionOpen, setPasswordSectionOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { openSidebar } = useShell();
  const [dataManagementOpen, setDataManagementOpen] = useState(false);
  const [deleteDataModalVisible, setDeleteDataModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPaywall, setPendingPaywall] = useState(false);

  const isAnonymous = user?.isAnonymous ?? true;
  const isLoggedIn = user && !isAnonymous;

  // Auth sonrası paywall açma kontrolü
  React.useEffect(() => {
    if (pendingPaywall && isLoggedIn) {
      setPendingPaywall(false);
      // Önce tüm modalları kapat
      setPremiumModalVisible(false);
      setShowAuthModal(false);
      // Kısa gecikme ile Paywall aç
      setTimeout(() => {
        setShowPaywall(true);
      }, 200);
    }
  }, [user, isLoggedIn, pendingPaywall]);

  // Haftalık haklar: değer ve tükenme kuralları ortak yardımcıda (UsageRings.buildWeeklyRights), eskisiyle aynı.
  const weeklyRights = buildWeeklyRights({
    isPremium,
    usageStats,
    familyMembersLength: familyMembers?.length,
    labels: {
      scan: t("settings.scan_rights"),
      chat: t("settings.chat_rights"),
      family: t("settings.family_slots"),
      image: t("settings.image_rights"),
    },
  });

  // Password section toggle
  const togglePasswordSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPasswordSectionOpen(!passwordSectionOpen);
    if (passwordSectionOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t("settings.error"), t("settings.fill_all_fields"));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t("settings.error"), t("settings.passwords_not_match"));
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(t("settings.error"), t("settings.password_min_length"));
      return;
    }

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user!.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);
      await updatePassword(auth.currentUser!, newPassword);

      Alert.alert(t("settings.success"), t("settings.password_changed"));
      togglePasswordSection();
    } catch (error: any) {
      const errorMsg = error.code === "auth/wrong-password"
        ? t("settings.wrong_password")
        : t("settings.password_change_error");
      Alert.alert(t("settings.error"), errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Data management toggle
  const toggleDataManagement = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDataManagementOpen(!dataManagementOpen);
  };

  // Contact support
  const handleContactSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t("settings.support_subject"))}`);
  };

  // Privacy policy
  const handlePrivacyPolicy = () => {
    Linking.openURL(PRIVACY_URL);
  };

  return (
    <View style={styles.container}>

      {/* Header (ortak PageHeader) */}
      <PageHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
        onBack={() => router.replace("/")}
        onHistory={openSidebar}
      />

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* === Görünüm ve dil: ana ekran başlığından taşındı (güneş/ay anahtarı ve bayraklar aynı) === */}
        <View style={styles.prefCard}>
          <View style={styles.prefRow}>
            <View style={[styles.prefIcon, { backgroundColor: isDark ? "rgba(147,197,253,0.14)" : "#EFF6FF" }]}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={18} color={isDark ? "#93C5FD" : "#F59E0B"} />
            </View>
            <View style={styles.prefText}>
              <Text style={styles.prefTitle}>{t("settings.theme")}</Text>
              <Text style={styles.prefValue}>{isDark ? t("settings.theme_dark") : t("settings.theme_light")}</Text>
            </View>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} primaryColor={colors.primary} warningColor={colors.warning} />
          </View>

          <View style={styles.prefDivider} />

          <View style={styles.prefLangHead}>
            <View style={[styles.prefIcon, { backgroundColor: isDark ? "rgba(242,96,12,0.18)" : "#FFF3EA" }]}>
              <Ionicons name="language" size={18} color={colors.primary} />
            </View>
            <Text style={styles.prefTitle}>{t("settings.language")}</Text>
          </View>
          <View style={styles.flagRow}>
            {APP_LANGUAGES.map((lang) => {
              const active = lang.code === activeLang;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => {
                    if (active) return;
                    haptics.selection();
                    setAppLanguage(lang.code);
                  }}
                  style={({ pressed }) => [styles.flagPill, active && styles.flagPillActive, pressed && { transform: [{ scale: 0.96 }] }]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={lang.label}
                >
                  <Image source={lang.flag} style={styles.flagImg} />
                  <Text style={[styles.flagLabel, active && styles.flagLabelActive]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                    {lang.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* === SECTION 1: Profil kartı ve haftalık haklar (tek kart) === */}
        <View style={styles.profileCard}>
          {/* Sağ üstten düşen yumuşak turuncu ışık (başlıktaki ışıkla aynı dil). */}
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Svg width="100%" height="100%">
              <Defs>
                <RadialGradient id="settingsProfileGlow" cx="100%" cy="0%" r="85%">
                  <Stop offset="0" stopColor={colors.primary} stopOpacity={isDark ? 0.16 : 0.09} />
                  <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#settingsProfileGlow)" />
            </Svg>
          </View>

          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: userProfile?.color || colors.primary }]}>
              <MaterialCommunityIcons
                name={(userProfile?.avatarIcon || "account") as any}
                size={30}
                color="#FFF"
              />
              {isPremium && (
                <View style={styles.crownBadge}>
                  <MaterialCommunityIcons name="crown" size={12} color={colors.primary} />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text
                variant="display"
                style={styles.profileName}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {isLoggedIn
                  ? (userProfile?.displayName || user?.email?.split("@")[0])
                  : t("settings.guest_user")}
              </Text>
              <Text style={styles.profileEmail} numberOfLines={isLoggedIn ? 2 : undefined}>
                {isLoggedIn ? user?.email : t("settings.guest_desc")}
              </Text>
              {isPremium ? (
                <LinearGradient
                  colors={[colors.primary, colors.primaryDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.memberPill}
                >
                  <MaterialCommunityIcons name="crown" size={11} color="#FFF" />
                  <Text style={styles.memberTextPremium} numberOfLines={1}>
                    {t("settings.premium_member")}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={[styles.memberPill, styles.memberPillFree]}>
                  <Text style={styles.memberText} numberOfLines={1}>
                    {t("settings.free_member")}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Haftalık haklar: dört küçük halka */}
          <View style={styles.usageSection}>
            <Text style={styles.sectionLabel}>{t("settings.my_rights")}</Text>
            <UsageRings items={weeklyRights} size={50} />
          </View>
        </View>

        {/* === SECTION 1.5: Login CTA (Guest) === */}
        {!isLoggedIn && (
          <View style={styles.section}>
            <Pressable
              style={({ pressed }) => [pressed && styles.cardPressed]}
              onPress={() => setShowAuthModal(true)}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginGradient}
              >
                <View pointerEvents="none" style={styles.ctaGlow}>
                  <Svg width="100%" height="100%">
                    <Defs>
                      <RadialGradient id="settingsLoginGlow" cx="92%" cy="0%" r="80%">
                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity={isDark ? 0.16 : 0.24} />
                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
                      </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#settingsLoginGlow)" />
                  </Svg>
                </View>
                <View style={styles.loginIconBox}>
                  <Ionicons name="log-in-outline" size={22} color={colors.primary} />
                </View>
                <View style={styles.loginContent}>
                  <Text
                    variant="display"
                    style={styles.loginTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {t("settings.login_label")}
                  </Text>
                  <Text style={styles.loginDesc}>{t("settings.login_sublabel")}</Text>
                </View>
                <View style={styles.ctaChevronWhite}>
                  <Ionicons name="chevron-forward" size={18} color="#FFF" />
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* === SECTION 2: Premium CTA === */}
        {!isPremium && (
          <View style={styles.section}>
            <Pressable
              style={({ pressed }) => [pressed && styles.cardPressed]}
              onPress={() => setPremiumModalVisible(true)}
            >
              <LinearGradient
                colors={isDark ? ["rgba(255,139,61,0.20)", "rgba(226,85,11,0.08)"] : ["#FFF5EC", "#FFE7D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumGradient}
              >
                <View style={styles.premiumIconBox}>
                  <MaterialCommunityIcons name="crown" size={22} color={colors.primary} />
                </View>
                <View style={styles.premiumContent}>
                  <Text
                    variant="display"
                    style={styles.premiumTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {t("settings.premium_title")}
                  </Text>
                  <Text style={styles.premiumDesc}>{t("settings.premium_desc")}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* === SECTION 3: Account Settings (Password) === */}
        {isLoggedIn && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.account_settings")}</Text>
            <View style={styles.group}>
              <MenuRow
                styles={styles}
                colors={colors}
                isDark={isDark}
                icon="lock-closed-outline"
                title={t("settings.change_password")}
                trailing="expand"
                expanded={passwordSectionOpen}
                onPress={togglePasswordSection}
              />

              {passwordSectionOpen && (
                <View style={styles.passwordForm}>
                  <View style={styles.inputBox}>
                    <Ionicons name="key-outline" size={18} color={colors.gray[400]} />
                    <TextInput
                      maxFontSizeMultiplier={FONT_SCALE_CAP}
                      style={styles.input}
                      placeholder={t("settings.current_password")}
                      placeholderTextColor={colors.gray[400]}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry={!showCurrentPassword}
                    />
                    <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)} hitSlop={8}>
                      <Ionicons name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.gray[400]} />
                    </Pressable>
                  </View>
                  <View style={styles.inputBox}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.gray[400]} />
                    <TextInput
                      maxFontSizeMultiplier={FONT_SCALE_CAP}
                      style={styles.input}
                      placeholder={t("settings.new_password")}
                      placeholderTextColor={colors.gray[400]}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                    />
                    <Pressable onPress={() => setShowNewPassword(!showNewPassword)} hitSlop={8}>
                      <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.gray[400]} />
                    </Pressable>
                  </View>
                  <View style={styles.inputBox}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.gray[400]} />
                    <TextInput
                      maxFontSizeMultiplier={FONT_SCALE_CAP}
                      style={styles.input}
                      placeholder={t("settings.confirm_password")}
                      placeholderTextColor={colors.gray[400]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showNewPassword}
                    />
                  </View>
                  <Pressable
                    style={[styles.changePasswordBtn, passwordLoading && styles.btnDisabled]}
                    onPress={handleChangePassword}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={styles.changePasswordBtnText}>
                        {t("settings.update_password")}
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )}

        {/* === SECTION 4: Support & Contact === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.support_contact")}</Text>
          <View style={styles.group}>
            <MenuRow
              styles={styles}
              colors={colors}
              isDark={isDark}
              icon="mail-outline"
              title={t("settings.contact_us")}
              subtitle={SUPPORT_EMAIL}
              trailing="external"
              onPress={handleContactSupport}
            />
            <View style={styles.separator} />
            <MenuRow
              styles={styles}
              colors={colors}
              isDark={isDark}
              icon="sparkles-outline"
              title={t("tour.replay")}
              subtitle={t("tour.replayDone")}
              trailing="refresh"
              onPress={async () => {
                haptics.selection();
                await resetAllTours();
                router.replace("/");
              }}
            />
          </View>
        </View>

        {/* === SECTION 5: About === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.about")}</Text>
          <View style={styles.group}>
            <MenuRow
              styles={styles}
              colors={colors}
              isDark={isDark}
              icon="shield-checkmark-outline"
              title={t("settings.privacy_policy")}
              subtitle={t("settings.privacy_policy_desc")}
              trailing="external"
              onPress={handlePrivacyPolicy}
            />
          </View>
        </View>

        {/* === SECTION 5.5: Data Management === */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.data_management")}</Text>
            <View style={styles.group}>
              <MenuRow
                styles={styles}
                colors={colors}
                isDark={isDark}
                icon="server-outline"
                title={t("settings.data_management_label")}
                subtitle={t("settings.data_management_desc")}
                trailing="expand"
                expanded={dataManagementOpen}
                onPress={toggleDataManagement}
              />

              {dataManagementOpen && (
                <View style={styles.subGroup}>
                  {/* Delete Data - Warning */}
                  <MenuRow
                    styles={styles}
                    colors={colors}
                    isDark={isDark}
                    icon="trash-outline"
                    tone="caution"
                    title={t("settings.delete_data_label")}
                    subtitle={t("settings.delete_data_sublabel")}
                    trailing="chevron"
                    onPress={() => setDeleteDataModalVisible(true)}
                  />
                  <View style={styles.separator} />
                  {/* Delete Account - Danger */}
                  <MenuRow
                    styles={styles}
                    colors={colors}
                    isDark={isDark}
                    icon="person-remove-outline"
                    tone="danger"
                    title={t("settings.delete_account_label")}
                    subtitle={t("settings.delete_account_sublabel")}
                    trailing="chevron"
                    onPress={() => setDeleteAccountModalVisible(true)}
                  />
                  {/* Logout (only for non-anonymous users) */}
                  {isLoggedIn && (
                    <>
                      <View style={styles.separator} />
                      <MenuRow
                        styles={styles}
                        colors={colors}
                        isDark={isDark}
                        icon="log-out-outline"
                        title={t("settings.logout_label")}
                        subtitle={t("settings.logout_sublabel")}
                        trailing="chevron"
                        onPress={logout}
                      />
                    </>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* === SECTION 6: Disclaimer === */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <Ionicons name="alert-circle" size={20} color="#D97706" />
            <Text style={styles.disclaimerTitle}>{t("settings.disclaimer_title")}</Text>
          </View>
          <Text style={styles.disclaimerText}>{t("settings.disclaimer_text")}</Text>
        </View>

        {/* === SECTION 7: İmza + Sürüm === */}
        <View style={styles.developerCard}>
          <SeptimusSignature theme={isDark ? "dark" : "light"} size={20} />
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeText}>v{APP_VERSION}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      
      <PremiumCompareModal
        visible={premiumModalVisible}
        onClose={() => setPremiumModalVisible(false)}
        onSubscribe={() => {
          // Önce modalı kapat
          setPremiumModalVisible(false);
          // Modal kapanma animasyonu için bekle
          setTimeout(() => {
            if (user?.isAnonymous) {
              // Misafir kullanıcı önce auth yapmalı
              setShowAuthModal(true);
              setPendingPaywall(true);
            } else {
              // Giriş yapmış kullanıcı direkt paywall'e gider
              setShowPaywall(true);
            }
          }, 300);
        }}
      />
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onAuthRequired={() => {
          setShowPaywall(false);
          setShowAuthModal(true);
          setPendingPaywall(true);
        }}
      />
      <ConfirmDeleteModal
        visible={deleteDataModalVisible}
        onClose={() => setDeleteDataModalVisible(false)}
        onConfirm={deleteUserData}
        type="data"
      />
      <ConfirmDeleteModal
        visible={deleteAccountModalVisible}
        onClose={() => setDeleteAccountModalVisible(false)}
        onConfirm={async () => {
          await deleteAccount();
        }}
        type="account"
      />
      <AuthModal 
        visible={showAuthModal} 
        onClose={() => {
          setShowAuthModal(false);
          // Eğer kullanıcı giriş yapmadan kapattıysa pending'i sıfırla
          if (!user || user.isAnonymous) {
            setPendingPaywall(false);
          }
        }} 
      />
    </View>
  );
}

const createStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleArea: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 12 },

  // Profile Card
  prefCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  prefIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  prefText: {
    flex: 1,
    minWidth: 0,
  },
  prefTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  prefValue: {
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  prefDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray[200],
    marginVertical: 14,
  },
  prefLangHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  flagRow: {
    flexDirection: "row",
    gap: 8,
  },
  flagPill: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    backgroundColor: isDark ? colors.gray[100] : colors.gray[50],
  },
  flagPillActive: {
    borderColor: colors.primary,
    backgroundColor: isDark ? "rgba(255,139,61,0.12)" : "#FFF3EA",
  },
  flagImg: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  flagLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    flexShrink: 1,
  },
  flagLabelActive: {
    color: colors.primary,
  },
  // Profil kartı: avatar, ad, üyelik hapı ve haftalık halkalar tek kartta
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: Radii.card,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: "hidden",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
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
    borderColor: colors.gray[200],
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: 22,
    lineHeight: 27,
    color: colors.text,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },
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
  },
  memberPillFree: {
    backgroundColor: colors.gray[100],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray[200],
  },
  memberText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[600],
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  memberTextPremium: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.2,
    flexShrink: 1,
  },

  // Haftalık haklar
  usageSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray[200],
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[400],
    letterSpacing: 0.6,
    marginBottom: 12,
  },

  // Giriş ve Premium kartları
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  loginGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: Radii.card,
  },
  ctaGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radii.card,
    overflow: "hidden",
  },
  loginIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  loginContent: {
    flex: 1,
    minWidth: 0,
  },
  loginTitle: {
    fontSize: 19,
    lineHeight: 24,
    color: "#FFF",
  },
  loginDesc: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.86)",
    marginTop: 2,
  },
  ctaChevronWhite: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: isDark ? "rgba(255,139,61,0.28)" : "rgba(242,96,12,0.16)",
  },
  premiumIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: isDark ? "rgba(255,139,61,0.18)" : "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumContent: {
    flex: 1,
    minWidth: 0,
  },
  premiumTitle: {
    fontSize: 19,
    lineHeight: 24,
    color: isDark ? colors.text : colors.primaryDeep,
  },
  premiumDesc: {
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Gruplu liste (iOS ayar listesi): yuvarlak grup, satırlar arasında ince çizgi
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[400],
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 16,
  },
  group: {
    backgroundColor: colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: "hidden",
  },
  subGroup: {
    backgroundColor: isDark ? colors.gray[100] : colors.gray[50],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray[200],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 16,
  },
  rowPressed: {
    backgroundColor: isDark ? colors.gray[200] : colors.gray[100],
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray[200],
    marginLeft: 58,
  },

  // Password Form
  passwordForm: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray[200],
    backgroundColor: isDark ? colors.gray[100] : colors.gray[50],
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: Radii.control,
    paddingHorizontal: 14,
    minHeight: 48,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
    color: colors.text,
  },
  changePasswordBtn: {
    minHeight: 48,
    borderRadius: Radii.control,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  changePasswordBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  btnDisabled: {
    opacity: 0.6,
  },

  // İmza + sürüm
  developerCard: {
    padding: 0,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 0,
    gap: 10,
  },
  versionBadge: {
    marginTop: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
  },
  versionBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.gray[500],
  },

  // Disclaimer Card
  disclaimerCard: {
    backgroundColor: isDark ? "rgba(245, 158, 11, 0.14)" : "#FFFBEB",
    borderRadius: Radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 16,
  },
  disclaimerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: isDark ? "#FCD34D" : "#B45309",
  },
  disclaimerText: {
    fontSize: 12,
    color: isDark ? "#FDE68A" : "#92400E",
    lineHeight: 18,
  },
});


