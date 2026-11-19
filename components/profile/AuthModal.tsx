import React, { useMemo, useState, useEffect } from "react";
import { Modal, View, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Animated, ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../ui/AppText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AppColors } from "../../constants/colors";
import { useAuth, AppleSignInCancelledError } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { useTranslation } from "react-i18next";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";
import PremiumCompareModal from "../ui/PremiumCompareModal";
import PaywallModal from "../ui/PaywallModal";
import { useTheme } from "../../context/ThemeContext";
import * as AppleAuthentication from "expo-apple-authentication";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { FONT_SCALE_CAP, Radii, shadow } from "../../constants/design";
import UsageRings, { buildWeeklyRights } from "../ui/UsageRings";
import { PressableScale } from "../ui/PressableScale";
import AuthStoryArt from "./AuthStoryArt";
import { AllergenCard, DietCard, ProfileHeader } from "./ProfileSections";

// Giriş görünümünün art hariç yaklaşık yüksekliği (yazı ölçeği 1.0, Apple düğmesi hariç).
// Animasyon boyu kalan alana göre küçülür: kısa telefonda form kaydırmadan sığsın.
const AUTH_FIXED_HEIGHT = 470;
const AUTH_FIXED_HEIGHT_COMPACT = 420;
const APPLE_BUTTON_HEIGHT = 64;

interface AuthModalProps {
    visible: boolean;
    onClose: () => void;
}

