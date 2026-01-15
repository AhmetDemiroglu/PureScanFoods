import React, { useState, useRef, useEffect } from "react";
import {
    View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,
    Dimensions, StatusBar, Modal, Pressable, PanResponder
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import ScoreRing from "../components/ui/ScoreRing";
import { LinearGradient } from "expo-linear-gradient";
import { TempStore } from "../lib/tempStore";
import DetailCards from "../components/product/DetailCards";
import { useUser } from "../context/UserContext";
import { analyzeEngine, CompatibilityReport, SeverityLevel, IngredientInput } from "../lib/analysisEngine";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { saveScanResultToDB } from "../lib/firestore";
import { uploadImage } from "../lib/storageHelper";
import { useAuth } from "../context/AuthContext";
import { incrementScanCount } from "../lib/firestore";
import { useLocalSearchParams } from "expo-router";

const { width } = Dimensions.get("window");
const IMAGE_HEIGHT = 320;

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

const BADGE_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; labelKey: string }> = {
    EU_BANNED: { icon: "ban", color: "#DC2626", bg: "#FEF2F2", labelKey: "results.badges.eu_banned" },
    FDA_WARN: { icon: "warning", color: "#D97706", bg: "#FFFBEB", labelKey: "results.badges.fda_warn" },
    HIGH_SUGAR: { icon: "alert-circle", color: "#DC2626", bg: "#FEF2F2", labelKey: "results.badges.high_sugar" },
    HIGH_SODIUM: { icon: "alert-circle", color: "#EA580C", bg: "#FFF7ED", labelKey: "results.badges.high_sodium" },
    HIGH_FAT: { icon: "alert-circle", color: "#EA580C", bg: "#FFF7ED", labelKey: "results.badges.high_fat" },
    CONTAINS_ALLERGENS: { icon: "warning", color: "#DC2626", bg: "#FEF2F2", labelKey: "results.badges.contains_allergens" },
    NO_ADDITIVES: { icon: "leaf", color: "#16A34A", bg: "#F0FDF4", labelKey: "results.badges.no_additives" },
    HIGH_PROTEIN: { icon: "barbell", color: "#2563EB", bg: "#EFF6FF", labelKey: "results.badges.high_protein" },
    SUGAR_FREE: { icon: "water", color: "#0891B2", bg: "#ECFEFF", labelKey: "results.badges.sugar_free" },
    WHOLE_GRAIN: { icon: "nutrition", color: "#16A34A", bg: "#F0FDF4", labelKey: "results.badges.whole_grain" },
    HIGH_FIBER: { icon: "leaf", color: "#16A34A", bg: "#F0FDF4", labelKey: "results.badges.high_fiber" },
    LOW_FAT: { icon: "heart", color: "#0891B2", bg: "#ECFEFF", labelKey: "results.badges.low_fat" },
    LOW_SODIUM: { icon: "heart", color: "#0891B2", bg: "#ECFEFF", labelKey: "results.badges.low_sodium" },
    ORGANIC: { icon: "leaf", color: "#16A34A", bg: "#F0FDF4", labelKey: "results.badges.organic" },
    VEGAN: { icon: "leaf", color: "#16A34A", bg: "#F0FDF4", labelKey: "results.badges.vegan" },
    VEGETARIAN: { icon: "leaf", color: "#22C55E", bg: "#F0FDF4", labelKey: "results.badges.vegetarian" },
    GLUTEN_FREE: { icon: "checkmark-circle", color: "#0891B2", bg: "#ECFEFF", labelKey: "results.badges.gluten_free" },
    LACTOSE_FREE: { icon: "checkmark-circle", color: "#0891B2", bg: "#ECFEFF", labelKey: "results.badges.lactose_free" },
    DEFAULT: { icon: "information-circle", color: Colors.gray[600], bg: Colors.gray[100], labelKey: "results.badges.general" }
};

const getScoreColor = (score: number): string => {
    if (score >= 80) return "#22C55E";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
};

const getScoreStyles = (score: number) => ({
    bg: score >= 80 ? '#F0FDF4' : (score >= 50 ? '#FFF7ED' : '#FEF2F2'),
    border: score >= 80 ? '#BBF7D0' : (score >= 50 ? '#FED7AA' : '#FECACA'),
    text: score >= 80 ? '#15803D' : (score >= 50 ? '#9A3412' : '#B91C1C'),
});

