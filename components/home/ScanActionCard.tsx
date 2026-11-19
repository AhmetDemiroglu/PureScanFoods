// Ana ekranın ana eylemi: "İçeriği Çek" kartı. Sağda canlı bir kadraj (dört köşe, etiket satırları,
// aşağı yukarı gezen tarama çizgisi) kartın ne yaptığını yazıdan önce anlatır. Üstünden ara ara ışık geçer.
// Dokununca kamera açılır (akış index.tsx'te, eskisiyle aynı).
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { Text } from "../ui/AppText";
import ScanSweep from "../ui/ScanSweep";
import { useTheme } from "../../context/ThemeContext";
import { Springs } from "../../constants/motion";
import * as haptics from "../../lib/haptics";

type Props = {
  height: number;
  title: string;
  hint: string;
  active: boolean;
  onPress: () => void;
};

const RADIUS = 26;
const CORNER = 14;

function Viewfinder({ size, active }: { size: number; active: boolean }) {
  const reduce = useReducedMotion();
  const y = useSharedValue(0);

  useEffect(() => {
    if (!active || reduce) {
      cancelAnimation(y);
      y.value = 0.5;
      return;
    }
    y.value = 0;
    y.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    return () => cancelAnimation(y);
  }, [active, reduce, y]);

  const inset = 10;
  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: inset + y.value * (size - inset * 2 - 2) }],
  }));

  const bar = (w: number, o: number) => (
    <View style={{ width: w, height: 5, borderRadius: 3, backgroundColor: `rgba(255,255,255,${o})` }} />
  );

  return (
    <View style={{ width: size, height: size }}>
      {/* Kadrajın içi: etiket satırlarını andıran çubuklar */}
      <View style={[StyleSheet.absoluteFill, styles.vfInner]}>
        <View style={{ gap: 6, width: size - 30 }}>
          {bar((size - 30) * 0.55, 0.75)}
          {bar((size - 30) * 0.95, 0.38)}
          {bar((size - 30) * 0.8, 0.38)}
          {bar((size - 30) * 0.9, 0.38)}
          {bar((size - 30) * 0.5, 0.38)}
        </View>
      </View>
      {/* Tarama çizgisi */}
      <Animated.View pointerEvents="none" style={[styles.scanLine, lineStyle]}>
        <LinearGradient
          colors={["rgba(255,255,255,0)", "#FFFFFF", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {/* Dört köşe */}
      <View style={[styles.corner, { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 }]} />
      <View style={[styles.corner, { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 }]} />
      <View style={[styles.corner, { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 }]} />
      <View style={[styles.corner, { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 }]} />
    </View>
  );
}

export default function ScanActionCard({ height, title, hint, active, onPress }: Props) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const { width } = useWindowDimensions();
  // Dar ekranda kadraj küçülür: açıklama yazısına yer kalsın.
  const vf = Math.min(height - 32, 112, Math.round(width * 0.27));

  return (
    <Animated.View
      style={[
        styles.shadowWrap,
        !isDark && { shadowColor: colors.primaryDeep, shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
        pressStyle,
      ]}
    >
      <Pressable
        onPress={() => {
          haptics.impactLight();
          onPress();
        }}
        onPressIn={() => {
          scale.value = withSpring(0.975, Springs.snappy);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, Springs.bouncy);
        }}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={hint}
        style={[styles.card, { height }]}
      >
        <LinearGradient
          colors={["#FF8A3D", colors.primary, colors.primaryDeep]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Sol üstten düşen yumuşak ışık: düz turuncu yerine derinliği olan yüzey */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg width="100%" height="100%">
            <Defs>
              <RadialGradient id="scanCardLight" cx="12%" cy="0%" r="85%">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.24} />
                <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#scanCardLight)" />
          </Svg>
        </View>
        <ScanSweep active={active} />

        <View style={styles.row}>
          <View style={styles.text}>
            {/* iOS'ta satır yüksekliği olan yazıda otomatik küçültme yanlış hesaplıyor: iki satıra izin verilir. */}
            <Text variant="display" style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.hint} numberOfLines={3} maxFontSizeMultiplier={1.15}>
              {hint}
            </Text>
          </View>
          <Viewfinder size={vf} active={active} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: RADIUS,
    elevation: 8,
  },
  card: {
    borderRadius: RADIUS,
    overflow: "hidden",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 16,
    gap: 14,
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
    color: "#FFF",
  },
  hint: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.88)",
    fontWeight: "500",
  },
  vfInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  scanLine: {
    position: "absolute",
    left: 4,
    right: 4,
    top: 0,
    height: 2,
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: "#FFFFFF",
  },
});
