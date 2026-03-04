import React, { useEffect } from "react";
import Svg, { Polygon, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
    interpolate,
} from "react-native-reanimated";

interface AnimatedDiamondProps {
    size?: number;
}

export default function AnimatedDiamond({ size = 20 }: AnimatedDiamondProps) {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        // 3 saniyede bir kendi ekseninde 3D dönme
        rotation.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 3000 }),
                withTiming(360, { duration: 1200, easing: Easing.inOut(Easing.ease) })
            ),
            -1
        );

        // Dönüşe eşlik eden parlama/büyüme efekti
        scale.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 3000 }),
                withTiming(1.15, { duration: 600, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 600, easing: Easing.in(Easing.ease) })
            ),
            -1
        );
    }, [rotation, scale]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotateY: `${rotation.value}deg` }, // Y ekseninde 3D dönüş
                { scale: scale.value }
            ],
        };
    });

    return (
        <Animated.View style={animatedStyle}>
            <Svg width={size * 1.3} height={size * 1.3} viewBox="0 0 24 24" fill="none">
                <Defs>
                    <RadialGradient id="shine" cx="50%" cy="50%" rx="50%" ry="50%">
                        <Stop offset="0%" stopColor="#FFF" stopOpacity="0.8" />
                        <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
                    </RadialGradient>
                </Defs>
                <Polygon points="7,3 17,3 15,9 9,9" fill="#FEF3C7" />
                <Polygon points="2,9 7,3 9,9" fill="#FDE68A" />
                <Polygon points="17,3 22,9 15,9" fill="#FCD34D" />
                <Polygon points="9,9 15,9 12,12" fill="#FBBF24" />
                <Polygon points="2,9 9,9 12,21" fill="#F59E0B" />
                <Polygon points="22,9 15,9 12,21" fill="#D97706" />
                <Polygon points="9,9 15,9 12,21" fill="#FBBF24" />
                <Polygon points="9,12 12,21 15,12" fill="#F59E0B" fillOpacity="0.4" />
                <Polygon points="7,3 17,3 22,9 12,21 2,9" stroke="#D97706" strokeWidth="0.5" />
            </Svg>
        </Animated.View>
    );
}