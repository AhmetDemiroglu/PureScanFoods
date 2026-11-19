// Haklar dolduğunda açılan sayfa (haftalık ve aile sınırı). Premium sayfalarıyla aynı dil: alttan açılır,
// serif başlık, gruplu kullanım listesi, turuncu geçişli düğme. Reklam ödülü, sınır hesabı ve geri
// çağrılar önceki sürümle aynı. Tarih uygulama diliyle biçimlenir.
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Pressable, StyleSheet, ActivityIndicator, ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./AppText";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppColors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    FadeInDown
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { showRewardedAd, isRewardedReady, loadRewardedAd } from '../../lib/admob';
import { grantBonusScan, grantBonusChat } from '../../lib/firestore';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { Radii } from '../../constants/design';

interface LimitWarningModalProps {
    visible: boolean;
    onClose: () => void;
    onGoPremium: () => void;
    stats: any;
    user: any;
    limitType?: 'weekly' | 'family';
    onRewardEarned?: () => void;
}



const UsageRow = ({ icon, label, status, isLimitReached, isAdAvailable, delay, onWatchAd, isLoadingAd, styles, colors, isLast }: any) => {
    const { t } = useTranslation();

    return (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(420)}
            style={[styles.usageRow, !isLast && styles.usageRowDivider]}
        >
            <View style={styles.usageLeft}>
                <View style={[styles.usageIconBox, isLimitReached && styles.usageIconBoxError]}>
                    <MaterialCommunityIcons name={icon} size={17} color={isLimitReached ? colors.error : colors.primary} />
                </View>
                <Text style={styles.usageLabel} numberOfLines={2}>{label}</Text>
            </View>

            <View style={styles.usageRight}>
                {isLimitReached && isAdAvailable ? (
                    <Pressable
                        style={({ pressed }) => [styles.adBadge, isLoadingAd && styles.adBadgeDisabled, pressed && { opacity: 0.85 }]}
                        onPress={onWatchAd}
                        disabled={isLoadingAd}
                    >
                        {isLoadingAd ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="play" size={10} color="#FFF" />
                                <Text style={styles.adBadgeText} numberOfLines={1}>{t('limits.watch_ad')}</Text>
                            </>
                        )}
                    </Pressable>
                ) : (
                    <View style={[styles.statusBadge, isLimitReached && styles.statusBadgeError]}>
                        <Text style={[styles.statusText, isLimitReached && styles.statusTextError]}>{status}</Text>
                        <Ionicons
                            name={isLimitReached ? "lock-closed" : "checkmark-circle"}
                            size={13}
                            color={isLimitReached ? colors.error : colors.success}
                        />
                    </View>
                )}
            </View>
        </Animated.View>
    );
};

const parseDate = (input: any): Date => {
    if (!input) return new Date();
    if (typeof input === 'object' && input.seconds) return new Date(input.seconds * 1000);
    return new Date(input);
};

