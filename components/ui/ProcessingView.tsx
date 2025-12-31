import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from "react-native";
import LottieView from "lottie-react-native";
import { Colors } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// --- SABİT VERİLER ---
const STEPS = [
    { id: 1, label: "Görüntü İşleniyor...", icon: "image-outline" },
    { id: 2, label: "Metin Ayrıştırılıyor...", icon: "text-outline" },
    { id: 3, label: "Besin Değerleri Analiz Ediliyor...", icon: "nutrition-outline" },
    { id: 4, label: "Sonuçlar Hazırlanıyor...", icon: "checkmark-circle-outline" },
];

const FACTS = [
    "Bir elma, sabahları uyanmanıza kahveden daha fazla yardımcı olabilir.",
    "Bal, bozulmayan tek gıdadır.",
    "Çilek aslında bir meyve değil, gül ailesindendir.",
    "Patatesler WiFi sinyallerini emebilir ve yansıtabilir.",
    "Çikolata, antik zamanlarda para birimi olarak kullanılmıştır.",
    "Domates aslında bir meyvedir, sebze değil.",
    "Muzlar radyoaktiftir (çok az miktarda potasyum nedeniyle).",
];

const LONG_WAIT_MESSAGES = [
    "Detaylara iniyoruz...",
    "Yapay zeka verileri karşılaştırıyor...",
    "Neredeyse bitti, sabrınız için teşekkürler...",
    "Son rötuşlar yapılıyor...",
];

export default function ProcessingView() {
    const [currentStep, setCurrentStep] = useState(0);
    const [factIndex, setFactIndex] = useState(0);
    const [showLongWait, setShowLongWait] = useState(false);
    const [longWaitIndex, setLongWaitIndex] = useState(0);

    // Animasyon Değerleri
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    // 1. Adım İlerlemesi (Simülasyon)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
        }, 2500); // Her 2.5 saniyede bir adım atla

        return () => clearInterval(interval);
    }, []);

    // 2. Bilgi Kartı Döngüsü (Random)
    useEffect(() => {
        setFactIndex(Math.floor(Math.random() * FACTS.length)); // İlk açılışta rastgele
        const interval = setInterval(() => {
            // Fade Out
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 20, duration: 300, useNativeDriver: true }),
            ]).start(() => {
                // Değiştir
                setFactIndex((prev) => (prev + 1) % FACTS.length);
                // Fade In
                Animated.parallel([
                    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                    Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
                ]).start();
            });
        }, 4000); // 4 saniyede bir bilgi değişsin

        return () => clearInterval(interval);
    }, []);

    // 3. Uzun Bekleme Kontrolü
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLongWait(true);
        }, 8000); // 8 saniye sonra uzun bekleme mesajları başlasın

        return () => clearTimeout(timer);
    }, []);

    // 4. Uzun Bekleme Mesaj Döngüsü
    useEffect(() => {
        if (showLongWait) {
            const interval = setInterval(() => {
                setLongWaitIndex((prev) => (prev + 1) % LONG_WAIT_MESSAGES.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [showLongWait]);

    return (
        <View style={styles.container}>
            {/* ÜST KISIM: Animasyon */}
            <View style={styles.animationContainer}>
                {/* Placeholder Lottie - Kendi json dosyanı assets'e koyup require ile alabilirsin */}
                <LottieView
                    source={{ uri: "https://lottie.host/56799056-7889-49fa-9481-987779f64949/lJ3g8J2XoP.json" }} // Örnek: Yürüyen yiyecekler / tarama
                    autoPlay
                    loop
                    style={{ width: 250, height: 250 }}
                />
            </View>

            {/* ORTA KISIM: Adımlar (Stepper) */}
            <View style={styles.stepsContainer}>
                {STEPS.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <View key={step.id} style={styles.stepRow}>
                            <View style={[styles.iconBox, (isActive || isCompleted) && styles.activeIconBox]}>
                                {isCompleted ? (
                                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                                ) : (
                                    <Ionicons name={step.icon as any} size={16} color={isActive ? Colors.white : Colors.gray[400]} />
                                )}
                            </View>
                            <Text style={[styles.stepText, isActive && styles.activeStepText, isCompleted && styles.completedStepText]}>
                                {step.label}
                            </Text>
                            {isActive && <LottieView source={require('../assets/loading-dots.json')} autoPlay loop style={{ width: 40, height: 20 }} />}
                            {/* Not: loading-dots.json yoksa activity indicator koyabiliriz */}
                        </View>
                    );
                })}
            </View>

            {/* ALT KISIM: Bilgi Kartı & Uzun Bekleme */}
            <View style={styles.bottomContainer}>
                {/* Bunları Biliyor Muydunuz? */}
                <View style={styles.factCard}>
                    <View style={styles.factHeader}>
                        <Ionicons name="bulb" size={18} color="#F59E0B" />
                        <Text style={styles.factTitle}>Bunları Biliyor Muydunuz?</Text>
                    </View>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <Text style={styles.factText}>{FACTS[factIndex]}</Text>
                    </Animated.View>
                </View>

                {/* Uzun Süren İşlem  */}
                {showLongWait && (
                    <View style={styles.longWaitContainer}>
                        <LottieView
                            source={{ uri: "https://lottie.host/02030095-23c2-4099-9061-687836376594/8w5g7g3J3f.json" }} // Kum saati vb.
                            autoPlay loop style={{ width: 30, height: 30 }}
                        />
                        <Text style={styles.longWaitText}>{LONG_WAIT_MESSAGES[longWaitIndex]}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
        paddingTop: 60,
        paddingHorizontal: 24,
        alignItems: "center",
    },
    animationContainer: {
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepsContainer: {
        width: "100%",
        gap: 20,
        marginBottom: 40,
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.gray[100],
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    activeIconBox: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    stepText: {
        fontSize: 15,
        color: Colors.gray[400],
        fontWeight: "500",
        flex: 1,
    },
    activeStepText: {
        color: Colors.secondary,
        fontWeight: "700",
    },
    completedStepText: {
        color: Colors.gray[600],
        textDecorationLine: "line-through",
    },
    bottomContainer: {
        width: "100%",
        position: 'absolute',
        bottom: 40,
        gap: 16,
    },
    factCard: {
        backgroundColor: "rgba(255,255,255,0.8)",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    factHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    factTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#F59E0B",
        textTransform: "uppercase",
    },
    factText: {
        fontSize: 14,
        color: Colors.secondary,
        lineHeight: 20,
        fontWeight: "500",
    },
    longWaitContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF6FF',
        padding: 10,
        borderRadius: 12,
        gap: 10,
    },
    longWaitText: {
        fontSize: 12,
        color: '#1E40AF',
        fontWeight: '600',
    }
});