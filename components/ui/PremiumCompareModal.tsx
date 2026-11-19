// "Premium Avantajları": alttan açılan sayfa. Turuncu geçişli üst alan (taç, serif başlık), altında
// Ücretsiz ve Premium sütunlu karşılaştırma; Premium sütunu vurgulu. Değerler ve geri çağrılar önceki
// sürümle aynı (onSubscribe, onClose).
import React, { useEffect, useMemo } from "react";
import { Modal, View, Pressable, StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./AppText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AppColors } from "../../constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    FadeInDown,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { Radii } from "../../constants/design";

interface PremiumCompareModalProps {
    visible: boolean;
    onClose: () => void;
    onSubscribe?: () => void;
}

const UNLIMITED = "∞";
const CHECK = "✓";
const CROSS = "✗";

/** Sütun genişlikleri tablo genişliğine oranla: dar ekranda da etiketler sığar. */
const FREE_COL = "22%";
const PREMIUM_COL = "27%";

type Styles = ReturnType<typeof createStyles>;

function FreeCell({ value, styles, colors }: { value: string; styles: Styles; colors: AppColors }) {
    if (value === CROSS) {
        return <Ionicons name="close" size={16} color={colors.gray[400]} accessibilityLabel={CROSS} />;
    }
    const isNumber = value === UNLIMITED || /^\d+$/.test(value);
    return (
        <Text
            variant={isNumber ? "display" : "body"}
            style={isNumber ? styles.freeNumber : styles.freeText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
        >
            {value}
        </Text>
    );
}

function PremiumCell({ value, styles }: { value: string; styles: Styles }) {
    if (value === CHECK) {
        return (
            <View style={styles.checkDot} accessibilityLabel={CHECK}>
                <Ionicons name="checkmark" size={13} color="#FFF" />
            </View>
        );
    }
    const isNumber = value === UNLIMITED || /^\d+$/.test(value);
    return (
        <Text
            variant={isNumber ? "display" : "body"}
            style={isNumber ? (value === UNLIMITED ? styles.premiumInfinity : styles.premiumNumber) : styles.premiumText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
        >
            {value}
        </Text>
    );
}

export default function PremiumCompareModal({ visible, onClose, onSubscribe }: PremiumCompareModalProps) {
    const { t } = useTranslation();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
    const insets = useSafeAreaInsets();
    const { height: winHeight } = useWindowDimensions();
    const maxSheetHeight = winHeight - insets.top - 12;
    // Kısa ekranda üst alan küçülür, tablo daha çok yer bulur.
    const compact = winHeight < 700;

    const translateY = useSharedValue(60);
    const sheetOpacity = useSharedValue(0);
    const backdrop = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) });
            sheetOpacity.value = withTiming(1, { duration: 260 });
            backdrop.value = withTiming(1, { duration: 260 });
        } else {
            translateY.value = 60;
            sheetOpacity.value = 0;
            backdrop.value = 0;
        }
    }, [visible]);

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: sheetOpacity.value,
    }));
    const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));

    const handleSubscribe = () => {
        onSubscribe?.();
    };

    if (!visible) return null;

    const rows: { icon: string; label: string; free: string; premium: string }[] = [
        { icon: "barcode-scan", label: t("premium.feat_scan"), free: "3", premium: UNLIMITED },
        { icon: "robot-outline", label: t("premium.feat_ai_chat"), free: "5", premium: UNLIMITED },
        {
            icon: "camera-outline",
            label: t("premium.feat_visuals"),
            free: CROSS,
            premium: t("premium.feat_visuals_value", { defaultValue: "5/hafta" }),
        },
        { icon: "account-group-outline", label: t("premium.feat_family"), free: "1", premium: UNLIMITED },
        { icon: "advertisements-off", label: t("premium.feat_ads"), free: CROSS, premium: CHECK },
        { icon: "lightning-bolt", label: t("premium.feat_priority"), free: CROSS, premium: CHECK },
    ];

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.root}>
                <Animated.View style={[styles.backdrop, backdropStyle]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                </Animated.View>

                <Animated.View
                    style={[styles.sheet, { maxHeight: maxSheetHeight, paddingBottom: insets.bottom + 12 }, sheetStyle]}
                >
                    {/* Üst alan: turuncu geçiş, sağ üstten yumuşak ışık */}
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDeep]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.hero, compact && styles.heroCompact]}
                    >
                        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                            <Svg width="100%" height="100%">
                                <Defs>
                                    <RadialGradient id="premiumCompareLight" cx="85%" cy="0%" r="80%">
                                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity={isDark ? 0.16 : 0.26} />
                                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
                                    </RadialGradient>
                                </Defs>
                                <Rect x="0" y="0" width="100%" height="100%" fill="url(#premiumCompareLight)" />
                            </Svg>
                        </View>

                        <View style={styles.grabber} />

                        <Pressable
                            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
                            onPress={onClose}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Close"
                        >
                            <Ionicons name="close" size={18} color="#FFF" />
                        </Pressable>

                        <View style={[styles.crownCircle, compact && styles.crownCircleCompact]}>
                            <MaterialCommunityIcons name="crown" size={compact ? 24 : 30} color="#FFF" />
                        </View>
                        <Text
                            variant="display"
                            style={[styles.title, compact && styles.titleCompact]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                        >
                            {t("premium.compare_title")}
                        </Text>
                        <Text style={styles.subtitle}>
                            {t("premium.compare_subtitle")}
                        </Text>
                    </LinearGradient>

                    <ScrollView
                        style={styles.scrollArea}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        <View style={styles.table}>
                            {/* Premium sütununun vurgulu zemini: tüm satırların arkasında tek parça */}
                            <View pointerEvents="none" style={styles.premiumColumnBg} />

                            {/* Sütun başlıkları */}
                            <View style={styles.headerRow}>
                                <View style={styles.labelCell} />
                                <View style={styles.freeCell}>
                                    <Text upper style={styles.freeHeaderText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                                        {t("premium.free")}
                                    </Text>
                                </View>
                                <View style={styles.premiumCell}>
                                    <View style={styles.premiumHeaderInner}>
                                        <MaterialCommunityIcons name="crown" size={12} color={colors.primary} />
                                        <Text upper style={styles.premiumHeaderText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                                            {t("premium.premium")}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {rows.map((row, index) => (
                                <Animated.View
                                    key={row.icon}
                                    entering={FadeInDown.delay(140 + index * 60).duration(340)}
                                    style={[styles.row, index < rows.length - 1 && styles.rowDivider]}
                                >
                                    <View style={styles.labelCell}>
                                        <View style={styles.featureIcon}>
                                            <MaterialCommunityIcons name={row.icon as any} size={16} color={colors.primary} />
                                        </View>
                                        <Text style={styles.featureLabel} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
                                            {row.label}
                                        </Text>
                                    </View>
                                    <View style={styles.freeCell}>
                                        <FreeCell value={row.free} styles={styles} colors={colors} />
                                    </View>
                                    <View style={styles.premiumCell}>
                                        <PremiumCell value={row.premium} styles={styles} />
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Pressable
                            style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
                            onPress={handleSubscribe}
                        >
                            <LinearGradient
                                colors={[colors.primary, colors.primaryDeep]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.ctaGradient}
                            >
                                <MaterialCommunityIcons name="crown" size={20} color="#FFF" />
                                <Text style={styles.ctaText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                                    {t("premium.upgrade_now")}
                                </Text>
                            </LinearGradient>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}
                            onPress={onClose}
                        >
                            <Text style={styles.secondaryText}>{t("premium.maybe_later")}</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const createStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.overlay,
    },
    sheet: {
        width: "100%",
        maxWidth: 560,
        alignSelf: "center",
        backgroundColor: colors.card,
        borderTopLeftRadius: Radii.sheet,
        borderTopRightRadius: Radii.sheet,
        overflow: "hidden",
    },

    // Üst alan
    hero: {
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 22,
        paddingHorizontal: 24,
    },
    heroCompact: {
        paddingBottom: 16,
    },
    grabber: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: "rgba(255,255,255,0.45)",
        marginBottom: 14,
    },
    closeBtn: {
        position: "absolute",
        top: 14,
        right: 14,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.35)",
    },
    crownCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.4)",
        marginBottom: 12,
    },
    crownCircleCompact: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        lineHeight: 34,
        color: "#FFF",
        textAlign: "center",
        maxWidth: "88%",
    },
    titleCompact: {
        fontSize: 24,
        lineHeight: 29,
    },
    subtitle: {
        fontSize: 13,
        lineHeight: 18,
        color: "rgba(255,255,255,0.86)",
        textAlign: "center",
        marginTop: 4,
        paddingHorizontal: 8,
    },

    // Tablo
    scrollArea: {
        flexShrink: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 6,
    },
    table: {
        position: "relative",
    },
    premiumColumnBg: {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        width: PREMIUM_COL,
        borderRadius: 16,
        backgroundColor: isDark ? "rgba(255,139,61,0.12)" : "rgba(242,96,12,0.07)",
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,139,61,0.30)" : "rgba(242,96,12,0.20)",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 38,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 50,
        paddingVertical: 6,
    },
    rowDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.gray[200],
    },
    labelCell: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingRight: 6,
    },
    freeCell: {
        width: FREE_COL,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    premiumCell: {
        width: PREMIUM_COL,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    freeHeaderText: {
        fontSize: 10.5,
        fontWeight: "700",
        color: colors.gray[500],
        letterSpacing: 0.5,
    },
    premiumHeaderInner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        maxWidth: "100%",
    },
    premiumHeaderText: {
        fontSize: 10.5,
        fontWeight: "700",
        color: colors.primary,
        letterSpacing: 0.5,
        flexShrink: 1,
    },
    featureIcon: {
        width: 30,
        height: 30,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDark ? "rgba(255,139,61,0.16)" : "rgba(242,96,12,0.10)",
    },
    featureLabel: {
        flex: 1,
        minWidth: 0,
        fontSize: 13.5,
        fontWeight: "600",
        color: colors.text,
    },
    freeNumber: {
        fontSize: 18,
        lineHeight: 22,
        color: colors.gray[500],
    },
    freeText: {
        fontSize: 12.5,
        fontWeight: "600",
        color: colors.gray[500],
    },
    premiumNumber: {
        fontSize: 18,
        lineHeight: 22,
        color: colors.primary,
    },
    premiumInfinity: {
        fontSize: 24,
        lineHeight: 26,
        color: colors.primary,
    },
    premiumText: {
        fontSize: 12.5,
        fontWeight: "700",
        color: colors.primary,
    },
    checkDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary,
    },

    // Alt düğmeler
    footer: {
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    ctaButton: {
        borderRadius: Radii.control + 2,
    },
    ctaPressed: {
        opacity: 0.92,
        transform: [{ scale: 0.98 }],
    },
    ctaGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderRadius: Radii.control + 2,
        gap: 8,
    },
    ctaText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
        flexShrink: 1,
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
        color: colors.gray[500],
    },
});
