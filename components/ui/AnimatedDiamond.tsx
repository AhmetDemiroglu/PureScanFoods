import React, { useEffect } from "react";
import Svg, { Polygon } from "react-native-svg";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from "react-native-reanimated";

interface AnimatedDiamondProps {
    size?: number;
}

export default function AnimatedDiamond({ size = 20 }: AnimatedDiamondProps) {
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        // 3 saniyede bir kendi ekseninde 3D dönme (1.2 saniye sürer)
        rotation.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 3000 }),
                withTiming(360, { duration: 1200, easing: Easing.inOut(Easing.ease) })
            ),
            -1 // Sonsuz döngü
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
                { rotateY: `${rotation.value}deg` },
                { scale: scale.value }
            ],
        };
    });

    return (
        <Animated.View style={animatedStyle}>
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                {/* Üst Düzey (En Açık Ton) */}
                <Polygon points="7,3 17,3 15,9 9,9" fill="#FEF3C7" />
                {/* Sol Üst */}
                <Polygon points="2,9 7,3 9,9" fill="#FDE68A" />
                {/* Sağ Üst */}
                <Polygon points="17,3 22,9 15,9" fill="#FCD34D" />
                {/* Sol Alt (Ana Gölge) */}
                <Polygon points="2,9 9,9 12,21" fill="#F59E0B" />
                {/* Sağ Alt (Derin Gölge) */}
                <Polygon points="22,9 15,9 12,21" fill="#D97706" />
                {/* Orta Ön (Parlak Yüzey) */}
                <Polygon points="9,9 15,9 12,21" fill="#FBBF24" />
            </Svg>
        </Animated.View>
    );
}