function Toast({
    message,
    type,
    visible,
    styles,
}: {
    message: string;
    type: "success" | "error";
    visible: boolean;
    styles: ReturnType<typeof createStyles>;
}) {
    const translateY = useState(new Animated.Value(-100))[0];

    useEffect(() => {
        Animated.spring(translateY, {
            toValue: visible ? 0 : -100,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
        }).start();
    }, [visible]);

    const bgColor = type === "success" ? "#10B981" : "#EF4444";
    const icon = type === "success" ? "checkmark-circle" : "alert-circle";

    return (
        <Animated.View style={[styles.toast, { backgroundColor: bgColor, transform: [{ translateY }] }]}>
            <Ionicons name={icon} size={18} color="#FFF" />
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
}

export default function AuthModal({ visible, onClose }: AuthModalProps) {
    const { t } = useTranslation();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
    const insets = useSafeAreaInsets();
    const { width: winWidth, height: winHeight } = useWindowDimensions();
    const maxModalHeight = winHeight - insets.top - insets.bottom - 32;
    // Kısa ekran (ör. 360x640): animasyon küçük uçta, boşluklar sıkı.
    const compactAuth = winHeight < 700;
    const { user, userProfile, login, register, loginWithGoogle, loginWithApple, logout, usageStats, isPremium } = useAuth();
    const { familyMembers } = useUser();
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; visible: boolean }>({
        message: "", type: "success", visible: false
    });
    const [showAllAllergens, setShowAllAllergens] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [profileUnlocked, setProfileUnlocked] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [appleAvailable, setAppleAvailable] = useState(false);

    const isLoggedIn = user && !user.isAnonymous;

    // Hikâye animasyonunun boyu: ekran boyunun ~%17'si (96-168), kart içi genişliği aşmaz, formun
    // kaydırmadan sığması için modalda kalan alana göre gerekirse 72'ye kadar küçülür.
    const appleShown = Platform.OS === "ios" && appleAvailable;
    const artBase = compactAuth ? 96 : Math.min(168, Math.max(96, winHeight * 0.17));
    const artRoom =
        maxModalHeight - 48 - (compactAuth ? AUTH_FIXED_HEIGHT_COMPACT : AUTH_FIXED_HEIGHT) - (appleShown ? APPLE_BUTTON_HEIGHT : 0);
    const artSize = Math.round(Math.max(72, Math.min(artBase, artRoom, winWidth * 0.88 - 48)));

    useEffect(() => {
        if (Platform.OS !== "ios") return;
        let cancelled = false;
        AppleAuthentication.isAvailableAsync()
            .then((available) => {
                if (!cancelled) setAppleAvailable(available);
            })
            .catch(() => {
                if (!cancelled) setAppleAvailable(false);
            });
        return () => { cancelled = true; };
    }, []);

    const handleAppleSignIn = async () => {
        try {
            setLoading(true);
            await loginWithApple();
            setProfileUnlocked(true);
        } catch (err: any) {
            if (err instanceof AppleSignInCancelledError) {
                // user dismissed — silent
            } else {
                showToast(
                    t("auth.errors.apple_failed", { defaultValue: "Apple ile giriş başarısız oldu." }),
                    "error"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // NOT: Eskiden burada, modal açılınca premium pitch'i OTOMATİK gösteren bir effect vardı.
    // Bu effect ana AuthModal ile PremiumCompareModal arasında senkron Modal-swap yapıyordu;
    // iOS'ta iki Modal aynı anda present/dismiss olunca görünmez bir katman kalıp tüm dokunmaları
    // (topbar dil/tema/profil dahil) kilitliyordu. Kaldırıldı — premium artık renderProfile'daki
    // açık "Premium'a Geç" butonuyla, tek seferde tek modal gösterilecek şekilde açılıyor.

    useEffect(() => {
        if (!visible) {
            setLoading(false);
            setEmail("");
            setPassword("");
            setShowAllAllergens(false);
            setToast(prev => ({ ...prev, visible: false }));
            setShowPremiumModal(false);
            setProfileUnlocked(false);
            setForgotLoading(false);
            setShowPassword(false);
        }
    }, [visible]);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2500);
    };

    const getErrorMessage = (err: any) => {
        const code = err?.code;
        switch (code) {
            case "auth/invalid-credential":
            case "auth/user-not-found":
            case "auth/wrong-password":
                return t("auth.errors.invalid_credentials", { defaultValue: "E-posta veya şifre hatalı." });
            case "auth/invalid-email":
                return t("auth.errors.invalid_email", { defaultValue: "Geçersiz e-posta formatı." });
            case "auth/email-already-in-use":
                return t("auth.errors.email_in_use", { defaultValue: "Bu e-posta adresi zaten kullanımda." });
            case "auth/weak-password":
                return t("auth.errors.weak_password", { defaultValue: "Şifre çok zayıf (en az 6 karakter olmalı)." });
            case "auth/network-request-failed":
                return t("auth.errors.network", { defaultValue: "Ağ bağlantısı hatası. Lütfen internetinizi kontrol edin." });
            case "auth/too-many-requests":
                return t("auth.errors.too_many_requests", { defaultValue: "Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin." });
            default:
                return err?.message || t("auth.generic_error", { defaultValue: "Bir hata oluştu, lütfen tekrar deneyin." });
        }
    };

    const handleSubmit = () => {
        if (!email || !password) {
            showToast(t("auth.fill_all"), "error");
            return;
        }
        setLoading(true);
        const action = isRegister ? register(email, password) : login(email, password);

        action
            .then(() => {
                if (isRegister) showToast(t("auth.register_success"), "success");
                setProfileUnlocked(true);
            })
            .catch((err: any) => showToast(getErrorMessage(err), "error"))
            .finally(() => setLoading(false));
    };

    const handleForgotPassword = () => {
        if (!email) {
            showToast(t("auth.enter_email_first"), "error");
            return;
        }
        setForgotLoading(true);
        sendPasswordResetEmail(auth, email)
            .then(() => {
                showToast(t("auth.reset_email_sent"), "success");
            })
            .catch((err: any) => {
                const errorMsg = err.code === "auth/user-not-found"
                    ? t("auth.user_not_found")
                    : t("auth.reset_email_error");
                showToast(errorMsg, "error");
            })
            .finally(() => setForgotLoading(false));
    };

    const handleLogout = () => {
        logout().then(() => onClose());
    };

    const handlePremiumModalClose = () => {
        setShowPremiumModal(false);
    };

    // Haftalık haklar: değer ve tükenme kuralları ortak yardımcıda (UsageRings.buildWeeklyRights), eskisiyle aynı.
    const weeklyRights = buildWeeklyRights({
        isPremium,
        usageStats,
        familyMembersLength: familyMembers?.length,
        labels: {
            scan: t("profile.scan_rights"),
            chat: t("profile.chat_rights"),
            family: t("profile.family_slots"),
            image: t("profile.image_rights"),
        },
    });

    // PROFILE VIEW
    const renderProfile = () => {
        const diet = userProfile?.dietaryPreferences?.[0];
        const allergens = (userProfile?.allergens as string[]) || [];

        return (
            <View style={styles.content}>
                {/* Avatar, ad, e-posta, üyelik hapı (Ayarlar profil kartıyla aynı dil) */}
                <ProfileHeader
                    name={userProfile?.displayName || user?.email?.split("@")[0]}
                    email={user?.email}
                    avatarColor={userProfile?.color || colors.primary}
                    avatarIcon={userProfile?.avatarIcon || "account"}
                    isPremium={isPremium}
                />

                {/* Haftalık haklar: dört küçük halka (Ayarlar ile ortak bileşen) */}
                <View style={styles.usageSection}>
                    <Text style={styles.usageSectionTitle}>{t("profile.weekly_usage")}</Text>
                    <UsageRings items={weeklyRights} size={46} />
                </View>

                {/* Beslenme planı ve alerjenler: beyaz, ince kenarlı kartlar */}
                <View style={styles.profileCards}>
                    <DietCard diet={diet} />
                    <AllergenCard
                        allergens={allergens}
                        expanded={showAllAllergens}
                        onToggle={() => setShowAllAllergens(!showAllAllergens)}
                    />
                </View>

                {/* Premium'a Geç (sadece free kullanıcı) — auth modal'ı kapatıp tek modal olarak premium aç (iOS swap yok) */}
                {!isPremium && (
                    <PressableScale
                        style={styles.upgradeShadow}
                        scaleTo={0.97}
                        accessibilityRole="button"
                        onPress={() => {
                            onClose();
                            setTimeout(() => setShowPremiumModal(true), 350);
                        }}
                    >
                        <LinearGradient
                            colors={[colors.primary, colors.primaryDeep]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.upgradeBtn}
                        >
                            <MaterialCommunityIcons name="crown" size={18} color="#FFF" />
                            <Text style={styles.upgradeText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                                {t("premium.upgrade_now")}
                            </Text>
                        </LinearGradient>
                    </PressableScale>
                )}

                {/* Logout */}
                <Pressable style={({ pressed }) => [styles.logoutBtn, pressed && styles.btnPressed]} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={18} color={isDark ? "#FCA5A5" : "#EF4444"} />
                    <Text style={styles.logoutText}>{t("auth.logout")}</Text>
                </Pressable>
            </View>
        );
    };

    // AUTH VIEW
    const renderAuth = () => (
        <View style={[styles.content, compactAuth && styles.contentCompact]}>
            {/* Header: profil kartının kurulduğu hikâye animasyonu */}
            <View style={[styles.authHeader, compactAuth && styles.authHeaderCompact]}>
                <View style={[styles.authArt, compactAuth && styles.authArtCompact]}>
                    <AuthStoryArt size={artSize} />
                </View>
                <Text style={styles.authTitle}>{isRegister ? t("auth.join_us") : t("auth.welcome_back")}</Text>
                <Text style={styles.authSubtitle}>{isRegister ? t("auth.register_subtitle") : t("auth.login_subtitle")}</Text>
            </View>

            {/* Form */}
            <View style={[styles.inputBox, compactAuth && styles.inputBoxCompact]}>
                <Ionicons name="mail-outline" size={18} color={colors.gray[400]} />
                <TextInput
                  maxFontSizeMultiplier={FONT_SCALE_CAP}
                    style={styles.input}
                    placeholder={t("auth.email_placeholder")}
                    placeholderTextColor={colors.gray[400]}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <View style={[styles.inputBox, compactAuth && styles.inputBoxCompact]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.gray[400]} />
                <TextInput
                  maxFontSizeMultiplier={FONT_SCALE_CAP}
                    style={styles.input}
                    placeholder={t("auth.password_placeholder")}
                    placeholderTextColor={colors.gray[400]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.gray[400]} />
                </Pressable>
            </View>

            {/* Forgot Password - Sadece Login modunda */}
            {!isRegister && (
                <Pressable
                    style={styles.forgotPasswordBtn}
                    onPress={handleForgotPassword}
                    disabled={forgotLoading}
                >
                    {forgotLoading ? (
                        <ActivityIndicator color={colors.primary} size="small" />
                    ) : (
                        <Text style={styles.forgotPasswordText}>{t("auth.forgot_password")}</Text>
                    )}
                </Pressable>
            )}

            <Pressable
                style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed, loading && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#FFF" size="small" /> : (
                    <Text style={styles.submitText}>{isRegister ? t("auth.register_button") : t("auth.login_button")}</Text>
                )}
            </Pressable>

            {/* Divider */}
            <View style={[styles.divider, compactAuth && styles.dividerCompact]}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t("common.or")}</Text>
                <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <Pressable style={({ pressed }) => [styles.googleBtn, pressed && styles.btnPressed]} onPress={loginWithGoogle}>
                <Ionicons name="logo-google" size={18} color={colors.secondary} />
                <Text style={styles.googleText}>{t("auth.google_button")}</Text>
            </Pressable>

            {/* Apple Sign-In (iOS only) */}
            {Platform.OS === "ios" && appleAvailable && (
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={
                        isRegister
                            ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                            : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                    }
                    buttonStyle={
                        isDark
                            ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                            : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                    }
                    cornerRadius={12}
                    style={styles.appleBtn}
                    onPress={handleAppleSignIn}
                />
            )}

            {/* Footer */}
            <View style={[styles.footer, compactAuth && styles.footerCompact]}>
                <Text style={styles.footerText}>{isRegister ? t("auth.has_account") : t("auth.no_account")}</Text>
                <Pressable onPress={() => setIsRegister(!isRegister)}>
                    <Text style={styles.footerLink}>{isRegister ? t("auth.login_button") : t("auth.register_button")}</Text>
                </Pressable>
            </View>
        </View>
    );

    // RENDER
    return (
        <>
            <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
                <View style={styles.container}>
                    {/* Backdrop */}
                    <Pressable style={styles.backdrop} onPress={onClose} />

                    {/* Modal */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={[styles.keyboardView, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
                    >
                        <View style={[styles.modal, { maxHeight: maxModalHeight }]}>
                            {/* Profil görünümü: sağ üstten düşen yumuşak turuncu ışık (Ayarlar profil kartıyla aynı) */}
                            {isLoggedIn && (
                                <View pointerEvents="none" style={styles.profileGlow}>
                                    <Svg width="100%" height="100%">
                                        <Defs>
                                            <RadialGradient id="authProfileGlow" cx="100%" cy="0%" r="85%">
                                                <Stop offset="0" stopColor={colors.primary} stopOpacity={isDark ? 0.16 : 0.09} />
                                                <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
                                            </RadialGradient>
                                        </Defs>
                                        <Rect x="0" y="0" width="100%" height="100%" fill="url(#authProfileGlow)" />
                                    </Svg>
                                </View>
                            )}
            <Toast message={toast.message} type={toast.type} visible={toast.visible} styles={styles} />

                            <Pressable
                                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
                                onPress={onClose}
                                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                            >
                                <Ionicons name="close" size={22} color={colors.gray[400]} />
                            </Pressable>

                            <ScrollView
                                style={styles.scrollArea}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                bounces={false}
                            >
                                {isLoggedIn ? renderProfile() : renderAuth()}
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Premium Compare Modal - Profile açılmadan önce */}
            <PremiumCompareModal
                visible={showPremiumModal}
                onClose={handlePremiumModalClose}
                onSubscribe={() => {
                    setShowPremiumModal(false);
                    setTimeout(() => setShowPaywall(true), 300);
                }}
            />
            <PaywallModal
                visible={showPaywall}
                onClose={() => setShowPaywall(false)}
            />
        </>
    );
}

// STYLES
const createStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
    container: { flex: 1 },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(31,22,17,0.5)" },
    keyboardView: { flex: 1, justifyContent: "center", alignItems: "center" },
    modal: { width: "88%", backgroundColor: colors.card, borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12, overflow: "hidden" },
    closeBtn: { position: "absolute", top: 16, right: 16, zIndex: 10 },
    scrollArea: { flexShrink: 1 },
    content: { paddingTop: 8 },
    contentCompact: { paddingTop: 0 },

    // Toast
    toast: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderTopLeftRadius: 24, borderTopRightRadius: 24, zIndex: 100 },
    toastText: { color: "#FFF", fontSize: 14, fontWeight: "600" },

    // Profile (başlık ve kartlar ProfileSections içinde)
    profileGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 240 },
    profileCards: { gap: 12, marginTop: 18, marginBottom: 16 },

    // Haftalık haklar (halkalar UsageRings içinde)
    usageSection: { marginTop: 16, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.gray[200] },
    usageSectionTitle: { fontSize: 11, fontWeight: "700", color: colors.gray[400], marginBottom: 12, letterSpacing: 0.6 },

    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: Radii.control + 2,
        borderWidth: 1,
        borderColor: isDark ? "rgba(248,113,113,0.35)" : "#F6D3CE",
        backgroundColor: isDark ? "rgba(220,38,38,0.12)" : "#FFF6F5"
    },
    logoutText: { fontSize: 15, fontWeight: "600", color: isDark ? "#FCA5A5" : "#EF4444" },
    upgradeShadow: {
        marginBottom: 10,
        borderRadius: Radii.control + 2,
        backgroundColor: colors.primaryDeep,
        ...shadow("md", isDark, colors.primaryDeep),
    },
    upgradeBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 52,
        paddingHorizontal: 16,
        borderRadius: Radii.control + 2,
    },
    upgradeText: { fontSize: 15, fontWeight: "700", color: "#FFF", flexShrink: 1 },

    // Auth
    authHeader: { alignItems: "center", marginBottom: 24 },
    authHeaderCompact: { marginBottom: 12 },
    authArt: { alignItems: "center", justifyContent: "center", marginBottom: 14 },
    authArtCompact: { marginBottom: 8 },
    authTitle: { fontSize: 22, fontWeight: "700", color: colors.secondary, marginBottom: 4 },
    authSubtitle: { fontSize: 14, color: colors.gray[500], textAlign: "center" },

    inputBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.gray[50], borderRadius: 14, paddingHorizontal: 14, height: 52, marginBottom: 12, borderWidth: 1, borderColor: colors.gray[200] },
    inputBoxCompact: { marginBottom: 8 },
    input: { flex: 1, fontSize: 15, color: colors.secondary },

    forgotPasswordBtn: { alignSelf: "flex-end", marginBottom: 8, marginTop: -4 },
    forgotPasswordText: { fontSize: 13, fontWeight: "600", color: colors.primary },

    submitBtn: { height: 52, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginTop: 4 },
    submitText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
    btnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
    btnDisabled: { opacity: 0.6 },

    divider: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
    dividerCompact: { marginVertical: 10 },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.gray[200] },
    dividerText: { marginHorizontal: 12, fontSize: 12, fontWeight: "600", color: colors.gray[400] },

    googleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 52, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.gray[200] },
    googleText: { fontSize: 15, fontWeight: "600", color: colors.secondary },
    appleBtn: { height: 52, marginTop: 12, borderRadius: 14 },

    footer: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 20 },
    footerCompact: { marginTop: 12 },
    footerText: { fontSize: 14, color: colors.gray[500] },
    footerLink: { fontSize: 14, fontWeight: "700", color: colors.primary },
});


