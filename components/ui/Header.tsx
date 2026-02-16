import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../profile/AuthModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LANGUAGE_STORAGE_KEY } from "../../lib/i18n";

interface HeaderProps {
    onHistoryPress?: () => void;
}

export default function Header({ onHistoryPress }: HeaderProps) {
    const { i18n } = useTranslation();
    const { isPremium, user, userProfile } = useAuth();
    const [showAuth, setShowAuth] = useState(false);

    const toggleLanguage = () => {
        const current = i18n.language?.startsWith("tr")
            ? "tr"
            : i18n.language?.startsWith("es")
                ? "es"
                : "en";
        const order = ["en", "tr", "es"] as const;
        const nextIndex = (order.indexOf(current as any) + 1) % order.length;
        const newLang = order[nextIndex];
        AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang).catch(() => {});
        i18n.changeLanguage(newLang);
    };

    const isLoggedIn = user && !user.isAnonymous;

    return (
        <View style={styles.header}>
            <View style={styles.headerLeft} />

            <View style={styles.headerRight}>
                {isPremium && (
                    <View style={styles.premiumBadge}>
                        <Ionicons name="diamond" size={16} color="#F59E0B" />
                    </View>
                )}

                <Pressable
                    style={({ pressed }) => [
                        styles.profileButton,
                        isLoggedIn && styles.profileButtonExpanded,
                        pressed && styles.buttonPressed
                    ]}
                    onPress={() => setShowAuth(true)}
                >
                    {isLoggedIn ? (
                        <View style={styles.profileContent}>
                            <View style={styles.profileTextContainer}>
                                <Text style={styles.profileName} numberOfLines={1}>
                                    {userProfile?.displayName || user.email?.split("@")[0]}
                                </Text>
                                <Text style={[styles.profileRole, isPremium && styles.profileRolePremium]}>
                                    {isPremium ? "Premium" : "Free"}
                                </Text>
                            </View>
                            <View style={[styles.avatarMini, { backgroundColor: userProfile?.color || Colors.primary }]}>
                                <MaterialCommunityIcons
                                    name={(userProfile?.avatarIcon || "account") as any}
                                    size={14}
                                    color="#FFF"
                                />
                            </View>
                        </View>
                    ) : (
                        <Ionicons name="person-outline" size={18} color={Colors.secondary} />
                    )}
                </Pressable>

                <Pressable
                    style={({ pressed }) => [styles.iconButton, pressed && styles.buttonPressed]}
                    onPress={onHistoryPress}
                >
                    <MaterialCommunityIcons name="history" size={22} color={Colors.secondary} />
                </Pressable>

                <Pressable
                    style={({ pressed }) => [styles.langButton, pressed && styles.buttonPressed]}
                    onPress={toggleLanguage}
                >
                    {i18n.language.startsWith("tr") ? (
                        <Image
                            source={require("../../assets/turkey-flag-round.png")}
                            style={styles.flagImage}
                        />
                    ) : i18n.language.startsWith("es") ? (
                        <Image
                            source={require("../../assets/spain-flag-round.png")}
                            style={styles.flagImage}
                        />
                    ) : (
                        <Image
                            source={require("../../assets/us-flag-round.png")}
                            style={styles.flagImage}
                        />
                    )}
                </Pressable>
            </View>

            <AuthModal visible={showAuth} onClose={() => setShowAuth(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 10,
        zIndex: 10,
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    buttonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.96 }],
    },

    premiumBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFFBEB",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#FDE68A",
    },

    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    profileButtonExpanded: {
        width: "auto",
        paddingLeft: 10,
        paddingRight: 6,
        borderRadius: 24,
        flexDirection: "row",
    },
    profileContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    profileTextContainer: {
        alignItems: "flex-end",
        maxWidth: 72,
    },
    profileName: {
        fontSize: 11,
        fontWeight: "700",
        color: Colors.secondary,
        lineHeight: 14,
    },
    profileRole: {
        fontSize: 9,
        fontWeight: "600",
        color: Colors.gray[400],
        lineHeight: 12,
    },
    profileRolePremium: {
        color: "#F59E0B",
    },
    avatarMini: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },

    langButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        overflow: "hidden",
    },
    flagImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
});
