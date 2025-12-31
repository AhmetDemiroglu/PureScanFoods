import React, { useEffect, useState, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Dimensions, Animated, Easing, ActivityIndicator } from "react-native";
import LottieView from "lottie-react-native";
import { Colors } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");

// --- LOGOLU SPINNER ---
const LogoSpinner = () => {
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={styles.spinnerContainer}>
            <Animated.View style={[styles.spinningRingContainer, { transform: [{ rotate: spin }] }]}>
                <LinearGradient
                    colors={[Colors.primary, Colors.secondary, Colors.primary]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.spinningRingGradient}
                />
            </Animated.View>

            <View style={styles.logoContainer}>
                <LinearGradient
                    colors={[Colors.primary, "#E65100"]}
                    style={styles.logoGradient}
                >
                    <Ionicons name="scan" size={24} color={Colors.white} />
                </LinearGradient>
            </View>
        </View>
    );
};

export default function ProcessingView() {
    const { t } = useTranslation();

    const STEPS = useMemo(() => [
        { id: 1, label: t("processing.steps.1", { defaultValue: "Görüntü Taranıyor..." }), icon: "scan-outline" },
        { id: 2, label: t("processing.steps.2", { defaultValue: "Yapay Zeka Analizi..." }), icon: "hardware-chip-outline" },
        { id: 3, label: t("processing.steps.3", { defaultValue: "Veriler İşleniyor..." }), icon: "server-outline" },
        { id: 4, label: t("processing.steps.4", { defaultValue: "Sonuçlar Hazırlanıyor..." }), icon: "document-text-outline" },
    ], [t]);

    const FACTS = (t("processing.facts", { returnObjects: true }) as string[]) || ["İlginç bilgi yükleniyor..."];
    const LONG_WAIT_MESSAGES = (t("processing.waitMessages", { returnObjects: true }) as string[]) || ["Lütfen bekleyin..."];

    const [currentStep, setCurrentStep] = useState(0);
    const [factIndex, setFactIndex] = useState(0);
    const [showLongWait, setShowLongWait] = useState(false);
    const [longWaitIndex, setLongWaitIndex] = useState(0);

    // --- ANİMASYON DEĞERLERİ (BAĞIMSIZ) ---
    const stepProgressAnim = useRef(new Animated.Value(0)).current;
    const factFadeAnim = useRef(new Animated.Value(1)).current;
    const waitFadeAnim = useRef(new Animated.Value(0)).current;

    // 1. Adım İlerlemesi
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prev) => {
                const next = prev < STEPS.length - 1 ? prev + 1 : prev;
                Animated.timing(stepProgressAnim, {
                    toValue: (next / (STEPS.length - 1)),
                    duration: 500,
                    useNativeDriver: false,
                }).start();
                return next;
            });
        }, 2500);
        return () => clearInterval(interval);
    }, [STEPS.length]);

    // 2. BİLGİ KARTI DÖNGÜSÜ (Random + Akıllı Süre)
    useEffect(() => {
        setFactIndex(Math.floor(Math.random() * FACTS.length));

        let timer: NodeJS.Timeout;

        const cycleFact = () => {
            const currentText = FACTS[factIndex] || "";
            const wordCount = currentText.split(" ").length;

            // Senin istediğin formül:
            const readingTime = Math.max(2500, wordCount * 100 + 1000);

            timer = setTimeout(() => {
                Animated.timing(factFadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    setFactIndex(Math.floor(Math.random() * FACTS.length));

                    Animated.timing(factFadeAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }).start(() => {
                        cycleFact();
                    });
                });
            }, readingTime);
        };

        cycleFact();
        return () => clearTimeout(timer);
    }, []);

    // 3. UZUN BEKLEME TETİKLEYİCİSİ (10 Saniye Sonra)
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLongWait(true);
            Animated.timing(waitFadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    // 4. UZUN BEKLEME MESAJ DÖNGÜSÜ (Sıralı)
    useEffect(() => {
        if (!showLongWait) return;

        let waitTimer: NodeJS.Timeout;

        const cycleWaitMessage = () => {
            waitTimer = setTimeout(() => {
                // Fade Out
                Animated.timing(waitFadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    // Change Text (Sıralı)
                    setLongWaitIndex((prev) => (prev + 1) % LONG_WAIT_MESSAGES.length);

                    // Fade In
                    Animated.timing(waitFadeAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }).start(() => {
                        cycleWaitMessage(); // Loop
                    });
                });
            }, 3000); // 3 saniyede bir değişsin
        };

        cycleWaitMessage();
        return () => clearTimeout(waitTimer);
    }, [showLongWait]);

    const progressWidth = stepProgressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.surface, '#FFF8E1']}
                style={StyleSheet.absoluteFill}
            />

            {/* ÜST KISIM */}
            <View style={styles.topSection}>
                <LottieView
                    source={require('../../assets/scanning-character.json')}
                    autoPlay
                    loop
                    style={styles.mainAnimation}
                />
                <Text style={styles.title}>Analiz Ediliyor...</Text>
            </View>

            {/* ORTA KISIM */}
            <View style={styles.middleSection}>
                <View style={styles.progressBarBg}>
                    <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
                </View>

                <View style={styles.stepsContainer}>
                    {STEPS.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <View key={step.id} style={styles.stepItem}>
                                <View style={[styles.iconBox, (isActive || isCompleted) && styles.activeIconBox]}>
                                    <Ionicons
                                        name={isCompleted ? "checkmark" : step.icon as any}
                                        size={18}
                                        color={(isActive || isCompleted) ? Colors.white : Colors.gray[400]}
                                    />
                                </View>
                                <Text style={[styles.stepText, isActive ? styles.activeStepText : styles.hiddenStepText]}>
                                    {step.label}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* ALT KISIM: Spinner ve Bilgiler */}
            <View style={styles.bottomSection}>
                <LogoSpinner />

                {/* 1. KUTU: SABİT BİLGİ KARTI (Daha kompakt) */}
                <View style={styles.factContainer}>
                    <Text style={styles.factTitle}>{t("processing.didYouKnow", { defaultValue: "BUNLARI BİLİYOR MUYDUNUZ?" })}</Text>
                    <Animated.View style={{ opacity: factFadeAnim }}>
                        <Text style={styles.factText}>
                            {FACTS[factIndex]}
                        </Text>
                    </Animated.View>
                </View>

                {/* 2. KUTU: UZUN BEKLEME BİLDİRİMİ (Sonradan açılır) */}
                {showLongWait && (
                    <Animated.View style={[styles.waitMessageContainer, { opacity: waitFadeAnim }]}>
                        <ActivityIndicator size="small" color="#E65100" style={{ marginRight: 8 }} />
                        <Text style={styles.waitMessageText}>
                            {LONG_WAIT_MESSAGES[longWaitIndex]}
                        </Text>
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
        paddingTop: height * 0.06,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingBottom: height * 0.04,
    },
    topSection: {
        alignItems: 'center',
        flex: 2,
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    mainAnimation: {
        width: width * 0.7,
        height: width * 0.7,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.secondary,
        marginTop: 10,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    middleSection: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: Colors.gray[200],
        borderRadius: 2,
        marginBottom: 20,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 2,
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    stepItem: {
        alignItems: 'center',
        width: width / 4.5,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.gray[100],
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
        borderWidth: 1.5,
        borderColor: Colors.gray[200],
        elevation: 1,
    },
    activeIconBox: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
        elevation: 4,
        shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 4,
    },
    stepText: {
        fontSize: 10,
        color: Colors.gray[500],
        fontWeight: "600",
        textAlign: 'center',
        position: 'absolute',
        top: 45,
        width: 100,
    },
    activeStepText: {
        color: Colors.secondary,
        fontWeight: "700",
        opacity: 1,
    },
    hiddenStepText: {
        opacity: 0,
    },
    bottomSection: {
        flex: 1.8,
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
    },
    spinnerContainer: {
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    spinningRingContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 30,
        overflow: 'hidden',
        padding: 3,
    },
    spinningRingGradient: {
        flex: 1,
        borderRadius: 30,
    },
    logoContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        elevation: 3,
    },
    logoGradient: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    factContainer: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: Colors.gray[200],
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        minHeight: 80,
        justifyContent: 'center',
    },
    factTitle: {
        fontSize: 10,
        fontWeight: "800",
        color: Colors.primary,
        marginBottom: 4,
        letterSpacing: 1,
        opacity: 0.8,
    },
    factText: {
        fontSize: 13,
        color: Colors.secondary,
        fontWeight: "600",
        textAlign: 'center',
        lineHeight: 18,
    },
    waitMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF3E0',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFE0B2',
        marginTop: 4,
        width: '90%',
    },
    waitMessageText: {
        fontSize: 11,
        color: '#E65100',
        fontWeight: '700',
    }
});