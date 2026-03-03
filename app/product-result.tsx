import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,
    Dimensions, StatusBar, Modal, Pressable, PanResponder, Animated,
    GestureResponderEvent
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { AppColors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { getDietDefinition } from "../lib/diets";
import { getAllergenDefinition, AllergenType } from "../lib/allergens";
import ScoreRing from "../components/ui/ScoreRing";
import { TempStore } from "../lib/tempStore";
import DetailCards from "../components/product/DetailCards";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { analyzeEngine, CompatibilityReport, SeverityLevel, IngredientInput } from "../lib/analysisEngine";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { saveScanResultToDB } from "../lib/firestore";
import { uploadImage } from "../lib/storageHelper";
import { useAuth } from "../context/AuthContext";
import { incrementScanCount } from "../lib/firestore";
import { useLocalSearchParams } from "expo-router";
import { NutriScoreGraphic } from "../components/ui/NutriScoreAssets";
import { getLifeStageDefinition, LifeStageType } from "../lib/lifestages";
import { showInterstitialAd, isInterstitialReady, loadInterstitialAd } from "../lib/admob";

const { width } = Dimensions.get("window");
const IMAGE_HEIGHT = 280;

interface NutritionFacts {
    data_available: boolean;
    serving_size: string | null;
    carbohydrates: number | null;
    fiber: number | null;
    sugar: number | null;
    protein: number | null;
}

interface KetoAnalysis {
    is_keto_friendly: boolean;
    net_carb_estimate: string;
    reasoning: string;
}

// Sadeleştirilmiş badge config - sadece kritik olanlar
const getBadgeConfig = (colors: AppColors, isDark: boolean): Record<string, { 
    icon: keyof typeof Ionicons.glyphMap; 
    color: string; 
    bg: string;
    labelKey: string;
}> => ({
    EU_BANNED: { icon: "close-circle", color: "#DC2626", bg: isDark ? "rgba(220,38,38,0.12)" : "#FEF2F2", labelKey: "results.badges.eu_banned" },
    FDA_WARN: { icon: "warning", color: "#D97706", bg: isDark ? "rgba(217,119,6,0.12)" : "#FFFBEB", labelKey: "results.badges.fda_warn" },
    HAZARDOUS_ADDITIVE: { icon: "skull", color: "#7C3AED", bg: isDark ? "rgba(124,58,237,0.12)" : "#F3E8FF", labelKey: "results.badges.fda_warn" },
    CONTAINS_ALLERGENS: { icon: "alert-circle", color: "#DC2626", bg: isDark ? "rgba(220,38,38,0.12)" : "#FEF2F2", labelKey: "results.badges.contains_allergens" },
    HIGH_SUGAR: { icon: "flame", color: "#DC2626", bg: isDark ? "rgba(220,38,38,0.12)" : "#FEF2F2", labelKey: "results.badges.high_sugar" },
    HIGH_SODIUM: { icon: "water", color: "#EA580C", bg: isDark ? "rgba(234,88,12,0.12)" : "#FFF7ED", labelKey: "results.badges.high_sodium" },
    HIGH_FAT: { icon: "fast-food", color: "#EA580C", bg: isDark ? "rgba(234,88,12,0.12)" : "#FFF7ED", labelKey: "results.badges.high_fat" },
    NO_ADDITIVES: { icon: "leaf", color: "#16A34A", bg: isDark ? "rgba(22,163,74,0.12)" : "#F0FDF4", labelKey: "results.badges.no_additives" },
    HIGH_PROTEIN: { icon: "barbell", color: "#2563EB", bg: isDark ? "rgba(37,99,235,0.12)" : "#EFF6FF", labelKey: "results.badges.high_protein" },
    SUGAR_FREE: { icon: "heart", color: "#0891B2", bg: isDark ? "rgba(8,145,178,0.12)" : "#ECFEFF", labelKey: "results.badges.sugar_free" },
    WHOLE_GRAIN: { icon: "nutrition", color: "#16A34A", bg: isDark ? "rgba(22,163,74,0.12)" : "#F0FDF4", labelKey: "results.badges.whole_grain" },
    HIGH_FIBER: { icon: "leaf", color: "#16A34A", bg: isDark ? "rgba(22,163,74,0.12)" : "#F0FDF4", labelKey: "results.badges.high_fiber" },
    LOW_FAT: { icon: "heart", color: "#0891B2", bg: isDark ? "rgba(8,145,178,0.12)" : "#ECFEFF", labelKey: "results.badges.low_fat" },
    LOW_SODIUM: { icon: "heart", color: "#0891B2", bg: isDark ? "rgba(8,145,178,0.12)" : "#ECFEFF", labelKey: "results.badges.low_sodium" },
    ORGANIC: { icon: "sparkles", color: "#16A34A", bg: isDark ? "rgba(22,163,74,0.12)" : "#F0FDF4", labelKey: "results.badges.organic" },
    VEGAN: { icon: "leaf", color: "#16A34A", bg: isDark ? "rgba(22,163,74,0.12)" : "#F0FDF4", labelKey: "results.badges.vegan" },
    VEGETARIAN: { icon: "nutrition", color: "#22C55E", bg: isDark ? "rgba(34,197,94,0.12)" : "#F0FDF4", labelKey: "results.badges.vegetarian" },
    GLUTEN_FREE: { icon: "checkmark-circle", color: "#0891B2", bg: isDark ? "rgba(8,145,178,0.12)" : "#ECFEFF", labelKey: "results.badges.gluten_free" },
    LACTOSE_FREE: { icon: "checkmark-circle", color: "#0891B2", bg: isDark ? "rgba(8,145,178,0.12)" : "#ECFEFF", labelKey: "results.badges.lactose_free" },
    DEFAULT: { icon: "information-circle", color: colors.gray[600], bg: colors.gray[100], labelKey: "results.badges.general" }
});

const getScoreColor = (score: number): string => {
    if (score >= 80) return "#10B981";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
};


export default function ProductResultScreen() {
    const { t, i18n } = useTranslation();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
    const badgeConfig = useMemo(() => getBadgeConfig(colors, isDark), [colors, isDark]);
    const isTr = i18n.language === "tr";
    const isEs = i18n.language?.startsWith("es");

    const router = useRouter();
    const { familyMembers, profilesData } = useUser();
    const { user, deviceId, userProfile, isPremium } = useAuth();
    const [showNutriInfo, setShowNutriInfo] = useState(false);

    const hasSaved = useRef(false);
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const isHistoryView = params.viewMode === 'history';

    const tempResult = TempStore.getResult();
    const data = tempResult?.data;
    const imageUri = tempResult?.image || undefined;
    const source = tempResult?.meta?.source as "camera" | "barcode" | "text" | undefined;
    const isBarcodeSource = source === "barcode";

    const [currentData, setCurrentData] = useState<any>(data);
    const [isAdLoading, setIsAdLoading] = useState(true);

    const [selectedMemberReport, setSelectedMemberReport] = useState<{ member: any, report: CompatibilityReport } | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const screenHeight = Dimensions.get('window').height;
    const panY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (showDetailModal) panY.setValue(0);
    }, [showDetailModal]);

    const closeWithAnimation = () => {
        Animated.timing(panY, {
            toValue: screenHeight,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setShowDetailModal(false));
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) panY.setValue(gestureState.dy);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100 || gestureState.vy > 0.6) {
                    closeWithAnimation();
                } else {
                    Animated.spring(panY, {
                        toValue: 0,
                        bounciness: 4,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (showNutriInfo) panY.setValue(0);
    }, [showNutriInfo]);

    const closeNutriWithAnimation = () => {
        Animated.timing(panY, {
            toValue: screenHeight,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setShowNutriInfo(false));
    };

    const nutriPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) panY.setValue(gestureState.dy);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100 || gestureState.vy > 0.6) {
                    closeNutriWithAnimation();
                } else {
                    Animated.spring(panY, {
                        toValue: 0,
                        bounciness: 4,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    if (!data || !currentData) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.gray[400]} />
                <Text style={styles.errorText}>{t("results.errorLoad")}</Text>
                <TouchableOpacity style={styles.backButtonSimple} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>{t("common.back")}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    useEffect(() => {
        if (isHistoryView) {
            setIsAdLoading(false);
            return;
        }
        const handleAd = async () => {
            if (isPremium) {
                setIsAdLoading(false);
                return;
            }
            if (!isInterstitialReady()) {
                try {
                    await loadInterstitialAd();
                } catch (e) {
                    setIsAdLoading(false);
                    return;
                }
            }
            await showInterstitialAd();
            setIsAdLoading(false);
        };
        handleAd();
    }, [isPremium]);

    useEffect(() => {
        if (params.viewMode !== 'history') return;
        if (data?.details) return;
        const productRaw = data?.product || data;
        if (!productRaw) return;
        try {
            const ingredientsInput: IngredientInput[] = (productRaw.ingredients || []).map((ing: any) => ({
                display_name: ing.text || ing.display_name || ing.id || "Bilinmeyen",
                technical_name: ing.technical_name || ing.id || ing.text || "unknown",
                isAllergen: ing.isAllergen || false,
                riskLevel: ing.riskLevel || "unknown"
            }));
            const profileForEngine = userProfile ? {
                diet: (userProfile.dietaryPreferences?.length > 0) ? userProfile.dietaryPreferences[0] : null,
                allergens: userProfile.allergens || []
            } : { diet: null, allergens: [] };
            const report = analyzeEngine(ingredientsInput, profileForEngine as any, data?.scores?.safety?.value || 50, t);
            setCurrentData((prev: any) => ({
                ...prev,
                scores: {
                    ...prev.scores,
                    compatibility: {
                        value: report.score,
                        verdict: report.title,
                        summary: report.summary,
                        details: report.findings
                    }
                },
                badges: prev.badges || []
            }));
        } catch (err) {
            console.error("Analiz hatası:", err);
        }
    }, [params.viewMode, userProfile]);

    useEffect(() => {
        if (params.viewMode === 'history') return;
        if (!user || !data || hasSaved.current) return;
        hasSaved.current = true;
        const saveScan = async () => {
            try {
                await incrementScanCount(user.uid, deviceId);
                let imageUrl = null;
                if (imageUri) {
                    try {
                        const filename = `scans/${user.uid}/${Date.now()}.jpg`;
                        imageUrl = await uploadImage(imageUri, filename);
                    } catch (imgError) {
                        console.error("Image upload failed:", imgError);
                    }
                }
                await saveScanResultToDB(user.uid, {
                    productName: data.product?.product_name || data.product?.name || t("results.unknownProduct"),
                    brand: data.product?.brands || data.product?.brand || t("results.unknownBrand"),
                    imageUrl: imageUrl,
                    score: data.scores?.safety?.value || 0,
                    verdict: data.scores?.compatibility?.verdict || "Analiz Edildi",
                    badges: data.badges || [],
                    miniData: JSON.stringify({
                        product: data.product,
                        details: data.details,
                        scores: data.scores,
                        nutrition_facts: data.nutrition_facts,
                        keto_analysis: data.keto_analysis
                    })
                });
            } catch (error) {
                console.error("CRITICAL SCAN ERROR:", error);
                hasSaved.current = false;
            }
        };
        saveScan();
    }, [user, data, params.viewMode]);

    const handleRescan = () => {
        TempStore.clear();
        router.replace({ pathname: "/", params: { autoStart: "true" } });
    };

    const renderDietScoreCard = () => {
        const SUPPORTED_DIETS = ['KETO', 'LOW_CARB', 'ATKINS', 'DUKAN'];
        const mainUserDiet = profilesData['main_user']?.diet;
        if (!mainUserDiet || !SUPPORTED_DIETS.includes(mainUserDiet)) return null;

        const userDiet = mainUserDiet;
        const ketoData = data?.keto_analysis as KetoAnalysis | undefined;
        const nutritionData = data?.nutrition_facts as NutritionFacts | undefined;
        if (!ketoData) return null;

        let limit = 25;
        if (userDiet === 'KETO') limit = 10;
        else if (userDiet === 'ATKINS') limit = 20;
        else if (userDiet === 'DUKAN') limit = 30;

        let netCarb = 0;
        let isMathAvailable = false;
        if (nutritionData?.data_available && nutritionData.carbohydrates !== null) {
            netCarb = nutritionData.carbohydrates - (nutritionData.fiber || 0);
            isMathAvailable = true;
        }

        let isRisky = false;
        if (isMathAvailable) {
            if (netCarb > limit) isRisky = true;
        } else {
            const estimateKey = ketoData.net_carb_estimate as 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
            if (estimateKey === 'HIGH') isRisky = true;
            else if (estimateKey === 'MEDIUM' && userDiet === 'KETO') isRisky = true;
        }

        const isSafe = !isRisky;
        const accentColor = isSafe ? "#10B981" : "#EF4444";
        const label = userDiet === 'KETO' ? t("results.diet_card.keto_title") : t("results.diet_card.lowcarb_title");

        return (
            <View style={styles.dietCard}>
                <View style={[styles.dietAccent, { backgroundColor: accentColor }]} />
                <View style={styles.dietContent}>
                    <View style={styles.dietHeader}>
                        <Ionicons name={isSafe ? "leaf" : "flame"} size={18} color={accentColor} />
                        <Text style={[styles.dietTitle, { color: colors.text }]}>{label}</Text>
                        <View style={[styles.statusChip, { backgroundColor: accentColor + '18' }]}>
                            <Text style={[styles.statusChipText, { color: accentColor }]}>
                                {isSafe ? t("common.suitable") : t("common.limit_exceeded")}
                            </Text>
                        </View>
                    </View>

                    {(!nutritionData?.data_available) && (
                        <View style={styles.dietMissing}>
                            <Ionicons name="eye-off-outline" size={13} color={isDark ? '#FBBF24' : '#B45309'} />
                            <Text style={[styles.dietMissingText, { color: isDark ? '#FBBF24' : '#B45309' }]}>{t("results.nutrition_data_missing")}</Text>
                        </View>
                    )}

                    {isMathAvailable ? (
                        <View style={styles.macroRow}>
                            <View style={styles.macroItem}>
                                <Text style={styles.macroValue}>{nutritionData?.carbohydrates}g</Text>
                                <Text style={styles.macroLabel}>{t("results.diet_card.carb")}</Text>
                            </View>
                            <Text style={styles.macroOp}>−</Text>
                            <View style={styles.macroItem}>
                                <Text style={styles.macroValue}>{nutritionData?.fiber || 0}g</Text>
                                <Text style={styles.macroLabel}>{t("results.diet_card.fiber")}</Text>
                            </View>
                            <Text style={styles.macroOp}>=</Text>
                            <View style={[styles.macroItemResult, { backgroundColor: accentColor + '12' }]}>
                                <Text style={[styles.macroResultValue, { color: accentColor }]}>
                                    {netCarb.toFixed(1)}g
                                </Text>
                                <Text style={[styles.macroLabel, { color: accentColor }]}>{t("results.diet_card.net")}</Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.dietEstimate}>
                            {t("results.estimated_carb")}: {t(`results.carb_levels.${ketoData.net_carb_estimate}`, { defaultValue: ketoData.net_carb_estimate })}
                        </Text>
                    )}
                    <Text style={styles.dietReason}>{ketoData.reasoning}</Text>
                </View>
            </View>
        );
    };

    const { product, scores } = data;
    const analysisIngredients = data.details?.ingredients || [];
    const criticalBadges = data.badges?.filter((b: string) => 
        ['EU_BANNED', 'FDA_WARN', 'HAZARDOUS_ADDITIVE', 'CONTAINS_ALLERGENS'].includes(b)
    ) || [];

    const familyAnalysis = familyMembers.map(member => {
        const profile = profilesData[member.id];
        const safetyScore = scores.safety?.value || 50;
        const report = analyzeEngine(analysisIngredients, profile, safetyScore, t);
        return { member, report };
    });

    const ownerAnalysis = familyAnalysis.find(f => f.member.id === "main_user") || familyAnalysis[0];
    const displayScore = ownerAnalysis ? ownerAnalysis.report.score : (scores.compatibility?.value || 0);
    const displayVerdict = ownerAnalysis?.report.title || t("results.analysis.status.safe");
    const displaySummary = ownerAnalysis?.report.summary || t("results.analysis.findings.safe_summary");
    const scoreColor = getScoreColor(displayScore);

    const handleMemberPress = (item: { member: any, report: CompatibilityReport }) => {
        setSelectedMemberReport(item);
        setShowDetailModal(true);
    };

    if (isAdLoading && !isPremium) {
        return <View style={{ flex: 1, backgroundColor: colors.surface }} />;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
                {/* Image Header */}
                <View style={styles.imageContainer}>
                    <Image source={imageUri ? { uri: imageUri } : require('../assets/placeholder.png')} style={styles.productImage} resizeMode="cover" />
                    <View style={styles.imageOverlay} />
                    <TouchableOpacity style={[styles.headerBtn, styles.headerBtnLeft]} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={22} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.headerBtn, styles.headerBtnRight]} onPress={handleRescan}>
                        <Ionicons name="scan-outline" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Pull-up Sheet Card */}
                <View style={styles.sheetCard}>
                    <View style={styles.sheetPill} />

                    {/* Product Identity */}
                    <View style={styles.productIdentity}>
                        <Text style={styles.brandLabel}>{product.brand || t("results.unknownBrand")}</Text>
                        <Text style={styles.productTitle}>{product.name || t("results.unknownProduct")}</Text>
                    </View>

                    {/* Badge Pills */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll} contentContainerStyle={styles.badgesList}>
                        {product.isFood ? (
                            <View style={[styles.badge, styles.badgeFood]}>
                                <Ionicons name="leaf" size={11} color={isDark ? '#34D399' : '#059669'} />
                                <Text style={[styles.badgeText, { color: isDark ? '#34D399' : '#059669' }]}>{t("results.badges.food")}</Text>
                            </View>
                        ) : (
                            <View style={[styles.badge, styles.badgeNonFood]}>
                                <Ionicons name="close-circle" size={11} color={isDark ? '#F87171' : '#DC2626'} />
                                <Text style={[styles.badgeText, { color: isDark ? '#F87171' : '#DC2626' }]}>{t("results.badges.notFood")}</Text>
                            </View>
                        )}
                        {data.badges?.slice(0, 6).map((badgeCode: string, index: number) => {
                            const config = badgeConfig[badgeCode] || badgeConfig.DEFAULT;
                            return (
                                <View key={index} style={[styles.badge, { backgroundColor: config.bg }]}>
                                    <Ionicons name={config.icon} size={11} color={config.color} />
                                    <Text style={[styles.badgeText, { color: config.color }]}>
                                        {t(config.labelKey, { defaultValue: badgeCode })}
                                    </Text>
                                </View>
                            );
                        })}
                    </ScrollView>

                    {/* Score Display — two gauge rings */}
                    <View style={styles.scoreZone}>
                        <ScoreRing
                            score={scores.safety?.value || 0}
                            label={isTr ? 'Güvenlik Skoru' : isEs ? 'Seguridad' : 'Safety Score'}
                            size={130}
                            strokeWidth={10}
                            type="safety"
                            arcDegrees={240}
                            showOutOf
                        />
                        <ScoreRing
                            score={displayScore}
                            label={isTr ? 'Uyum Skoru' : isEs ? 'Compatibilidad' : 'Compatibility'}
                            size={130}
                            strokeWidth={10}
                            type="compatibility"
                            arcDegrees={240}
                            showOutOf
                        />
                    </View>

                    {/* Verdict + Summary */}
                    <View style={[styles.summaryCard, { borderLeftColor: scoreColor }]}>
                        <View style={styles.verdictRow}>
                            <View style={[styles.verdictDot, { backgroundColor: scoreColor }]} />
                            <Text style={[styles.verdictTitle, { color: scoreColor }]}>{displayVerdict}</Text>
                        </View>
                        <Text style={styles.summaryText}>{displaySummary}</Text>
                    </View>

                    {/* Nutri-Score Bar */}
                    {data.product?.nutriscore_grade && (
                        <View style={styles.nutriBar}>
                            <NutriScoreGraphic grade={data.product.nutriscore_grade} />
                            <TouchableOpacity onPress={() => setShowNutriInfo(true)} hitSlop={8}>
                                <Ionicons name="information-circle-outline" size={18} color={colors.gray[400]} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Critical Alerts */}
                    {criticalBadges.length > 0 && (
                        <View style={styles.alertBox}>
                            <View style={styles.alertHeader}>
                                <View style={styles.alertIconWrap}>
                                    <Ionicons name="shield" size={14} color="#FFF" />
                                </View>
                                <Text style={styles.alertTitle}>{t("results.critical_warnings")}</Text>
                            </View>
                            {criticalBadges.map((badge: string, idx: number) => (
                                <View key={idx} style={styles.alertItem}>
                                    <View style={styles.alertBullet} />
                                    <Text style={styles.alertText}>{t(`results.badges.${badge.toLowerCase()}_desc`)}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Diet Card */}
                    {renderDietScoreCard()}
                </View>

                {/* Family Compatibility */}
                <View style={styles.familyZone}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionLine} />
                        <Text style={styles.sectionLabel}>{t("results.family.title")}</Text>
                        <View style={styles.sectionLine} />
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.familyList}>
                        {familyAnalysis.map((item) => {
                            const mScore = item.report.score;
                            const mColor = getScoreColor(mScore);
                            return (
                                <Pressable
                                    key={item.member.id}
                                    style={({ pressed }) => [styles.familyChip, pressed && { transform: [{ scale: 0.96 }] }]}
                                    onPress={() => handleMemberPress(item)}
                                >
                                    <View style={[styles.familyAv, { backgroundColor: item.member.color }]}>
                                        <MaterialCommunityIcons name={item.member.avatarIcon as any} size={18} color="#FFF" />
                                    </View>
                                    <View style={styles.familyMeta}>
                                        <Text style={[styles.familyNum, { color: mColor }]}>{mScore}</Text>
                                        <Text style={styles.familyLabel} numberOfLines={1}>{item.member.name}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={14} color={colors.gray[400]} />
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Detailed Analysis */}
                <View style={styles.detailZone}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionLine} />
                        <Text style={styles.sectionLabel}>{t("results.detailedAnalysis")}</Text>
                        <View style={styles.sectionLine} />
                    </View>
                    <DetailCards data={data} />
                </View>

                {/* Disclaimer */}
                <View style={styles.footerNote}>
                    <Ionicons name="information-circle-outline" size={16} color={colors.gray[400]} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.footerNoteTitle}>{t("common.disclaimer.title")}</Text>
                        <Text style={styles.footerNoteText}>{t("common.disclaimer.text")}</Text>
                    </View>
                </View>

                {/* OpenFoodFacts */}
                {isBarcodeSource && (
                    <View style={styles.offNotice}>
                        <View style={styles.offNoticeRow}>
                            <Ionicons name="barcode-outline" size={14} color={colors.gray[500]} />
                            <Text style={styles.offNoticeTitle}>{t("results.openfoodfactsNotice.title")}</Text>
                        </View>
                        <Text style={styles.offNoticeBody}>{t("results.openfoodfactsNotice.body")}</Text>
                        <TouchableOpacity style={styles.offNoticeCta} onPress={() => router.replace({ pathname: "/", params: { autoStart: "true" } })}>
                            <Ionicons name="camera-outline" size={13} color={colors.primary} />
                            <Text style={[styles.offNoticeCtaText, { color: colors.primary }]}>{t("results.openfoodfactsNotice.cta")}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 50 }} />
            </ScrollView>

            {/* Detail Modal */}
            <Modal visible={showDetailModal} transparent animationType="fade" onRequestClose={closeWithAnimation}>
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalDismiss} onPress={closeWithAnimation} />
                    <Animated.View style={[styles.bottomSheet, { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 30 }, { transform: [{ translateY: panY }] }]}>
                        <View style={styles.bottomSheetHandleContainer} {...panResponder.panHandlers}>
                            <View style={styles.bottomSheetHandle} />
                        </View>
                        {selectedMemberReport && (
                            <View style={{ flex: 1 }}>
                                <View style={styles.sheetHeader}>
                                    <View style={styles.sheetHeaderLeft}>
                                        <View style={[styles.modalAvatar, { backgroundColor: selectedMemberReport.member.color }]}>
                                            <MaterialCommunityIcons name={selectedMemberReport.member.avatarIcon as any} size={24} color="#FFF" />
                                        </View>
                                        <View>
                                            <Text style={styles.modalTitle}>{selectedMemberReport.member.name}</Text>
                                            <Text style={[styles.modalSubtitle, { color: selectedMemberReport.report.color }]}>
                                                {selectedMemberReport.report.title}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={[styles.modalScoreBadge, { backgroundColor: selectedMemberReport.report.color }]}>
                                        <Text style={styles.modalScoreText}>{selectedMemberReport.report.score}</Text>
                                    </View>
                                </View>
                                <View style={styles.divider} />
                                <Text style={styles.reasonsTitle}>{t("results.family.reasons")}</Text>
                                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={true}>
                                    {(() => {
                                        const memberId = selectedMemberReport.member.id;
                                        const profile = profilesData[memberId];
                                        const userDiet = profile?.diet;
                                        const userAllergens = profile?.allergens || [];
                                        const dietDef = userDiet ? getDietDefinition(userDiet) : null;
                                        if (!dietDef && userAllergens.length === 0) return null;
                                        return (
                                            <View style={styles.profileSummaryBox}>
                                                <Text style={styles.profileSummaryTitle}>{t("results.family.profile_settings")}</Text>
                                                <View style={styles.tagsContainer}>
                                                    {(() => {
                                                        const lifeStage = profile?.lifeStage;
                                                        if (!lifeStage || lifeStage === 'ADULT') return null;
                                                        const lifeStageDef = getLifeStageDefinition(lifeStage as LifeStageType);
                                                        if (!lifeStageDef) return null;
                                                        const isVulnerable = ['INFANT_0_6', 'INFANT_6_12', 'TODDLER_1_3', 'PREGNANT', 'BREASTFEEDING'].includes(lifeStage);
                                                        const bgColor = isVulnerable ? (isDark ? "rgba(245,158,11,0.15)" : '#FEF3C7') : (isDark ? "rgba(22,163,74,0.15)" : '#F0FDF4');
                                                        const textColor = isVulnerable ? '#B45309' : '#15803D';
                                                        const iconName = lifeStage.includes('INFANT') || lifeStage.includes('TODDLER') ? 'nutrition-outline' : (lifeStage === 'PREGNANT' ? 'heart' : 'person');
                                                        return (
                                                            <View style={[styles.infoChip, { backgroundColor: bgColor }]}>
                                                                <Ionicons name={iconName as any} size={14} color={textColor} />
                                                                <Text style={[styles.infoChipText, { color: textColor }]}>
                                                                    {isTr ? lifeStageDef.nameTr : isEs ? lifeStageDef.nameEs : lifeStageDef.name}
                                                                </Text>
                                                            </View>
                                                        );
                                                    })()}
                                                    {dietDef && (
                                                        <View style={[styles.infoChip, { backgroundColor: isDark ? "rgba(37,99,235,0.15)" : '#EFF6FF' }]}>
                                                            <Ionicons name="restaurant" size={14} color="#2563EB" />
                                                            <Text style={[styles.infoChipText, { color: isDark ? '#93C5FD' : '#1E40AF' }]}>
                                                                {isTr ? dietDef.nameTr : isEs ? dietDef.nameEs : dietDef.name}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    {userAllergens.map((alg: string) => {
                                                        const algDef = getAllergenDefinition(alg as AllergenType);
                                                        if (!algDef) return null;
                                                        return (
                                                            <View key={alg} style={[styles.infoChip, { backgroundColor: isDark ? "rgba(220,38,38,0.15)" : '#FEF2F2' }]}>
                                                                <Ionicons name="hand-left" size={14} color="#DC2626" />
                                                                <Text style={[styles.infoChipText, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
                                                                    {isTr ? algDef.nameTr : isEs ? algDef.nameEs : algDef.name}
                                                                </Text>
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            </View>
                                        );
                                    })()}
                                    {selectedMemberReport.report.findings.length === 0 ? (
                                        <View style={styles.emptyStateBox}>
                                            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                                            <Text style={styles.emptyStateText}>{selectedMemberReport.report.summary}</Text>
                                        </View>
                                    ) : (
                                        selectedMemberReport.report.findings.map((finding, index) => {
                                            const isHighSeverity = finding.severity === 'forbidden' || finding.severity === 'restricted';
                                            return (
                                                <View key={index} style={[styles.findingCard, { borderLeftColor: isHighSeverity ? "#EF4444" : "#F59E0B", borderLeftWidth: 3 }]}>
                                                    <Ionicons name={isHighSeverity ? "close-circle" : "alert-circle"} size={18} color={isHighSeverity ? "#EF4444" : "#F59E0B"} />
                                                    <Text style={[styles.findingText, { color: isHighSeverity ? (isDark ? '#FCA5A5' : '#B91C1C') : (isDark ? '#FDBA74' : '#9A3412') }]}>
                                                        {finding.message}
                                                    </Text>
                                                </View>
                                            );
                                        })
                                    )}
                                </ScrollView>
                            </View>
                        )}
                    </Animated.View>
                </View>
            </Modal>

            {/* Nutri Info Modal */}
            <Modal visible={showNutriInfo} transparent animationType="fade" onRequestClose={closeNutriWithAnimation}>
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalDismiss} onPress={closeNutriWithAnimation} />
                    <Animated.View style={[styles.bottomSheet, { height: 'auto' }, { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 30 }, { transform: [{ translateY: panY }] }]}>
                        <View style={styles.bottomSheetHandleContainer} {...nutriPanResponder.panHandlers}>
                            <View style={styles.bottomSheetHandle} />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <Ionicons name="information-circle" size={28} color={colors.primary} />
                            <Text style={styles.modalTitle}>{t("results.nutriscore.what_is_title")}</Text>
                        </View>
                        <Text style={[styles.modalSubtitle, { fontWeight: '400', lineHeight: 22, color: colors.gray[600] }]}>
                            {t("results.nutriscore.what_is_desc")}
                        </Text>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const createStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
    // ── Base ──
    container: { flex: 1, backgroundColor: colors.surface },
    errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    errorText: { fontSize: 16, color: colors.gray[500], fontWeight: '600' },
    backButtonSimple: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.primary, borderRadius: 10 },
    backButtonText: { color: '#FFF', fontWeight: '700' },
    scrollContent: { paddingBottom: 0 },

    // ── Image Header ──
    imageContainer: { height: IMAGE_HEIGHT, position: 'relative' },
    productImage: { width: '100%', height: '100%' },
    imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
    headerBtn: {
        position: 'absolute', top: 52, width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
    },
    headerBtnLeft: { left: 20 },
    headerBtnRight: { right: 20 },

    // ── Pull-up Sheet ──
    sheetCard: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        marginTop: -32,
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28,
        ...(isDark ? { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' } : {
            shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06, shadowRadius: 20, elevation: 12,
        }),
    },
    sheetPill: {
        width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20,
        backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
    },

    // ── Product Identity ──
    productIdentity: { alignItems: 'center', marginBottom: 16 },
    brandLabel: {
        fontSize: 12, fontWeight: '600', color: colors.gray[400],
        textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6,
    },
    productTitle: {
        fontSize: 24, fontWeight: '800', color: colors.text,
        textAlign: 'center', lineHeight: 30, letterSpacing: -0.3,
    },

    // ── Badge Pills ──
    badgesScroll: { marginHorizontal: -20, marginBottom: 16 },
    badgesList: { paddingHorizontal: 20, gap: 6 },
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    },
    badgeFood: { backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5' },
    badgeNonFood: { backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2' },
    badgeText: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.2 },

    // ── Score Zone (two gauge rings) ──
    scoreZone: {
        flexDirection: 'row' as const,
        justifyContent: 'space-around' as const,
        alignItems: 'flex-start' as const,
        paddingVertical: 14,
        marginBottom: 16,
        borderTopWidth: 1, borderBottomWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    },

    // ── Verdict + Summary Card ──
    summaryCard: {
        borderLeftWidth: 3, borderRadius: 14, padding: 16, marginBottom: 16,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.gray[50],
    },
    verdictRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, marginBottom: 8 },
    verdictDot: { width: 8, height: 8, borderRadius: 4 },
    verdictTitle: { fontSize: 15, fontWeight: '800' as const, letterSpacing: -0.2 },
    summaryText: { fontSize: 14, lineHeight: 22, color: colors.gray[500], paddingLeft: 16 },

    // ── Nutri-Score ──
    nutriBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 14, paddingHorizontal: 16, marginBottom: 16,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.gray[50],
        borderRadius: 14,
    },


    // ── Alert Box ──
    alertBox: {
        borderRadius: 14, padding: 16, marginBottom: 16,
        backgroundColor: isDark ? 'rgba(239,68,68,0.08)' : '#FEF2F2',
    },
    alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    alertIconWrap: {
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
    },
    alertTitle: {
        fontSize: 13, fontWeight: '800', color: isDark ? '#FCA5A5' : '#B91C1C',
        textTransform: 'uppercase', letterSpacing: 0.5,
    },
    alertItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
    alertBullet: {
        width: 5, height: 5, borderRadius: 2.5, marginTop: 7,
        backgroundColor: isDark ? '#FCA5A5' : '#EF4444',
    },
    alertText: { fontSize: 13, lineHeight: 20, color: isDark ? '#FCA5A5' : '#7F1D1D', flex: 1 },

    // ── Diet Card ──
    dietCard: {
        flexDirection: 'row', borderRadius: 14, overflow: 'hidden', marginBottom: 16,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.gray[50],
    },
    dietAccent: { width: 4 },
    dietContent: { flex: 1, padding: 16 },
    dietHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    dietTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
    statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusChipText: { fontSize: 11, fontWeight: '700' },
    dietMissing: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12,
        paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8,
        backgroundColor: isDark ? 'rgba(251,191,36,0.08)' : '#FFFBEB',
    },
    dietMissingText: { fontSize: 12, flex: 1 },
    macroRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    macroItem: { alignItems: 'center' },
    macroValue: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
    macroLabel: { fontSize: 10, fontWeight: '600', color: colors.gray[400], marginTop: 2, textTransform: 'uppercase' },
    macroOp: { fontSize: 18, fontWeight: '300', color: colors.gray[400] },
    macroItemResult: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    macroResultValue: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
    dietEstimate: { fontSize: 13, color: colors.gray[500], marginBottom: 12 },
    dietReason: { fontSize: 13, lineHeight: 20, color: colors.gray[500] },

    // ── Section Headers ──
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 24, marginBottom: 16,
    },
    sectionLine: { flex: 1, height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
    sectionLabel: {
        fontSize: 13, fontWeight: '700', color: colors.gray[400],
        textTransform: 'uppercase', letterSpacing: 1.2,
    },

    // ── Family ──
    familyZone: { marginTop: 16 },
    familyList: { paddingHorizontal: 20, paddingVertical: 6, gap: 10 },
    familyChip: {
        backgroundColor: colors.card, borderRadius: 16,
        paddingVertical: 12, paddingHorizontal: 14,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        ...(isDark ? { borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' } : {
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04, shadowRadius: 8, elevation: 3,
        }),
    },
    familyAv: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    familyMeta: { flexDirection: 'column' },
    familyNum: { fontSize: 20, fontWeight: '900', letterSpacing: -1, lineHeight: 22 },
    familyLabel: { fontSize: 12, fontWeight: '500', color: colors.gray[500], marginTop: 1 },

    // ── Detail Section ──
    detailZone: { marginTop: 16 },

    // ── Footer Notes ──
    footerNote: {
        flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 16,
        padding: 14, borderRadius: 14,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.gray[50],
    },
    footerNoteTitle: { fontSize: 12, fontWeight: '700', color: colors.gray[400], marginBottom: 3 },
    footerNoteText: { fontSize: 11, lineHeight: 17, color: colors.gray[400] },

    // ── OFF Notice ──
    offNotice: {
        marginHorizontal: 20, marginTop: 16, padding: 14, borderRadius: 14,
        backgroundColor: isDark ? 'rgba(59,130,246,0.06)' : '#EFF6FF',
    },
    offNoticeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    offNoticeTitle: { fontSize: 12, fontWeight: '700', color: isDark ? '#93C5FD' : '#1E40AF' },
    offNoticeBody: { fontSize: 12, lineHeight: 18, color: colors.gray[500], marginBottom: 10 },
    offNoticeCta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    offNoticeCtaText: { fontSize: 12, fontWeight: '700' },

    // ── Modals ──
    modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    modalDismiss: { flex: 1 },
    bottomSheet: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingHorizontal: 20, paddingTop: 12, height: '70%', maxHeight: '85%',
    },
    bottomSheetHandleContainer: { alignItems: 'center', paddingVertical: 8, marginBottom: 8 },
    bottomSheetHandle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
    },
    sheetHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
    },
    sheetHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    modalAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
    modalSubtitle: { fontSize: 14, fontWeight: '600', marginTop: 2 },
    modalScoreBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    modalScoreText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    divider: { height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', marginVertical: 12 },
    reasonsTitle: {
        fontSize: 12, fontWeight: '700', color: colors.gray[400],
        textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
    },
    profileSummaryBox: {
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.gray[50],
        borderRadius: 14, padding: 14, marginBottom: 16,
    },
    profileSummaryTitle: { fontSize: 11, fontWeight: '700', color: colors.gray[400], marginBottom: 10 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    infoChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    },
    infoChipText: { fontSize: 12, fontWeight: '600' },
    emptyStateBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
    emptyStateText: { fontSize: 15, fontWeight: '600', color: colors.gray[500], textAlign: 'center' },
    findingCard: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.gray[50],
        padding: 14, borderRadius: 14, marginBottom: 8,
    },
    findingText: { fontSize: 14, lineHeight: 22, flex: 1 },
});
