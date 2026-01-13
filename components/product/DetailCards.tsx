import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { useTranslation } from "react-i18next";

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
    const [expandedSection, setExpandedSection] = useState<string | null>("ingredients");

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
                    <Ionicons name={icon} size={20} color={expandedSection === sectionKey ? Colors.white : Colors.primary} />
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
                color={Colors.gray[400]}
            />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>

            <View style={styles.card}>
                {renderHeader(t("results.ingredients"), "list", "ingredients", data.details.ingredients?.length)}
                {expandedSection === "ingredients" && (
                    <View style={styles.cardBody}>
                        <View style={styles.tagsContainer}>
                            {data.details.ingredients?.map((ing: any, i: number) => (
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
                                        {ing.name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>

            {data.details.additives?.length > 0 && (
                <View style={styles.card}>
                    {renderHeader(t("results.additives"), "flask", "additives", data.details.additives.length)}
                    {expandedSection === "additives" && (
                        <View style={styles.cardBody}>
                            {data.details.additives.map((add: any, i: number) => (
                                <View key={i} style={styles.additiveRow}>
                                    <View style={[styles.additiveCode, add.risk === 'Hazardous' ? { backgroundColor: '#FEF2F2' } : { backgroundColor: '#FFFBEB' }]}>
                                        <Text style={[styles.additiveCodeText, add.risk === 'Hazardous' ? { color: Colors.error } : { color: Colors.warning }]}>{add.code}</Text>
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

            <View style={styles.card}>
                {renderHeader(t("results.details"), "stats-chart", "nutrition")}
                {expandedSection === "nutrition" && (
                    <View style={styles.cardBody}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>{t("results.processingLevel")}</Text>
                            <Text style={styles.infoValue}>{data.details.processing?.classification || t("common.unknown")}</Text>
                            <Text style={styles.infoDesc}>{data.details.processing?.description}</Text>
                        </View>

                        <View style={styles.divider} />

                        {data.details.nutritional_highlights?.pros?.length > 0 && (
                            <>
                                <Text style={[styles.subTitle, { color: Colors.success }]}>{t("results.pros")}</Text>
                                {data.details.nutritional_highlights.pros.map((pro: string, i: number) => (
                                    <View key={i} style={styles.bulletRow}>
                                        <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                                        <Text style={styles.bulletText}>{pro}</Text>
                                    </View>
                                ))}
                                <View style={{ height: 12 }} />
                            </>
                        )}

                        {data.details.nutritional_highlights?.cons?.length > 0 && (
                            <>
                                <Text style={[styles.subTitle, { color: Colors.error }]}>{t("results.cons")}</Text>
                                {data.details.nutritional_highlights.cons.map((con: string, i: number) => (
                                    <View key={i} style={styles.bulletRow}>
                                        <Ionicons name="warning" size={16} color={Colors.error} />
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

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        gap: 16,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.gray[200],
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: Colors.white,
    },
    cardHeaderActive: {
        backgroundColor: Colors.surface,
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
        backgroundColor: Colors.gray[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBoxActive: {
        backgroundColor: Colors.primary,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.secondary,
    },
    headerTitleActive: {
        color: Colors.primary,
    },
    badge: {
        backgroundColor: Colors.gray[200],
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.gray[600],
    },
    cardBody: {
        padding: 16,
        paddingTop: 0,
        backgroundColor: Colors.surface,
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
    tagSuccess: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
    tagTextSuccess: { color: '#15803D' },
    tagWarning: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
    tagTextWarning: { color: '#B45309' },
    tagDanger: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
    tagTextDanger: { color: '#B91C1C' },
    additiveRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
        backgroundColor: Colors.white,
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
        color: Colors.secondary,
    },
    additiveDesc: {
        fontSize: 11,
        color: Colors.gray[500],
        marginTop: 2,
        lineHeight: 16,
    },
    infoBox: {
        backgroundColor: Colors.white,
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        marginTop: 12,
    },
    infoLabel: {
        fontSize: 10,
        color: Colors.gray[400],
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.secondary,
        marginVertical: 2,
    },
    infoDesc: {
        fontSize: 11,
        color: Colors.gray[500],
    },
    divider: {
        height: 1,
        backgroundColor: Colors.gray[200],
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
        color: Colors.gray[600],
        flex: 1,
        lineHeight: 18,
    },
});