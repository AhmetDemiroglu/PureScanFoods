// Premium satın alma sayfası: alttan açılan sayfa. Telefonda kaymaz: üst alan, plan kartları ve alt
// blok (düğme + yasal bağlantılar) ölçülür, özellik listesi kalan yere sığan satır sayısına kısaltılır.
// Yasal metin ve satın alma düğmesi hiçbir zaman kaydırma alanına girmez, kırpılmaz.
// Satın alma, geri yükleme, paket yükleme ve misafir akışı önceki sürümle aynı.
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  ScrollView,
  Linking,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./AppText";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AppColors } from "../../constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeInDown,
  ZoomIn,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import LottieView from "lottie-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { getOfferings, purchasePackage, restorePurchases, isRevenueCatAvailable } from "../../lib/revenuecat";
import { PurchasesPackage } from "react-native-purchases";
import { FONT_SCALE_CAP, Radii } from "../../constants/design";

const TERMS_URL = "https://purescan-foods.septimuslab.com/terms/";
const PRIVACY_URL = "https://purescan-foods.septimuslab.com/privacy-policy/";
const MANAGE_SUBSCRIPTION_URL =
  Platform.OS === "ios"
    ? "https://apps.apple.com/account/subscriptions"
    : "https://play.google.com/store/account/subscriptions";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onAuthRequired?: () => void;
}

type PlanType = "monthly" | "yearly";

/** Özellik satırı sabit yükseklikte: kaç satır sığacağı ölçümle hesaplanır. */
const FEATURE_ROW_H = 38;
const FEATURE_ROW_GAP = 2;

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
          <Text variant="display" style={[styles.successTitle, { color: colors.text }]}>
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

/** Yükseklik ölçümü: yalnız gerçekten değişince state günceller. */
function useHeight(): [number, (e: LayoutChangeEvent) => void] {
  const [h, setH] = useState(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const next = Math.ceil(e.nativeEvent.layout.height);
    setH((prev) => (Math.abs(prev - next) > 1 ? next : prev));
  }, []);
  return [h, onLayout];
}

