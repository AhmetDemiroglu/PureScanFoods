import React, { useEffect, useMemo } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    FadeInDown
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
interface LimitWarningModalProps {
    visible: boolean;
    onClose: () => void;
    onGoPremium: () => void;
    stats: any;
    user: any;
    limitType?: 'weekly' | 'family';
}

const { width } = Dimensions.get('window');

const UsageRow = ({ icon, label, status, isLimitReached, isAdAvailable, delay }: any) => {
    const { t } = useTranslation();

    return (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(500).springify()}
            style={styles.usageRow}
        >
            <View style={styles.usageLeft}>
                <View style={[styles.usageIconBox, isLimitReached && styles.usageIconBoxError]}>
                    <MaterialCommunityIcons name={icon} size={20} color={isLimitReached ? '#EF4444' : Colors.gray[600]} />
                </View>
                <Text style={styles.usageLabel}>{label}</Text>
            </View>

            <View style={styles.usageRight}>
                {isLimitReached && isAdAvailable ? (
                    <View style={styles.adBadge}>
                        <Ionicons name="play" size={10} color="#FFF" />
                        <Text style={styles.adBadgeText}>{t('limits.watch_ad')}</Text>
                    </View>
                ) : (
                    <View style={[styles.statusBadge, isLimitReached && styles.statusBadgeError]}>
                        <Text style={[styles.statusText, isLimitReached && styles.statusTextError]}>{status}</Text>
                        <Ionicons
                            name={isLimitReached ? "lock-closed" : "checkmark-circle"}
                            size={14}
                            color={isLimitReached ? "#EF4444" : "#10B981"}
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

export default function LimitWarningModal({ visible, onClose, onGoPremium, stats, user, limitType = 'weekly' }: LimitWarningModalProps) {
    const { t } = useTranslation();
    const scale = useSharedValue(0.9);
    const opacity = useSharedValue(0);

    const isFamilyMode = limitType === 'family';

    useEffect(() => {
        if (visible) {
            scale.value = withSpring(1, { damping: 12 });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            scale.value = 0.9;
            opacity.value = 0;
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const computedData = useMemo(() => {
        const s = stats || { scanCount: 0, scanLimit: 3, aiChatCount: 0, aiChatLimit: 5 };
        const u = user || { familyMembers: [] };

        const rawFamilyCount = u.familyMembers?.length || 0;
        const adjustedFamilyCount = rawFamilyCount > 0 ? rawFamilyCount - 1 : 0;

        return {
            scan: { current: s.scanCount || 0, max: s.scanLimit || 3 },
            ai: { current: s.aiChatCount || 0, max: s.aiChatLimit || 5 },
            family: { current: adjustedFamilyCount, max: 1 }
        };
    }, [stats, user]);

    const renewalDateText = useMemo(() => {
        if (isFamilyMode) return "";

        const rawDate = stats?.weekStartDate || user?.metadata?.createdAt || user?.createdAt || new Date();
        const date = parseDate(rawDate);
        date.setDate(date.getDate() + 7);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
    }, [stats, user, isFamilyMode]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <Animated.View style={[styles.container, animatedStyle]}>
                    <Pressable style={styles.closeIconBtn} onPress={onClose}>
                        <Ionicons name="close" size={20} color={Colors.gray[500]} />
                    </Pressable>

                    <View style={styles.headerIconContainer}>
                        <View style={styles.headerIconBg}>
                            <MaterialCommunityIcons
                                name={isFamilyMode ? "account-group" : "alert-decagram-outline"}
                                size={32}
                                color="#EF4444"
                            />
                        </View>
                    </View>

                    <Text style={styles.mainTitle}>
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

                    <View style={styles.listSection}>
                        <Text style={styles.sectionTitle}>{t('limits.usage_status', 'KULLANIM DURUMU')}</Text>
                        <View style={styles.listContainer}>
                            {!isFamilyMode && (
                                <>
                                    <UsageRow
                                        icon="barcode-scan"
                                        label={t('limits.feat_analysis', 'Ürün Analizi')}
                                        status={`${computedData.scan.current}/${computedData.scan.max}`}
                                        isLimitReached={computedData.scan.current >= computedData.scan.max}
                                        isAdAvailable={true}
                                        delay={100}
                                    />
                                    <UsageRow
                                        icon="robot-outline"
                                        label={t('limits.feat_chat', 'AI Asistan')}
                                        status={`${computedData.ai.current}/${computedData.ai.max}`}
                                        isLimitReached={computedData.ai.current >= computedData.ai.max}
                                        isAdAvailable={true}
                                        delay={200}
                                    />
                                </>
                            )}

                            {/* Family Row: Her zaman görünür */}
                            <UsageRow
                                icon="account-group-outline"
                                label={t('limits.feat_family', 'Aile Üyesi')}
                                status={`${computedData.family.current}/${computedData.family.max}`}
                                isLimitReached={computedData.family.current >= computedData.family.max}
                                delay={300}
                            />
                        </View>
                    </View>

                    {/* 4. Tarih Kutusu: Sadece Weekly modunda görünür. Family statiktir, tarih yoktur. */}
                    {!isFamilyMode && (
                        <View style={styles.infoBox}>
                            <View style={styles.infoIcon}>
                                <MaterialCommunityIcons name="calendar-refresh-outline" size={20} color="#3B82F6" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoTitle}>{t('limits.renewal_title', 'YENİLENME ZAMANI')}</Text>
                                <Text style={styles.infoDesc}>
                                    {t('limits.renewal_desc', { date: renewalDateText })} tarihinde haklarınız sıfırlanacak.
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* 5. Aile Modu için Ekstra Bilgi (Opsiyonel) */}
                    {isFamilyMode && (
                        <View style={[styles.infoBox, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
                            <View style={[styles.infoIcon, { backgroundColor: '#FFEDD5' }]}>
                                <MaterialCommunityIcons name="crown-outline" size={20} color="#F97316" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.infoTitle, { color: '#C2410C' }]}>PREMIUM AVANTAJI</Text>
                                <Text style={[styles.infoDesc, { color: '#EA580C' }]}>
                                    Premium planda dilediğiniz kadar aile üyesi profili oluşturabilirsiniz.
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Butonlar AYNI */}
                    <Pressable style={styles.ctaButton} onPress={onGoPremium}>
                        <LinearGradient
                            colors={['#FF8C00', '#EA580C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaGradient}
                        >
                            <MaterialCommunityIcons name="crown-outline" size={20} color="#FFF" />
                            <Text style={styles.ctaText}>{t('limits.go_premium_caps', 'PREMIUM\'A GEÇ')}</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                        </LinearGradient>
                    </Pressable>

                    <Pressable style={styles.secondaryButton} onPress={onClose}>
                        <Text style={styles.secondaryText}>{t('limits.maybe_later', 'Şimdilik İdare Et')}</Text>
                    </Pressable>

                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.7)' },
    usageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
    usageLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    usageIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    usageIconBoxError: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
    usageLabel: { fontSize: 13, fontWeight: '600', color: '#334155' },
    usageRight: { flexDirection: 'row', alignItems: 'center' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusBadgeError: { backgroundColor: '#FEF2F2' },
    statusText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
    statusTextError: { color: '#EF4444' },
    container: { width: width * 0.88, maxWidth: 380, backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center' },
    backdrop: { ...StyleSheet.absoluteFillObject },
    closeIconBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 4 },
    headerIconContainer: { marginBottom: 16, marginTop: 8 },
    headerIconBg: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECACA', borderStyle: 'dashed' },
    mainTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 8 },
    description: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 24, paddingHorizontal: 10 },
    listSection: { width: '100%', marginBottom: 14 },
    sectionTitle: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginBottom: 12, letterSpacing: 0.5 },
    listContainer: { gap: 10 },
    infoBox: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 14, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: '#DBEAFE', gap: 12 },
    infoIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },
    infoTitle: { fontSize: 11, fontWeight: '800', color: '#1E40AF', marginBottom: 2 },
    infoDesc: { fontSize: 11, color: '#3B82F6', lineHeight: 14, fontWeight: '500' },
    ctaButton: { width: '100%', marginBottom: 16 },
    ctaGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 18, gap: 8 },
    ctaText: { color: '#FFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
    secondaryButton: { paddingVertical: 4 },
    secondaryText: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5 },
    adBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F43F5E',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 20,
        gap: 4,
    },
    adBadgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});