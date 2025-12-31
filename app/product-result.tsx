import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import ScoreRing from "../components/ui/ScoreRing";
import { LinearGradient } from "expo-linear-gradient";
import { TempStore } from "../lib/tempStore";

const { width } = Dimensions.get("window");

export default function ProductResultScreen() {
    const router = useRouter();

    const { data, image } = TempStore.getResult();

    const imageUri = image || undefined;

    if (!data) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={Colors.gray[400]} />
                    <Text style={styles.errorText}>Analiz verisi bulunamadı.</Text>
                    <TouchableOpacity style={styles.backButtonSimple} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Geri Dön</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const { product, scores } = data;

    return (
        <View style={styles.container}>
            {/* 1. HEADER (Resim ve Geri Butonu) */}
            <View style={styles.header}>
                {/* HATA ÇÖZÜMÜ: uri varsa göster, yoksa gösterme */}
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.productImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.productImage, { backgroundColor: Colors.gray[200] }]} />
                )}

                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent']}
                    style={styles.headerGradient}
                />
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 2. ÜRÜN KİMLİĞİ */}
                <View style={styles.titleSection}>
                    <Text style={styles.brandText}>{product.brand || "Marka Bilinmiyor"}</Text>
                    <Text style={styles.productName}>{product.name || "Ürün Adı"}</Text>
                    <View style={styles.badgesRow}>
                        {product.isFood ? (
                            <View style={styles.badge}><Text style={styles.badgeText}>Gıda Ürünü</Text></View>
                        ) : (
                            <View style={[styles.badge, { backgroundColor: Colors.error }]}><Text style={styles.badgeText}>Gıda Değil</Text></View>
                        )}
                        <View style={[styles.badge, { backgroundColor: Colors.gray[200] }]}><Text style={[styles.badgeText, { color: Colors.secondary }]}>{product.category || "Kategorisiz"}</Text></View>
                    </View>
                </View>

                {/* 3. SKOR KARTI */}
                <View style={styles.scoreCard}>
                    <Text style={styles.sectionTitle}>ANALİZ ÖZETİ</Text>
                    <View style={styles.ringsRow}>
                        {/* Güvenlik Skoru */}
                        <ScoreRing
                            score={scores.safety?.value || 0}
                            label="GÜVENLİK"
                            type="safety"
                            size={100}
                        />

                        {/* Ayırıcı Çizgi */}
                        <View style={styles.verticalDivider} />

                        {/* Uyum Skoru */}
                        <ScoreRing
                            score={scores.compatibility?.value || 0}
                            label="UYUM"
                            type="compatibility"
                            size={100}
                        />
                    </View>

                    {/* Uyum Yorumu */}
                    {scores.compatibility?.verdict && (
                        <View style={[styles.verdictBox, { backgroundColor: scores.compatibility.value > 50 ? '#ECFDF5' : '#FEF2F2' }]}>
                            <Ionicons
                                name={scores.compatibility.value > 50 ? "happy-outline" : "alert-circle-outline"}
                                size={20}
                                color={scores.compatibility.value > 50 ? Colors.success : Colors.error}
                            />
                            <Text style={[styles.verdictText, { color: scores.compatibility.value > 50 ? Colors.success : Colors.error }]}>
                                {scores.compatibility.verdict}
                            </Text>
                        </View>
                    )}
                </View>

                {/* --- BURAYA DETAY KARTLARI GELECEK --- */}
                <View style={{ height: 50 }} />

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
    },
    header: {
        height: 250,
        width: '100%',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
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
        zIndex: 10,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    titleSection: {
        padding: 20,
        backgroundColor: Colors.white,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginTop: -20,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5,
    },
    brandText: {
        fontSize: 14,
        color: Colors.gray[500],
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    productName: {
        fontSize: 22,
        fontWeight: "800",
        color: Colors.secondary,
        marginVertical: 4,
    },
    badgesRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: Colors.primary,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: Colors.white,
    },
    scoreCard: {
        margin: 20,
        marginTop: 16,
        padding: 20,
        backgroundColor: Colors.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.gray[200],
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "800",
        color: Colors.gray[400],
        letterSpacing: 1,
        marginBottom: 16,
    },
    ringsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    verticalDivider: {
        width: 1,
        height: '60%',
        backgroundColor: Colors.gray[200],
    },
    verdictBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 20,
        padding: 12,
        borderRadius: 12,
        width: '100%',
    },
    verdictText: {
        fontSize: 13,
        fontWeight: "600",
        flex: 1,
    },
    // Hata Durumu İçin
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
    }
});