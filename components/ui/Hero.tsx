import { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { AppColors } from "../../constants/colors";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

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

export default function Hero() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const swayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: -1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [swayAnim]);

  const rotate = swayAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-5deg", "5deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <View style={[styles.tiltedBox, { transform: [{ rotate: "0deg" }] }]}>
          <LinearGradient
            colors={isDark ? [colors.gray[200], colors.surface] : [colors.secondary, "#0F172A"]}
            style={styles.gradientBox}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={{ transform: [{ rotate: rotate }] }}>
              <Ionicons name="scan" size={48} color={colors.white} />
            </Animated.View>

            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [
                    {
                      translateY: swayAnim.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: [-34, 0, 34],
                      }),
                    },
                  ],
                  opacity: swayAnim.interpolate({
                    inputRange: [-1, -0.8, 0, 0.8, 1],
                    outputRange: [0, 1, 1, 1, 0],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={["transparent", colors.primary, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.textWrapper}>
        <View style={styles.titleRow}>
          <Text style={styles.titlePure}>Pure</Text>
          <Text style={styles.titleScan}>Scan</Text>
        </View>
        <Text style={styles.subtitleFoods}>foods</Text>
      </View>

      <View style={styles.sloganContainer}>
        <GradientText colors={colors} style={styles.sloganMain}>
          {t("home.headline", { defaultValue: "G�dalar�n�zda Neler Var?" })}
        </GradientText>

        <Text style={styles.sloganSub}>
          {t("home.subheadline", { defaultValue: "AI destekli analiz ile an�nda ��ren" })}
        </Text>
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
      marginBottom: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.2 : 0.3,
      shadowRadius: 16,
      elevation: 10,
    },
    tiltedBox: {
      width: 88,
      height: 88,
      borderRadius: 24,
      transform: [{ rotate: "8deg" }],
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? colors.border : "rgba(255,255,255,0.1)",
    },
    gradientBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    textWrapper: {
      alignItems: "center",
      marginBottom: 16,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    titlePure: {
      fontSize: 36,
      fontWeight: "800",
      color: colors.secondary,
      letterSpacing: -1,
    },
    titleScan: {
      fontSize: 36,
      fontWeight: "800",
      color: colors.primary,
      letterSpacing: -1,
    },
    subtitleFoods: {
      fontSize: 28,
      fontFamily: "serif",
      fontStyle: "italic",
      color: isDark ? "#F87171" : "#EF4444",
      marginTop: -10,
      marginLeft: 120,
      transform: [{ rotate: "-6deg" }],
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
    scanLine: {
      position: "absolute",
      width: "85%",
      left: "7.5%",
      height: 3,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 12,
      elevation: 8,
      zIndex: 10,
      borderRadius: 2,
    },
  });


