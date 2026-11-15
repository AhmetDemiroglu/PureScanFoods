import { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { Text } from "./AppText";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { AppColors } from "../../constants/colors";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import BrandLogo from "../brand/BrandLogo";

const GradientText = ({ colors, ...props }: any) => {
  return (
    <MaskedView maskElement={<Text {...props} />}>
      <LinearGradient
        colors={[colors.secondary, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text {...props} style={[props.style, { opacity: 0 }]} />
      </LinearGradient>
    </MaskedView>
  );
};

/** Yatay logonun (simge + PureScan | FOODS) en/boy oranı. */
export const HERO_LOGO_ASPECT = 4.7865;

type HeroProps = {
  /** Logo genişliği: ana ekran, kalan yüksekliğe göre hesaplar. */
  logoWidth: number;
  /** Çok dar ekranda alt başlık gizlenir. */
  showSubheadline?: boolean;
};

export default function Hero({ logoWidth, showSubheadline = true }: HeroProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: enter,
            transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
          },
        ]}
      >
        <BrandLogo variant="horizontal" width={logoWidth} />
      </Animated.View>

      <View style={styles.sloganContainer}>
        <GradientText colors={colors} style={styles.sloganMain}>
          {t("home.headline", { defaultValue: "Gıdalarınızda Neler Var?" })}
        </GradientText>

        {showSubheadline ? (
          <Text style={styles.sloganSub}>
            {t("home.subheadline", { defaultValue: "AI destekli analiz ile anında öğren" })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
    },
    logoWrapper: {
      marginBottom: 18,
      alignItems: "center",
    },
    sloganContainer: {
      alignItems: "center",
      marginTop: 8,
    },
    sloganMain: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: 0.3,
      textAlign: "center",
    },
    sloganSub: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textMuted,
      marginTop: 6,
      letterSpacing: 0.5,
      textAlign: "center",
    },
  });


