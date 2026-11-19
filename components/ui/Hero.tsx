import { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import Animated, {
  Easing,
  FadeInDown,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Text } from "./AppText";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { AppColors } from "../../constants/colors";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../brand/BrandLogo";
import { HERO } from "../../lib/heroLayout";

/** "PureScan | FOODS" yazı logosunun en/boy oranı (geriye dönük ad; asıl değer lib/heroLayout HERO). */
export const HERO_WORDMARK_ASPECT = HERO.wordmarkAspect;
/** Simge ile yazı arasındaki boşluk. */
export const HERO_MARK_GAP = HERO.markGap;

const GradientText = ({ colors, ...props }: any) => {
  return (
    <MaskedView maskElement={<Text {...props} />}>
      <LinearGradient colors={[colors.secondary, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text {...props} style={[props.style, { opacity: 0 }]} />
      </LinearGradient>
    </MaskedView>
  );
};

type HeroProps = {
  /** stacked: portakal üstte, yazı altta. inline: küçük ekranda yan yana (yazılı logo hiç gizlenmez). */
  lockup?: "stacked" | "inline";
  /** Yan yana düzende logonun genişliği. */
  inlineWidth?: number;
  /** Logo ile başlık arası boşluk (ana ekranın blok boşluğu, lib/heroLayout). */
  gap?: number;
  /** Ortadaki portakal simgesinin ölçüsü: ana ekran, kalan yüksekliğe göre hesaplar. */
  markSize: number;
  /** Altındaki "PureScan | FOODS" yazısının genişliği. */
  wordmarkWidth: number;
  /** Çok dar ekranda alt başlık gizlenir. */
  showSubheadline?: boolean;
  /** Eski ad: yazı logosu artık gizlenmez, küçük ekranda yan yana düzene geçer. */
  showWordmark?: boolean;
  /** En küçük ekranda başlık da gizlenir. */
  showHeadline?: boolean;
};

export default function Hero({
  lockup = "stacked",
  inlineWidth = 260,
  gap = 20,
  markSize,
  wordmarkWidth,
  showSubheadline = true,
  showWordmark = true,
  showHeadline = true,
}: HeroProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const reduce = useReducedMotion();

  // Simgenin arkasında yavaşça nefes alan sıcak hale: logo zemine yapışık durmasın, ışık alsın.
  const breathe = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    breathe.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(breathe);
  }, [reduce, breathe]);
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + breathe.value * 0.35,
    transform: [{ scale: 0.96 + breathe.value * 0.06 }],
  }));

  // Hale simge kutusunun biraz dışına taşar; kaydırma alanının üst kenarında kesik görünmesin diye
  // ışık yarıçapın üçte ikisinde tamamen söner.
  const halo = markSize * 1.5;

  return (
    <View style={styles.container}>
      {lockup === "inline" ? (
        <Animated.View entering={reduce ? undefined : FadeInDown.duration(520)} style={styles.logoWrapper}>
          <BrandLogo variant="horizontal" width={inlineWidth} />
        </Animated.View>
      ) : (
      <Animated.View entering={reduce ? undefined : FadeInDown.duration(520)} style={styles.logoWrapper}>
        <View style={{ width: markSize, height: markSize, alignItems: "center", justifyContent: "center" }}>
          <Animated.View
            pointerEvents="none"
            style={[{ position: "absolute", width: halo, height: halo }, haloStyle]}
          >
            <Svg width={halo} height={halo}>
              <Defs>
                <RadialGradient id="heroHalo" cx="50%" cy="54%" r="50%">
                  <Stop offset="0" stopColor={colors.primary} stopOpacity={isDark ? 0.34 : 0.24} />
                  <Stop offset="0.42" stopColor={colors.primary} stopOpacity={isDark ? 0.12 : 0.08} />
                  <Stop offset="0.68" stopColor={colors.primary} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle cx={halo / 2} cy={halo / 2} r={halo / 2} fill="url(#heroHalo)" />
            </Svg>
          </Animated.View>
          <BrandLogo variant="mark" size={markSize} />
        </View>
        <BrandLogo variant="wordmark" width={wordmarkWidth} style={{ marginTop: HERO.markGap }} />
      </Animated.View>
      )}

      {showHeadline ? (
        <View style={[styles.sloganContainer, { marginTop: gap + HERO.sloganTop }]}>
          <GradientText
            colors={colors}
            variant="display"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={styles.sloganMain}
          >
            {t("home.headline", { defaultValue: "Gıdalarınızda Neler Var?" })}
          </GradientText>

          {showSubheadline ? (
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={styles.sloganSub}>
              {t("home.subheadline", { defaultValue: "AI destekli analiz ile anında öğren" })}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "stretch",
    },
    logoWrapper: {
      alignItems: "center",
    },
    sloganContainer: {
      alignItems: "center",
      alignSelf: "stretch",
      marginTop: HERO.sloganTop,
      paddingHorizontal: 8,
    },
    sloganMain: {
      fontSize: HERO.headlineSize,
      lineHeight: HERO.headlineLine,
      letterSpacing: 0.2,
      textAlign: "center",
    },
    sloganSub: {
      fontSize: HERO.subSize,
      lineHeight: HERO.subLine,
      fontWeight: "500",
      color: colors.textMuted,
      marginTop: HERO.subTop,
      letterSpacing: 0.3,
      textAlign: "center",
    },
  });
