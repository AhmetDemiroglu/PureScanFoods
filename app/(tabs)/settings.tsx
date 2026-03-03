import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Linking,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
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
import HistorySidebar from "../history";
import PaywallModal from "../../components/ui/PaywallModal";
import ConfirmDeleteModal from "../../components/ui/ConfirmDeleteModal";
import AuthModal from "../../components/profile/AuthModal";
import { useTheme } from "../../context/ThemeContext";


if (Platform.OS === "android" && !(global as any).nativeFabricUIManager && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const APP_VERSION = Application.nativeApplicationVersion || "1.0.0";
const PRIVACY_URL = "https://purescan-foods.septimuslab.com/privacy-policy/";
const SUPPORT_EMAIL = "info@septimuslab.com";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { user, userProfile, isPremium, usageStats, logout, deleteUserData, deleteAccount } = useAuth();
  const { familyMembers } = useUser();
  const router = useRouter();

  const [passwordSectionOpen, setPasswordSectionOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
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

  // Usage calculations
  const unlimited = String.fromCharCode(8734);
  const scanRemaining = isPremium ? unlimited : Math.max(0, usageStats.scanLimit - usageStats.scanCount);
  const chatRemaining = isPremium ? unlimited : Math.max(0, usageStats.aiChatLimit - usageStats.aiChatCount);
  const familyCount = Math.max(0, (familyMembers?.length || 1) - 1);
  const familyLimitNum = isPremium ? Infinity : 1;
  const familyLimitDisplay = isPremium ? unlimited : "1";

  // Exhausted limit state
  const isScanExhausted = !isPremium && scanRemaining === 0;
  const isChatExhausted = !isPremium && chatRemaining === 0;
  const isFamilyExhausted = !isPremium && familyCount >= familyLimitNum;

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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#B45309", "#9A3412"] : [colors.primary, "#E65100"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/")}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleArea}>
              <Text style={styles.headerTitle}>{t("settings.title")}</Text>
              <Text style={styles.headerSubtitle}>{t("settings.subtitle")}</Text>
            </View>
            <TouchableOpacity style={[styles.backButton, { marginRight: 0 }]} onPress={() => setHistoryOpen(true)}>
              <MaterialCommunityIcons name="history" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* === SECTION 1: Profile Card === */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: userProfile?.color || colors.primary }]}>
              <MaterialCommunityIcons
                name={(userProfile?.avatarIcon || "account") as any}
                size={32}
                color="#FFF"
              />
              {isPremium && (
                <View style={styles.crownBadge}>
                  <MaterialCommunityIcons name="crown" size={12} color="#F59E0B" />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {isLoggedIn
                  ? (userProfile?.displayName || user?.email?.split("@")[0])
                  : t("settings.guest_user")}
              </Text>
              <Text style={styles.profileEmail}>
                {isLoggedIn ? user?.email : t("settings.guest_desc")}
              </Text>
              <View style={[styles.memberBadge, isPremium && styles.memberBadgePremium]}>
                <Text style={[styles.memberText, isPremium && styles.memberTextPremium]}>
                  {isPremium ? t("settings.premium_member") : t("settings.free_member")}
                </Text>
              </View>
            </View>
          </View>

          {/* Usage Grid */}
          <View style={styles.usageSection}>
            <Text style={styles.sectionLabel}>{t("settings.my_rights")}</Text>
            <View style={styles.usageGrid}>
              <View style={[styles.usageCard, isScanExhausted && styles.usageCardExhausted]}>
                <View style={[
                  styles.usageIconBox,
                  { backgroundColor: isScanExhausted ? (isDark ? "rgba(220,38,38,0.20)" : "#FEF2F2") : (isDark ? "rgba(234,88,12,0.20)" : "#FFF7ED") }
                ]}>
                  <Ionicons
                    name="scan-outline"
                    size={18}
                    color={isScanExhausted ? "#DC2626" : colors.primary}
                  />
                </View>
                <Text style={[styles.usageValue, isScanExhausted && styles.usageValueExhausted]}>
                  {scanRemaining}
                </Text>
                <Text style={[styles.usageLabel, isScanExhausted && styles.usageLabelExhausted]}>
                  {t("settings.scan_rights")}
                </Text>
              </View>
              <View style={[styles.usageCard, isChatExhausted && styles.usageCardExhausted]}>
                <View style={[
                  styles.usageIconBox,
                  { backgroundColor: isChatExhausted ? (isDark ? "rgba(220,38,38,0.20)" : "#FEF2F2") : (isDark ? "rgba(124,58,237,0.22)" : "#EDE9FE") }
                ]}>
                  <MaterialCommunityIcons
                    name="robot-outline"
                    size={18}
                    color={isChatExhausted ? "#DC2626" : "#7C3AED"}
                  />
                </View>
                <Text style={[styles.usageValue, isChatExhausted && styles.usageValueExhausted]}>
                  {chatRemaining}
                </Text>
                <Text style={[styles.usageLabel, isChatExhausted && styles.usageLabelExhausted]}>
                  {t("settings.chat_rights")}
                </Text>
              </View>
              <View style={[styles.usageCard, isFamilyExhausted && styles.usageCardExhausted]}>
                <View style={[
                  styles.usageIconBox,
                  { backgroundColor: isFamilyExhausted ? (isDark ? "rgba(220,38,38,0.20)" : "#FEF2F2") : (isDark ? "rgba(2,132,199,0.22)" : "#E0F2FE") }
                ]}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={18}
                    color={isFamilyExhausted ? "#DC2626" : "#0284C7"}
                  />
                </View>
                <Text style={[styles.usageValue, isFamilyExhausted && styles.usageValueExhausted]}>
                  {familyCount}/{familyLimitDisplay}
                </Text>
                <Text style={[styles.usageLabel, isFamilyExhausted && styles.usageLabelExhausted]}>
                  {t("settings.family_slots")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* === SECTION 1.5: Login CTA (Guest) === */}
        {!isLoggedIn && (
          <View style={styles.section}>
            <Pressable
              style={({ pressed }) => [styles.loginCard, pressed && styles.cardPressed]}
              onPress={() => setShowAuthModal(true)}
            >
              <LinearGradient
                colors={isDark ? ["#D97706", "#9A3412"] : [colors.primary, "#E65100"]}
                style={styles.loginGradient}
              >
                <View style={styles.loginIconBox}>
                  <Ionicons name="log-in-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.loginContent}>
                  <Text style={styles.loginTitle}>{t("settings.login_label")}</Text>
                  <Text style={styles.loginDesc}>{t("settings.login_sublabel")}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FFF" style={styles.chevronWhite} />
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* === SECTION 2: Premium CTA === */}
        {!isPremium && (
          <Pressable
            style={({ pressed }) => [styles.premiumCard, pressed && styles.cardPressed]}
            onPress={() => setPremiumModalVisible(true)}
          >
            <LinearGradient
              colors={isDark ? ["rgba(251,191,36,0.15)", "rgba(245,158,11,0.08)"] : ["#FFF7ED", "#FFEDD5"]}
              style={styles.premiumGradient}
            >
              <View style={styles.premiumIconBox}>
                <MaterialCommunityIcons name="crown" size={24} color="#F59E0B" />
              </View>
              <View style={styles.premiumContent}>
                <Text style={styles.premiumTitle}>{t("settings.premium_title")}</Text>
                <Text style={styles.premiumDesc}>{t("settings.premium_desc")}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#F59E0B" style={styles.chevronRight} />
            </LinearGradient>
          </Pressable>
        )}

        {/* === SECTION 3: Account Settings (Password) === */}
        {isLoggedIn && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.account_settings")}</Text>

            <Pressable
              style={[styles.menuItem, passwordSectionOpen && styles.menuItemActive]}
              onPress={togglePasswordSection}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: isDark ? "rgba(220,38,38,0.20)" : "#FEF2F2" }]}>
                  <Ionicons name="lock-closed-outline" size={18} color="#EF4444" />
                </View>
                <Text style={styles.menuItemText}>{t("settings.change_password")}</Text>
              </View>
              <Ionicons
                name={passwordSectionOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.gray[400]}
              />
            </Pressable>

            {passwordSectionOpen && (
              <View style={styles.passwordForm}>
                <View style={styles.inputBox}>
                  <Ionicons name="key-outline" size={18} color={colors.gray[400]} />
                  <TextInput
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
        )}

        {/* === SECTION 4: Support & Contact === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.support_contact")}</Text>

          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={handleContactSupport}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: isDark ? "rgba(2,132,199,0.22)" : "#E0F2FE" }]}>
                <Ionicons name="mail-outline" size={18} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.menuItemText}>{t("settings.contact_us")}</Text>
                <Text style={styles.menuItemSubtext}>{SUPPORT_EMAIL}</Text>
              </View>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.gray[400]} style={styles.chevronRight} />
          </Pressable>
        </View>

        {/* === SECTION 5: About === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.about")}</Text>

          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={handlePrivacyPolicy}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: isDark ? "rgba(22,163,74,0.20)" : "#F0FDF4" }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.menuItemText}>{t("settings.privacy_policy")}</Text>
                <Text style={styles.menuItemSubtext}>{t("settings.privacy_policy_desc")}</Text>
              </View>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.gray[400]} style={styles.chevronRight} />
          </Pressable>
        </View>

        {/* === SECTION 5.5: Data Management === */}
        {isLoggedIn && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.data_management")}</Text>

            <Pressable
              style={[styles.menuItem, dataManagementOpen && styles.menuItemActive]}
              onPress={toggleDataManagement}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: isDark ? "rgba(234,88,12,0.20)" : "#FFF7ED" }]}>
                  <Ionicons name="server-outline" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.menuItemText, { color: colors.primary }]}>{t("settings.data_management_label")}</Text>
                  <Text style={styles.menuItemSubtext}>{t("settings.data_management_desc")}</Text>
                </View>
              </View>
              <Ionicons
                name={dataManagementOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.gray[400]}
              />
            </Pressable>

            {dataManagementOpen && (
              <View style={styles.dataManagementPanel}>
                {/* Delete Data - Warning */}
                <Pressable
                  style={({ pressed }) => [styles.subMenuItem, styles.subMenuItemWarning, pressed && styles.menuItemPressed]}
                  onPress={() => setDeleteDataModalVisible(true)}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: isDark ? "rgba(245,158,11,0.22)" : "#FEF3C7" }]}>
                      <Ionicons name="trash-outline" size={18} color="#D97706" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: isDark ? "#FCD34D" : "#92400E" }]}>{t("settings.delete_data_label")}</Text>
                      <Text style={styles.menuItemSubtext}>{t("settings.delete_data_sublabel")}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} style={styles.chevronRight} />
                </Pressable>

                {/* Delete Account - Danger */}
                <Pressable
                  style={({ pressed }) => [styles.subMenuItem, styles.subMenuItemDanger, pressed && styles.menuItemPressed]}
                  onPress={() => setDeleteAccountModalVisible(true)}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: isDark ? "rgba(220,38,38,0.22)" : "#FEE2E2" }]}>
                      <Ionicons name="person-remove-outline" size={18} color="#DC2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemText, { color: "#DC2626" }]}>{t("settings.delete_account_label")}</Text>
                      <Text style={styles.menuItemSubtext}>{t("settings.delete_account_sublabel")}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} style={styles.chevronRight} />
                </Pressable>

                {/* Logout */}
                <Pressable
                  style={({ pressed }) => [styles.subMenuItem, styles.subMenuItemLast, pressed && styles.menuItemPressed]}
                  onPress={logout}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: isDark ? "rgba(37,99,235,0.22)" : "#EFF6FF" }]}>
                      <Ionicons name="log-out-outline" size={18} color="#2563EB" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuItemText}>{t("settings.logout_label")}</Text>
                      <Text style={styles.menuItemSubtext}>{t("settings.logout_sublabel")}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} style={styles.chevronRight} />
                </Pressable>
              </View>
            )}
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

        {/* === SECTION 7: Developer + Version === */}
        <View style={styles.developerCard}>
          <Text style={styles.developerTitle}>{t("settings.developer_text")} </Text>
          <Image
            source={require("../../assets/septimus_lab.png")}
            style={styles.developerLogo}
            resizeMode="contain"
          />
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeText}>v{APP_VERSION}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <HistorySidebar visible={isHistoryOpen} onClose={() => setHistoryOpen(false)} />
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
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.secondary,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 2,
  },
  memberBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.gray[100],
    marginTop: 8,
  },
  memberBadgePremium: {
    backgroundColor: isDark ? "rgba(251,191,36,0.20)" : "#FEF3C7",
  },
  memberText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[600],
  },
  memberTextPremium: {
    color: isDark ? "#FBBF24" : "#D97706",
  },

  // Usage Section
  usageSection: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[400],
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  usageGrid: {
    flexDirection: "row",
    gap: 10,
  },
  usageCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  usageIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  usageValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.secondary,
  },
  usageLabel: {
    fontSize: 10,
    color: colors.gray[500],
    textAlign: "center",
    marginTop: 4,
  },

  // Exhausted states
  usageCardExhausted: {
    borderColor: "#FECACA",
    backgroundColor: isDark ? "rgba(220,38,38,0.20)" : "#FEF2F2",
  },
  usageValueExhausted: {
    color: "#DC2626",
  },
  usageLabelExhausted: {
    color: "#EF4444",
  },

  // Premium Card
  premiumCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  premiumGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  premiumIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: isDark ? "rgba(251,191,36,0.20)" : "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumContent: {
    flex: 1,
    marginLeft: 14,
  },
  premiumTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: isDark ? "#FBBF24" : "#C2410C",
  },
  premiumDesc: {
    fontSize: 12,
    color: isDark ? "#FDBA74" : "#EA580C",
    marginTop: 2,
  },

  // Sections
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[400],
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },

  // Menu Items
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 22,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  menuItemActive: {
    borderColor: colors.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  menuItemPressed: {
    backgroundColor: colors.gray[50],
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondary,
  },
  menuItemSubtext: {
    fontSize: 11,
    color: colors.gray[500],
    marginTop: 2,
  },

  // Password Form
  passwordForm: {
    backgroundColor: colors.card,
    padding: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.primary,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.secondary,
  },
  changePasswordBtn: {
    height: 48,
    borderRadius: 12,
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

  // Developer Card
  developerCard: {
    padding: 0,
    alignItems: "center",
    marginBottom: 0,
    opacity: 0.65,
  },
  developerLogo: {
    width: 180,
    height: 75,
  },
  developerTitle: {
    fontSize: 13,
    fontWeight: "700",
    paddingBottom: 4,
    color: colors.gray[500],
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

  // Data Management Panel
  dataManagementPanel: {
    backgroundColor: colors.card,
    padding: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.primary,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginBottom: 8,
    gap: 8,
  },
  subMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 22,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  subMenuItemWarning: {
    borderColor: "#FCD34D",
    backgroundColor: isDark ? "rgba(245, 158, 11, 0.14)" : "#FFFBEB",
  },
  subMenuItemDanger: {
    borderColor: "#FCA5A5",
    backgroundColor: isDark ? "rgba(220,38,38,0.20)" : "#FEF2F2",
  },
  subMenuItemLast: {
    borderColor: colors.gray[200],
    backgroundColor: colors.card,
  },
  chevronRight: {
    marginRight: 6,
  },
  chevronWhite: {
    marginRight: 8,
    marginLeft: 8,
  },

  // Login Card (Guest)
  loginCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  loginGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  loginIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  loginContent: {
    flex: 1,
    marginLeft: 14,
  },
  loginTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
  loginDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },

  // Disclaimer Card
  disclaimerCard: {
    backgroundColor: isDark ? "rgba(245, 158, 11, 0.14)" : "#FFFBEB",
    borderRadius: 16,
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


