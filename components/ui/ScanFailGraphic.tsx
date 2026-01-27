import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../constants/colors';

export const ScanFailGraphic = () => {
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: 10, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
            ])
        ).start();
    }, []);

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', height: 120 }}>
            {/* Arka Plan Glow Efekti */}
            <Svg height="120" width="120" viewBox="0 0 100 100" style={{ position: 'absolute' }}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.1" />
                        <Stop offset="1" stopColor={Colors.secondary} stopOpacity="0.05" />
                    </LinearGradient>
                </Defs>
                <Circle cx="50" cy="50" r="45" fill="url(#grad)" />
            </Svg>

            {/* Hareketli Büyüteç ve İkon */}
            <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
                <Svg height="80" width="80" viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                        stroke={Colors.primary}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <Path
                        d="M11 8V11M11 14H11.01"
                        stroke={Colors.secondary}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </Svg>
            </Animated.View>
        </View>
    );
};