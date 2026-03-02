import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppColors } from "../../constants/colors";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface DetailCardsProps {
    data: any;
}

export default function DetailCards({ data }: DetailCardsProps) {
    const { t } = useTranslation();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
    if (!data || !data.details) return null;

    const [expandedSection, setExpandedSection] = useState<string | null>("ingredients");

    const rawAdditives = data.details?.additives || [];

    const validAdditives = rawAdditives.filter((item: any) => {
        const name = item.name ? item.name.toLowerCase() : "";
        return name !== "yok" && name !== "none" && name !== "n/a" && name !== "";
    });

    const toggleSection = (section: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSection(expandedSection === section ? null : section);
    };

    const renderHeader = (title: string, icon: any, sectionKey: string, badgeCount?: number) => (
        <TouchableOpacity
            style={[styles.cardHeader, expandedSection === sectionKey && styles.cardHeaderActive]}
            onPress={() => toggleSection(sectionKey)}
            activeOpacity={0.7}
        >
            <View style={styles.headerLeft}>
                <View style={[styles.iconBox, expandedSection === sectionKey && styles.iconBoxActive]}>
                    <Ionicons name={icon} size={20} color={expandedSection === sectionKey ? colors.white : colors.primary} />
                </View>
                <Text style={[styles.headerTitle, expandedSection === sectionKey && styles.headerTitleActive]}>{title}</Text>
                {badgeCount ? (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badgeCount}</Text>
                    </View>
                ) : null}
            </View>
            <Ionicons
                name={expandedSection === sectionKey ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.gray[400]}
            />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>

            {/* INGREDIENTS KISMI */}
            <View style={styles.card}>
                {renderHeader(t("results.ingredients"), "list", "ingredients", data.details?.ingredients?.length)}
                {expandedSection === "ingredients" && (
                    <View style={styles.cardBody}>
                        <View style={styles.tagsContainer}>
                            {data.details?.ingredients?.map((ing: any, i: number) => (
                                <View key={i} style={[
                                    styles.tag,
                                    ing.riskLevel === 'High' ? styles.tagDanger :
                                        ing.riskLevel === 'Medium' ? styles.tagWarning : styles.tagSuccess
                                ]}>
                                    <Text style={[
                                        styles.tagText,
                                        ing.riskLevel === 'High' ? styles.tagTextDanger :
                                            ing.riskLevel === 'Medium' ? styles.tagTextWarning : styles.tagTextSuccess
                                    ]}>
                                        {ing.display_name || ing.name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>

            {/* ADDITIVES KISMI */}
            {validAdditives.length > 0 && (
                <View style={styles.card}>
                    {renderHeader(t("results.additives"), "flask", "additives", validAdditives.length)}
                    {expandedSection === "additives" && (
                        <View style={styles.cardBody}>
                            {validAdditives.map((add: any, i: number) => (
                                <View key={i} style={styles.additiveRow}>
                                    <View style={[styles.additiveCode, add.risk === 'Hazardous'
                                        ? { backgroundColor: isDark ? "rgba(220,38,38,0.20)" : '#FEF2F2' }
                                        : { backgroundColor: isDark ? "rgba(217,119,6,0.20)" : '#FFFBEB' }]}>
                                        <Text style={[styles.additiveCodeText, add.risk === 'Hazardous' ? { color: colors.error } : { color: colors.warning }]}>{add.code}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.additiveName}>{add.name}</Text>
                                        <Text style={styles.additiveDesc}>{add.description}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* DETAILS KISMI */}
            <View style={styles.card}>
                {renderHeader(t("results.details"), "stats-chart", "nutrition")}
                {expandedSection === "nutrition" && (
                    <View style={styles.cardBody}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>{t("results.processingLevel")}</Text>
                            <Text style={styles.infoValue}>{data.details?.processing?.classification || t("common.unknown")}</Text>
                            <Text style={styles.infoDesc}>{data.details?.processing?.description}</Text>
                        </View>

                        <View style={styles.divider} />

                        {data.details?.nutritional_highlights?.pros?.length > 0 && (
                            <>
                                <Text style={[styles.subTitle, { color: colors.success }]}>{t("results.pros")}</Text>
                                {data.details.nutritional_highlights.pros.map((pro: string, i: number) => (
                                    <View key={i} style={styles.bulletRow}>
                                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                        <Text style={styles.bulletText}>{pro}</Text>
                                    </View>
                                ))}
                                <View style={{ height: 12 }} />
                            </>
                        )}

                        {/* DÜZELTME: Optional chaining (?.) */}
                        {data.details?.nutritional_highlights?.cons?.length > 0 && (
                            <>
                                <Text style={[styles.subTitle, { color: colors.error }]}>{t("results.cons")}</Text>
                                {data.details.nutritional_highlights.cons.map((con: string, i: number) => (
                                    <View key={i} style={styles.bulletRow}>
                                        <Ionicons name="warning" size={16} color={colors.error} />
                                        <Text style={styles.bulletText}>{con}</Text>
                                    </View>
                                ))}
                            </>
                        )}
                    </View>
                )}
            </View>

        </View>
    );
}

const createStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        gap: 16,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.gray[200],
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: colors.card,
    },
    cardHeaderActive: {
        backgroundColor: colors.surface,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.gray[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBoxActive: {
        backgroundColor: colors.primary,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.secondary,
    },
    headerTitleActive: {
        color: colors.primary,
    },
    badge: {
        backgroundColor: colors.gray[200],
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.gray[600],
    },
    cardBody: {
        padding: 16,
        paddingTop: 0,
        backgroundColor: colors.surface,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingTop: 12,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    tagSuccess: { backgroundColor: isDark ? "rgba(22,163,74,0.20)" : '#F0FDF4', borderColor: isDark ? "rgba(34,197,94,0.45)" : '#BBF7D0' },
    tagTextSuccess: { color: isDark ? '#86EFAC' : '#15803D' },
    tagWarning: { backgroundColor: isDark ? "rgba(217,119,6,0.20)" : '#FFFBEB', borderColor: isDark ? "rgba(251,191,36,0.45)" : '#FDE68A' },
    tagTextWarning: { color: isDark ? '#FCD34D' : '#B45309' },
    tagDanger: { backgroundColor: isDark ? "rgba(220,38,38,0.20)" : '#FEF2F2', borderColor: isDark ? "rgba(248,113,113,0.45)" : '#FECACA' },
    tagTextDanger: { color: isDark ? '#FCA5A5' : '#B91C1C' },
    additiveRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
        backgroundColor: colors.card,
        padding: 10,
        borderRadius: 10,
        marginTop: 12,
    },
    additiveCode: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    additiveCodeText: {
        fontWeight: '700',
        fontSize: 12,
    },
    additiveName: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.secondary,
    },
    additiveDesc: {
        fontSize: 11,
        color: colors.gray[500],
        marginTop: 2,
        lineHeight: 16,
    },
    infoBox: {
        backgroundColor: colors.card,
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        marginTop: 12,
    },
    infoLabel: {
        fontSize: 10,
        color: colors.gray[400],
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.secondary,
        marginVertical: 2,
    },
    infoDesc: {
        fontSize: 11,
        color: colors.gray[500],
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray[200],
        marginVertical: 12,
    },
    subTitle: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    bulletRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 6,
        paddingRight: 10,
    },
    bulletText: {
        fontSize: 13,
        color: colors.gray[600],
        flex: 1,
        lineHeight: 18,
    },
});



