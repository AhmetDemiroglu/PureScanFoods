import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { Colors } from "../../constants/colors";
import { useTranslation } from "react-i18next";

const GradientText = (props: any) => {
    return (
        <MaskedView maskElement={<Text {...props} />}>
            <LinearGradient
                colors={[Colors.secondary, Colors.primary]}
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
    }, []);

    const rotate = swayAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ["-5deg", "5deg"],
    });

    return (
        <View style={styles.container}>
            {/* 1. Animasyonlu Logo */}
            <Animated.View style={[styles.logoWrapper, { transform: [{ rotate: rotate }] }]}>
                <View style={styles.tiltedBox}>
                    <LinearGradient
                        colors={[Colors.secondary, "#0F172A"]}
                        style={styles.gradientBox}
                    >
                        <Ionicons name="scan" size={48} color={Colors.white} />
                    </LinearGradient>
                </View>
            </Animated.View>

            {/* 2. Marka İsmi */}
            <View style={styles.textWrapper}>
                <View style={styles.titleRow}>
                    <Text style={styles.titlePure}>Pure</Text>
                    <Text style={styles.titleScan}>Scan</Text>
                </View>
                <Text style={styles.subtitleFoods}>foods</Text>
            </View>

            {/* 3. Gradient Slogan ve Alt Metin (Çeviriye Bağlandı) */}
            <View style={styles.sloganContainer}>
                <GradientText style={styles.sloganMain}>
                    {t("home.headline", { defaultValue: "Gıdalarınızda Neler Var?" })}
                </GradientText>

                <Text style={styles.sloganSub}>
                    {t("home.subheadline", { defaultValue: "AI destekli analiz ile anında öğren" })}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    logoWrapper: {
        marginBottom: 20,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
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
        borderColor: "rgba(255,255,255,0.1)",
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
        color: Colors.secondary,
        letterSpacing: -1,
    },
    titleScan: {
        fontSize: 36,
        fontWeight: "800",
        color: Colors.primary,
        letterSpacing: -1,
    },
    subtitleFoods: {
        fontSize: 28,
        fontFamily: "serif",
        fontStyle: "italic",
        color: "#EF4444",
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
        color: Colors.gray[500],
        marginTop: 6,
        letterSpacing: 0.5,
        textAlign: "center",
    },
});