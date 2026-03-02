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
            <View style={[styles.sectionCard, { borderLeftColor: accentColor, borderLeftWidth: 3 }]}>
                <View style={styles.sectionCardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[styles.iconCircle, { backgroundColor: accentColor + '15' }]}>
                            <Ionicons name={isSafe ? "leaf" : "flame"} size={16} color={accentColor} />
                        </View>
                        <Text style={[styles.sectionCardTitle, { color: colors.text }]}>{label}</Text>
                    </View>
                    <View style={[styles.pillBadge, { backgroundColor: isSafe ? "#DCFCE7" : "#FEE2E2" }]}>
                        <Text style={[styles.pillText, { color: isSafe ? "#166534" : "#991B1B" }]}>
                            {isSafe ? t("common.suitable") : t("common.limit_exceeded")}
                        </Text>
                    </View>
                </View>
                
                {(!nutritionData?.data_available) && (
                    <View style={styles.warningRow}>
                        <Ionicons name="eye-off" size={14} color="#B45309" />
                        <Text style={styles.warningText}>{t("results.nutrition_data_missing")}</Text>
                    </View>
                )}

                {isMathAvailable ? (
                    <View style={styles.macroRow}>
                        <View style={styles.macroItem}>
                            <Text style={styles.macroLabel}>{t("results.diet_card.carb")}</Text>
                            <Text style={styles.macroValue}>{nutritionData?.carbohydrates}g</Text>
                        </View>
                        <Text style={styles.macroOperator}>-</Text>
                        <View style={styles.macroItem}>
                            <Text style={styles.macroLabel}>{t("results.diet_card.fiber")}</Text>
                            <Text style={styles.macroValue}>{nutritionData?.fiber || 0}g</Text>
                        </View>
                        <Text style={styles.macroOperator}>=</Text>
                        <View style={[styles.macroItem, styles.macroResult, { borderColor: accentColor + '40' }]}>
                            <Text style={[styles.macroLabel, { color: accentColor }]}>{t("results.diet_card.net")}</Text>
                            <Text style={[styles.macroValue, { color: accentColor, fontWeight: '800' }]}>
                                {netCarb.toFixed(1)}g
                            </Text>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.estimateText}>
                        {t("results.estimated_carb")}: {t(`results.carb_levels.${ketoData.net_carb_estimate}`, { defaultValue: ketoData.net_carb_estimate })}
                    </Text>
                )}
                <Text style={styles.reasonText}>{ketoData.reasoning}</Text>
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
                    <View style={styles.imageGradient} />
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.backButton, { right: 20, left: undefined }]} onPress={handleRescan}>
                        <Ionicons name="scan" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Main Content Card */}
                <View style={styles.contentCard}>
                    <View style={styles.dragHandle} />
                    
                    {/* Product Info - Centered */}
                    <View style={[styles.productHeader, { alignItems: 'center' }]}>
                        <Text style={[styles.brandText, { textAlign: 'center' }]}>{product.brand || t("results.unknownBrand")}</Text>
                        <Text style={[styles.productName, { textAlign: 'center' }]}>{product.name || t("results.unknownProduct")}</Text>
                    </View>

                    {/* Badges - Centered */}
                    <View style={[styles.badgesContainer, { justifyContent: 'center' }]}>
                        {product.isFood ? (
                            <View style={[styles.badge, { backgroundColor: isDark ? "rgba(16,185,129,0.12)" : "#F0FDF4" }]}>
                                <Ionicons name="nutrition" size={12} color="#10B981" />
                                <Text style={[styles.badgeText, { color: "#15803D" }]}>{t("results.badges.food")}</Text>
                            </View>
                        ) : (
                            <View style={[styles.badge, { backgroundColor: isDark ? "rgba(239,68,68,0.12)" : "#FEF2F2" }]}>
                                <Ionicons name="close-circle" size={12} color="#EF4444" />
                                <Text style={[styles.badgeText, { color: "#B91C1C" }]}>{t("results.badges.notFood")}</Text>
                            </View>
                        )}
                        {data.badges?.slice(0, 4).map((badgeCode: string, index: number) => {
                            const config = badgeConfig[badgeCode] || badgeConfig.DEFAULT;
                            return (
                                <View key={index} style={[styles.badge, { backgroundColor: config.bg }]}>
                                    <Ionicons name={config.icon} size={12} color={config.color} />
                                    <Text style={[styles.badgeText, { color: config.color }]}>
                                        {t(config.labelKey, { defaultValue: badgeCode })}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Scores - Centered */}
                    <View style={[styles.scoresRow, { justifyContent: 'center', gap: 40 }]}>
                        <ScoreRing score={scores.safety?.value || 0} label={t("results.scores.safety")} type="safety" />
                        <ScoreRing score={displayScore} label={t("results.scores.compatibility")} type="compatibility" />
                    </View>

                    {/* Nutri-Score */}
                    {data.product?.nutriscore_grade && (
                        <View style={styles.nutriRow}>
                            <NutriScoreGraphic grade={data.product.nutriscore_grade} />
                            <TouchableOpacity onPress={() => setShowNutriInfo(true)} style={styles.nutriInfo}>
                                <Ionicons name="information-circle-outline" size={18} color={colors.gray[400]} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Verdict Card - Left Border Accent */}
                    <View style={[styles.verdictCard, { borderLeftColor: scoreColor }]}>
                        <View style={styles.verdictHeader}>
                            <View style={[styles.verdictIcon, { backgroundColor: scoreColor + '15' }]}>
                                <Ionicons name={displayScore >= 80 ? "checkmark" : "alert"} size={18} color={scoreColor} />
                            </View>
                            <Text style={[styles.verdictTitle, { color: scoreColor }]}>{displayVerdict}</Text>
                        </View>
                        <Text style={styles.verdictText}>{displaySummary}</Text>
                    </View>

                    {/* Critical Warnings - Left Border Accent */}
                    {criticalBadges.length > 0 && (
                        <View style={[styles.warningCard, { borderLeftColor: "#EF4444" }]}>
                            <View style={styles.warningHeader}>
                                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                                <Text style={styles.warningTitle}>{t("results.critical_warnings")}</Text>
                            </View>
                            {criticalBadges.map((badge: string, idx: number) => (
                                <View key={idx} style={styles.warningItem}>
                                    <Ionicons name="warning" size={14} color="#EF4444" style={{ marginTop: 3 }} />
                                    <Text style={styles.warningItemText}>{t(`results.badges.${badge.toLowerCase()}_desc`)}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Diet Card */}
                    {renderDietScoreCard()}
                </View>

                {/* Family Section */}
                <View style={styles.familySection}>
                    <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>{t("results.family.title")}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.familyScroll}>
                        {familyAnalysis.map((item) => {
                            const mScore = item.report.score;
                            const ringColor = getScoreColor(mScore);
                            return (
                                <Pressable 
                                    key={item.member.id} 
                                    style={({ pressed }) => [
                                        styles.familyCard, 
                                        pressed && styles.familyCardPressed
                                    ]} 
                                    onPress={() => handleMemberPress(item)}
                                >
                                    <View style={[styles.familyAvatar, { backgroundColor: item.member.color }]}>
                                        <MaterialCommunityIcons name={item.member.avatarIcon as any} size={20} color="#FFF" />
                                    </View>
                                    <View style={styles.familyInfo}>
                                        <Text style={[styles.familyScore, { color: ringColor }]}>{mScore}</Text>
                                        <Text style={styles.familyName} numberOfLines={1}>{item.member.name}</Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Details Section */}
                <View style={styles.detailsSection}>
                    <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>{t("results.detailedAnalysis")}</Text>
                    <DetailCards data={data} />
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimerCard}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.gray[400]} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.disclaimerTitle}>{t("common.disclaimer.title")}</Text>
                        <Text style={styles.disclaimerText}>{t("common.disclaimer.text")}</Text>
                    </View>
                </View>

                {/* OpenFoodFacts Notice */}
                {isBarcodeSource && (
                    <View style={styles.offCard}>
                        <View style={styles.offHeader}>
                            <Ionicons name="barcode-outline" size={16} color={colors.gray[500]} />
                            <Text style={styles.offTitle}>{t("results.openfoodfactsNotice.title")}</Text>
                        </View>
                        <Text style={styles.offText}>{t("results.openfoodfactsNotice.body")}</Text>
                        <TouchableOpacity style={styles.offButton} onPress={() => router.replace({ pathname: "/", params: { autoStart: "true" } })}>
                            <Ionicons name="camera-outline" size={14} color={colors.primary} />
                            <Text style={styles.offButtonText}>{t("results.openfoodfactsNotice.cta")}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
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
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        color: colors.gray[500],
        fontWeight: '600',
    },
    backButtonSimple: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: colors.primary,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#FFF',
        fontWeight: '700',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    imageContainer: {
        height: IMAGE_HEIGHT,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentCard: {
        backgroundColor: colors.card,
        borderRadius: 24,
        marginTop: -40,
        marginHorizontal: 16,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        ...(!isDark && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 8,
        }),
    },
    dragHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
        alignSelf: 'center',
        marginBottom: 16,
    },
    productHeader: {
        marginBottom: 12,
    },
    brandText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.gray[500],
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    productName: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.text,
        lineHeight: 28,
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 20,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    scoresRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    scoreDivider: {
        width: 1,
        height: 60,
        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    },
    nutriRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: 12,
    },
    nutriInfo: {
        padding: 4,
    },
    verdictCard: {
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 3,
    },
    verdictHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    verdictIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verdictTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    verdictText: {
        fontSize: 13,
        lineHeight: 20,
        color: colors.gray[600],
    },
    warningCard: {
        backgroundColor: isDark ? 'rgba(239,68,68,0.06)' : '#FEF2F2',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 3,
    },
    warningHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    warningTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#EF4444',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    warningItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 6,
    },
    warningItemText: {
        fontSize: 13,
        lineHeight: 18,
        color: isDark ? '#FCA5A5' : '#7F1D1D',
        flex: 1,
        marginTop: -1,
    },
    sectionCard: {
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    sectionCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionCardTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    pillBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pillText: {
        fontSize: 11,
        fontWeight: '700',
    },
    warningRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        marginBottom: 12,
        backgroundColor: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(254,243,199,0.5)',
        padding: 10,
        borderRadius: 8,
    },
    warningText: {
        fontSize: 12,
        color: '#B45309',
        flex: 1,
        lineHeight: 18,
    },
    macroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    macroItem: {
        alignItems: 'center',
    },
    macroLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.gray[500],
        marginBottom: 2,
    },
    macroValue: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
    },
    macroOperator: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.gray[400],
    },
    macroResult: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    estimateText: {
        fontSize: 13,
        color: colors.gray[600],
        marginBottom: 12,
    },
    reasonText: {
        fontSize: 13,
        lineHeight: 20,
        color: colors.gray[600],
    },
    familySection: {
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.text,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    familyScroll: {
        paddingHorizontal: 20,
        gap: 10,
    },
    familyCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1.5,
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    },
    familyCardPressed: {
        borderColor: colors.primary,
    },
    familyAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    familyInfo: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    familyScore: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
        lineHeight: 24,
    },
    familyName: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.gray[500],
        marginTop: 1,
    },
    detailsSection: {
        marginTop: 32,
    },
    disclaimerCard: {
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 20,
        marginTop: 32,
        padding: 16,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: 12,
    },
    disclaimerTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.gray[500],
        marginBottom: 4,
    },
    disclaimerText: {
        fontSize: 12,
        lineHeight: 18,
        color: colors.gray[500],
    },
    offCard: {
        marginHorizontal: 20,
        marginTop: 32,
        padding: 16,
        backgroundColor: isDark ? 'rgba(59,130,246,0.06)' : '#EFF6FF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(59,130,246,0.15)' : '#BFDBFE',
    },
    offHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    offTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: isDark ? '#93C5FD' : '#1E40AF',
    },
    offText: {
        fontSize: 13,
        lineHeight: 20,
        color: colors.gray[600],
        marginBottom: 12,
    },
    offButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
    },
    offButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.primary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    modalDismiss: {
        flex: 1,
    },
    bottomSheet: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        height: '70%',
        maxHeight: '85%',
    },
    bottomSheetHandleContainer: {
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 8,
    },
    bottomSheetHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sheetHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.text,
    },
    modalSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    modalScoreBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalScoreText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        marginVertical: 12,
    },
    reasonsTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.gray[500],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    profileSummaryBox: {
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
    },
    profileSummaryTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.gray[500],
        marginBottom: 10,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    infoChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    infoChipText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyStateBox: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    emptyStateText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.gray[500],
        textAlign: 'center',
    },
    findingCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
    },
    findingText: {
        fontSize: 14,
        lineHeight: 22,
        flex: 1,
    },
});
