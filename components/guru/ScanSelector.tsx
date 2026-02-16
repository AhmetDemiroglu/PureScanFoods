import React from "react";
import { View, Text, ScrollView, Pressable, Image, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "../../constants/colors";
import { ScanResult } from "../../lib/firestore";

interface ScanSelectorProps {
    scans: ScanResult[];
    onSelect: (scan: ScanResult) => void;
    isLoading: boolean;
}

export const ScanSelector = ({ scans, onSelect, isLoading }: ScanSelectorProps) => {
    const { t } = useTranslation();

    if (isLoading || scans.length === 0) return null;

    const getScoreColor = (score: number) => {
        if (score >= 70) return Colors.success;
        if (score >= 40) return Colors.warning;
        return Colors.error;
    };

    const getDisplayName = (scan: ScanResult) => {
        return scan.productName?.trim() || scan.brand?.trim() || "Bilinmeyen Ürün";
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {t("guru.recentScans", { defaultValue: "Son Taramalar" })}
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {scans.map((scan) => {
                    const scoreColor = getScoreColor(scan.score);
                    const displayName = getDisplayName(scan);

                    return (
                        <Pressable
                            key={scan.id}
                            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                            onPress={() => onSelect(scan)}
                        >
                            {/* Resim veya Placeholder */}
                            <Image
                                source={scan.imageUrl ? { uri: scan.imageUrl } : require("../../assets/placeholder.png")}
                                style={styles.image}
                            />

                            {/* İsim + Brand + Score */}
                            <View style={styles.info}>
                                <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
                                <View style={styles.metaRow}>
                                    <Text style={styles.brand} numberOfLines={1}>{scan.brand || "-"}</Text>
                                    <View style={[styles.scorePill, { backgroundColor: scoreColor }]}>
                                        <Text style={styles.scoreText}>{scan.score}</Text>
                                    </View>
                                </View>
                            </View>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[100],
    },
    title: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.gray[400],
        marginBottom: 10,
        marginLeft: 20,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 10,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.white,
        padding: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.gray[200],
        gap: 10,
        minWidth: 200,
        maxWidth: 260,
    },
    cardPressed: {
        backgroundColor: Colors.gray[50],
        transform: [{ scale: 0.98 }],
    },
    image: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: Colors.gray[100],
    },
    info: {
        flex: 1,
        minWidth: 0,
    },
    name: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.secondary,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    brand: {
        fontSize: 12,
        color: Colors.gray[400],
        flex: 1,
    },
    scorePill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    scoreText: {
        fontSize: 11,
        fontWeight: "700",
        color: Colors.white,
    },
});