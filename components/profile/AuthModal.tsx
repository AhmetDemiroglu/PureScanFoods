import React, { useState, useEffect } from "react";
import {
    Modal, View, Text, TextInput, Pressable, StyleSheet,
    KeyboardAvoidingView, Platform, ActivityIndicator, Animated
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

interface AuthModalProps {
    visible: boolean;
    onClose: () => void;
}

// ═══════════════════════════════════════════════════════════
// INLINE TOAST COMPONENT
// ═══════════════════════════════════════════════════════════
function Toast({ message, type, visible }: { message: string; type: "success" | "error"; visible: boolean }) {
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
    const { user, userProfile, login, register, loginWithGoogle, logout, usageStats, isPremium } = useAuth();

    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; visible: boolean }>({
        message: "", type: "success", visible: false
    });
    const [showAllAllergens, setShowAllAllergens] = useState(false);

    useEffect(() => {
        if (!visible) {
            setLoading(false);
            setEmail("");
            setPassword("");
            setShowAllAllergens(false);
            setToast(prev => ({ ...prev, visible: false }));
        }
    }, [visible]);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2500);
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
            })
            .catch((err: any) => showToast(err.message || t("auth.generic_error"), "error"))
            .finally(() => setLoading(false));
    };

    const handleLogout = () => {
        logout().then(() => onClose());
    };

    const isLoggedIn = user && !user.isAnonymous;

    // ═══════════════════════════════════════════════════════════
    // PROFILE VIEW
    // ═══════════════════════════════════════════════════════════
    const renderProfile = () => {
        const diet = userProfile?.dietaryPreferences?.[0];
        const allergens = (userProfile?.allergens as string[]) || [];
        const remaining = isPremium ? "∞" : Math.max(0, usageStats.scanLimit - usageStats.scanCount);

        return (
            <View style={styles.content}>
                {/* Avatar + Info */}
                <View style={styles.profileHeader}>
                    <View style={[styles.avatar, { backgroundColor: userProfile?.color || Colors.primary }]}>
                        <MaterialCommunityIcons name={(userProfile?.avatarIcon || "account") as any} size={32} color="#FFF" />
                        {isPremium && (
                            <View style={styles.crownBadge}>
                                <MaterialCommunityIcons name="crown" size={12} color="#F59E0B" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.profileName}>{userProfile?.displayName || user?.email?.split("@")[0]}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                    <View style={[styles.memberBadge, isPremium && styles.memberBadgePremium]}>
                        <Text style={[styles.memberText, isPremium && styles.memberTextPremium]}>
                            {isPremium ? t("profile.premium_member") : t("profile.free_member")}
                        </Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Ionicons name="scan-outline" size={20} color={Colors.primary} />
                        <Text style={styles.statValue}>{remaining}</Text>
                        <Text style={styles.statLabel}>{t("profile.scan_rights")}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="leaf" size={20} color="#22C55E" />
                        <Text style={styles.statValue}>{diet ? t(`diets.${diet}` as any) : "—"}</Text>
                        <Text style={styles.statLabel}>{t("profile.diet_plan")}</Text>
                    </View>
                </View>

                {/* Allergens - Collapsible */}
                {allergens.length > 0 && (
                    <View style={styles.allergensSection}>
                        <Pressable
                            style={styles.allergensHeader}
                            onPress={() => setShowAllAllergens(!showAllAllergens)}
                        >
                            <View style={styles.allergensHeaderLeft}>
                                <View style={styles.allergenIconBox}>
                                    <Ionicons name="warning" size={14} color="#EF4444" />
                                </View>
                                <Text style={styles.allergensTitle}>{t("profile.allergens_title")}</Text>
                                <View style={styles.allergenCount}>
                                    <Text style={styles.allergenCountText}>{allergens.length}</Text>
                                </View>
                            </View>
                            <Ionicons
                                name={showAllAllergens ? "chevron-up" : "chevron-down"}
                                size={18}
                                color={Colors.gray[400]}
                            />
                        </Pressable>

                        {showAllAllergens && (
                            <View style={styles.allergensList}>
                                {allergens.map((a, i) => (
                                    <View key={a} style={styles.allergenChip}>
                                        <Text style={styles.allergenChipText}>{t(`allergens.${a}` as any)}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Logout */}
                <Pressable style={({ pressed }) => [styles.logoutBtn, pressed && styles.btnPressed]} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                    <Text style={styles.logoutText}>{t("auth.logout")}</Text>
                </Pressable>
            </View>
        );
    };

    // ═══════════════════════════════════════════════════════════
    // AUTH VIEW
    // ═══════════════════════════════════════════════════════════
    const renderAuth = () => (
        <View style={styles.content}>
            {/* Header */}
            <View style={styles.authHeader}>
                <View style={styles.authIcon}>
                    <MaterialCommunityIcons name={isRegister ? "account-plus" : "login"} size={28} color={Colors.primary} />
                </View>
                <Text style={styles.authTitle}>{isRegister ? t("auth.join_us") : t("auth.welcome_back")}</Text>
                <Text style={styles.authSubtitle}>{isRegister ? t("auth.register_subtitle") : t("auth.login_subtitle")}</Text>
            </View>

            {/* Form */}
            <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={18} color={Colors.gray[400]} />
                <TextInput
                    style={styles.input}
                    placeholder={t("auth.email_placeholder")}
                    placeholderTextColor={Colors.gray[400]}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.gray[400]} />
                <TextInput
                    style={styles.input}
                    placeholder={t("auth.password_placeholder")}
                    placeholderTextColor={Colors.gray[400]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

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
            <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t("common.or")}</Text>
                <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <Pressable style={({ pressed }) => [styles.googleBtn, pressed && styles.btnPressed]} onPress={loginWithGoogle}>
                <Ionicons name="logo-google" size={18} color={Colors.secondary} />
                <Text style={styles.googleText}>{t("auth.google_button")}</Text>
            </Pressable>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>{isRegister ? t("auth.has_account") : t("auth.no_account")}</Text>
                <Pressable onPress={() => setIsRegister(!isRegister)}>
                    <Text style={styles.footerLink}>{isRegister ? t("auth.login_button") : t("auth.register_button")}</Text>
                </Pressable>
            </View>
        </View>
    );

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════
    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
            <View style={styles.container}>
                {/* Backdrop - Ayrı layer, keyboard'dan etkilenmez */}
                <Pressable style={styles.backdrop} onPress={onClose} />

                {/* Modal - Keyboard ile hareket eder */}
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
                    <View style={styles.modal}>
                        <Toast message={toast.message} type={toast.type} visible={toast.visible} />

                        <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
                            <Ionicons name="close" size={22} color={Colors.gray[400]} />
                        </Pressable>

                        {isLoggedIn ? renderProfile() : renderAuth()}
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const styles = StyleSheet.create({
    container: { flex: 1 },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.5)" },
    keyboardView: { flex: 1, justifyContent: "center", alignItems: "center" },
    modal: { width: "88%", backgroundColor: "#FFF", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12, overflow: "hidden" },
    closeBtn: { position: "absolute", top: 16, right: 16, zIndex: 10 },
    content: { paddingTop: 8 },

    // Toast
    toast: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderTopLeftRadius: 24, borderTopRightRadius: 24, zIndex: 100 },
    toastText: { color: "#FFF", fontSize: 14, fontWeight: "600" },

    // Profile
    profileHeader: { alignItems: "center", marginBottom: 20 },
    avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    crownBadge: { position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    profileName: { fontSize: 20, fontWeight: "700", color: Colors.secondary, marginBottom: 2 },
    profileEmail: { fontSize: 13, color: Colors.gray[500], marginBottom: 10 },
    memberBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: Colors.gray[100] },
    memberBadgePremium: { backgroundColor: "#FEF3C7" },
    memberText: { fontSize: 11, fontWeight: "700", color: Colors.gray[600] },
    memberTextPremium: { color: "#D97706" },

    statsRow: { flexDirection: "row", backgroundColor: Colors.gray[50], borderRadius: 16, padding: 16, marginBottom: 16 },
    statItem: { flex: 1, alignItems: "center", gap: 4 },
    statValue: { fontSize: 16, fontWeight: "700", color: Colors.secondary },
    statLabel: { fontSize: 11, color: Colors.gray[500] },
    statDivider: { width: 1, backgroundColor: Colors.gray[200], marginHorizontal: 12 },

    allergensSection: { backgroundColor: "#FFF9F9", borderRadius: 14, borderWidth: 1, borderColor: "#FEE2E2", marginBottom: 16, overflow: "hidden" },
    allergensHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
    allergensHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    allergenIconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" },
    allergensTitle: { fontSize: 14, fontWeight: "600", color: "#991B1B" },
    allergenCount: { backgroundColor: "#FECACA", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    allergenCountText: { fontSize: 12, fontWeight: "700", color: "#DC2626" },
    allergensList: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
    allergenChip: { backgroundColor: "#FEE2E2", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    allergenChipText: { fontSize: 13, fontWeight: "500", color: "#B91C1C" },

    logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
    logoutText: { fontSize: 15, fontWeight: "600", color: "#EF4444" },

    // Auth
    authHeader: { alignItems: "center", marginBottom: 24 },
    authIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: `${Colors.primary}15`, alignItems: "center", justifyContent: "center", marginBottom: 16 },
    authTitle: { fontSize: 22, fontWeight: "700", color: Colors.secondary, marginBottom: 4 },
    authSubtitle: { fontSize: 14, color: Colors.gray[500], textAlign: "center" },

    inputBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.gray[50], borderRadius: 14, paddingHorizontal: 14, height: 52, marginBottom: 12, borderWidth: 1, borderColor: Colors.gray[200] },
    input: { flex: 1, fontSize: 15, color: Colors.secondary },

    submitBtn: { height: 52, borderRadius: 14, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", marginTop: 4 },
    submitText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
    btnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
    btnDisabled: { opacity: 0.6 },

    divider: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.gray[200] },
    dividerText: { marginHorizontal: 12, fontSize: 12, fontWeight: "600", color: Colors.gray[400] },

    googleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 52, borderRadius: 14, backgroundColor: "#FFF", borderWidth: 1.5, borderColor: Colors.gray[200] },
    googleText: { fontSize: 15, fontWeight: "600", color: Colors.secondary },

    footer: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 20 },
    footerText: { fontSize: 14, color: Colors.gray[500] },
    footerLink: { fontSize: 14, fontWeight: "700", color: Colors.primary },
});