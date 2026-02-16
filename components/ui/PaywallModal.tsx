import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import LottieView from "lottie-react-native";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

type PlanType = "monthly" | "yearly";

const PLACEHOLDER_PRICES = {
  monthly: { price: "$7.99" },
  yearly: { price: "$54.99", monthlyEquiv: "$4.58" },
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const FeatureItem = ({
  icon,
  iconColor,
  iconBg,
  label,
  index,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  index: number;
}) => (
  <Animated.View
    entering={FadeInDown.delay(220 + index * 50).duration(360).springify()}
    style={styles.featureItem}
  >
    <View style={[styles.featureIcon, { backgroundColor: iconBg }]}>
      <MaterialCommunityIcons name={icon as any} size={17} color={iconColor} />
    </View>
    <Text style={styles.featureText}>{label}</Text>
    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
  </Animated.View>
);

const DevNoticeModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { t } = useTranslation();

  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 14 });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      scale.value = 0.9;
      opacity.value = 0;
    }
  }, [visible, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={devStyles.overlay}>
        <Pressable style={devStyles.backdrop} onPress={onClose} />
        <Animated.View style={[devStyles.card, animatedStyle]}>
          <Image source={require("../../assets/septimus_lab.png")} style={devStyles.logo} resizeMode="contain" />
          <View style={devStyles.iconBox}>
            <MaterialCommunityIcons name="hammer-wrench" size={28} color={Colors.primary} />
          </View>

          <Text style={devStyles.title}>{t("paywall.dev_notice_title")}</Text>
          <Text style={devStyles.desc}>{t("paywall.dev_notice_desc")}</Text>

          <Pressable
            style={({ pressed }) => [devStyles.linkButton, pressed && { opacity: 0.7 }]}
            onPress={() => Linking.openURL("https://septimuslab.com")}
          >
            <Ionicons name="globe-outline" size={18} color={Colors.primary} />
            <Text style={devStyles.linkText}>septimuslab.com</Text>
            <Ionicons name="open-outline" size={14} color={Colors.gray[400]} />
          </Pressable>

          <Pressable style={({ pressed }) => [devStyles.closeButton, pressed && { opacity: 0.8 }]} onPress={onClose}>
            <Text style={devStyles.closeText}>{t("paywall.dev_notice_ok")}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("yearly");
  const [showDevNotice, setShowDevNotice] = useState(false);

  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setSelectedPlan("yearly");
      translateY.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 320 });
    } else {
      translateY.value = 40;
      opacity.value = 0;
    }
  }, [visible, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handleSubscribe = useCallback(() => {
    setShowDevNotice(true);
  }, []);

  if (!visible) return null;

  const features = [
    { icon: "barcode-scan", iconColor: Colors.primary, iconBg: "#FFF7ED", label: t("paywall.feat_unlimited_scan") },
    { icon: "robot-outline", iconColor: "#7C3AED", iconBg: "#EDE9FE", label: t("paywall.feat_unlimited_ai") },
    { icon: "account-group-outline", iconColor: "#0284C7", iconBg: "#E0F2FE", label: t("paywall.feat_unlimited_family") },
    { icon: "advertisements-off", iconColor: "#DC2626", iconBg: "#FEF2F2", label: t("paywall.feat_no_ads") },
    { icon: "lightning-bolt", iconColor: "#F59E0B", iconBg: "#FEF3C7", label: t("paywall.feat_priority") },
  ];

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View style={[styles.container, animatedStyle]}>
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={20} color={Colors.gray[500]} />
          </Pressable>

          <Animated.View entering={FadeIn.delay(90).duration(350)} style={styles.header}>
            <LinearGradient colors={["#FFFFFF", "#FFFFFF"]} style={styles.crownBox}>
              <LottieView
                source={require("../../assets/crown.json")}
                autoPlay
                loop
                style={styles.crownLottie}
              />
            </LinearGradient>
            <Text style={styles.title}>{t("paywall.title")}</Text>
            <Text style={styles.subtitle}>{t("paywall.subtitle")}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).duration(360)} style={styles.planGrid}>
            <Pressable
              style={[styles.planSquare, selectedPlan === "yearly" && styles.planSquareSelected]}
              onPress={() => setSelectedPlan("yearly")}
            >
              <View style={styles.cornerTriangle} />
              <Text style={styles.cornerText}>{t("paywall.save_percent")}</Text>

              <View style={styles.planRadioTop}>
                <View style={[styles.radioOuter, selectedPlan === "yearly" && styles.radioOuterSelected]}>
                  {selectedPlan === "yearly" && <View style={styles.radioInner} />}
                </View>
              </View>

              <View style={styles.planCenter}>
                <Text style={[styles.squareTitle, selectedPlan === "yearly" && styles.squareTitleSelected]}>
                  {t("paywall.yearly")}
                </Text>
                <Text style={styles.squarePrice}>{PLACEHOLDER_PRICES.yearly.price}</Text>
                <Text style={styles.squareMeta}>{t("paywall.per_year")}</Text>
                <Text style={styles.squareHint}>{PLACEHOLDER_PRICES.yearly.monthlyEquiv}{t("paywall.per_month")}</Text>
              </View>
            </Pressable>

            <Pressable
              style={[styles.planSquare, selectedPlan === "monthly" && styles.planSquareSelected]}
              onPress={() => setSelectedPlan("monthly")}
            >
              <View style={styles.planRadioTop}>
                <View style={[styles.radioOuter, selectedPlan === "monthly" && styles.radioOuterSelected]}>
                  {selectedPlan === "monthly" && <View style={styles.radioInner} />}
                </View>
              </View>

              <View style={styles.planCenter}>
                <Text style={[styles.squareTitle, selectedPlan === "monthly" && styles.squareTitleSelected]}>
                  {t("paywall.monthly")}
                </Text>
                <Text style={styles.squarePrice}>{PLACEHOLDER_PRICES.monthly.price}</Text>
                <Text style={styles.squareMeta}>{t("paywall.per_month")}</Text>
              </View>
            </Pressable>
          </Animated.View>

          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>{t("paywall.includes")}</Text>
            <ScrollView
              style={styles.featuresScroll}
              contentContainerStyle={styles.featuresScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {features.map((f, i) => (
                <FeatureItem key={f.icon} {...f} index={i} />
              ))}
            </ScrollView>
          </View>

          <Pressable style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]} onPress={handleSubscribe}>
            <LinearGradient colors={["#FF8C00", "#EA580C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
              <MaterialCommunityIcons name="crown" size={20} color="#FFF" />
              <Text style={styles.ctaText}>{t("paywall.subscribe_now")}</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.footerLinks}>
            <Pressable style={({ pressed }) => [pressed && { opacity: 0.6 }]} onPress={() => setShowDevNotice(true)}>
              <Text style={styles.footerLink}>{t("paywall.restore")}</Text>
            </Pressable>
            <Text style={styles.footerDot}>·</Text>
            <Pressable style={({ pressed }) => [pressed && { opacity: 0.6 }]} onPress={() => Linking.openURL("https://septimuslab.com/privacy")}>
              <Text style={styles.footerLink}>{t("paywall.terms")}</Text>
            </Pressable>
          </View>

          <Pressable style={({ pressed }) => [styles.secondaryClose, pressed && { opacity: 0.6 }]} onPress={onClose}>
            <Text style={styles.secondaryCloseText}>{t("paywall.maybe_later")}</Text>
          </Pressable>
        </Animated.View>
      </View>

      <DevNoticeModal visible={showDevNotice} onClose={() => setShowDevNotice(false)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: SCREEN_WIDTH * 0.92,
    maxWidth: 410,
    maxHeight: SCREEN_HEIGHT * 0.9,
    backgroundColor: "#FFF",
    borderRadius: 26,
    paddingTop: 24,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 20,
    padding: 6,
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },

  header: {
    alignItems: "center",
    marginBottom: 14,
  },
  crownBox: {
    height: 80,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  crownLottie: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    color: Colors.secondary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: "center",
    marginTop: 5,
    lineHeight: 17,
    paddingHorizontal: 8,
  },

  planGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  planSquare: {
    flex: 1,
    minHeight: 122,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gray[100],
    backgroundColor: Colors.gray[50],
    overflow: "hidden",
    position: "relative",
    padding: 8,
  },
  planSquareSelected: {
    borderColor: Colors.primary,
    backgroundColor: "#FFF7ED",
  },
  cornerTriangle: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderTopWidth: 38,
    borderLeftWidth: 38,
    borderTopColor: "#10B981",
    borderLeftColor: "transparent",
  },
  cornerText: {
    position: "absolute",
    top: 5,
    right: -4,
    width: 34,
    textAlign: "center",
    fontSize: 7,
    fontWeight: "800",
    color: "#FFF",
    transform: [{ rotate: "45deg" }],
  },
  planRadioTop: {
    alignItems: "flex-start",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  planCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  squareTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.gray[600],
    marginBottom: 2,
  },
  squareTitleSelected: {
    color: Colors.secondary,
  },
  squarePrice: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.primary,
  },
  squareMeta: {
    fontSize: 10,
    color: Colors.gray[500],
    fontWeight: "600",
    marginTop: 1,
  },
  squareHint: {
    marginTop: 4,
    fontSize: 9,
    color: Colors.gray[400],
    fontWeight: "600",
  },

  featuresSection: {
    marginBottom: 10,
  },
  featuresTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.gray[400],
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  featuresScroll: {
    maxHeight: SCREEN_HEIGHT * 0.27,
  },
  featuresScrollContent: {
    paddingBottom: 4,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.secondary,
  },

  ctaButton: {
    marginTop: 4,
    marginBottom: 10,
  },
  ctaPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 15,
    gap: 8,
  },
  ctaText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },

  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.gray[400],
  },
  footerDot: {
    fontSize: 11,
    color: Colors.gray[300],
  },
  secondaryClose: {
    alignItems: "center",
    paddingVertical: 6,
  },
  secondaryCloseText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.gray[400],
  },
});

const devStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: SCREEN_WIDTH * 0.82,
    maxWidth: 340,
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FFEDD5",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.secondary,
    textAlign: "center",
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    color: Colors.gray[500],
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF7ED",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFEDD5",
    marginBottom: 16,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
  closeButton: {
    backgroundColor: Colors.gray[100],
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  closeText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.gray[600],
  },
});