export default function LimitWarningModal({ visible, onClose, onGoPremium, stats, user, limitType = 'weekly', onRewardEarned }: LimitWarningModalProps) {
    const { t, i18n } = useTranslation();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
    const insets = useSafeAreaInsets();
    const { height: winHeight } = useWindowDimensions();
    const maxSheetHeight = winHeight - insets.top - 12;
    const { user: authUser, deviceId } = useAuth();
    const { familyMembers } = useUser();

    const translateY = useSharedValue(60);
    const opacity = useSharedValue(0);
    const backdrop = useSharedValue(0);

    const [loadingAdType, setLoadingAdType] = useState<'scan' | 'chat' | null>(null);
    const [adAvailable, setAdAvailable] = useState(false);
    const isFamilyMode = limitType === 'family';

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) });
            opacity.value = withTiming(1, { duration: 280 });
            backdrop.value = withTiming(1, { duration: 260 });
        } else {
            translateY.value = 60;
            opacity.value = 0;
            backdrop.value = 0;
        }
    }, [visible]);

    useEffect(() => {
        if (visible) {
            if (isRewardedReady()) {
                setAdAvailable(true);
            } else {
                setAdAvailable(false);
                loadRewardedAd()
                    .then(() => setAdAvailable(true))
                    .catch(() => setAdAvailable(false));
            }
        }
    }, [visible]);

    const handleWatchAd = async (type: 'scan' | 'chat') => {
        if (!authUser?.uid) return;

        console.log("?? handleWatchAd START - type:", type, "uid:", authUser.uid, "deviceId:", deviceId);
        setLoadingAdType(type);

        try {
            const result = await showRewardedAd(type);
            console.log("?? showRewardedAd result:", result);

            if (result.success) {
                if (type === 'scan') {
                    await grantBonusScan(authUser.uid, deviceId);
                } else {
                    await grantBonusChat(authUser.uid, deviceId);
                }

                onRewardEarned?.();
                // Reward verildikten sonra modalı kapat
                onClose();
            }
        } catch (error) {
            console.error('Ad error:', error);
        } finally {
            setLoadingAdType(null);
            // Reklam gösterildikten sonra yeni reklam yüklenene kadar butonu devre dışı bırak
            setAdAvailable(isRewardedReady());
            if (!isRewardedReady()) {
                loadRewardedAd()
                    .then(() => setAdAvailable(true))
                    .catch(() => setAdAvailable(false));
            }
        }
    };

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));
    const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));

    const computedData = useMemo(() => {
        const s = stats || { scanCount: 0, scanLimit: 3, aiChatCount: 0, aiChatLimit: 5 };
        const u = user || { familyMembers: [] };

        // Source of truth: UserContext (main_user excluded). Fallback to modal user prop.
        const contextFamilyCount = (familyMembers || []).filter((m: any) => m.id !== 'main_user').length;
        const fallbackRawFamilyCount = u.familyMembers?.length || 0;
        const fallbackAdjustedFamilyCount = fallbackRawFamilyCount > 0 ? fallbackRawFamilyCount - 1 : 0;
        const adjustedFamilyCount = contextFamilyCount > 0 ? contextFamilyCount : fallbackAdjustedFamilyCount;

        return {
            scan: { current: s.scanCount || 0, max: s.scanLimit || 3 },
            ai: { current: s.aiChatCount || 0, max: s.aiChatLimit || 5 },
            family: { current: adjustedFamilyCount, max: 1 }
        };
    }, [stats, user, familyMembers]);

    const renewalDateText = useMemo(() => {
        if (isFamilyMode) return "";

        const rawDate = stats?.weekStartDate || user?.metadata?.createdAt || user?.createdAt || new Date();
        const date = parseDate(rawDate);
        date.setDate(date.getDate() + 7);
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', weekday: 'long' };
        try {
            return date.toLocaleDateString(i18n.language || undefined, options);
        } catch {
            return date.toLocaleDateString(undefined, options);
        }
    }, [stats, user, isFamilyMode, i18n.language]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.root}>
                <Animated.View style={[styles.backdrop, backdropStyle]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                </Animated.View>

                <Animated.View
                    style={[styles.sheet, { maxHeight: maxSheetHeight, paddingBottom: insets.bottom + 12 }, sheetStyle]}
                >
                    <ScrollView
                        style={styles.scrollArea}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        {/* Üst alan: sıcak ışık, simge, serif başlık */}
                        <View style={styles.hero}>
                            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                                <Svg width="100%" height="100%">
                                    <Defs>
                                        <RadialGradient id="limitGlow" cx="50%" cy="0%" r="75%">
                                            <Stop offset="0" stopColor={colors.primary} stopOpacity={isDark ? 0.2 : 0.12} />
                                            <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
                                        </RadialGradient>
                                    </Defs>
                                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#limitGlow)" />
                                </Svg>
                            </View>

                            <View style={styles.grabber} />

                            <View style={styles.headerIconBg}>
                                <MaterialCommunityIcons
                                    name={isFamilyMode ? "account-group" : "alert-decagram-outline"}
                                    size={30}
                                    color={colors.primary}
                                />
                            </View>

                            <Text variant="display" style={styles.mainTitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
                                {isFamilyMode
                                    ? t('limits.family_limit_title', 'Aile Sınırı Doldu')
                                    : t('limits.weekly_title', 'Haftalık Limit')}
                            </Text>

                            <Text style={styles.description}>
                                {isFamilyMode
                                    ? t('limits.family_limit_desc', 'Ücretsiz planda en fazla 1 aile üyesi ekleyebilirsiniz. Sınırsız profil için Premium\'a geçin.')
                                    : t('limits.limit_reached_desc', 'Haftalık ücretsiz kullanım haklarınızdan bazıları doldu. Premium ile sınırsız kullanın.')
                                }
                            </Text>
                        </View>

                        <View style={styles.body}>
                            <Text style={styles.sectionTitle}>{t('limits.usage_status', 'KULLANIM DURUMU')}</Text>
                            <View style={styles.listGroup}>
                                {!isFamilyMode && (
                                    <>
                                        <UsageRow
                                            icon="barcode-scan"
                                            label={t('limits.feat_analysis', 'Ürün Analizi')}
                                            status={`${computedData.scan.current}/${computedData.scan.max}`}
                                            isLimitReached={computedData.scan.current >= computedData.scan.max}
                                            isAdAvailable={adAvailable}
                                            delay={100}
                                            onWatchAd={() => handleWatchAd('scan')}
                                            isLoadingAd={loadingAdType === 'scan'}
                                            styles={styles} colors={colors} />
                                        <UsageRow
                                            icon="robot-outline"
                                            label={t('limits.feat_chat', 'AI Asistan')}
                                            status={`${computedData.ai.current}/${computedData.ai.max}`}
                                            isLimitReached={computedData.ai.current >= computedData.ai.max}
                                            isAdAvailable={adAvailable}
                                            delay={170}
                                            onWatchAd={() => handleWatchAd('chat')}
                                            isLoadingAd={loadingAdType === 'chat'}
                                            styles={styles} colors={colors} />
                                    </>
                                )}

                                {/* Family Row: Her zaman görünür */}
                                <UsageRow
                                    icon="account-group-outline"
                                    label={t('limits.feat_family', 'Aile Üyesi')}
                                    status={`${computedData.family.current}/${computedData.family.max}`}
                                    isLimitReached={computedData.family.current >= computedData.family.max}
                                    delay={240}
                                    isLast
                                    styles={styles} colors={colors} />
                            </View>

                            {/* Yenilenme tarihi: yalnız haftalık modda. Aile sınırı sabittir, tarihi yoktur. */}
                            {!isFamilyMode && (
                                <View style={styles.infoBox}>
                                    <View style={styles.infoIcon}>
                                        <MaterialCommunityIcons name="calendar-refresh-outline" size={18} color={colors.primary} />
                                    </View>
                                    <View style={styles.infoText}>
                                        <Text style={styles.infoTitle}>{t('limits.renewal_title', 'YENİLENME ZAMANI')}</Text>
                                        <Text style={styles.infoDesc}>
                                            {t('limits.renewal_desc', { date: renewalDateText })}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Aile modunda Premium avantajı */}
                            {isFamilyMode && (
                                <View style={styles.infoBox}>
                                    <View style={styles.infoIcon}>
                                        <MaterialCommunityIcons name="crown-outline" size={18} color={colors.primary} />
                                    </View>
                                    <View style={styles.infoText}>
                                        <Text style={styles.infoTitle}>
                                            {t('limits.premium_advantage', { defaultValue: 'PREMIUM BENEFIT' })}
                                        </Text>
                                        <Text style={styles.infoDesc}>
                                            {t('limits.family_premium_desc', {
                                                defaultValue: 'With Premium you can create as many family member profiles as you like.',
                                            })}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Düğmeler: kaydırma alanının dışında, hep görünür */}
                    <View style={styles.footer}>
                        <Pressable
                            style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
                            onPress={onGoPremium}
                        >
                            <LinearGradient
                                colors={[colors.primary, colors.primaryDeep]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.ctaGradient}
                            >
                                <MaterialCommunityIcons name="crown-outline" size={20} color="#FFF" />
                                <Text
                                    style={styles.ctaText}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.72}
                                >
                                    {t('limits.go_premium_caps', 'PREMIUM\'A GEÇ')}
                                </Text>
                                <Ionicons name="arrow-forward" size={18} color="#FFF" />
                            </LinearGradient>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.6 }]}
                            onPress={onClose}
                        >
                            <Text style={styles.secondaryText}>{t('limits.maybe_later', 'Şimdilik İdare Et')}</Text>
                        </Pressable>
                    </View>

                    <Pressable
                        style={({ pressed }) => [styles.closeIconBtn, pressed && { opacity: 0.6 }]}
                        onPress={onClose}
                        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                        accessibilityRole="button"
                        accessibilityLabel="Close"
                    >
                        <Ionicons name="close" size={18} color={colors.gray[500]} />
                    </Pressable>
                </Animated.View>
            </View>
        </Modal>
    );
}

const createStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
    sheet: {
        width: '100%',
        maxWidth: 560,
        alignSelf: 'center',
        backgroundColor: colors.card,
        borderTopLeftRadius: Radii.sheet,
        borderTopRightRadius: Radii.sheet,
        overflow: 'hidden',
    },
    scrollArea: { flexShrink: 1 },
    scrollContent: { paddingBottom: 4 },
    closeIconBtn: {
        position: 'absolute',
        top: 14,
        right: 14,
        zIndex: 10,
        elevation: 3,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? colors.gray[200] : colors.gray[100],
    },

    // Üst alan
    hero: { alignItems: 'center', paddingTop: 10, paddingBottom: 16, paddingHorizontal: 24 },
    grabber: { width: 40, height: 5, borderRadius: 2.5, backgroundColor: colors.gray[300], marginBottom: 16 },
    headerIconBg: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: isDark ? 'rgba(255,139,61,0.16)' : 'rgba(242,96,12,0.10)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,139,61,0.28)' : 'rgba(242,96,12,0.18)',
        marginBottom: 12,
    },
    mainTitle: { fontSize: 25, lineHeight: 30, color: colors.text, textAlign: 'center', marginBottom: 6, maxWidth: '88%' },
    description: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19, paddingHorizontal: 6 },

    // Kullanım listesi
    body: { paddingHorizontal: 18 },
    sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.gray[400], marginBottom: 8, marginLeft: 4, letterSpacing: 0.6 },
    listGroup: {
        backgroundColor: colors.card,
        borderRadius: Radii.card,
        borderWidth: 1,
        borderColor: colors.gray[200],
        overflow: 'hidden',
        marginBottom: 12,
    },
    usageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        minHeight: 54,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    usageRowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.gray[200] },
    usageLeft: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 },
    usageIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: isDark ? 'rgba(255,139,61,0.16)' : 'rgba(242,96,12,0.10)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    usageIconBoxError: { backgroundColor: isDark ? 'rgba(248,113,113,0.16)' : 'rgba(239,68,68,0.10)' },
    usageLabel: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: '600', color: colors.text },
    usageRight: { flexDirection: 'row', alignItems: 'center' },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: Radii.pill,
        backgroundColor: isDark ? colors.gray[100] : colors.gray[50],
    },
    statusBadgeError: { backgroundColor: isDark ? 'rgba(248,113,113,0.16)' : 'rgba(239,68,68,0.10)' },
    statusText: { fontSize: 12.5, fontWeight: '700', color: colors.gray[500] },
    statusTextError: { color: colors.error },
    adBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: Radii.pill,
        gap: 4,
        minWidth: 80,
        justifyContent: 'center',
    },
    adBadgeDisabled: {
        opacity: 0.7,
    },
    adBadgeText: {
        color: '#FFF',
        fontSize: 11.5,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // Bilgi kutusu (yenilenme / premium avantajı)
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: Radii.card,
        backgroundColor: isDark ? 'rgba(255,139,61,0.10)' : '#FFF6EE',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,139,61,0.22)' : 'rgba(242,96,12,0.14)',
        marginBottom: 4,
    },
    infoIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: isDark ? 'rgba(255,139,61,0.18)' : '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: { flex: 1, minWidth: 0 },
    infoTitle: { fontSize: 11, fontWeight: '700', color: isDark ? colors.primary : colors.primaryDeep, letterSpacing: 0.5, marginBottom: 2 },
    infoDesc: { fontSize: 12.5, color: colors.textMuted, lineHeight: 17 },

    // Düğmeler
    footer: { paddingHorizontal: 18, paddingTop: 12 },
    ctaButton: { borderRadius: Radii.control + 2 },
    ctaPressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 14,
        borderRadius: Radii.control + 2,
        gap: 8,
    },
    ctaText: { color: '#FFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.3, flexShrink: 1, textAlign: 'center' },
    secondaryButton: { alignItems: 'center', paddingVertical: 12 },
    secondaryText: { fontSize: 12.5, fontWeight: '600', color: colors.gray[500], letterSpacing: 0.3 },
});
