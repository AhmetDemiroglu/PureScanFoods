import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Text } from "../ui/AppText";
import ConsumptionJar from "./ConsumptionJar";
import { RenderLayer } from "../../lib/composition";
import { useTranslation } from "react-i18next";

interface Props {
    layers: RenderLayer[];
    spoons: number;
    sugarEstimated: boolean;
    aiUrl: string | null;
    productName?: string;
    width: number;
}

// Paylaşım için markalı tek görsel (view-shot ile yakalanır). Her zaman açık tema.
const C = {
    bg: "#FBF8F3",
    text: "#16203A",
    muted: "#6B7280",
    accent: "#FF6F00",
    border: "#ECE6DC",
};

export default function ShareCard({ layers, spoons, sugarEstimated, aiUrl, productName, width }: Props) {
    const { t } = useTranslation();
    const inner = width - 36;
    const showPhoto = !!aiUrl;

    return (
        <View style={[styles.root, { width }]}>
            {/* Marka başlığı */}
            <View style={styles.header}>
                <Image source={require("../../assets/adaptive-icon.png")} style={styles.logo} resizeMode="contain" />
                <Text style={styles.brand}>PureScan Foods</Text>
            </View>

            <Text style={styles.title}>
                {t("consumption.modal_title", { defaultValue: "Gerçekte Ne Tüketiyorsun?" })}
            </Text>
            {!!productName && (
                <Text style={styles.product} numberOfLines={1}>
                    {productName}
                </Text>
            )}

            {showPhoto ? (
                <>
                    <Image
                        source={{ uri: aiUrl! }}
                        style={[styles.photo, { width: inner, height: inner }]}
                        resizeMode="cover"
                    />
                    <View style={styles.legend}>
                        {layers.map((l, i) => (
                            <View key={i} style={[styles.legendRow, { width: inner / 2 - 6 }]}>
                                <View style={[styles.dot, { backgroundColor: l.color }]} />
                                <Text style={styles.legendName} numberOfLines={1}>
                                    {l.display_name}
                                </Text>
                                <Text style={styles.legendRange}>{l.rangeLabel}</Text>
                            </View>
                        ))}
                    </View>
                    {spoons > 0 && (
                        <Text style={styles.spoon}>
                            ≈ {spoons % 1 === 0 ? spoons : spoons.toFixed(1)}{" "}
                            {t("consumption.sugar_spoons", { defaultValue: "yemek kaşığı şeker" })}
                            {sugarEstimated ? " " + t("consumption.estimated_tag", { defaultValue: "(tahmini)" }) : ""}
                        </Text>
                    )}
                </>
            ) : (
                <View style={{ marginTop: 4 }}>
                    <ConsumptionJar
                        layers={layers}
                        spoons={spoons}
                        sugarEstimated={sugarEstimated}
                        fullyEstimated={false}
                        width={inner}
                        forceLight
                    />
                </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.tagline}>
                    {t("consumption.brand_tagline", { defaultValue: "İçindekileri gör, bilinçli seç" })}
                </Text>
                <Text style={styles.hashtag}>#PureScanFoods</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        backgroundColor: C.bg,
        borderRadius: 22,
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 14,
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        alignSelf: "center",
        marginBottom: 8,
    },
    logo: { width: 26, height: 26, borderRadius: 6 },
    brand: { fontSize: 16, fontWeight: "900", color: C.text, letterSpacing: -0.2 },
    title: { fontSize: 18, fontWeight: "900", color: C.text, textAlign: "center", letterSpacing: -0.3 },
    product: { fontSize: 13, fontWeight: "600", color: C.muted, textAlign: "center", marginTop: 1, marginBottom: 2 },
    photo: { borderRadius: 16, marginTop: 8, backgroundColor: "#EEE9E0" },
    legend: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 4,
        marginTop: 12,
    },
    legendRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 2 },
    dot: { width: 10, height: 10, borderRadius: 3 },
    legendName: { flex: 1, fontSize: 11.5, fontWeight: "700", color: C.text },
    legendRange: { fontSize: 11.5, fontWeight: "700", color: C.muted },
    spoon: { fontSize: 14, fontWeight: "800", color: C.text, textAlign: "center", marginTop: 12 },
    footer: {
        marginTop: 14,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: C.border,
        alignItems: "center",
        alignSelf: "stretch",
        gap: 2,
    },
    tagline: { fontSize: 12, fontWeight: "600", color: C.muted },
    hashtag: { fontSize: 12, fontWeight: "800", color: C.accent },
});
