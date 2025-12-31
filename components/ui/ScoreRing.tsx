import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { Colors } from "../../constants/colors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreRingProps {
    score: number;      // 0-100 arası puan
    size?: number;      // Çap (varsayılan 120)
    strokeWidth?: number; // Kalınlık
    label: string;      // "Güvenlik" veya "Uyum"
    type?: "safety" | "compatibility"; // Renk şeması için
}

export default function ScoreRing({
    score,
    size = 120,
    strokeWidth = 10,
    label,
    type = "safety"
}: ScoreRingProps) {

    // Animasyon Değerleri
    const animatedValue = useRef(new Animated.Value(0)).current;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Renk Hesaplama (Puana Göre)
    const getColor = (val: number) => {
        if (val >= 80) return "#10B981"; // Yeşil (Mükemmel)
        if (val >= 60) return "#84CC16"; // Açık Yeşil (İyi)
        if (val >= 40) return "#F59E0B"; // Turuncu (Orta)
        if (val >= 20) return "#F97316"; // Koyu Turuncu (Riskli)
        return "#EF4444";                // Kırmızı (Tehlikeli)
    };

    const color = getColor(score);

    useEffect(() => {
        // Animasyonu başlat (0'dan Score'a)
        Animated.timing(animatedValue, {
            toValue: score,
            duration: 1500, // 1.5 saniyede dolsun
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true, // SVG animasyonu için true genelde çalışır ama bazen false gerekebilir
        }).start();
    }, [score]);

    // Stroke Dash Offset Animasyonu
    // Circle'ın ne kadarının dolu olacağını hesaplar
    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0], // Çemberin tamamından 0'a (tam doluya)
    });

    return (
        <View style={[styles.container, { width: size, height: size + 30 }]}>
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                {/* SVG ALANI */}
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        {/* 1. Arka Plan Halkası (Gri) */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={Colors.gray[200]}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        {/* 2. Ön Plan Halkası (Renkli & Hareketli) */}
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round" // Uçları yuvarlak
                        />
                    </G>
                </Svg>

                {/* ORTA KISIM: PUAN */}
                <View style={[StyleSheet.absoluteFillObject, { justifyContent: "center", alignItems: "center" }]}>
                    <Text style={[styles.scoreText, { color: color, fontSize: size * 0.28 }]}>
                        {score}
                    </Text>
                    <Text style={styles.scoreMax}>/100</Text>
                </View>
            </View>

            {/* ALT ETİKET (Güvenlik / Uyum) */}
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    scoreText: {
        fontWeight: "900",
        textAlign: "center",
    },
    scoreMax: {
        fontSize: 10,
        color: Colors.gray[400],
        fontWeight: "600",
        marginTop: -2,
    },
    label: {
        marginTop: 8,
        fontSize: 13,
        fontWeight: "700",
        color: Colors.gray[600],
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
});