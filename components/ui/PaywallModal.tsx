import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AppColors } from "../../constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
  FadeInDown,
  ZoomIn,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import LottieView from "lottie-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { getOfferings, purchasePackage, restorePurchases } from "../../lib/revenuecat";
import { PurchasesPackage } from "react-native-purchases";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onAuthRequired?: () => void;
}

type PlanType = "monthly" | "yearly";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const FeatureItem = ({
  icon,
  iconColor,
  iconBg,
  label,
  index,
  styles,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  index: number;
  styles: ReturnType<typeof createStyles>;
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

// Başarı ekranı bileşeni
const SuccessView = ({ onComplete, t, colors }: { onComplete: () => void; t: any; colors: AppColors }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Animated.View 
      entering={FadeIn.duration(300)}
      style={styles.successOverlay}
    >
      <View style={[styles.successContainer, { backgroundColor: colors.card }]}>
        <Animated.View 
          entering={ZoomIn.delay(200).duration(500)}
          style={styles.successIconContainer}
        >
          <LinearGradient
            colors={["#10B981", "#059669"]}
            style={styles.successGradient}
          >
            <Ionicons name="checkmark" size={50} color="#FFF" />
          </LinearGradient>
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={[styles.successTitle, { color: colors.secondary }]}>
            {t("paywall.successTitle", "Harika!")}
          </Text>
          <Text style={[styles.successSubtitle, { color: colors.gray[500] }]}>
            {t("paywall.successSubtitle", "Premium Özellikler Aktif")}
          </Text>
        </Animated.View>

        {/* Dekoratif animasyonlu noktalar */}
        <View style={styles.confettiContainer}>
          <View style={[styles.confettiDot, styles.confettiYellow, { top: 20, left: 40 }]} />
          <View style={[styles.confettiDot, styles.confettiBlue, { top: 60, right: 50 }]} />
          <View style={[styles.confettiDot, styles.confettiRed, { bottom: 40, left: 60 }]} />
          <View style={[styles.confettiDot, styles.confettiPurple, { bottom: 80, right: 40 }]} />
        </View>
      </View>
    </Animated.View>
  );
};

export default function PaywallModal({ visible, onClose, onAuthRequired }: PaywallModalProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { user, refreshPremiumStatus } = useAuth();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("yearly");
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);

  // RevenueCat'ten paketleri çek
  const loadPackages = useCallback(async () => {
    setLoading(true);
    console.log("[Paywall] Paketler yükleniyor...");
    
    try {
      const offerings = await getOfferings();
      
      if (offerings && offerings.availablePackages.length > 0) {
        setPackages(offerings.availablePackages);
        
        // Yıllık paketi varsayılan olarak seç
        const yearly = offerings.availablePackages.find(
          (p) => p.identifier === "$rc_annual" || p.identifier.includes("yearly") || p.identifier.includes("annual")
        );
        if (yearly) {
          setSelectedPlan("yearly");
        } else {
          setSelectedPlan("monthly");
        }
      } else {
        console.log("[Paywall] Paket bulunamadı!");
        setPackages([]);
      }
    } catch (error) {
      console.error("[Paywall] Paket yükleme hatası:", error);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setSelectedPlan("yearly");
      translateY.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 320 });
      loadPackages();
      setErrorMsg(null);
      setShowSuccess(false);
    } else {
      translateY.value = 40;
      opacity.value = 0;
    }
  }, [visible, loadPackages]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Paket fiyatını formatla
  const formatPrice = (pkg: PurchasesPackage) => {
    return pkg.product.priceString;
  };

  // Aylık eşdeğer fiyatı hesapla (yıllık için)
  const getMonthlyEquivalent = (pkg: PurchasesPackage) => {
    // Introductory price kontrolü (promosyon fiyatı varsa)
    const introPrice = (pkg.product as any).introductoryPrice;
    if (introPrice && introPrice.price > 0) {
      return introPrice.priceString;
    }
    // Yıllık fiyatı 12'ye böl
    const monthlyPrice = pkg.product.price / 12;
    return `~${pkg.product.currencyCode} ${monthlyPrice.toFixed(2)}`;
  };

  // Seçili paketi bul
  const getSelectedPackage = useCallback((): PurchasesPackage | null => {
    if (selectedPlan === "yearly") {
      const yearly = packages.find(
        (p) => p.identifier === "$rc_annual" || p.identifier.includes("yearly") || p.identifier.includes("annual")
      );
      if (yearly) return yearly;
      // Fallback: İlk paketi al (eğer yıllık bulunamazsa)
      return packages[0] || null;
    }
    const monthly = packages.find(
      (p) => p.identifier === "$rc_monthly" || p.identifier.includes("monthly")
    );
    if (monthly) return monthly;
    // Fallback: Son paketi al (eğer aylık bulunamazsa)
    return packages[packages.length - 1] || null;
  }, [selectedPlan, packages]);

  const handleSubscribe = useCallback(async () => {
    // 1. Misafir kullanıcı kontrolü - EN BAŞTA!
    if (!user || user.isAnonymous) {
      console.log("[Paywall] Misafir kullanıcı, auth gerekli");
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }

    // 2. Paket kontrolü
    const selectedPkg = getSelectedPackage();
    if (!selectedPkg) {
      console.log("[Paywall] Paket bulunamadı! packages:", packages.length);
      setErrorMsg(t("paywall.selectPackage", "Lütfen bir paket seçin"));
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setErrorMsg(null);
    setPurchasing(true);
    console.log("[Paywall] Satın alma başlıyor...", selectedPkg.identifier);

    // 3. Satın alma işlemi
    const result = await purchasePackage(selectedPkg);
    console.log("[Paywall] Satın alma sonucu:", result);

    if (result.success && result.isPremium) {
      console.log("[Paywall] Satın alma BAŞARILI!");
      await refreshPremiumStatus();
      setPurchasing(false);
      setShowSuccess(true);
    } else {
      setPurchasing(false);
      if (!result.cancelled && result.error) {
        setErrorMsg(result.error || t("paywall.purchaseError", "İşlem sırasında bir hata oluştu"));
        setTimeout(() => setErrorMsg(null), 3000);
      }
    }
  }, [user, selectedPlan, packages, onAuthRequired, t, refreshPremiumStatus, getSelectedPackage]);

  const handleRestore = useCallback(async () => {
    setRestoring(true);
    setErrorMsg(null);
    console.log("[Paywall] Geri yükleme başlıyor...");

    const isPremium = await restorePurchases();

    if (isPremium) {
      console.log("[Paywall] Geri yükleme BAŞARILI!");
      await refreshPremiumStatus();
      setRestoring(false);
      setShowSuccess(true);
    } else {
      console.log("[Paywall] Geri yükleme: Premium bulunamadı");
      setRestoring(false);
      setErrorMsg(t("paywall.noRestore", "Geri yüklenecek satın alma bulunamadı"));
      setTimeout(() => setErrorMsg(null), 3000);
    }
  }, [refreshPremiumStatus, t]);

  const handleSuccessComplete = useCallback(() => {
    setShowSuccess(false);
    onClose();
  }, [onClose]);

  // Yıllık paket mi kontrolü
  const isYearlyPackage = (pkg: PurchasesPackage) => {
    return pkg.identifier === "$rc_annual" || pkg.identifier.includes("yearly") || pkg.identifier.includes("annual");
  };

  if (!visible) return null;

  const features = [
    { icon: "barcode-scan", iconColor: colors.primary, iconBg: isDark ? "rgba(234,88,12,0.20)" : "#FFF7ED", label: t("paywall.feat_unlimited_scan") },
    { icon: "robot-outline", iconColor: "#7C3AED", iconBg: isDark ? "rgba(124,58,237,0.20)" : "#EDE9FE", label: t("paywall.feat_unlimited_ai") },
    { icon: "account-group-outline", iconColor: "#0284C7", iconBg: isDark ? "rgba(2,132,199,0.20)" : "#E0F2FE", label: t("paywall.feat_unlimited_family") },
    { icon: "advertisements-off", iconColor: "#DC2626", iconBg: isDark ? "rgba(220,38,38,0.20)" : "#FEF2F2", label: t("paywall.feat_no_ads") },
    { icon: "lightning-bolt", iconColor: "#F59E0B", iconBg: isDark ? "rgba(245,158,11,0.20)" : "#FEF3C7", label: t("paywall.feat_priority") },
  ];

  const yearlyPkg = packages.find((p) => isYearlyPackage(p));
  const monthlyPkg = packages.find((p) => !isYearlyPackage(p));

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View style={[styles.container, animatedStyle]}>
          {/* Başarı ekranı */}
          {showSuccess && (
            <SuccessView 
              onComplete={handleSuccessComplete} 
              t={t} 
              colors={colors}
            />
          )}

          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={20} color={colors.gray[500]} />
          </Pressable>

          <Animated.View entering={FadeIn.delay(90).duration(350)} style={styles.header}>
            <LinearGradient colors={isDark ? [colors.gray[100], colors.gray[200]] : ["#FFFFFF", "#FFFFFF"]} style={styles.crownBox}>
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

          {loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.gray[500] }]}>
                {t("paywall.loading")}
              </Text>
            </View>
          ) : packages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={48} color={colors.gray[300]} />
              <Text style={[styles.emptyTitle, { color: colors.gray[500], marginTop: 16 }]}>
                {t("paywall.noPackages")}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.gray[400] }]}>
                {t("paywall.comingSoon")}
              </Text>
            </View>
          ) : (
            <>
              <Animated.View entering={FadeInDown.delay(160).duration(360)} style={styles.planGrid}>
                {/* Yıllık Plan */}
                {yearlyPkg && (
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
                      <Text style={styles.squarePrice}>{formatPrice(yearlyPkg)}</Text>
                      <Text style={styles.squareMeta}>{t("paywall.per_year")}</Text>
                      <Text style={styles.squareHint}>{getMonthlyEquivalent(yearlyPkg)}{t("paywall.per_month")}</Text>
                    </View>
                  </Pressable>
                )}

                {/* Aylık Plan */}
                {monthlyPkg && (
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
                      <Text style={styles.squarePrice}>{formatPrice(monthlyPkg)}</Text>
                      <Text style={styles.squareMeta}>{t("paywall.per_month")}</Text>
                    </View>
                  </Pressable>
                )}


              </Animated.View>

              <View style={styles.featuresSection}>
                <Text style={styles.featuresTitle}>{t("paywall.includes")}</Text>
                <ScrollView
                  style={styles.featuresScroll}
                  contentContainerStyle={styles.featuresScrollContent}
                  showsVerticalScrollIndicator={true}
                >
                  {features.map((f, i) => (
                    <FeatureItem styles={styles} key={f.icon} {...f} index={i} />
                  ))}
                </ScrollView>
              </View>

              {/* Hata mesajı */}
              {errorMsg && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {packages.length > 0 && (
                <>
                  <Pressable 
                    style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]} 
                    onPress={handleSubscribe}
                    disabled={purchasing}
                  >
                    <LinearGradient colors={["#FF8C00", "#EA580C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
                      {purchasing ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="crown" size={20} color="#FFF" />
                          <Text style={styles.ctaText}>{t("paywall.subscribe_now")}</Text>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>

                  <View style={styles.footerLinks}>
                    <Pressable style={({ pressed }) => [pressed && { opacity: 0.6 }]} onPress={handleRestore} disabled={restoring}>
                      <Text style={styles.footerLink}>
                        {restoring ? t("paywall.restoring", "Yükleniyor...") : t("paywall.restore")}
                      </Text>
                    </Pressable>
                    <Text style={styles.footerDot}>·</Text>
                    <Pressable style={({ pressed }) => [pressed && { opacity: 0.6 }]} onPress={() => Linking.openURL("https://septimuslab.com/privacy")}>
                      <Text style={styles.footerLink}>{t("paywall.terms")}</Text>
                    </Pressable>
                  </View>
                </>
              )}

              <Pressable style={({ pressed }) => [styles.secondaryClose, pressed && { opacity: 0.6 }]} onPress={onClose}>
                <Text style={styles.secondaryCloseText}>{t("paywall.maybe_later")}</Text>
              </Pressable>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.95)",
    zIndex: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 26,
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    borderRadius: 26,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  confettiDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confettiYellow: {
    backgroundColor: "#FCD34D",
    transform: [{ scale: 1 }],
  },
  confettiBlue: {
    backgroundColor: "#60A5FA",
    transform: [{ scale: 0.8 }],
  },
  confettiRed: {
    backgroundColor: "#F87171",
    transform: [{ scale: 1.2 }],
  },
  confettiPurple: {
    backgroundColor: "#A78BFA",
    transform: [{ scale: 0.9 }],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "400",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
});

const createStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[500],
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "400",
    color: colors.gray[400],
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    minHeight: 180,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "400",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
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
    backgroundColor: colors.card,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.gray[200],
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
    color: colors.secondary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: colors.gray[500],
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
    borderColor: colors.gray[100],
    backgroundColor: colors.gray[50],
    overflow: "hidden",
    position: "relative",
    padding: 8,
  },
  planSquareSelected: {
    borderColor: colors.primary,
    backgroundColor: isDark ? "rgba(249,115,22,0.18)" : "#FFF7ED",
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
    borderColor: colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
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
    color: colors.gray[600],
    marginBottom: 2,
  },
  squareTitleSelected: {
    color: colors.secondary,
  },
  squarePrice: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
  },
  squareMeta: {
    fontSize: 10,
    color: colors.gray[500],
    fontWeight: "600",
    marginTop: 1,
  },
  squareHint: {
    marginTop: 4,
    fontSize: 9,
    color: colors.gray[400],
    fontWeight: "600",
  },

  featuresSection: {
    marginBottom: 10,
  },
  featuresTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.gray[400],
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
    borderBottomColor: colors.gray[100],
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
    color: colors.secondary,
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
    color: colors.gray[400],
  },
  footerDot: {
    fontSize: 11,
    color: colors.gray[300],
  },
  secondaryClose: {
    alignItems: "center",
    paddingVertical: 6,
  },
  secondaryCloseText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.gray[400],
  },
});
