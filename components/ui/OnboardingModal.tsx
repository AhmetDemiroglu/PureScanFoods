import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Modal,
    Animated,
    Easing,
    ScrollView,
} from "react-native";
import Svg, {
    Defs,
    LinearGradient as SvgLinearGradient,
    Stop,
    Circle,
    Rect,
    Path,
    G,
} from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

export interface OnboardingSlide {
    title: string;
    desc: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
}

interface Props {
    visible: boolean;
    onFinish: () => void;
    slides: OnboardingSlide[];
    finishLabel?: string;
    nextLabel?: string;
}

// --- FLOATING ANIMATION ---
const FloatingElement = ({
    children,
    duration = 3500,
    range = 8,
}: {
    children: React.ReactNode;
    duration?: number;
    range?: number;
}) => {
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: -range,
                    duration,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [duration, range, translateY]);

    return <Animated.View style={{ transform: [{ translateY }] }}>{children}</Animated.View>;
};

// --- SVG ILLUSTRATION ---
const SlideIllustration = ({ icon, iconColor, iconBg }: { icon: keyof typeof Ionicons.glyphMap; iconColor: string; iconBg: string }) => {
    // Derive accent from iconColor for the ring/particles
    const accent = iconColor;

    return (
        <View style={illustrationStyles.container}>
            <FloatingElement duration={3800}>
                <View style={illustrationStyles.wrapper}>
                    <Svg width={200} height={170} viewBox="0 0 200 170" style={illustrationStyles.svg}>
                        <Defs>
                            <SvgLinearGradient id="obBg" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0" stopColor={accent} stopOpacity="0.10" />
                                <Stop offset="1" stopColor={accent} stopOpacity="0.02" />
                            </SvgLinearGradient>
                            <SvgLinearGradient id="obRing" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0" stopColor={accent} stopOpacity="0.25" />
                                <Stop offset="1" stopColor={accent} stopOpacity="0.08" />
                            </SvgLinearGradient>
                        </Defs>

                        {/* Background glow */}
                        <Circle cx="100" cy="85" r="80" fill="url(#obBg)" />

                        {/* Outer decorative ring */}
                        <Circle cx="100" cy="85" r="60" fill="none" stroke="url(#obRing)" strokeWidth="1.5" strokeDasharray="6,4" />

                        {/* Main icon background circle */}
                        <Circle cx="100" cy="85" r="44" fill={iconBg} />
                        <Circle cx="100" cy="85" r="44" fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.15" />

                        {/* Floating accent particles */}
                        <G opacity="0.5">
                            <Circle cx="36" cy="55" r="4" fill={accent} opacity="0.3" />
                            <Circle cx="164" cy="45" r="3" fill={accent} opacity="0.25" />
                            <Circle cx="155" cy="130" r="5" fill={accent} opacity="0.15" />
                            <Circle cx="45" cy="125" r="3.5" fill={accent} opacity="0.2" />
                        </G>

                        {/* Small decorative elements */}
                        <G opacity="0.6">
                            <Rect x="22" y="90" width="12" height="12" rx="4" fill={iconBg} stroke={accent} strokeWidth="0.8" strokeOpacity="0.3" />
                            <Path d="M25 96 L28 99 L31 94" stroke={accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                        </G>
                        <G opacity="0.6">
                            <Rect x="166" y="80" width="12" height="12" rx="4" fill={iconBg} stroke={accent} strokeWidth="0.8" strokeOpacity="0.3" />
                            <Circle cx="172" cy="86" r="2" fill={accent} opacity="0.4" />
                        </G>
                    </Svg>

                    {/* Icon overlay (rendered as RN component for crisp icon) */}
                    <View style={illustrationStyles.iconOverlay}>
                        <Ionicons name={icon} size={44} color={iconColor} />
                    </View>
                </View>
            </FloatingElement>
        </View>
    );
};

const illustrationStyles = StyleSheet.create({
    container: {
        height: 180,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    wrapper: {
        width: 200,
        height: 170,
        position: "relative",
    },
    svg: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    iconOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 0,
    },
});

// --- MAIN COMPONENT ---
export const OnboardingModal = ({ visible, onFinish, slides, finishLabel, nextLabel }: Props) => {
    const [step, setStep] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setStep(0);
            fadeAnim.setValue(1);
            slideAnim.setValue(0);
        }
    }, [visible, fadeAnim, slideAnim]);

    const animateToStep = (nextStep: number) => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -16, duration: 140, useNativeDriver: true }),
        ]).start(() => {
            setStep(nextStep);
            slideAnim.setValue(16);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            ]).start();
        });
    };

    const handleNext = () => {
        if (step < slides.length - 1) {
            animateToStep(step + 1);
        } else {
            onFinish();
        }
    };

    const handleSkip = () => {
        onFinish();
    };

    if (!visible || slides.length === 0) return null;

    const current = slides[step];
    const isLast = step === slides.length - 1;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <ScrollView
                        contentContainerStyle={styles.cardContent}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        {/* Top row: step indicator + skip */}
                        <View style={styles.topRow}>
                            <View style={styles.stepIndicator}>
                                <Text style={styles.stepText}>
                                    {step + 1}/{slides.length}
                                </Text>
                            </View>
                            {!isLast && (
                                <Pressable
                                    style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.6 }]}
                                    onPress={handleSkip}
                                >
                                    <Text style={styles.skipText}>
                                        {finishLabel || "OK"}
                                    </Text>
                                </Pressable>
                            )}
                        </View>

                        {/* Animated content */}
                        <Animated.View
                            style={[
                                styles.animatedContent,
                                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                            ]}
                        >
                            <SlideIllustration
                                icon={current.icon}
                                iconColor={current.iconColor}
                                iconBg={current.iconBg}
                            />

                            <Text style={styles.title}>{current.title}</Text>
                            <Text style={styles.description}>{current.desc}</Text>
                        </Animated.View>

                        {/* Progress bar */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBg}>
                                <Animated.View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${((step + 1) / slides.length) * 100}%`,
                                            backgroundColor: current.iconColor,
                                        },
                                    ]}
                                />
                            </View>
                        </View>

                        {/* Primary button */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.button,
                                { backgroundColor: current.iconColor },
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={handleNext}
                        >
                            <Text style={styles.buttonText}>
                                {isLast
                                    ? (finishLabel || "OK")
                                    : (nextLabel || "Next")}
                            </Text>
                            <Ionicons
                                name={isLast ? "checkmark" : "arrow-forward"}
                                size={20}
                                color={Colors.white}
                            />
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
        backgroundColor: "rgba(0,0,0,0.82)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 24,
    },
    card: {
        width: "100%",
        maxWidth: 370,
        maxHeight: "88%",
        backgroundColor: Colors.white,
        borderRadius: 28,
        elevation: 14,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
    },
    cardContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
        alignItems: "center",
    },
    topRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    stepIndicator: {
        backgroundColor: Colors.gray[100],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    stepText: {
        fontSize: 11,
        fontWeight: "700",
        color: Colors.gray[400],
        letterSpacing: 0.5,
    },
    skipButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    skipText: {
        fontSize: 13,
        color: Colors.gray[400],
        fontWeight: "600",
    },
    animatedContent: {
        alignItems: "center",
        width: "100%",
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: Colors.secondary,
        textAlign: "center",
        marginBottom: 10,
        letterSpacing: -0.3,
    },
    description: {
        fontSize: 14.5,
        color: Colors.gray[500],
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    progressContainer: {
        width: "100%",
        marginBottom: 16,
    },
    progressBg: {
        height: 4,
        backgroundColor: Colors.gray[100],
        borderRadius: 2,
        overflow: "hidden",
    },
    progressFill: {
        height: 4,
        borderRadius: 2,
    },
    button: {
        width: "100%",
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        color: Colors.white,
        fontWeight: "700",
        fontSize: 16,
    },
});
