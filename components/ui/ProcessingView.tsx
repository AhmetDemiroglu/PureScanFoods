import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Animated, Easing, ActivityIndicator } from "react-native";
import LottieView from "lottie-react-native";
import { AppColors } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";

const { width, height } = Dimensions.get("window");

export type ProcessingMode = "camera" | "text" | "barcode" | "ad";

interface ProcessingViewProps {
  mode?: ProcessingMode;
}

const LogoSpinner = ({ colors, styles }: { colors: AppColors; styles: ReturnType<typeof createStyles> }) => {
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
  }, [spinValue]);

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={styles.spinnerContainer}>
      <Animated.View style={[styles.spinningRingContainer, { transform: [{ rotate: spin }] }]}>
        <LinearGradient colors={[colors.primary, colors.secondary, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.spinningRingGradient} />
      </Animated.View>

      <View style={styles.logoContainer}>
        <LinearGradient colors={[colors.primary, "#E65100"]} style={styles.logoGradient}>
          <Ionicons name="scan" size={24} color={colors.white} />
        </LinearGradient>
      </View>
    </View>
  );
};

export default function ProcessingView({ mode = "camera" }: ProcessingViewProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const titleKeyByMode: Record<ProcessingMode, string> = {
    camera: "processing.titles.camera",
    text: "processing.titles.text",
    barcode: "processing.titles.barcode",
    ad: "processing.titles.ad",
  };

  const titleDefaultByMode: Record<ProcessingMode, string> = {
    camera: "Analyzing Image...",
    text: "Analyzing Text...",
    barcode: "Reading Barcode...",
    ad: "Preparing Result...",
  };

  const steps = useMemo(() => {
    if (mode === "text") {
      return [
        { id: 1, label: t("processing.textSteps.1", { defaultValue: "Text received..." }), icon: "document-text-outline" },
        { id: 2, label: t("processing.textSteps.2", { defaultValue: "AI is analyzing..." }), icon: "hardware-chip-outline" },
        { id: 3, label: t("processing.textSteps.3", { defaultValue: "Extracting nutrition..." }), icon: "server-outline" },
        { id: 4, label: t("processing.textSteps.4", { defaultValue: "Preparing results..." }), icon: "checkmark-done-outline" },
      ];
    }

    if (mode === "barcode") {
      return [
        { id: 1, label: t("processing.barcodeSteps.1", { defaultValue: "Barcode detected..." }), icon: "barcode-outline" },
        { id: 2, label: t("processing.barcodeSteps.2", { defaultValue: "Fetching product data..." }), icon: "cloud-download-outline" },
        { id: 3, label: t("processing.barcodeSteps.3", { defaultValue: "AI validation..." }), icon: "hardware-chip-outline" },
        { id: 4, label: t("processing.barcodeSteps.4", { defaultValue: "Preparing results..." }), icon: "checkmark-done-outline" },
      ];
    }

    if (mode === "ad") {
      return [
        { id: 1, label: t("processing.adSteps.1", { defaultValue: "Loading ad..." }), icon: "play-circle-outline" },
        { id: 2, label: t("processing.adSteps.2", { defaultValue: "Finalizing result..." }), icon: "hourglass-outline" },
      ];
    }

    return [
      { id: 1, label: t("processing.steps.1", { defaultValue: "Processing image..." }), icon: "scan-outline" },
      { id: 2, label: t("processing.steps.2", { defaultValue: "Extracting text..." }), icon: "hardware-chip-outline" },
      { id: 3, label: t("processing.steps.3", { defaultValue: "Analyzing nutrition..." }), icon: "server-outline" },
      { id: 4, label: t("processing.steps.4", { defaultValue: "Preparing results..." }), icon: "document-text-outline" },
    ];
  }, [mode, t]);

  const facts = useMemo(() => {
    const raw = t("processing.facts", { returnObjects: true });
    return Array.isArray(raw) && raw.length > 0 ? (raw as string[]) : ["Interesting fact loading..."];
  }, [t]);

  const longWaitMessages = useMemo(() => {
    const raw = t("processing.waitMessages", { returnObjects: true });
    return Array.isArray(raw) && raw.length > 0 ? (raw as string[]) : ["Please wait..."];
  }, [t]);

  const [currentStep, setCurrentStep] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [showLongWait, setShowLongWait] = useState(false);
  const [longWaitIndex, setLongWaitIndex] = useState(0);

  const stepProgressAnim = useRef(new Animated.Value(0)).current;
  const factFadeAnim = useRef(new Animated.Value(1)).current;
  const waitFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setCurrentStep(0);
    stepProgressAnim.setValue(0);
    setShowLongWait(false);
    setLongWaitIndex(0);
  }, [mode, stepProgressAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev < steps.length - 1 ? prev + 1 : prev;
        Animated.timing(stepProgressAnim, {
          toValue: next / Math.max(1, steps.length - 1),
          duration: 500,
          useNativeDriver: false,
        }).start();
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [steps.length, stepProgressAnim]);

  useEffect(() => {
    if (facts.length <= 1) return;

    const timer = setInterval(() => {
      Animated.timing(factFadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setFactIndex((prev) => {
          let next = prev;
          while (next === prev && facts.length > 1) {
            next = Math.floor(Math.random() * facts.length);
          }
          return next;
        });
        Animated.timing(factFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 6500);

    return () => clearInterval(timer);
  }, [factFadeAnim, facts.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLongWait(true);
      Animated.timing(waitFadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 10000);
    return () => clearTimeout(timer);
  }, [waitFadeAnim]);

  useEffect(() => {
    if (!showLongWait || longWaitMessages.length <= 1) return;

    const waitTimer = setInterval(() => {
      Animated.timing(waitFadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setLongWaitIndex((prev) => (prev + 1) % longWaitMessages.length);
        Animated.timing(waitFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 3200);

    return () => clearInterval(waitTimer);
  }, [longWaitMessages.length, showLongWait, waitFadeAnim]);

  const progressWidth = stepProgressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={styles.container}>
      <LinearGradient colors={isDark ? [colors.surface, "#0B1220"] : [colors.surface, "#FFF8E1"]} style={StyleSheet.absoluteFill} />

      <View style={styles.topSection}>
        <LottieView source={require("../../assets/scanning-character.json")} autoPlay loop style={styles.mainAnimation} />
        <Text style={styles.title}>{t(titleKeyByMode[mode], { defaultValue: titleDefaultByMode[mode] })}</Text>
      </View>

      <View style={styles.middleSection}>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>

        <View style={styles.stepsContainer}>
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <View key={step.id} style={styles.stepItem}>
                <View style={[styles.iconBox, (isActive || isCompleted) && styles.activeIconBox]}>
                  <Ionicons name={(isCompleted ? "checkmark" : step.icon) as any} size={18} color={(isActive || isCompleted) ? colors.white : colors.gray[400]} />
                </View>
                <Text style={[styles.stepText, isActive ? styles.activeStepText : styles.hiddenStepText]}>{step.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.bottomSection}>
        <LogoSpinner colors={colors} styles={styles} />

        <View style={styles.factContainer}>
          <Text style={styles.factTitle}>{t("processing.didYouKnow", { defaultValue: "DID YOU KNOW?" })}</Text>
          <Animated.View style={{ opacity: factFadeAnim }}>
            <Text style={styles.factText}>{facts[factIndex]}</Text>
          </Animated.View>
        </View>

        {showLongWait && (
          <Animated.View style={[styles.waitMessageContainer, { opacity: waitFadeAnim }]}>
            <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.waitMessageText}>{longWaitMessages[longWaitIndex]}</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingTop: height * 0.06,
      paddingHorizontal: 24,
      justifyContent: "space-between",
      paddingBottom: height * 0.04,
    },
    topSection: {
      alignItems: "center",
      flex: 2,
      justifyContent: "flex-end",
      marginBottom: 5,
      marginTop: 30,
    },
    mainAnimation: {
      width: width * 0.7,
      height: width * 0.7,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.secondary,
      marginTop: 10,
      letterSpacing: 0.5,
      textAlign: "center",
    },
    middleSection: {
      flex: 1,
      width: "100%",
      justifyContent: "flex-start",
      marginTop: 10,
    },
    progressBarBg: {
      height: 4,
      backgroundColor: colors.gray[200],
      borderRadius: 2,
      marginBottom: 20,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    stepsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    stepItem: {
      alignItems: "center",
      width: width / 4.5,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.gray[100],
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
      borderWidth: 1.5,
      borderColor: colors.gray[200],
      elevation: 1,
    },
    activeIconBox: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      elevation: 4,
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    stepText: {
      fontSize: 10,
      color: colors.gray[500],
      fontWeight: "600",
      textAlign: "center",
      position: "absolute",
      top: 45,
      width: 100,
    },
    activeStepText: {
      color: colors.secondary,
      fontWeight: "700",
      opacity: 1,
    },
    hiddenStepText: {
      opacity: 0,
    },
    bottomSection: {
      flex: 1.8,
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 12,
    },
    spinnerContainer: {
      width: 60,
      height: 60,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    spinningRingContainer: {
      position: "absolute",
      width: "100%",
      height: "100%",
      borderRadius: 30,
      overflow: "hidden",
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
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },
    logoGradient: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
    },
    factContainer: {
      width: "100%",
      backgroundColor: isDark ? "rgba(17,24,39,0.86)" : "rgba(255,255,255,0.8)",
      borderRadius: 16,
      padding: 16,
      minHeight: 100,
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.gray[200],
    },
    factTitle: {
      fontSize: 11,
      fontWeight: "800",
      color: colors.primary,
      letterSpacing: 0.4,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    factText: {
      fontSize: 14,
      color: colors.gray[700],
      lineHeight: 20,
      fontWeight: "500",
    },
    waitMessageContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      backgroundColor: isDark ? "rgba(17,24,39,0.82)" : "rgba(255,255,255,0.75)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    waitMessageText: {
      fontSize: 12,
      color: colors.gray[600],
      fontWeight: "600",
    },
  });
