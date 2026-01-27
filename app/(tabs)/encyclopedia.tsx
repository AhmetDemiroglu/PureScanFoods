import React, { useState, useMemo, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    LayoutAnimation,
    Platform,
    UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/colors";
import { BrandLoader } from "../../components/ui/BrandLoader";

import {
    NOVA_GROUPS,
    getAllAdditives,
    getAdditivesByRisk,
    searchAdditives,
    type AdditiveInfo,
    type AdditiveRisk,
    type NovaGroup,
    NUTRI_SCORES,
    type NutriScore
} from "../../constants/additives";
import { NutriScoreGraphic } from "../../components/ui/NutriScoreAssets";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");

type TabType = "additives" | "nova" | "nutriscore";
type RiskFilter = "ALL" | AdditiveRisk;

const RISK_CONFIG: Record<AdditiveRisk, { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
    HAZARDOUS: { color: "#DC2626", bg: "#FEF2F2", icon: "skull" },
    CAUTION: { color: "#D97706", bg: "#FFFBEB", icon: "warning" },
    SAFE: { color: "#16A34A", bg: "#F0FDF4", icon: "checkmark-circle" },
};

const STATUS_CONFIG = {
    BANNED: { color: "#DC2626", label: "Banned", labelTr: "Yasaklı" },
    RESTRICTED: { color: "#D97706", label: "Restricted", labelTr: "Kısıtlı" },
    ALLOWED: { color: "#16A34A", label: "Allowed", labelTr: "İzinli" },
    WARNING: { color: "#D97706", label: "Warning", labelTr: "Uyarılı" },
    GRAS: { color: "#16A34A", label: "GRAS", labelTr: "Güvenli" },
};

export default function AdditivesLibraryScreen() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const isTr = i18n.language === "tr";
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<TabType>("additives");
    const [searchQuery, setSearchQuery] = useState("");
    const [riskFilter, setRiskFilter] = useState<RiskFilter>("ALL");
    const [expandedAdditive, setExpandedAdditive] = useState<string | null>(null);
    const [expandedNova, setExpandedNova] = useState<NovaGroup | null>(null);

    // Filtered additives
    const filteredAdditives = useMemo(() => {
        let results: AdditiveInfo[];

        if (searchQuery.trim()) {
            results = searchAdditives(searchQuery);
        } else if (riskFilter === "ALL") {
            results = getAllAdditives();
        } else {
            results = getAdditivesByRisk(riskFilter);
        }

        const riskOrder: Record<AdditiveRisk, number> = { HAZARDOUS: 0, CAUTION: 1, SAFE: 2 };
        return results.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);
    }, [searchQuery, riskFilter]);

    // Stats
    const stats = useMemo(() => ({
        total: getAllAdditives().length,
        hazardous: getAdditivesByRisk("HAZARDOUS").length,
        caution: getAdditivesByRisk("CAUTION").length,
        safe: getAdditivesByRisk("SAFE").length,
    }), []);

    const toggleAdditive = (code: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedAdditive(expandedAdditive === code ? null : code);
    };

    const toggleNova = (group: NovaGroup) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedNova(expandedNova === group ? null : group);
    };

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 100);
    }, []);

    const renderAdditiveCard = (additive: AdditiveInfo) => {
        const isExpanded = expandedAdditive === additive.code;
        const config = RISK_CONFIG[additive.risk];

        return (
            <TouchableOpacity
                key={additive.code}
                style={[styles.card, isExpanded && styles.cardExpanded]}
                onPress={() => toggleAdditive(additive.code)}
                activeOpacity={0.7}
            >
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={[styles.riskBadge, { backgroundColor: config.bg }]}>
                        <Ionicons name={config.icon} size={16} color={config.color} />
                    </View>
                    <View style={styles.cardTitleArea}>
                        <Text style={styles.cardCode}>{additive.code}</Text>
                        <Text style={styles.cardName} numberOfLines={1}>
                            {isTr ? additive.nameTr : additive.name}
                        </Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={Colors.gray[400]}
                    />
                </View>

                {/* Status Row */}
                <View style={styles.statusRow}>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>EU</Text>
                        <Text style={[styles.statusValue, { color: STATUS_CONFIG[additive.euStatus].color }]}>
                            {isTr ? STATUS_CONFIG[additive.euStatus].labelTr : STATUS_CONFIG[additive.euStatus].label}
                        </Text>
                    </View>
                    <View style={styles.statusDivider} />
                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>FDA</Text>
                        <Text style={[styles.statusValue, { color: STATUS_CONFIG[additive.fdaStatus].color }]}>
                            {isTr ? STATUS_CONFIG[additive.fdaStatus].labelTr : STATUS_CONFIG[additive.fdaStatus].label}
                        </Text>
                    </View>
                    <View style={styles.statusDivider} />
                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>{isTr ? "Kategori" : "Category"}</Text>
                        <Text style={styles.statusValueSmall} numberOfLines={1}>
                            {additive.categoryTr}
                        </Text>
                    </View>
                </View>

                {/* Expanded Content */}
                {isExpanded && (
                    <View style={styles.expandedContent}>
                        <View style={[styles.riskIndicator, { backgroundColor: config.bg, borderColor: config.color }]}>
                            <Ionicons name={config.icon} size={20} color={config.color} />
                            <Text style={[styles.riskText, { color: config.color }]}>
                                {additive.risk === "HAZARDOUS" && (isTr ? "Tehlikeli" : "Hazardous")}
                                {additive.risk === "CAUTION" && (isTr ? "Dikkatli Tüketilmeli" : "Use with Caution")}
                                {additive.risk === "SAFE" && (isTr ? "Güvenli" : "Safe")}
                            </Text>
                        </View>
                        <Text style={styles.reasonText}>
                            {isTr ? additive.reasonTr : additive.reason}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderNovaCard = (group: NovaGroup) => {
        const nova = NOVA_GROUPS[group];
        const isExpanded = expandedNova === group;

        return (
            <TouchableOpacity
                key={group}
                style={[styles.novaCard, { borderLeftColor: nova.color }]}
                onPress={() => toggleNova(group)}
                activeOpacity={0.7}
            >
                {/* Header */}
                <View style={styles.novaHeader}>
                    <View style={[styles.novaGroupBadge, { backgroundColor: nova.color }]}>
                        <Text style={styles.novaGroupText}>{group}</Text>
                    </View>
                    <View style={styles.novaTitleArea}>
                        <Text style={styles.novaTitle}>
                            {isTr ? nova.labelTr : nova.label}
                        </Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={Colors.gray[400]}
                    />
                </View>

                {/* Short Description */}
                {!isExpanded && (
                    <Text style={styles.novaShortDesc} numberOfLines={2}>
                        {isTr ? nova.descriptionTr : nova.description}
                    </Text>
                )}

                {/* Expanded Content */}
                {isExpanded && (
                    <View style={styles.novaExpandedContent}>
                        <Text style={styles.novaDescription}>
                            {isTr ? nova.descriptionTr : nova.description}
                        </Text>

                        {/* Examples */}
                        <View style={styles.novaSection}>
                            <Text style={styles.novaSectionTitle}>
                                <Ionicons name="list" size={14} color={Colors.gray[600]} />
                                {"  "}{isTr ? "Örnekler" : "Examples"}
                            </Text>
                            <View style={styles.examplesContainer}>
                                {(isTr ? nova.examplesTr : nova.examples).map((example, idx) => (
                                    <View key={idx} style={styles.exampleTag}>
                                        <Text style={styles.exampleText}>{example}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Health Tips */}
                        <View style={styles.novaSection}>
                            <Text style={styles.novaSectionTitle}>
                                <Ionicons name="heart" size={14} color={nova.color} />
                                {"  "}{isTr ? "Sağlık Önerileri" : "Health Tips"}
                            </Text>
                            {(isTr ? nova.healthTipsTr : nova.healthTips).map((tip, idx) => (
                                <View key={idx} style={styles.tipRow}>
                                    <Ionicons name="checkmark-circle" size={16} color={nova.color} />
                                    <Text style={styles.tipText}>{tip}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderNutriScoreCard = (score: NutriScore) => {
        const info = NUTRI_SCORES[score];

        return (
            <View key={score} style={[styles.novaCard, { borderLeftColor: info.color }]}>
                {/* Header: Graphic + Title */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={[styles.novaTitle, { fontSize: 18, color: info.color, marginBottom: 4 }]}>
                            {isTr ? info.labelTr : info.label}
                        </Text>
                        <Text style={styles.novaDescription}>
                            {isTr ? info.descriptionTr : info.description}
                        </Text>
                    </View>
                    <View style={{ transform: [{ scale: 0.8 }], transformOrigin: 'top right' }}>
                        <NutriScoreGraphic grade={score} />
                    </View>
                </View>

                {/* Examples */}
                <View style={styles.novaSection}>
                    <Text style={styles.novaSectionTitle}>
                        <Ionicons name="basket" size={14} color={Colors.gray[600]} />
                        {"  "}{isTr ? "Örnek Gıdalar" : "Common Examples"}
                    </Text>
                    <View style={styles.examplesContainer}>
                        {(isTr ? info.examplesTr : info.examples).map((example, idx) => (
                            <View key={idx} style={styles.exampleTag}>
                                <Text style={styles.exampleText}>{example}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return <BrandLoader mode="fullscreen" />;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Header */}
            <LinearGradient
                colors={[Colors.primary, "#E65100"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <SafeAreaView edges={["top"]}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleArea}>
                            <Text style={styles.headerTitle}>
                                {isTr ? "Gıda Sözlüğü" : "Food Encyclopedia"}
                            </Text>
                            <Text style={styles.headerSubtitle}>
                                {isTr ? "Katkı maddeleri ve NOVA rehberi" : "Additives & NOVA guide"}
                            </Text>
                        </View>
                    </View>

                    {/* Tab Switcher */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "additives" && styles.tabActive]}
                            onPress={() => setActiveTab("additives")}
                        >
                            <Ionicons
                                name="flask"
                                size={18}
                                color={activeTab === "additives" ? Colors.primary : "#FFF"}
                            />
                            <Text style={[styles.tabText, activeTab === "additives" && styles.tabTextActive]}>
                                {isTr ? "Katkı Maddeleri" : "Additives"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "nova" && styles.tabActive]}
                            onPress={() => setActiveTab("nova")}
                        >
                            <Ionicons
                                name="nutrition"
                                size={18}
                                color={activeTab === "nova" ? Colors.primary : "#FFF"}
                            />
                            <Text style={[styles.tabText, activeTab === "nova" && styles.tabTextActive]}>
                                {isTr ? "NOVA Rehberi" : "NOVA Guide"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "nutriscore" && styles.tabActive]}
                            onPress={() => setActiveTab("nutriscore")}
                        >
                            <Ionicons
                                name="stats-chart"
                                size={18}
                                color={activeTab === "nutriscore" ? Colors.primary : "#FFF"}
                            />
                            <Text style={[styles.tabText, activeTab === "nutriscore" && styles.tabTextActive]}>
                                Nutri-Score
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ADDITIVES TAB */}
                {activeTab === "additives" && (
                    <>
                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color={Colors.gray[400]} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={isTr ? "E kodu veya isim ara..." : "Search E-code or name..."}
                                placeholderTextColor={Colors.gray[400]}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery("")}>
                                    <Ionicons name="close-circle" size={20} color={Colors.gray[400]} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <View style={[styles.statBox, { backgroundColor: "#FEF2F2" }]}>
                                <Text style={[styles.statNumber, { color: "#DC2626" }]}>{stats.hazardous}</Text>
                                <Text style={styles.statLabel}>{isTr ? "Tehlikeli" : "Hazardous"}</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: "#FFFBEB" }]}>
                                <Text style={[styles.statNumber, { color: "#D97706" }]}>{stats.caution}</Text>
                                <Text style={styles.statLabel}>{isTr ? "Dikkatli" : "Caution"}</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: "#F0FDF4" }]}>
                                <Text style={[styles.statNumber, { color: "#16A34A" }]}>{stats.safe}</Text>
                                <Text style={styles.statLabel}>{isTr ? "Güvenli" : "Safe"}</Text>
                            </View>
                        </View>

                        {/* Risk Filter */}
                        <View style={styles.filterRow}>
                            {(["ALL", "HAZARDOUS", "CAUTION", "SAFE"] as RiskFilter[]).map((filter) => (
                                <TouchableOpacity
                                    key={filter}
                                    style={[
                                        styles.filterChip,
                                        riskFilter === filter && styles.filterChipActive,
                                        riskFilter === filter && filter === "ALL" && { backgroundColor: Colors.secondary },
                                        riskFilter === filter && filter === "HAZARDOUS" && { backgroundColor: "#DC2626" },
                                        riskFilter === filter && filter === "CAUTION" && { backgroundColor: "#D97706" },
                                        riskFilter === filter && filter === "SAFE" && { backgroundColor: "#16A34A" },
                                    ]}
                                    onPress={() => setRiskFilter(filter)}
                                >
                                    <Text
                                        style={[
                                            styles.filterChipText,
                                            riskFilter === filter && styles.filterChipTextActive,
                                        ]}
                                    >
                                        {filter === "ALL" && (isTr ? "Tümü" : "All")}
                                        {filter === "HAZARDOUS" && (isTr ? "Tehlikeli" : "Hazardous")}
                                        {filter === "CAUTION" && (isTr ? "Dikkatli" : "Caution")}
                                        {filter === "SAFE" && (isTr ? "Güvenli" : "Safe")}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Results Count */}
                        <Text style={styles.resultsCount}>
                            {filteredAdditives.length} {isTr ? "sonuç" : "results"}
                        </Text>

                        {/* Additive Cards */}
                        {filteredAdditives.map(renderAdditiveCard)}
                    </>
                )}

                {/* NOVA TAB */}
                {activeTab === "nova" && (
                    <>
                        {/* NOVA Info Box */}
                        <View style={styles.novaInfoBox}>
                            <Ionicons name="information-circle" size={24} color={Colors.primary} />
                            <View style={styles.novaInfoContent}>
                                <Text style={styles.novaInfoTitle}>
                                    {isTr ? "NOVA Sınıflandırması Nedir?" : "What is NOVA Classification?"}
                                </Text>
                                <Text style={styles.novaInfoText}>
                                    {isTr
                                        ? "NOVA, gıdaları işlenme derecelerine göre 4 gruba ayıran uluslararası bir sınıflandırma sistemidir. Düşük gruplar daha sağlıklı seçenekleri temsil eder."
                                        : "NOVA is an international classification system that divides foods into 4 groups based on their degree of processing. Lower groups represent healthier choices."}
                                </Text>
                            </View>
                        </View>

                        {/* NOVA Cards */}
                        {([1, 2, 3, 4] as NovaGroup[]).map(renderNovaCard)}
                    </>
                )}

                {/* NUTRI-SCORE TAB */}
                {activeTab === "nutriscore" && (
                    <>
                        {/* Info Box */}
                        <View style={styles.novaInfoBox}>
                            <Ionicons name="information-circle" size={24} color={Colors.primary} />
                            <View style={styles.novaInfoContent}>
                                <Text style={styles.novaInfoTitle}>
                                    {isTr ? "Nutri-Score Nedir?" : "What is Nutri-Score?"}
                                </Text>
                                <Text style={styles.novaInfoText}>
                                    {isTr
                                        ? "Nutri-Score, gıdaların besin değerini A'dan (en sağlıklı) E'ye (en az sağlıklı) kadar sıralayan 5 renkli bir etiketleme sistemidir."
                                        : "Nutri-Score is a 5-color nutrition label that ranks foods from A (best) to E (poorest) nutritional quality."}
                                </Text>
                            </View>
                        </View>

                        {/* Cards */}
                        {(['A', 'B', 'C', 'D', 'E'] as NutriScore[]).map(renderNutriScoreCard)}
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F5F9",
    },
    header: {
        paddingBottom: 16,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitleArea: {
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#FFF",
    },
    headerSubtitle: {
        fontSize: 13,
        color: "rgba(255,255,255,0.8)",
        marginTop: 2,
    },
    tabContainer: {
        flexDirection: "row",
        marginHorizontal: 20,
        marginTop: 16,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 12,
        borderRadius: 10,
    },
    tabActive: {
        backgroundColor: "#FFF",
    },
    tabText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#FFF",
    },
    tabTextActive: {
        color: Colors.primary,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: Colors.secondary,
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
    },
    statBox: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "800",
    },
    statLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.gray[600],
        marginTop: 4,
    },
    filterRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 16,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    filterChipActive: {
        borderColor: "transparent",
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.gray[600],
    },
    filterChipTextActive: {
        color: "#FFF",
    },
    resultsCount: {
        fontSize: 12,
        color: Colors.gray[500],
        marginTop: 16,
        marginBottom: 8,
    },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    cardExpanded: {
        borderColor: Colors.primary,
        borderWidth: 1.5,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    riskBadge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    cardTitleArea: {
        flex: 1,
    },
    cardCode: {
        fontSize: 15,
        fontWeight: "800",
        color: Colors.secondary,
    },
    cardName: {
        fontSize: 12,
        color: Colors.gray[500],
        marginTop: 2,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[100],
    },
    statusItem: {
        flex: 1,
        alignItems: "center",
    },
    statusDivider: {
        width: 1,
        height: 24,
        backgroundColor: Colors.gray[200],
    },
    statusLabel: {
        fontSize: 10,
        fontWeight: "600",
        color: Colors.gray[400],
        textTransform: "uppercase",
    },
    statusValue: {
        fontSize: 12,
        fontWeight: "700",
        marginTop: 2,
    },
    statusValueSmall: {
        fontSize: 10,
        fontWeight: "600",
        color: Colors.gray[600],
        marginTop: 2,
    },
    expandedContent: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[100],
    },
    riskIndicator: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        alignSelf: "flex-start",
        marginBottom: 12,
    },
    riskText: {
        fontSize: 13,
        fontWeight: "700",
    },
    reasonText: {
        fontSize: 14,
        color: Colors.gray[700],
        lineHeight: 22,
    },

    // NOVA Styles
    novaInfoBox: {
        flexDirection: "row",
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 16,
        gap: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    novaInfoContent: {
        flex: 1,
    },
    novaInfoTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: Colors.secondary,
        marginBottom: 4,
    },
    novaInfoText: {
        fontSize: 13,
        color: Colors.gray[600],
        lineHeight: 20,
    },
    novaCard: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.gray[200],
        borderLeftWidth: 4,
    },
    novaHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    novaGroupBadge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    novaGroupText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#FFF",
    },
    novaTitleArea: {
        flex: 1,
    },
    novaTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: Colors.secondary,
    },
    novaShortDesc: {
        fontSize: 12,
        color: Colors.gray[500],
        marginTop: 8,
        lineHeight: 18,
    },
    novaExpandedContent: {
        marginTop: 16,
    },
    novaDescription: {
        fontSize: 14,
        color: Colors.gray[700],
        lineHeight: 22,
        marginBottom: 16,
    },
    novaSection: {
        marginBottom: 16,
    },
    novaSectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.gray[700],
        marginBottom: 10,
    },
    examplesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    exampleTag: {
        backgroundColor: Colors.gray[100],
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    exampleText: {
        fontSize: 12,
        color: Colors.gray[700],
    },
    tipRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 8,
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: Colors.gray[600],
        lineHeight: 20,
    },
});