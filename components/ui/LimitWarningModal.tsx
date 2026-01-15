import React, { useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withDelay,
    FadeInDown,
    withRepeat,
    withSequence
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

interface LimitWarningModalProps {
    visible: boolean;
    onClose: () => void;
    onGoPremium: () => void;
    resetDate?: string;
}

const { width, height } = Dimensions.get('window');

// --- ALT BİLEŞENLER ---
const FeatureRow = ({ label, subLabel, freeVal, proCheck, delay }: { label: string, subLabel: string, freeVal: string | boolean, proCheck: boolean, delay: number }) => {
    return (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(500).springify()}
            style={styles.row}
        >
            {/* SOL: İkon ve Metinler */}
            <View style={styles.rowLeft}>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons
                        name={label.includes("Sohbet") ? "robot" : label.includes("Reklam") ? "block-helper" : label.includes("Aile") ? "account-group" : "scan-helper"}
                        size={20}
                        color={Colors.gray[600]}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{label}</Text>
                    <Text style={styles.rowSubLabel} numberOfLines={2}>{subLabel}</Text>
                </View>
            </View>

            {/* SAĞ: Değerler */}
            <View style={styles.rowRight}>
                {/* FREE */}
                <View style={styles.colCenter}>
                    {typeof freeVal === 'string' ? (
                        <Text style={styles.limitText}>{freeVal}</Text>
                    ) : (
                        <Ionicons name="close" size={20} color="#EF4444" />
                    )}
                </View>

                {/* PRO */}
                <View style={styles.colCenter}>
                    <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={14} color="white" />
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

export default function LimitWarningModal({ visible, onClose, onGoPremium }: LimitWarningModalProps) {
    const { t } = useTranslation();
    const scale = useSharedValue(0.9);
    const opacity = useSharedValue(0);
    const buttonPulse = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            scale.value = withSpring(1, { damping: 12 });
            opacity.value = withTiming(1, { duration: 300 });

            buttonPulse.value = withRepeat(
                withSequence(withTiming(1.05, { duration: 800 }), withTiming(1, { duration: 800 })),
                -1,
                true
            );
        } else {
            scale.value = 0.9;
            opacity.value = 0;
            buttonPulse.value = 1;
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonPulse.value }]
    }));

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />

                <Animated.View style={[styles.container, animatedStyle]}>

                    <Pressable style={styles.closeIconBtn} onPress={onClose}>
                        <Ionicons name="close" size={20} color={Colors.gray[500]} />
                    </Pressable>

                    {/* 2. HEADER (Pro Tanıtım) */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{t('limits.pro_title')}</Text>
                        <Text style={styles.subtitle}>{t('limits.pro_subtitle')}</Text>
                    </View>

                    {/* 1. YENİ: LIMIT DURUM KARTI (Geri Bildirim) */}
                    <View style={styles.limitStatusCard}>
                        <View style={styles.limitIconBox}>
                            <MaterialCommunityIcons name="lock" size={24} color="#EF4444" />
                        </View>
                        <View style={styles.limitInfo}>
                            <Text style={styles.limitTitle}>{t('limits.limit_reached_title')}</Text>
                            <Text style={styles.limitDesc}>{t('limits.limit_reached_desc')}</Text>
                            {/* Dolu Bar */}
                            <View style={styles.limitBarBg}>
                                <View style={styles.limitBarFill} />
                            </View>
                        </View>
                    </View>

                    {/* 3. TABLO BAŞLIKLARI */}
                    <View style={styles.tableHeader}>
                        <View style={{ flex: 1.5 }} /> {/* Sol taraf payı arttı */}
                        <Text style={styles.colTitle}>{t('limits.col_free')}</Text>
                        <Text style={[styles.colTitle, styles.colPro]}>{t('limits.col_pro')}</Text>
                    </View>

                    {/* 4. GÜNCELLENMİŞ LİSTE */}
                    <View style={styles.listContainer}>
                        <FeatureRow
                            label={t('limits.feat_scan')}
                            subLabel={t('limits.feat_scan_sub')}
                            freeVal={t('limits.limit_val', { count: 3 })}
                            proCheck={true}
                            delay={100}
                        />
                        <FeatureRow
                            label={t('limits.feat_family')}
                            subLabel={t('limits.feat_family_sub')}
                            freeVal={t('limits.val_family_free')}
                            proCheck={true}
                            delay={200}
                        />
                        <FeatureRow
                            label={t('limits.feat_ai')}
                            subLabel={t('limits.feat_ai_sub')}
                            freeVal={t('limits.limit_val', { count: 5 })}
                            proCheck={true}
                            delay={300}
                        />
                        <FeatureRow
                            label={t('limits.feat_ads')}
                            subLabel={t('limits.feat_ads_sub')}
                            freeVal={false}
                            proCheck={true}
                            delay={400}
                        />
                    </View>

                    {/* AKSİYON BUTONU */}
                    <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
                        <Pressable style={styles.premiumButton} onPress={onGoPremium}>
                            <LinearGradient
                                colors={['#FF8C00', '#EA580C']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBtn}
                            >
                                <Text style={styles.premiumBtnText}>{t('limits.go_pro')} ➔</Text>
                            </LinearGradient>
                        </Pressable>
                    </Animated.View>

                    <Pressable style={styles.restoreBtn}>
                        <Text style={styles.restoreText}>{t('limits.restore')}</Text>
                    </Pressable>

                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.7)', // Koyu Slate overlay
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        width: width * 0.9,
        maxWidth: 400,
        backgroundColor: '#F8FAFC', // Çok açık gri/beyaz
        borderRadius: 32,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 10,
        overflow: 'hidden',
    },
    closeIconBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 0,
        marginTop: 8,
    },
    logoBox: {
        width: 64,
        height: 64,
        borderRadius: 24,
        backgroundColor: '#F59E0B',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.secondary,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.gray[500],
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    colTitle: {
        width: 60,
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '700',
        color: Colors.gray[400],
        letterSpacing: 0.5,
    },
    colPro: {
        color: '#F59E0B',
    },
    listContainer: {
        width: '100%',
        gap: 12,
        marginBottom: 32,
    },
    row: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
        paddingVertical: 12,
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: Colors.gray[50],
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.secondary,
        marginBottom: 2,
    },
    rowRight: {
        flexDirection: 'row',
    },
    colCenter: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    buttonContainer: {
        width: '100%',
    },
    premiumButton: {
        width: '100%',
        borderRadius: 20,
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    gradientBtn: {
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: 20,
    },
    premiumBtnText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    restoreBtn: {
        marginTop: 16,
        padding: 8,
    },
    restoreText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.gray[400],
        letterSpacing: 0.5,
    },
    limitStatusCard: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FECACA',
        marginBottom: 20,
        marginTop: 20,
        gap: 12,
    },
    limitIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    limitInfo: {
        flex: 1,
    },
    limitTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#991B1B',
        marginBottom: 2,
    },
    limitDesc: {
        fontSize: 11,
        color: '#B91C1C',
        marginBottom: 6,
    },
    limitBarBg: {
        height: 6,
        backgroundColor: '#FCA5A5',
        borderRadius: 3,
        width: '100%',
    },
    limitBarFill: {
        width: '100%',
        height: '100%',
        backgroundColor: '#EF4444',
        borderRadius: 3,
    },

    rowSubLabel: {
        fontSize: 10,
        color: Colors.gray[500],
        lineHeight: 14,
        paddingRight: 8,
    },
    rowLeft: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    limitText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.gray[600],
        textAlign: 'center',
    },
});