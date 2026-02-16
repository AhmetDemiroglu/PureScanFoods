import React, { useEffect, useRef, useState } from "react";
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
  Line,
} from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "../../constants/colors";

// --- FLOATING ANIMATION ---
const FloatingElement = ({
  children,
  duration = 3500,
  range = 10,
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

// =============================================
// ILLUSTRATION 1: SCAN - product card + corners
// =============================================
const ScanIllustration = () => (
  <View style={illustrationStyles.container}>
    <FloatingElement duration={3800}>
      <Svg width={220} height={190} viewBox="0 0 220 190">
        <Defs>
          <SvgLinearGradient id="scanCircle" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.15" />
            <Stop offset="1" stopColor="#E65100" stopOpacity="0.05" />
          </SvgLinearGradient>
          <SvgLinearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#FFF7ED" />
          </SvgLinearGradient>
          <SvgLinearGradient id="scanLine" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={Colors.primary} stopOpacity="0" />
            <Stop offset="0.5" stopColor={Colors.primary} stopOpacity="1" />
            <Stop offset="1" stopColor={Colors.primary} stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle cx="110" cy="95" r="88" fill="url(#scanCircle)" />

        {/* Product card */}
        <Rect x="55" y="22" width="110" height="146" rx="16" fill="url(#cardGrad)" stroke={Colors.gray[200]} strokeWidth="1.5" />

        {/* Product image placeholder */}
        <Rect x="70" y="36" width="80" height="50" rx="10" fill={Colors.gray[100]} />
        <Circle cx="110" cy="56" r="12" fill={Colors.gray[200]} />
        <Path d="M105 56 L115 56 M110 51 L110 61" fill="none" stroke={Colors.gray[300]} strokeWidth="2" strokeLinecap="round" />

        {/* Text lines */}
        <Rect x="70" y="96" width="68" height="7" rx="3.5" fill={Colors.gray[300]} />
        <Rect x="70" y="109" width="52" height="7" rx="3.5" fill={Colors.gray[200]} />

        {/* Score badge */}
        <Rect x="70" y="126" width="44" height="20" rx="10" fill={Colors.success} />
        <Rect x="120" y="126" width="26" height="20" rx="10" fill="#F0FDF4" stroke={Colors.success} strokeWidth="1" />

        {/* Scan corners - fill="none" prevents black triangles */}
        <Path d="M42 50 L42 30 L62 30" fill="none" stroke={Colors.primary} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M178 50 L178 30 L158 30" fill="none" stroke={Colors.primary} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M42 140 L42 160 L62 160" fill="none" stroke={Colors.primary} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M178 140 L178 160 L158 160" fill="none" stroke={Colors.primary} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Scan line */}
        <Rect x="48" y="92" width="124" height="3" rx="1.5" fill="url(#scanLine)" opacity="0.7" />

        {/* Floating particles */}
        <Circle cx="30" cy="70" r="4" fill={Colors.primary} opacity="0.2" />
        <Circle cx="190" cy="50" r="3" fill={Colors.success} opacity="0.3" />
        <Circle cx="185" cy="140" r="5" fill={Colors.warning} opacity="0.2" />
      </Svg>
    </FloatingElement>
  </View>
);

// =============================================
// ILLUSTRATION 2: AI INSIGHTS - bot + bubbles
// =============================================
const InsightIllustration = () => (
  <View style={illustrationStyles.container}>
    <FloatingElement duration={4000}>
      <Svg width={220} height={190} viewBox="0 0 220 190">
        <Defs>
          <SvgLinearGradient id="aiBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#7C3AED" stopOpacity="0.12" />
            <Stop offset="1" stopColor="#A855F7" stopOpacity="0.04" />
          </SvgLinearGradient>
          <SvgLinearGradient id="botGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.primary} />
            <Stop offset="1" stopColor="#E65100" />
          </SvgLinearGradient>
        </Defs>

        <Circle cx="110" cy="95" r="88" fill="url(#aiBg)" />

        {/* User message bubble */}
        <Rect x="80" y="24" width="120" height="38" rx="14" fill="#FFFFFF" stroke={Colors.gray[200]} strokeWidth="1.5" />
        <Rect x="92" y="37" width="70" height="6" rx="3" fill={Colors.gray[300]} />
        <Rect x="92" y="47" width="45" height="6" rx="3" fill={Colors.gray[200]} />

        {/* AI Bot avatar */}
        <Circle cx="38" cy="100" r="22" fill="url(#botGrad)" />
        <Path d="M30 96 L38 104 L46 96" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="38" cy="90" r="3" fill="#FFF" />

        {/* AI response bubble */}
        <Rect x="66" y="78" width="136" height="62" rx="14" fill="#FFFFFF" stroke={Colors.primary} strokeWidth="1.5" />

        {/* Allergen warning chip */}
        <Rect x="78" y="90" width="60" height="18" rx="9" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1" />
        <Circle cx="88" cy="99" r="4" fill={Colors.error} />

        {/* Diet match chip */}
        <Rect x="144" y="90" width="48" height="18" rx="9" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
        <Circle cx="154" cy="99" r="4" fill={Colors.success} />

        {/* Analysis lines */}
        <Rect x="78" y="116" width="105" height="6" rx="3" fill={Colors.gray[200]} />
        <Rect x="78" y="126" width="78" height="6" rx="3" fill={Colors.primary} opacity="0.4" />

        {/* Checkmark badge */}
        <Circle cx="176" cy="155" r="14" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
        <Path d="M171 155 L175 159 L182 151" fill="none" stroke={Colors.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </FloatingElement>
  </View>
);

// =============================================
// ILLUSTRATION 3: FAMILY - connected avatars
// =============================================
const FamilyIllustration = () => (
  <View style={illustrationStyles.container}>
    <FloatingElement duration={3600}>
      <Svg width={220} height={190} viewBox="0 0 220 190">
        <Defs>
          <SvgLinearGradient id="famBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#0284C7" stopOpacity="0.12" />
            <Stop offset="1" stopColor="#0EA5E9" stopOpacity="0.04" />
          </SvgLinearGradient>
        </Defs>

        <Circle cx="110" cy="95" r="88" fill="url(#famBg)" />

        {/* Main user avatar */}
        <Circle cx="110" cy="58" r="24" fill={Colors.primary} />
        <Circle cx="110" cy="50" r="8" fill="#FFF" />
        <Path d="M100 62 Q110 72 120 62" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />

        {/* Family member left */}
        <Circle cx="56" cy="100" r="18" fill="#0EA5E9" />
        <Circle cx="56" cy="94" r="6" fill="#FFF" />
        <Path d="M49 104 Q56 111 63 104" fill="none" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />

        {/* Family member right */}
        <Circle cx="164" cy="100" r="18" fill="#A855F7" />
        <Circle cx="164" cy="94" r="6" fill="#FFF" />
        <Path d="M157 104 Q164 111 171 104" fill="none" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />

        {/* Connection lines */}
        <Line x1="90" y1="72" x2="70" y2="88" stroke={Colors.gray[300]} strokeWidth="1.5" strokeDasharray="4,3" />
        <Line x1="130" y1="72" x2="150" y2="88" stroke={Colors.gray[300]} strokeWidth="1.5" strokeDasharray="4,3" />

        {/* Allergen/diet tags */}
        <Rect x="30" y="126" width="52" height="20" rx="10" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1" />
        <Rect x="38" y="132" width="36" height="8" rx="4" fill={Colors.error} opacity="0.5" />

        <Rect x="88" y="126" width="52" height="20" rx="10" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
        <Rect x="96" y="132" width="36" height="8" rx="4" fill={Colors.success} opacity="0.5" />

        <Rect x="146" y="126" width="52" height="20" rx="10" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
        <Rect x="154" y="132" width="36" height="8" rx="4" fill={Colors.warning} opacity="0.5" />

        {/* Shield with checkmark - using Rect+border approach for reliable rendering */}
        <G>
          <Rect x="96" y="152" width="28" height="28" rx="6" fill="#FFF" stroke={Colors.success} strokeWidth="1.5" />
          <Path d="M104 166 L108 170 L118 160" fill="none" stroke={Colors.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </G>
      </Svg>
    </FloatingElement>
  </View>
);

// =============================================
// ILLUSTRATION 4: DISCLAIMER - document + shield (compact)
// =============================================
const DisclaimerIllustration = () => (
  <View style={illustrationStyles.containerSmall}>
    <FloatingElement duration={4200} range={7}>
      <Svg width={180} height={130} viewBox="0 0 180 130">
        <Defs>
          <SvgLinearGradient id="discBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.10" />
            <Stop offset="1" stopColor="#E65100" stopOpacity="0.03" />
          </SvgLinearGradient>
        </Defs>

        <Circle cx="90" cy="65" r="60" fill="url(#discBg)" />

        {/* Document */}
        <Rect x="48" y="14" width="84" height="102" rx="12" fill="#FFFFFF" stroke={Colors.gray[200]} strokeWidth="1.5" />

        {/* Header line */}
        <Rect x="60" y="26" width="60" height="7" rx="3.5" fill={Colors.secondary} opacity="0.6" />
        <Rect x="60" y="38" width="44" height="5" rx="2.5" fill={Colors.gray[300]} />

        {/* Content lines */}
        <Rect x="60" y="50" width="60" height="4" rx="2" fill={Colors.gray[200]} />
        <Rect x="60" y="58" width="52" height="4" rx="2" fill={Colors.gray[200]} />
        <Rect x="60" y="66" width="56" height="4" rx="2" fill={Colors.gray[200]} />
        <Rect x="60" y="74" width="44" height="4" rx="2" fill={Colors.gray[200]} />

        {/* Checkbox */}
        <Rect x="60" y="86" width="14" height="14" rx="4" fill={Colors.primary} />
        <Path d="M64 93 L67 96 L71 90" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Rect x="80" y="90" width="40" height="5" rx="2.5" fill={Colors.gray[300]} />

        {/* Shield overlay (right side) */}
        <G>
          <Path d="M148 36 L162 42 L162 54 L148 64 L134 54 L134 42 Z" fill="#FFF" stroke={Colors.primary} strokeWidth="2" strokeLinejoin="round" />
          <Circle cx="148" cy="48" r="7" fill={Colors.primary} opacity="0.12" />
          <Path d="M144 49 L147 52 L153 45" fill="none" stroke={Colors.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </G>

        {/* Trust check left */}
        <Circle cx="30" cy="40" r="7" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
        <Path d="M27 40 L29 42 L34 37" fill="none" stroke={Colors.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        <Circle cx="30" cy="60" r="7" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
        <Path d="M27 60 L29 62 L34 57" fill="none" stroke={Colors.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </FloatingElement>
  </View>
);

const illustrationStyles = StyleSheet.create({
  container: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  containerSmall: {
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
});

// --- MAIN COMPONENT ---
interface Props {
  visible: boolean;
  onAccept: () => Promise<void> | void;
}

export function AppOnboardingModal({ visible, onAccept }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStep(0);
      setAccepted(false);
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, [visible, fadeAnim, slideAnim]);

  const slides = [
    { title: t("appOnboarding.slide1Title"), desc: t("appOnboarding.slide1Desc"), Illustration: ScanIllustration },
    { title: t("appOnboarding.slide2Title"), desc: t("appOnboarding.slide2Desc"), Illustration: InsightIllustration },
    { title: t("appOnboarding.slide3Title"), desc: t("appOnboarding.slide3Desc"), Illustration: FamilyIllustration },
    { title: t("appOnboarding.slide4Title"), desc: t("appOnboarding.slide4Desc"), Illustration: DisclaimerIllustration },
  ];

  const lastStep = step === slides.length - 1;
  const CurrentIllustration = slides[step].Illustration;
  const isPrimaryDisabled = lastStep && !accepted;

  const animateToStep = (nextStep: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    });
  };

  const handlePrimary = async () => {
    if (lastStep) {
      if (accepted) await onAccept();
      return;
    }
    animateToStep(step + 1);
  };

  const handleSkip = () => {
    animateToStep(slides.length - 1);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView
            contentContainerStyle={styles.cardContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Top row: step + skip */}
            <View style={styles.topRow}>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>
                  {step + 1}/{slides.length}
                </Text>
              </View>
              {!lastStep && (
                <Pressable style={styles.skipButton} onPress={handleSkip}>
                  <Text style={styles.skipText}>{t("appOnboarding.skipBtn")}</Text>
                </Pressable>
              )}
            </View>

            {/* Animated content */}
            <Animated.View style={[styles.animatedContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <CurrentIllustration />

              <Text style={[styles.title, lastStep && { fontSize: 21 }]}>{slides[step].title}</Text>
              <Text style={[styles.description, lastStep && { marginBottom: 10, fontSize: 13.5 }]}>{slides[step].desc}</Text>
            </Animated.View>

            {/* Disclaimer section on last slide */}
            {lastStep && (
              <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerBody}>{t("appOnboarding.disclaimer.body")}</Text>
                {(
                  t("appOnboarding.disclaimer.points", { returnObjects: true }) as string[]
                ).map((point, index) => (
                  <View key={`dp-${index}`} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}

                <Pressable style={styles.checkboxRow} onPress={() => setAccepted((prev) => !prev)}>
                  <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
                    {accepted ? <Ionicons name="checkmark" size={14} color={Colors.white} /> : null}
                  </View>
                  <Text style={styles.checkboxText}>{t("appOnboarding.disclaimer.acceptLabel")}</Text>
                </Pressable>
              </View>
            )}

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${((step + 1) / slides.length) * 100}%` }]} />
              </View>
            </View>

            {/* Required hint */}
            {isPrimaryDisabled && (
              <Text style={styles.requiredHint}>{t("appOnboarding.disclaimer.requiredHint")}</Text>
            )}

            {/* Primary button */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                isPrimaryDisabled && styles.buttonDisabled,
                pressed && !isPrimaryDisabled && styles.buttonPressed,
              ]}
              onPress={handlePrimary}
              disabled={isPrimaryDisabled}
            >
              <Text style={styles.buttonText}>
                {lastStep ? t("appOnboarding.finishBtn") : t("appOnboarding.nextBtn")}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "92%",
    backgroundColor: Colors.white,
    borderRadius: 28,
    elevation: 16,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 20,
    alignItems: "center",
  },
  topRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
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
    fontSize: 14,
    color: Colors.gray[400],
    fontWeight: "600",
  },
  animatedContent: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.secondary,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14.5,
    color: Colors.gray[500],
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  disclaimerBox: {
    width: "100%",
    backgroundColor: "#FFFBF5",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FFE4C4",
  },
  disclaimerBody: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.gray[500],
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    paddingRight: 4,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: Colors.gray[600],
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#FFE4C4",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: "600",
    lineHeight: 16,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 14,
  },
  progressBg: {
    height: 4,
    backgroundColor: Colors.gray[100],
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  requiredHint: {
    width: "100%",
    textAlign: "center",
    color: Colors.error,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
  },
  button: {
    backgroundColor: Colors.primary,
    width: "100%",
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
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