export default function ProductResultScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const { familyMembers, profilesData } = useUser();
    const { user, deviceId, refreshLimits, userProfile } = useAuth();

    const hasSaved = useRef(false);
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();

    const tempResult = TempStore.getResult();
    const data = tempResult?.data;
    const imageUri = tempResult?.image || undefined;

    const [currentData, setCurrentData] = useState<any>(data);

    const [selectedMemberReport, setSelectedMemberReport] = useState<{ member: any, report: CompatibilityReport } | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 50) setShowDetailModal(false);
            },
        })
    ).current;

    if (!data || !currentData) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.gray[400]} />
                <Text style={styles.errorText}>{t("results.errorLoad")}</Text>
                <TouchableOpacity style={styles.backButtonSimple} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>{t("common.back")}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    useEffect(() => {
        const processScan = async () => {
            if (params.viewMode === 'history') {
                const productRaw = data?.product || data;

                if (data?.details) {
                    return;
                }

                if (productRaw) {
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

                        const report = analyzeEngine(
                            ingredientsInput,
                            profileForEngine as any,
                            data?.scores?.safety?.value || 50,
                            t
                        );

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

                        console.log("✅ Analiz tamamlandı. Puan:", report.score);

                    } catch (err) {
                        console.error("Analiz hatası:", err);
                    }
                }
                return;
            }

            if (!user || !data || hasSaved.current) {
                console.log("🚫 Scan process skipped (User missing, Data missing, or Already Saved)");
                return;
            }

            hasSaved.current = true;
            console.log("🚀 Starting Scan Process...");

            try {
                console.log(`⏳ Incrementing scan count...`);
                await incrementScanCount(user.uid, deviceId);
                refreshLimits();

                let imageUrl = null;
                if (imageUri) {
                    try {
                        const filename = `scans/${user.uid}/${Date.now()}.jpg`;
                        imageUrl = await uploadImage(imageUri, filename);
                    } catch (imgError) {
                        console.error("⚠️ Image upload failed:", imgError);
                    }
                }

                console.log("⏳ Saving to Firestore...");
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
                console.log("🎉 Scan saved successfully!");

            } catch (error) {
                console.error("❌ CRITICAL SCAN ERROR:", error);
            }
        };

        processScan();
    }, [user, userProfile, params.viewMode]);

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

        if (userDiet === 'KETO') {
            limit = 10;
        } else if (userDiet === 'ATKINS') {
            limit = 20;
        } else if (userDiet === 'DUKAN') {
            limit = 30;
        }

        let netCarb = 0;
        let isMathAvailable = false;

        if (nutritionData?.data_available && nutritionData.carbohydrates !== null) {
            netCarb = nutritionData.carbohydrates - (nutritionData.fiber || 0);
            isMathAvailable = true;
        }

        let isRisky = false;
        let adviceText = "";

        if (isMathAvailable) {
            if (userDiet === 'KETO') {
                if (netCarb > limit) {
                    isRisky = true;
                    adviceText = t("results.analysis.findings.keto_advice_strict");
                } else if (netCarb > limit / 2) {
                    isRisky = false;
                    adviceText = t("results.analysis.findings.keto_advice_moderate");
                } else {
                    adviceText = ketoData.reasoning;
                }
            } else {
                if (netCarb > limit) {
                    isRisky = true;
                    adviceText = t("results.analysis.findings.lowcarb_advice_high");
                } else {
                    isRisky = false;
                    adviceText = t("results.analysis.findings.lowcarb_advice_ok");
                }
            }

        } else {
            const estimateKey = ketoData.net_carb_estimate as 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

            if (estimateKey === 'HIGH') {
                isRisky = true;
            }
            else if (estimateKey === 'MEDIUM' && userDiet === 'KETO') {
                isRisky = true;
            } else {
                isRisky = false;
            }

            adviceText = ketoData.reasoning;
        }

        const isSafe = !isRisky;

        const bg = isSafe ? '#F0FDF4' : '#FEF2F2';
        const border = isSafe ? '#BBF7D0' : '#FECACA';
        const text = isSafe ? '#15803D' : '#B91C1C';
        const label = userDiet === 'KETO' ? "KETO KARNESİ" : "LOW CARB ANALİZİ";

        return (
            <View style={[styles.dietCard, { backgroundColor: bg, borderColor: border }]}>

                {/* Üst Kısım: Başlık ve İkon */}
                <View style={styles.dietCardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name={isSafe ? "leaf" : "flame"} size={18} color={text} />
                        <Text style={[styles.dietCardTitle, { color: text }]}>{label}</Text>
                    </View>
                    {/* Sağ Üst Köşe: Durum Rozeti */}
                    <View style={[styles.statusBadge, { backgroundColor: isSafe ? '#DCFCE7' : '#FEE2E2' }]}>
                        <Text style={[styles.statusText, { color: text }]}>
                            {isSafe ? t("common.suitable", "UYGUN") : t("common.limit_exceeded", "LİMİT AŞIMI")}
                        </Text>
                    </View>
                </View>

                {/* --- BESİN DEĞERİ OKUNAMADI --- */}
                {(!nutritionData?.data_available) && (
                    <View style={{
                        flexDirection: 'row',
                        gap: 6,
                        marginBottom: 10,
                        backgroundColor: 'rgba(255,255,0,0.15)',
                        padding: 8,
                        borderRadius: 6
                    }}>
                        <Ionicons name="eye-off" size={14} color="#B45309" />
                        <Text style={{ fontSize: 11, color: "#B45309", flex: 1, fontWeight: '500' }}>
                            {t("results.nutrition_data_missing")}
                        </Text>
                    </View>
                )}

                {/* Orta Kısım: Kompakt Veri Paneli */}
                {isMathAvailable ? (
                    <View style={styles.dietStatsRow}>
                        {/* Karb */}
                        <View style={styles.statCompact}>
                            <Text style={styles.statLabel}>Karb</Text>
                            <Text style={styles.statValue}>{nutritionData?.carbohydrates}g</Text>
                        </View>

                        <Text style={[styles.mathOperator, { color: text }]}>-</Text>

                        {/* Lif */}
                        <View style={styles.statCompact}>
                            <Text style={styles.statLabel}>Lif</Text>
                            <Text style={styles.statValue}>{nutritionData?.fiber || 0}g</Text>
                        </View>

                        <Text style={[styles.mathOperator, { color: text }]}>=</Text>

                        {/* NET (Vurgulu) */}
                        <View style={[styles.statResult, { borderColor: border }]}>
                            <Text style={[styles.statResultLabel, { color: text }]}>NET</Text>
                            <Text style={[styles.statResultValue, { color: text }]}>
                                {netCarb.toFixed(1)}g
                            </Text>
                        </View>
                    </View>
                ) : (
                    // Veri Yoksa Tahmin
                    <View style={styles.estimateBox}>
                        <Text style={[styles.estimateText, { color: text }]}>
                            {t("results.estimated_carb")}: {
                                t(`results.carb_levels.${ketoData.net_carb_estimate}`, { defaultValue: ketoData.net_carb_estimate })
                            }
                        </Text>
                    </View>
                )}

                {/* Alt Kısım: AI Açıklaması */}
                <View style={styles.dividerSimple} />
                <Text style={[styles.dietReason, { color: Colors.gray[600] }]} >
                    {ketoData.reasoning}
                </Text>
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
    const scoreStyles = getScoreStyles(displayScore);

    const displayVerdict = ownerAnalysis?.report.title || t("analysis.status.safe");
    const displaySummary = ownerAnalysis?.report.summary || t("analysis.findings.safe_summary");

    const handleMemberPress = (item: { member: any, report: CompatibilityReport }) => {
        setSelectedMemberReport(item);
        setShowDetailModal(true);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >

                <View style={styles.imageContainer}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.productImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.productImage, { backgroundColor: Colors.gray[200] }]} />
                    )}

                    <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.1)']}
                        style={styles.imageGradient}
                    />

                    <TouchableOpacity style={styles.floatingBackButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.floatingBackButton, { left: undefined, right: 20 }]} onPress={handleRescan}>
                        <Ionicons name="scan" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.floatingCard}>
                    <View style={styles.dragHandle} />

                    <Text style={styles.brandText}>{product.brand || t("results.unknownBrand")}</Text>
                    <Text style={styles.productName}>{product.name || t("results.unknownProduct")}</Text>

                    <View style={styles.badgesRow}>
                        {product.isFood ? (
                            <View style={[styles.badge, styles.badgeSuccess]}>
                                <Ionicons name="nutrition" size={12} color={Colors.success} style={{ marginRight: 4 }} />
                                <Text style={[styles.badgeText, { color: Colors.success }]}>{t("results.badges.food")}</Text>
                            </View>
                        ) : (
                            <View style={[styles.badge, styles.badgeError]}>
                                <Ionicons name="warning" size={12} color={Colors.error} style={{ marginRight: 4 }} />
                                <Text style={[styles.badgeText, { color: Colors.error }]}>{t("results.badges.notFood")}</Text>
                            </View>
                        )}

                        {data.badges?.map((badgeCode: string, index: number) => {
                            const config = BADGE_CONFIG[badgeCode] || BADGE_CONFIG.DEFAULT;
                            return (
                                <View key={index} style={[styles.badge, { backgroundColor: config.bg, borderColor: config.color + '40' }]}>
                                    <Ionicons name={config.icon} size={12} color={config.color} style={{ marginRight: 4 }} />
                                    <Text style={[styles.badgeText, { color: config.color }]}>
                                        {t(config.labelKey, { defaultValue: badgeCode })}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.scoresRow}>
                        <ScoreRing
                            score={scores.safety?.value || 0}
                            label={t("results.scores.safety")}
                            type="safety"
                            size={90}
                            strokeWidth={8}
                        />

                        <View style={styles.scoreDivider} />

                        <ScoreRing
                            score={displayScore}
                            label={t("results.scores.compatibility")}
                            type="compatibility"
                            size={90}
                            strokeWidth={8}
                        />
                    </View>

                    {/* --- BÖLÜM 1: KİŞİSEL UYUM ANALİZİ --- */}
                    <View style={[styles.verdictBox, {
                        backgroundColor: scoreStyles.bg,
                        borderColor: scoreStyles.border,
                        borderBottomLeftRadius: criticalBadges.length > 0 ? 4 : 16,
                        borderBottomRightRadius: criticalBadges.length > 0 ? 4 : 16,
                        borderBottomWidth: criticalBadges.length > 0 ? 0 : 1,
                    }]}>
                        <Ionicons
                            name={displayScore >= 80 ? "checkmark-circle" : "alert-circle"}
                            size={24}
                            color={displayScore >= 80 ? Colors.success : (displayScore >= 50 ? '#EA580C' : Colors.error)}
                        />
                        <View style={{ flex: 1, gap: 4 }}>
                            <Text style={[styles.verdictTitle, {
                                color: displayScore >= 80 ? '#15803D' : (displayScore >= 50 ? '#9A3412' : '#B91C1C')
                            }]}>
                                {displayVerdict}
                            </Text>
                            <Text style={styles.verdictText}>
                                {displaySummary}
                            </Text>
                        </View>
                    </View>

                    {/* --- BÖLÜM 2: YASAL / KRİTİK UYARILAR --- */}
                    {criticalBadges.length > 0 && (
                        <View style={[styles.warningBox, {
                            backgroundColor: '#FEF2F2',
                            borderColor: '#FECACA',
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                        }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <Ionicons name="megaphone" size={18} color="#B91C1C" />
                                <Text style={{ fontSize: 12, fontWeight: '800', color: '#B91C1C', textTransform: 'uppercase' }}>
                                    {t("results.critical_warnings", "KRİTİK UYARILAR")}
                                </Text>
                            </View>

                            {criticalBadges.map((badge: string, idx: number) => (
                                <View key={idx} style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
                                    <Text style={{ fontSize: 12, color: '#B91C1C' }}>•</Text>
                                    <Text style={{ fontSize: 12, color: '#7F1D1D', flex: 1 }}>
                                        {t(`results.badges.${badge.toLowerCase()}_desc`, {
                                            defaultValue: badge === 'EU_BANNED' ? "Avrupa Birliği'nde yasaklanmış katkı maddeleri içeriyor." :
                                                badge === 'FDA_WARN' ? "FDA tarafından sağlık uyarısı verilmiş bileşenler içeriyor." :
                                                    "Alerjen uyarısı."
                                        })}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {renderDietScoreCard()}

                </View>

                {/* --- AİLE LİSTESİ --- */}
                <View style={styles.familySection}>
                    <Text style={styles.sectionHeader}>{t("results.family.title")}</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                    >
                        {familyAnalysis.map((item) => {
                            const mScore = item.report.score;
                            // Renk belirleme (Basit mantık)
                            const ringColor = getScoreColor(mScore);

                            return (
                                <TouchableOpacity
                                    key={item.member.id}
                                    style={styles.memberCard}
                                    onPress={() => handleMemberPress(item)}
                                >
                                    <View style={[styles.memberAvatarRing, { borderColor: ringColor }]}>
                                        <View style={[styles.memberAvatar, { backgroundColor: item.member.color }]}>
                                            <MaterialCommunityIcons
                                                name={item.member.avatarIcon as any}
                                                size={20}
                                                color="#FFF"
                                            />
                                        </View>
                                        <View style={[styles.miniScoreBadge, { backgroundColor: ringColor }]}>
                                            <Text style={styles.miniScoreText}>{mScore}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.memberName} numberOfLines={2}>{item.member.name}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.sectionHeader}>{t("results.detailedAnalysis")}</Text>
                    <DetailCards data={data} />
                </View>

                <View style={styles.disclaimerBox}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors.gray[400]} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.disclaimerTitle}>{t("common.disclaimer.title")}</Text>
                        <Text style={styles.disclaimerText}>{t("common.disclaimer.text")}</Text>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
            {/* --- DETAY MODALI --- */}
            <Modal
                visible={showDetailModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDetailModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalDismiss} onPress={() => setShowDetailModal(false)} />

                    <View
                        style={[
                            styles.bottomSheet,
                            { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 30 }
                        ]}
                    // DİKKAT: panResponder'ı buradan kaldırdık! Artık içerik scroll edilebilir.
                    >
                        {/* Sadece bu gri çubuğa dokunarak kapatabilirsin */}
                        <View
                            style={styles.bottomSheetHandleContainer}
                            {...panResponder.panHandlers}
                        >
                            <View style={styles.bottomSheetHandle} />
                        </View>

                        {selectedMemberReport && (
                            <View style={{ flex: 1 }}>
                                {/* Header Sabit Kalır */}
                                <View style={styles.sheetHeader}>
                                    {/* ... Avatar ve İsim Kodları Aynı ... */}
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

                                {/* ScrollView Artık Çalışacak */}
                                <ScrollView
                                    style={{ flex: 1 }}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                    showsVerticalScrollIndicator={true}
                                >
                                    {selectedMemberReport.report.findings.length === 0 ? (
                                        <View style={styles.emptyStateBox}>
                                            <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
                                            <Text style={styles.emptyStateText}>{selectedMemberReport.report.summary}</Text>
                                        </View>
                                    ) : (
                                        selectedMemberReport.report.findings.map((finding, index) => {
                                            const isHighSeverity = finding.severity === 'forbidden' || finding.severity === 'restricted';

                                            return (
                                                <View key={index} style={[styles.findingCard, {
                                                    backgroundColor: isHighSeverity ? '#FEF2F2' : '#FFF7ED',
                                                    borderColor: isHighSeverity ? '#FECACA' : '#FED7AA'
                                                }]}>
                                                    <Ionicons
                                                        name={isHighSeverity ? "ban" : "alert-circle"}
                                                        size={20}
                                                        color={isHighSeverity ? Colors.error : "#EA580C"}
                                                    />
                                                    <Text style={[styles.findingText, {
                                                        color: isHighSeverity ? '#B91C1C' : '#9A3412'
                                                    }]}>
                                                        {finding.message}
                                                    </Text>
                                                </View>
                                            );
                                        })
                                    )}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F5F9",
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        color: Colors.gray[500],
        fontWeight: '600',
    },
    backButtonSimple: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Colors.gray[200],
        borderRadius: 8,
    },
    backButtonText: {
        fontWeight: '600',
        color: Colors.secondary,
    },

    scrollContent: {
        paddingBottom: 40,
    },
    disclaimerBox: {
        marginHorizontal: 20,
        marginTop: 24,
        padding: 16,
        backgroundColor: Colors.gray[100],
        borderRadius: 12,
        flexDirection: "row",
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    disclaimerTitle: {
        fontSize: 10,
        fontWeight: "700",
        color: Colors.gray[500],
        marginBottom: 4,
    },
    disclaimerText: {
        fontSize: 11,
        color: Colors.gray[500],
        lineHeight: 16,
    },
    imageContainer: {
        height: IMAGE_HEIGHT,
        width: '100%',
        backgroundColor: Colors.gray[200],
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    floatingBackButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },

    floatingCard: {
        marginTop: -60,
        marginHorizontal: 20,
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        zIndex: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: Colors.gray[200],
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    brandText: {
        fontSize: 13,
        color: Colors.gray[500],
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 1.2,
        textAlign: 'center',
    },
    productName: {
        fontSize: 24,
        fontWeight: "900",
        color: Colors.secondary,
        marginVertical: 4,
        textAlign: 'center',
        lineHeight: 30,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        paddingHorizontal: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    badgeSuccess: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
    badgeError: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
    badgeNeutral: { backgroundColor: Colors.gray[100], borderColor: Colors.gray[200] },

    badgeText: { fontSize: 11, fontWeight: "700" },
    badgeTextNeutral: { fontSize: 11, fontWeight: "600", color: Colors.gray[600] },

    divider: {
        height: 1,
        backgroundColor: Colors.gray[100],
        marginVertical: 20,
    },

    scoresRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    scoreDivider: {
        width: 1,
        height: 60,
        backgroundColor: Colors.gray[200],
    },

    verdictBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginTop: 24,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    verdictTitle: {
        fontSize: 14,
        fontWeight: "700",
        textTransform: 'uppercase',
    },
    verdictText: {
        fontSize: 13,
        fontWeight: "500",
        color: Colors.gray[600],
        lineHeight: 18,
    },

    detailsContainer: {
        marginTop: 24,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: "800",
        color: Colors.gray[400],
        marginBottom: 12,
        marginLeft: 24,
        letterSpacing: 1,
    },
    familySection: {
        marginTop: 24,
    },
    memberCard: {
        alignItems: 'center',
        width: 64,
    },
    memberAvatarRing: {
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        backgroundColor: '#FFF',
    },
    memberAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniScoreBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    miniScoreText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#FFF',
    },
    memberName: {
        fontSize: 11,
        color: Colors.gray[600],
        fontWeight: '600',
        textAlign: 'center',
    },
    // --- MODAL STİLLERİ ---
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalDismiss: {
        flex: 1,
    },
    bottomSheet: {
        backgroundColor: "#FFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        height: '60%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    bottomSheetHandleContainer: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 20,
        backgroundColor: 'transparent',
    },
    bottomSheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: Colors.gray[200],
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        fontWeight: '700',
        color: Colors.secondary,
    },
    modalSubtitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    modalScoreBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalScoreText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFF',
    },
    reasonsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.gray[500],
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    findingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
        gap: 10,
    },
    findingText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
        lineHeight: 18,
    },
    emptyStateBox: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#BBF7D0',
        gap: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#15803D',
        fontWeight: '600',
    },
    dietCard: {
        marginTop: 16,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
    },
    dietCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dietCardTitle: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    dietStatsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 12,
        padding: 10,
    },
    statCompact: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        color: Colors.gray[500],
        marginBottom: 2,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.secondary,
    },
    mathOperator: {
        fontSize: 18,
        fontWeight: '300',
        paddingBottom: 4,
    },
    statResult: {
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 70,
    },
    statResultLabel: {
        fontSize: 9,
        fontWeight: '800',
        marginBottom: 0,
    },
    statResultValue: {
        fontSize: 18,
        fontWeight: '900',
    },
    estimateBox: {
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 8,
        alignItems: 'center',
    },
    estimateText: {
        fontSize: 14,
        fontWeight: '700',
    },
    dividerSimple: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginVertical: 12,
    },
    dietReason: {
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '500',
    },
    warningBox: {
        marginTop: 0,
        marginBottom: 24,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
});