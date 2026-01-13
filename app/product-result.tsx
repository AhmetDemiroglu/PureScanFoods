import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, StatusBar } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import ScoreRing from "../components/ui/ScoreRing";
import { LinearGradient } from "expo-linear-gradient";
import { TempStore } from "../lib/tempStore";
import DetailCards from "../components/product/DetailCards";

const { width } = Dimensions.get("window");
const IMAGE_HEIGHT = 320;

export default function ProductResultScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const { data, image } = TempStore.getResult();
    const imageUri = image || undefined;

    if (!data) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.gray[400]} />
                <Text style={styles.errorText}>{t("results.errorLoad")}</Text>                <TouchableOpacity style={styles.backButtonSimple} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>{t("common.back")}</Text>                </TouchableOpacity>
            </View>
        );
    }

    const { product, scores } = data;

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
                        <View style={[styles.badge, styles.badgeNeutral]}>
                            <Text style={styles.badgeTextNeutral}>{product.category || t("results.badges.general")}</Text>
                        </View>
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
                            score={scores.compatibility?.value || 0}
                            label={t("results.scores.compatibility")}
                            type="compatibility"
                            size={90}
                            strokeWidth={8}
                        />
                    </View>

                    {scores.compatibility?.verdict && (
                        <View style={[styles.verdictBox, {
                            backgroundColor: scores.compatibility.value > 50 ? '#F0FDF4' : '#FEF2F2',
                            borderColor: scores.compatibility.value > 50 ? '#BBF7D0' : '#FECACA'
                        }]}>
                            <Ionicons
                                name={scores.compatibility.value > 50 ? "checkmark-circle" : "alert-circle"}
                                size={22}
                                color={scores.compatibility.value > 50 ? Colors.success : Colors.error}
                            />
                            <Text style={[styles.verdictText, {
                                color: scores.compatibility.value > 50 ? '#15803D' : '#B91C1C'
                            }]}>
                                {scores.compatibility.verdict}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.sectionHeader}>{t("results.detailedAnalysis")}</Text>
                    <DetailCards data={data} />
                </View>

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
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
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
    verdictText: {
        fontSize: 13,
        fontWeight: "600",
        flex: 1,
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
});