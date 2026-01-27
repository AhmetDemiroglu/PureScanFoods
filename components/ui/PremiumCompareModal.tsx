import React, { useEffect } from "react";
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    FadeIn,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";

interface PremiumCompareModalProps {
    visible: boolean;
    onClose: () => void;
    onSubscribe?: () => void;
}

const { width } = Dimensions.get("window");

interface FeatureRowProps {
    icon: string;
    iconColor: string;
    iconBg: string;
    label: string;
    freeValue: string;
    premiumValue: string;
    index: number;
}

const FeatureRow = ({ icon, iconColor, iconBg, label, freeValue, premiumValue, index }: FeatureRowProps) => {
    const isPremiumBetter = premiumValue === "∞" || premiumValue.includes("✓");

    return (
        <Animated.View
            entering={FadeIn.delay(200 + index * 80).duration(400)}
            style={styles.featureRow}
        >
            <View style={styles.featureLeft}>
                <View style={[styles.featureIconBox, { backgroundColor: iconBg }]}>
                    <MaterialCommunityIcons name={icon as any} size={18} color={iconColor} />
                </View>
                <Text style={styles.featureLabel}>{label}</Text>
            </View>
            <View style={styles.featureValues}>
                <View style={styles.freeValueBox}>
                    <Text style={styles.freeValue}>{freeValue}</Text>
                </View>
                <View style={[styles.premiumValueBox, isPremiumBetter && styles.premiumValueBoxHighlight]}>
                    <Text style={[styles.premiumValue, isPremiumBetter && styles.premiumValueHighlight]}>
                        {premiumValue}
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
};

export default function PremiumCompareModal({ visible, onClose, onSubscribe }: PremiumCompareModalProps) {
    const { t } = useTranslation();

    const translateY = useSharedValue(30);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                duration: 450,
                easing: Easing.out(Easing.cubic),
            });
            opacity.value = withTiming(1, { duration: 350 });
        } else {
            translateY.value = 30;
            opacity.value = 0;
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    const handleSubscribe = () => {
        onSubscribe?.();
        // TODO: Navigate to paywall
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <Animated.View style={[styles.container, animatedStyle]}>
                    {/* Close Button */}
                    <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
                        <Ionicons name="close" size={22} color={Colors.gray[400]} />
                    </Pressable>

                    {/* Header */}
                    <View style={styles.headerSection}>
                        <LinearGradient
                            colors={["#FEF3C7", "#FDE68A"]}
                            style={styles.crownContainer}
                        >
                            <MaterialCommunityIcons name="crown" size={32} color="#F59E0B" />
                        </LinearGradient>
                        <Text style={styles.title}>{t("premium.compare_title")}</Text>
                        <Text style={styles.subtitle}>{t("premium.compare_subtitle")}</Text>
                    </View>

                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <View style={styles.tableHeaderLeft} />
                        <View style={styles.tableHeaderValues}>
                            <View style={styles.freeHeader}>
                                <Text style={styles.freeHeaderText}>{t("premium.free")}</Text>
                            </View>
                            <View style={styles.premiumHeader}>
                                <MaterialCommunityIcons name="crown" size={12} color="#FFF" />
                                <Text style={styles.premiumHeaderText}>{t("premium.premium")}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Features List */}
                    <View style={styles.featuresList}>
                        <FeatureRow
                            icon="barcode-scan"
                            iconColor={Colors.primary}
                            iconBg="#FFF7ED"
                            label={t("premium.feat_scan")}
                            freeValue="5"
                            premiumValue="∞"
                            index={0}
                        />
                        <FeatureRow
                            icon="robot-outline"
                            iconColor="#7C3AED"
                            iconBg="#EDE9FE"
                            label={t("premium.feat_ai_chat")}
                            freeValue="5"
                            premiumValue="∞"
                            index={1}
                        />
                        <FeatureRow
                            icon="account-group-outline"
                            iconColor="#0284C7"
                            iconBg="#E0F2FE"
                            label={t("premium.feat_family")}
                            freeValue="1"
                            premiumValue="∞"
                            index={2}
                        />
                        <FeatureRow
                            icon="advertisements-off"
                            iconColor="#DC2626"
                            iconBg="#FEF2F2"
                            label={t("premium.feat_ads")}
                            freeValue="✗"
                            premiumValue="✓"
                            index={3}
                        />
                        <FeatureRow
                            icon="lightning-bolt"
                            iconColor="#F59E0B"
                            iconBg="#FEF3C7"
                            label={t("premium.feat_priority")}
                            freeValue="✗"
                            premiumValue="✓"
                            index={4}
                        />
                    </View>

                    {/* CTA Button */}
                    <Pressable
                        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
                        onPress={handleSubscribe}
                    >
                        <LinearGradient
                            colors={["#FF8C00", "#EA580C"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaGradient}
                        >
                            <MaterialCommunityIcons name="crown" size={20} color="#FFF" />
                            <Text style={styles.ctaText}>{t("premium.upgrade_now")}</Text>
                        </LinearGradient>
                    </Pressable>

                    {/* Secondary Action */}
                    <Pressable
                        style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}
                        onPress={onClose}
                    >
                        <Text style={styles.secondaryText}>{t("premium.maybe_later")}</Text>
                    </Pressable>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        width: width * 0.9,
        maxWidth: 400,
        backgroundColor: "#FFF",
        borderRadius: 24,
        paddingTop: 28,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    closeBtn: {
        position: "absolute",
        top: 14,
        right: 14,
        zIndex: 10,
        padding: 4,
    },

    // Header
    headerSection: {
        alignItems: "center",
        marginBottom: 20,
    },
    crownContainer: {
        width: 60,
        height: 60,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },
    title: {
        fontSize: 19,
        fontWeight: "800",
        color: Colors.secondary,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 13,
        color: Colors.gray[500],
        textAlign: "center",
        marginTop: 6,
        lineHeight: 18,
    },

    // Table Header
    tableHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    tableHeaderLeft: {
        flex: 1,
    },
    tableHeaderValues: {
        flexDirection: "row",
        gap: 8,
    },
    freeHeader: {
        width: 50,
        paddingVertical: 5,
        borderRadius: 6,
        backgroundColor: Colors.gray[100],
        alignItems: "center",
    },
    freeHeaderText: {
        fontSize: 10,
        fontWeight: "700",
        color: Colors.gray[500],
    },
    premiumHeader: {
        width: 70,
        paddingVertical: 5,
        borderRadius: 6,
        backgroundColor: "#F59E0B",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
    },
    premiumHeaderText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#FFF",
    },

    // Features List
    featuresList: {
        marginBottom: 16,
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[100],
    },
    featureLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 10,
    },
    featureIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    featureLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.secondary,
        flex: 1,
    },
    featureValues: {
        flexDirection: "row",
        gap: 8,
    },
    freeValueBox: {
        width: 50,
        paddingVertical: 5,
        borderRadius: 6,
        backgroundColor: Colors.gray[50],
        alignItems: "center",
    },
    freeValue: {
        fontSize: 12,
        fontWeight: "700",
        color: Colors.gray[500],
    },
    premiumValueBox: {
        width: 70,
        paddingVertical: 5,
        borderRadius: 6,
        backgroundColor: Colors.gray[50],
        alignItems: "center",
    },
    premiumValueBoxHighlight: {
        backgroundColor: "#FEF3C7",
    },
    premiumValue: {
        fontSize: 12,
        fontWeight: "700",
        color: Colors.gray[600],
    },
    premiumValueHighlight: {
        color: "#D97706",
    },

    // CTA
    ctaButton: {
        marginTop: 4,
    },
    ctaPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    ctaGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 14,
        gap: 8,
    },
    ctaText: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "700",
    },
    secondaryButton: {
        alignItems: "center",
        paddingVertical: 12,
    },
    secondaryPressed: {
        opacity: 0.7,
    },
    secondaryText: {
        fontSize: 13,
        fontWeight: "600",
        color: Colors.gray[400],
    },
});