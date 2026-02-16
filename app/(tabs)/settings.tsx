import React, { useState } from "react";
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
import { Colors } from "../../constants/colors";
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


if (Platform.OS === "android" && !(global as any).nativeFabricUIManager && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const APP_VERSION = Application.nativeApplicationVersion || "1.0.0";
const PRIVACY_URL = "https://ahmetdemiroglu.github.io/pure_scan_cosmetics/";
const SUPPORT_EMAIL = "septimus.labb@gmail.com";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { user, userProfile, isPremium, usageStats, logout } = useAuth();
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

  const isAnonymous = user?.isAnonymous ?? true;
  const isLoggedIn = user && !isAnonymous;

  // Haklar hesaplama
  const scanRemaining = isPremium ? "∞" : Math.max(0, usageStats.scanLimit - usageStats.scanCount);
  const chatRemaining = isPremium ? "∞" : Math.max(0, usageStats.aiChatLimit - usageStats.aiChatCount);
  const familyCount = Math.max(0, (familyMembers?.length || 1) - 1);
  const familyLimitNum = isPremium ? Infinity : 1;
  const familyLimitDisplay = isPremium ? "∞" : "1";

  // Limit kontrolleri (kırmızı gösterim için)
  const isScanExhausted = !isPremium && scanRemaining === 0;
  const isChatExhausted = !isPremium && chatRemaining === 0;
  const isFamilyExhausted = !isPremium && familyCount >= familyLimitNum;

  // Şifre değiştirme toggle
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

  // Şifre değiştirme işlemi
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

  // Mail gönderme
  const handleContactSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t("settings.support_subject"))}`);
  };

  // Gizlilik politikası
  const handlePrivacyPolicy = () => {
    Linking.openURL(PRIVACY_URL);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, "#E65100"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.push("/")}>
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
        {/* === SECTION 1: Profil Kartı === */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: userProfile?.color || Colors.primary }]}>
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

          {/* Haklarım Grid */}
          <View style={styles.usageSection}>
            <Text style={styles.sectionLabel}>{t("settings.my_rights")}</Text>
            <View style={styles.usageGrid}>
              <View style={[styles.usageCard, isScanExhausted && styles.usageCardExhausted]}>
                <View style={[
                  styles.usageIconBox,
                  { backgroundColor: isScanExhausted ? "#FEF2F2" : "#FFF7ED" }
                ]}>
                  <Ionicons
                    name="scan-outline"
                    size={18}
                    color={isScanExhausted ? "#DC2626" : Colors.primary}
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
                  { backgroundColor: isChatExhausted ? "#FEF2F2" : "#EDE9FE" }
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
                  { backgroundColor: isFamilyExhausted ? "#FEF2F2" : "#E0F2FE" }
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

        {/* === SECTION 2: Premium CTA === */}
        {!isPremium && (
          <Pressable
            style={({ pressed }) => [styles.premiumCard, pressed && styles.cardPressed]}
            onPress={() => setPremiumModalVisible(true)}
          >
            <LinearGradient
              colors={["#FFF7ED", "#FFEDD5"]}
              style={styles.premiumGradient}
            >
              <View style={styles.premiumIconBox}>
                <MaterialCommunityIcons name="crown" size={24} color="#F59E0B" />
              </View>
              <View style={styles.premiumContent}>
                <Text style={styles.premiumTitle}>{t("settings.premium_title")}</Text>
                <Text style={styles.premiumDesc}>{t("settings.premium_desc")}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
            </LinearGradient>
          </Pressable>
        )}

        {/* === SECTION 3: Hesap Ayarları (Şifre Değiştirme) === */}
        {isLoggedIn && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.account_settings")}</Text>

            <Pressable
              style={[styles.menuItem, passwordSectionOpen && styles.menuItemActive]}
              onPress={togglePasswordSection}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: "#FEF2F2" }]}>
                  <Ionicons name="lock-closed-outline" size={18} color="#EF4444" />
                </View>
                <Text style={styles.menuItemText}>{t("settings.change_password")}</Text>
              </View>
              <Ionicons
                name={passwordSectionOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.gray[400]}
              />
            </Pressable>

            {passwordSectionOpen && (
              <View style={styles.passwordForm}>
                <View style={styles.inputBox}>
                  <Ionicons name="key-outline" size={18} color={Colors.gray[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder={t("settings.current_password")}
                    placeholderTextColor={Colors.gray[400]}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrentPassword}
                  />
                  <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)} hitSlop={8}>
                    <Ionicons name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.gray[400]} />
                  </Pressable>
                </View>
                <View style={styles.inputBox}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.gray[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder={t("settings.new_password")}
                    placeholderTextColor={Colors.gray[400]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                  />
                  <Pressable onPress={() => setShowNewPassword(!showNewPassword)} hitSlop={8}>
                    <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.gray[400]} />
                  </Pressable>
                </View>
                <View style={styles.inputBox}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={Colors.gray[400]} />
                  <TextInput
                    style={styles.input}
                    placeholder={t("settings.confirm_password")}
                    placeholderTextColor={Colors.gray[400]}
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

        {/* === SECTION 4: Destek & İletişim === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.support_contact")}</Text>

          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={handleContactSupport}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: "#E0F2FE" }]}>
                <Ionicons name="mail-outline" size={18} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.menuItemText}>{t("settings.contact_us")}</Text>
                <Text style={styles.menuItemSubtext}>{SUPPORT_EMAIL}</Text>
              </View>
            </View>
            <Ionicons name="open-outline" size={18} color={Colors.gray[400]} />
          </Pressable>
        </View>

        {/* === SECTION 5: Hakkında === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.about")}</Text>

          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={handlePrivacyPolicy}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.menuItemText}>{t("settings.privacy_policy")}</Text>
                <Text style={styles.menuItemSubtext}>{t("settings.privacy_policy_desc")}</Text>
              </View>
            </View>
            <Ionicons name="open-outline" size={18} color={Colors.gray[400]} />
          </Pressable>
        </View>

        {/* === SECTION 6: Disclaimer === */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <Ionicons name="alert-circle" size={20} color="#D97706" />
            <Text style={styles.disclaimerTitle}>{t("settings.disclaimer_title")}</Text>
          </View>
          <Text style={styles.disclaimerText}>{t("settings.disclaimer_text")}</Text>
        </View>

        {/* === SECTION 7: Geliştirici + Versiyon === */}
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
          setPremiumModalVisible(false);
          setShowPaywall(true);
        }}
      />
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
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
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
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
    backgroundColor: "#FFF",
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
    color: Colors.secondary,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.gray[500],
    marginTop: 2,
  },
  memberBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: Colors.gray[100],
    marginTop: 8,
  },
  memberBadgePremium: {
    backgroundColor: "#FEF3C7",
  },
  memberText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.gray[600],
  },
  memberTextPremium: {
    color: "#D97706",
  },

  // Usage Section
  usageSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.gray[400],
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  usageGrid: {
    flexDirection: "row",
    gap: 10,
  },
  usageCard: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray[100],
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
    color: Colors.secondary,
  },
  usageLabel: {
    fontSize: 10,
    color: Colors.gray[500],
    textAlign: "center",
    marginTop: 4,
  },

  // Exhausted states
  usageCardExhausted: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
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
    backgroundColor: "#FEF3C7",
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
    color: "#C2410C",
  },
  premiumDesc: {
    fontSize: 12,
    color: "#EA580C",
    marginTop: 2,
  },

  // Sections
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.gray[400],
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },

  // Menu Items
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  menuItemActive: {
    borderColor: Colors.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  menuItemPressed: {
    backgroundColor: "#FAFAFA",
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
    color: Colors.secondary,
  },
  menuItemSubtext: {
    fontSize: 11,
    color: Colors.gray[500],
    marginTop: 2,
  },

  // Password Form
  passwordForm: {
    backgroundColor: "#FFF",
    padding: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.primary,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.secondary,
  },
  changePasswordBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
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
    color: Colors.gray[500],
  },
  versionBadge: {
    marginTop: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
  },
  versionBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.gray[500],
  },

  // Disclaimer Card
  disclaimerCard: {
    backgroundColor: "#FFFBEB",
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
    color: "#B45309",
  },
  disclaimerText: {
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
  },
});
