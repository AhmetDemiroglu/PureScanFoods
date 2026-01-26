import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "../../constants/colors";
import { ActiveProduct } from "../../context/GuruContext";

interface ProductContextCardProps {
    product: ActiveProduct;
    onClose: () => void;
}

export const ProductContextCard = ({ product, onClose }: ProductContextCardProps) => {
    const { t } = useTranslation();

    const getScoreColor = (score: number) => {
        if (score >= 70) return Colors.success;
        if (score >= 40) return Colors.warning;
        return Colors.error;
    };

    const scoreColor = getScoreColor(product.score);
    const displayName = product.name?.trim() || product.brand?.trim() || "Bilinmeyen Ürün";

    return (
        <View style={styles.container}>
            {/* Close Button - Sağ Üst */}
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color={Colors.gray[400]} />
            </Pressable>

            {/* Label */}
            <Text style={styles.label}>
                {t("guru.activeProduct", { defaultValue: "Aktif Ürün" })}
            </Text>

            {/* Content Row */}
            <View style={styles.contentRow}>
                {/* Score Badge */}
                <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
                    <Text style={styles.scoreValue}>{product.score}</Text>
                    <Text style={styles.scoreMax}>/100</Text>
                </View>

                {/* Info */}
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
                    <Text style={styles.brand} numberOfLines={1}>{product.brand || "-"}</Text>
                    <Text style={[styles.verdict, { color: scoreColor }]} numberOfLines={1}>
                        {product.verdict}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        marginHorizontal: 16,
        marginTop: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.gray[200],
        position: "relative",
    },
    closeBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1,
        padding: 4,
    },
    label: {
        fontSize: 10,
        fontWeight: "600",
        color: Colors.primary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    contentRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    scoreBadge: {
        width: 56,
        height: 56,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    scoreValue: {
        fontSize: 20,
        fontWeight: "800",
        color: Colors.white,
    },
    scoreMax: {
        fontSize: 10,
        fontWeight: "600",
        color: "rgba(255,255,255,0.8)",
        marginTop: -2,
    },
    info: {
        flex: 1,
        minWidth: 0,
    },
    name: {
        fontSize: 15,
        fontWeight: "700",
        color: Colors.secondary,
    },
    brand: {
        fontSize: 13,
        color: Colors.gray[500],
        marginTop: 2,
    },
    verdict: {
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },
});