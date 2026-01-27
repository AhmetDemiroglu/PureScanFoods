import React, { useEffect, useRef } from "react";
import { View, Image, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/colors";

type BrandLoaderProps = {
    mode?: "fullscreen" | "inline";
    size?: number;
};

export function BrandLoader({ mode = "fullscreen", size }: BrandLoaderProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0.7)).current;

    useEffect(() => {
        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Fade animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0.7,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const logoSize = size || (mode === "fullscreen" ? 120 : 60);

    const content = (
        <Animated.View
            style={[
                styles.logoContainer,
                {
                    transform: [{ scale: pulseAnim }],
                    opacity: fadeAnim,
                },
            ]}
        >
            <Image
                source={require("../../assets/brand-logo.png")}
                style={{ width: logoSize, height: logoSize }}
                resizeMode="contain"
            />
        </Animated.View>
    );

    if (mode === "inline") {
        return <View style={styles.inlineWrapper}>{content}</View>;
    }

    return (
        <LinearGradient
            colors={["#FFFFFF", "#FFF8F3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fullscreenWrapper}
        >
            {content}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    fullscreenWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    inlineWrapper: {
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    logoContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
});