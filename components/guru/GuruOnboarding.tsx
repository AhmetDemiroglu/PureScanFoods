import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Modal, Dimensions, Animated, Easing, ScrollView } from "react-native";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Rect, Path, G, Line } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

// --- ANIMATION HELPER ---
const FloatingElement = ({ children, duration = 4000, delay = 0 }: { children: React.ReactNode, duration?: number, delay?: number }) => {
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: -8,
                    duration: duration,
                    delay: delay,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: duration,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true
                })
            ])
        ).start();
    }, []);

    return <Animated.View style={{ transform: [{ translateY }] }}>{children}</Animated.View>;
};

// --- ILLUSTRATIONS ---
const ShelfIllustration = () => (
    <Svg width={200} height={200} viewBox="0 0 200 200">
        <Defs>
            <SvgLinearGradient id="shelfGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.2" />
                <Stop offset="1" stopColor="#E65100" stopOpacity="0.1" />
            </SvgLinearGradient>
            <SvgLinearGradient id="bottleGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#F472B6" />
                <Stop offset="1" stopColor="#DB2777" />
            </SvgLinearGradient>
        </Defs>
        <Circle cx="100" cy="100" r="80" fill="url(#shelfGrad)" />

        {/* Dolap Rafı */}
        <Rect x="40" y="40" width="120" height="130" rx="12" fill="#FFFFFF" stroke={Colors.primary} strokeWidth="2" />
        <Line x1="45" y1="85" x2="155" y2="85" stroke={Colors.gray[200]} strokeWidth="2" />
        <Line x1="45" y1="130" x2="155" y2="130" stroke={Colors.gray[200]} strokeWidth="2" />

        {/* Ürünler - Hareketli Gruplar */}
        <G>
            <Rect x="55" y="55" width="20" height="30" rx="4" fill="url(#bottleGrad)" />
            <Rect x="80" y="60" width="15" height="25" rx="3" fill="#93C5FD" />
            <Circle cx="115" cy="70" r="12" fill="#FCD34D" />
            <Rect x="135" y="50" width="12" height="35" rx="2" fill={Colors.success} />
        </G>

        <G>
            <Rect x="60" y="100" width="25" height="30" rx="6" fill={Colors.primary} opacity="0.6" />
            <Rect x="95" y="105" width="18" height="25" rx="3" fill="#A855F7" />
        </G>
    </Svg>
);

const SecurityIllustration = () => (
    <Svg width={200} height={200} viewBox="0 0 200 200">
        <Defs>
            <SvgLinearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#EF4444" stopOpacity="0.1" />
                <Stop offset="1" stopColor="#B91C1C" stopOpacity="0.05" />
            </SvgLinearGradient>
        </Defs>
        <Circle cx="100" cy="100" r="80" fill="url(#shieldGrad)" />

        {/* Kalkan ve Uyarı */}
        <G>
            <Path d="M100 40 L140 60 V100 C140 130 100 160 100 160 C100 160 60 130 60 100 V60 L100 40 Z" fill="#FFFFFF" stroke={Colors.error} strokeWidth="3" />
            <Path d="M100 80 V110" stroke={Colors.error} strokeWidth="4" strokeLinecap="round" />
            <Circle cx="100" cy="125" r="3" fill={Colors.error} />
        </G>

        {/* Yüzen Doktor Simgeleri */}
        <Circle cx="50" cy="80" r="4" fill={Colors.gray[300]} />
        <Path d="M45 80 H55 M50 75 V85" stroke={Colors.gray[400]} strokeWidth="2" />

        <Circle cx="150" cy="120" r="4" fill={Colors.gray[300]} />
    </Svg>
);

// --- MAIN COMPONENT ---
interface Props {
    visible: boolean;
    onFinish: () => void;
}

export const GuruOnboarding = ({ visible, onFinish }: Props) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (visible) {
            setStep(0);
        }
    }, [visible]);

    const slides = [
        {
            id: 1,
            title: t("guru.onboarding.slide1Title"),
            desc: t("guru.onboarding.slide1Desc"),
            Illustration: ShelfIllustration,
        },
        {
            id: 2,
            title: t("guru.onboarding.slide2Title"),
            desc: t("guru.onboarding.slide2Desc"),
            Illustration: SecurityIllustration,
        }
    ];

    const handleNext = () => {
        if (step < slides.length - 1) {
            setStep(step + 1);
        } else {
            onFinish();
        }
    };

    if (!visible) return null;

    const CurrentIllustration = slides[step].Illustration;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <ScrollView
                        contentContainerStyle={styles.cardContent}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        {/* Illustration Area */}
                        <View style={styles.illustrationContainer}>
                            <FloatingElement>
                                <CurrentIllustration />
                            </FloatingElement>
                        </View>

                        {/* Text Area */}
                        <Text style={styles.title}>{slides[step].title}</Text>
                        <Text style={styles.description}>{slides[step].desc}</Text>

                        {/* Dots */}
                        <View style={styles.dotsContainer}>
                            {slides.map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.dot,
                                        i === step ? styles.activeDot : styles.inactiveDot
                                    ]}
                                />
                            ))}
                        </View>

                        {/* Button */}
                        <Pressable style={styles.button} onPress={handleNext}>
                            <Text style={styles.buttonText}>
                                {step === slides.length - 1
                                    ? t("guru.onboarding.finishBtn")
                                    : t("guru.onboarding.nextBtn")}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    card: {
        width: "100%",
        maxWidth: 360,
        maxHeight: "85%",
        backgroundColor: Colors.white,
        borderRadius: 32,
        elevation: 10,
        shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20
    },
    cardContent: {
        padding: 32,
        alignItems: "center",
    },
    illustrationContainer: {
        height: 200,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: Colors.secondary,
        textAlign: "center",
        marginBottom: 12
    },
    description: {
        fontSize: 15,
        color: Colors.gray[500],
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 32,
        minHeight: 44
    },
    dotsContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 24
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
    activeDot: {
        width: 24,
        backgroundColor: Colors.primary
    },
    inactiveDot: {
        width: 6,
        backgroundColor: Colors.gray[200]
    },
    button: {
        backgroundColor: Colors.primary,
        width: "100%",
        paddingVertical: 16,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
    },
    buttonText: {
        color: Colors.white,
        fontWeight: "700",
        fontSize: 16
    }
});
