import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Colors } from "../../constants/colors";

export const TypingIndicator = () => {
    const opacity1 = useRef(new Animated.Value(0.3)).current;
    const opacity2 = useRef(new Animated.Value(0.3)).current;
    const opacity3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animate = (anim: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                        delay: delay
                    }),
                    Animated.timing(anim, {
                        toValue: 0.3,
                        duration: 400,
                        useNativeDriver: true
                    })
                ])
            ).start();
        };

        animate(opacity1, 0);
        animate(opacity2, 200);
        animate(opacity3, 400);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.dot, { opacity: opacity1 }]} />
            <Animated.View style={[styles.dot, { opacity: opacity2 }]} />
            <Animated.View style={[styles.dot, { opacity: opacity3 }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        backgroundColor: Colors.gray[100],
        borderBottomLeftRadius: 4,
        borderRadius: 16,
        alignSelf: "flex-start",
        marginLeft: 16,
        marginBottom: 8,
        width: 60,
        height: 40,
        gap: 4
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.gray[500]
    }
});