export default function PaywallModal({ visible, onClose, onAuthRequired }: PaywallModalProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { user, refreshPremiumStatus } = useAuth();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const insets = useSafeAreaInsets();
  const { height: winHeight, fontScale } = useWindowDimensions();
  const maxSheetHeight = winHeight - insets.top - 10;
  const sheetBottomPad = insets.bottom + 10;
  // Kısa ekran ya da büyük yazı: üst alan küçülür. Yalnız ekran ve yazı ölçeğinden karar verilir
  // (ölçümden değil), yoksa ölçüm ve düzen birbirini tetikler.
  //  - compact: taç küçülür, başlık bir boy küçülür.
  //  - tight (320x568, 360x640, iPhone SE, büyük yazılı kısa ekran): taç başlığın yanına geçer,
  //    alt başlık gösterilmez (özellik listesi aynı bilgiyi verir), yer özellik satırlarına kalır.
  const tight = winHeight < 680 || (winHeight < 760 && fontScale > 1.15);
  const compact = tight || winHeight < 780 || fontScale > 1.15;

  const [selectedPlan, setSelectedPlan] = useState<PlanType>("yearly");
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [heroH, onHeroLayout] = useHeight();
  const [plansH, onPlansLayout] = useHeight();
  const [bottomH, onBottomLayout] = useHeight();

  const translateY = useSharedValue(60);
  const opacity = useSharedValue(0);
  const backdrop = useSharedValue(0);

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
      backdrop.value = withTiming(1, { duration: 260 });
      loadPackages();
      setErrorMsg(null);
      setShowSuccess(false);
    } else {
      translateY.value = 60;
      opacity.value = 0;
      backdrop.value = 0;
    }
  }, [visible, loadPackages]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));

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

  // Mağazanın kendi biçimlediği aylık fiyat varsa o, yoksa eski hesap.
  const getMonthlyHint = (pkg: PurchasesPackage) => pkg.product.pricePerMonthString || getMonthlyEquivalent(pkg);

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
    { icon: "barcode-scan", label: t("paywall.feat_unlimited_scan") },
    { icon: "robot-outline", label: t("paywall.feat_unlimited_ai") },
    { icon: "image-multiple", label: t("paywall.feat_weekly_visuals") },
    { icon: "account-group-outline", label: t("paywall.feat_unlimited_family") },
    { icon: "advertisements-off", label: t("paywall.feat_no_ads") },
    { icon: "lightning-bolt", label: t("paywall.feat_priority") },
  ];

  const yearlyPkg = packages.find((p) => isYearlyPackage(p));
  const monthlyPkg = packages.find((p) => !isYearlyPackage(p));

  // Gerçek fiyatlardan indirim: yıllık / (aylık x 12). Aynı para birimi değilse ya da sonuç
  // sıfır veya altındaysa rozet gösterilmez.
  const discountPercent = (() => {
    if (!yearlyPkg || !monthlyPkg) return 0;
    const y = yearlyPkg.product.price;
    const m = monthlyPkg.product.price;
    if (!(y > 0) || !(m > 0)) return 0;
    if (yearlyPkg.product.currencyCode !== monthlyPkg.product.currencyCode) return 0;
    return Math.round((1 - y / (m * 12)) * 100);
  })();

  // Özellik listesine kalan yer: sayfa sınırı - alt boşluk - alt blok - üst alan - plan kartları -
  // liste başlığı (yazı ölçeğiyle) - bölüm üst boşluğu (14) - kaydırma alanı alt boşluğu (4).
  const featuresTitleH = Math.ceil(14 * Math.min(fontScale, FONT_SCALE_CAP)) + 10;
  const measured = heroH > 0 && plansH > 0 && bottomH > 0;
  const featureSpace = maxSheetHeight - sheetBottomPad - bottomH - heroH - plansH - featuresTitleH - 14 - 4;
  const fitCount = measured
    ? Math.max(0, Math.min(features.length, Math.floor((featureSpace + FEATURE_ROW_GAP) / (FEATURE_ROW_H + FEATURE_ROW_GAP))))
    : 0;
  const visibleFeatures = features.slice(0, fitCount);

  const lottieSize = tight ? 40 : compact ? 60 : 84;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, { maxHeight: maxSheetHeight, paddingBottom: sheetBottomPad }, animatedStyle]}
        >
          {/* Başarı ekranı */}
          {showSuccess && (
            <SuccessView
              onComplete={handleSuccessComplete}
              t={t}
              colors={colors}
            />
          )}

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={false}
            bounces={false}
          >
            {/* Üst alan: sıcak ışık, taç, serif başlık */}
            <View onLayout={onHeroLayout} style={[styles.hero, tight && styles.heroTight]}>
              <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                <LinearGradient
                  colors={isDark ? ["rgba(255,139,61,0.16)", "rgba(255,139,61,0)"] : ["#FFEEDF", "rgba(255,255,255,0)"]}
                  style={StyleSheet.absoluteFill}
                />
                <Svg width="100%" height="100%">
                  <Defs>
                    <RadialGradient id="paywallGlow" cx="50%" cy="0%" r="70%">
                      <Stop offset="0" stopColor={colors.primary} stopOpacity={isDark ? 0.22 : 0.14} />
                      <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
                    </RadialGradient>
                  </Defs>
                  <Rect x="0" y="0" width="100%" height="100%" fill="url(#paywallGlow)" />
                </Svg>
              </View>

              <View style={styles.grabber} />

              <Animated.View entering={FadeIn.delay(90).duration(350)} style={[styles.heroInner, tight && styles.heroInnerTight]}>
                <LottieView
                  source={require("../../assets/crown.json")}
                  autoPlay
                  loop
                  style={{ width: lottieSize, height: lottieSize }}
                />
                <Text
                  variant="display"
                  style={[styles.title, compact && styles.titleCompact, tight && styles.titleTight]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {t("paywall.title")}
                </Text>
                {/* Alt başlık kısaltılmaz: ya tam görünür ya da (tight) hiç görünmez. */}
                {!tight && (
                  <Text style={styles.subtitle}>
                    {t("paywall.subtitle")}
                  </Text>
                )}
              </Animated.View>
            </View>

            {!isRevenueCatAvailable() ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={48} color={colors.gray[300]} />
                <Text style={[styles.emptyTitle, { color: colors.gray[500], marginTop: 16 }]}>
                  {t("paywall.platformUnavailableTitle", "Coming Soon")}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.gray[400] }]}>
                  {Platform.OS === "ios"
                    ? t(
                        "paywall.iosUnavailable",
                        "Premium subscriptions are not yet available on iOS. We are finalizing setup. Please check back soon."
                      )
                    : t("paywall.comingSoon")}
                </Text>
              </View>
            ) : loading ? (
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
                <Animated.View
                  entering={FadeInDown.delay(160).duration(360)}
                  onLayout={onPlansLayout}
                  style={styles.planGrid}
                >
                  {/* Yıllık Plan */}
                  {yearlyPkg && (
                    <Pressable
                      style={[styles.planCard, selectedPlan === "yearly" && styles.planCardSelected]}
                      onPress={() => setSelectedPlan("yearly")}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: selectedPlan === "yearly" }}
                    >
                      {discountPercent > 0 && (
                        <View style={styles.badgeWrap} pointerEvents="none">
                          <LinearGradient
                            colors={[colors.primary, colors.primaryDeep]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.badge}
                          >
                            <Text style={styles.badgeText} numberOfLines={1} maxFontSizeMultiplier={1.1}>
                              {t("paywall.save_percent_dynamic", {
                                percent: discountPercent,
                                defaultValue: "SAVE {{percent}}%",
                              })}
                            </Text>
                          </LinearGradient>
                        </View>
                      )}

                      <View style={styles.planTop}>
                        <View style={[styles.radioOuter, selectedPlan === "yearly" && styles.radioOuterSelected]}>
                          {selectedPlan === "yearly" && <View style={styles.radioInner} />}
                        </View>
                        <Text
                          style={[styles.planTitle, selectedPlan === "yearly" && styles.planTitleSelected]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.8}
                        >
                          {t("paywall.yearly")}
                        </Text>
                      </View>
                      <Text
                        variant="display"
                        style={styles.planPrice}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.6}
                      >
                        {formatPrice(yearlyPkg)}
                      </Text>
                      <Text style={styles.planMeta} numberOfLines={1}>{t("paywall.per_year")}</Text>
                      <View style={styles.planHint}>
                        <Text style={styles.planHintText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                          {getMonthlyHint(yearlyPkg)}{t("paywall.per_month")}
                        </Text>
                      </View>
                    </Pressable>
                  )}

                  {/* Aylık Plan */}
                  {monthlyPkg && (
                    <Pressable
                      style={[styles.planCard, selectedPlan === "monthly" && styles.planCardSelected]}
                      onPress={() => setSelectedPlan("monthly")}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: selectedPlan === "monthly" }}
                    >
                      <View style={styles.planTop}>
                        <View style={[styles.radioOuter, selectedPlan === "monthly" && styles.radioOuterSelected]}>
                          {selectedPlan === "monthly" && <View style={styles.radioInner} />}
                        </View>
                        <Text
                          style={[styles.planTitle, selectedPlan === "monthly" && styles.planTitleSelected]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.8}
                        >
                          {t("paywall.monthly")}
                        </Text>
                      </View>
                      <Text
                        variant="display"
                        style={styles.planPrice}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.6}
                      >
                        {formatPrice(monthlyPkg)}
                      </Text>
                      <Text style={styles.planMeta} numberOfLines={1}>{t("paywall.per_month")}</Text>
                    </Pressable>
                  )}
                </Animated.View>

                {/* Özellikler: yalnız sığan satırlar (sayfa kaymasın diye) */}
                {visibleFeatures.length > 0 && (
                  <View style={styles.featuresSection}>
                    <Text upper style={styles.featuresTitle} numberOfLines={1}>{t("paywall.includes")}</Text>
                    {visibleFeatures.map((f, i) => (
                      <Animated.View
                        key={f.icon}
                        entering={FadeInDown.delay(80 + i * 45).duration(320)}
                        style={styles.featureItem}
                      >
                        <View style={styles.featureIcon}>
                          <MaterialCommunityIcons name={f.icon as any} size={15} color={colors.primary} />
                        </View>
                        <Text style={styles.featureText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                          {f.label}
                        </Text>
                        <Ionicons name="checkmark" size={16} color={colors.primary} />
                      </Animated.View>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Alt blok: kaydırma alanının dışında, hep görünür */}
          {isRevenueCatAvailable() && !loading && packages.length > 0 && (
            <View onLayout={onBottomLayout} style={styles.bottomBlock}>
              {/* Hata mesajı */}
              {errorMsg && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              <Pressable
                style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
                onPress={handleSubscribe}
                disabled={purchasing}
              >
                <LinearGradient colors={[colors.primary, colors.primaryDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
                  {purchasing ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="crown" size={20} color="#FFF" />
                      <Text style={styles.ctaText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                        {t("paywall.subscribe_now")}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              <Text style={styles.autoRenew}>
                {t("paywall.auto_renew", {
                  defaultValue:
                    "Subscription renews automatically. You can cancel anytime in your store settings at least 24 hours before renewal.",
                })}
              </Text>

              <View style={styles.footerLinks}>
                <Pressable
                  style={({ pressed }) => [styles.footerLinkHit, pressed && { opacity: 0.6 }]}
                  onPress={handleRestore}
                  disabled={restoring}
                  hitSlop={8}
                >
                  <Text style={styles.footerLink}>
                    {restoring ? t("paywall.restoring", "Yükleniyor...") : t("paywall.restore")}
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.footerLinkHit, pressed && { opacity: 0.6 }]}
                  onPress={() => Linking.openURL(TERMS_URL)}
                  hitSlop={8}
                >
                  <Text style={styles.footerLink}>
                    {t("paywall.termsOfUse", "Terms of Use")}
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.footerLinkHit, pressed && { opacity: 0.6 }]}
                  onPress={() => Linking.openURL(PRIVACY_URL)}
                  hitSlop={8}
                >
                  <Text style={styles.footerLink}>
                    {t("paywall.privacyPolicy", "Privacy Policy")}
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.footerLinkHit, pressed && { opacity: 0.6 }]}
                  onPress={() => Linking.openURL(MANAGE_SUBSCRIPTION_URL)}
                  hitSlop={8}
                >
                  <Text style={styles.footerLink}>
                    {t("paywall.manageSubscription", "Manage Subscription")}
                  </Text>
                </Pressable>
              </View>

              <Pressable style={({ pressed }) => [styles.secondaryClose, pressed && { opacity: 0.6 }]} onPress={onClose}>
                <Text style={styles.secondaryCloseText}>{t("paywall.maybe_later")}</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            onPress={onClose}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={18} color={colors.gray[500]} />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(31,22,17,0.95)",
    zIndex: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
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
    fontSize: 30,
    lineHeight: 36,
    textAlign: "center",
    marginBottom: 6,
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
});

const createStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    backgroundColor: colors.card,
    borderTopLeftRadius: Radii.sheet,
    borderTopRightRadius: Radii.sheet,
    overflow: "hidden",
  },
  scrollArea: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 20,
    elevation: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isDark ? colors.gray[200] : "rgba(255,255,255,0.9)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray[300],
  },

  // Üst alan
  hero: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 24,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.gray[300],
    marginBottom: 4,
  },
  heroTight: {
    paddingBottom: 6,
  },
  heroInner: {
    alignItems: "center",
    width: "100%",
  },
  heroInnerTight: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    // Sağ üstteki kapat düğmesine binmesin.
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 27,
    lineHeight: 32,
    color: colors.text,
    textAlign: "center",
    marginTop: 2,
    maxWidth: "88%",
  },
  titleCompact: {
    fontSize: 23,
    lineHeight: 28,
  },
  titleTight: {
    flexShrink: 1,
    maxWidth: undefined,
    marginTop: 0,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 4,
  },

  // Boş ve yükleniyor durumları
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    minHeight: 180,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "400",
    textAlign: "center",
  },

  // Plan kartları
  planGrid: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  planCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.gray[200],
    backgroundColor: isDark ? colors.gray[100] : colors.gray[50],
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 12,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: isDark ? "rgba(255,139,61,0.12)" : "#FFF4EA",
  },
  badgeWrap: {
    position: "absolute",
    top: -11,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    maxWidth: "92%",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.4,
  },
  planTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
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
  planTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: "700",
    color: colors.gray[600],
  },
  planTitleSelected: {
    color: colors.text,
  },
  planPrice: {
    fontSize: 24,
    lineHeight: 29,
    color: colors.text,
  },
  planMeta: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },
  planHint: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    backgroundColor: isDark ? "rgba(255,139,61,0.16)" : "rgba(242,96,12,0.10)",
  },
  planHintText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },

  // Özellikler
  featuresSection: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  featuresTitle: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    color: colors.gray[400],
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  featureItem: {
    height: FEATURE_ROW_H,
    marginBottom: FEATURE_ROW_GAP,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isDark ? "rgba(255,139,61,0.16)" : "rgba(242,96,12,0.10)",
  },
  featureText: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  // Alt blok
  bottomBlock: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isDark ? "rgba(248,113,113,0.14)" : "#FEF2F2",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
    gap: 8,
  },
  errorText: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "600",
    color: colors.error,
  },
  ctaButton: {
    borderRadius: Radii.control + 2,
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: Radii.control + 2,
    gap: 8,
  },
  ctaText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
  },
  autoRenew: {
    fontSize: 10.5,
    lineHeight: 14,
    color: colors.gray[400],
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 6,
  },
  footerLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 14,
    rowGap: 4,
    marginTop: 6,
  },
  footerLinkHit: {
    paddingVertical: 2,
  },
  footerLink: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.gray[500],
    textDecorationLine: "underline",
  },
  secondaryClose: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 2,
  },
  secondaryCloseText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.gray[400],
  },
});
