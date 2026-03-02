import React, { useEffect } from "react";
import { StyleSheet, Pressable } from "react-native";
import Svg, { G, Circle, Path } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  interpolate,
} from "react-native-reanimated";

const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 28;
const INDICATOR_SIZE = 24;
const PADDING = (TRACK_HEIGHT - INDICATOR_SIZE) / 2; // 2

const BULUT_PATH =
  "M19.16,13.88a1.23,1.23,0,0,1,0-.16c0-.06,0-.12,0-.18a3.11,3.11,0,0,0-5.46-2.14,3.12,3.12,0,0,0-5.74,2.32,1.22,1.22,0,0,1,0,.16c0,.06,0,.12,0,.18a3.11,3.11,0,0,0,2.16,3h.08a3.12,3.12,0,0,0,5.74-2.32,3.11,3.11,0,0,0,3.22-.86ZM16,16a1.12,1.12,0,1,1,1.12-1.12A1.12,1.12,0,0,1,16,16ZM10,14a1.12,1.12,0,1,1,1.12-1.12A1.12,1.12,0,0,1,10,14Z";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle?: () => void;
  primaryColor?: string;
  warningColor?: string;
}

export default function ThemeToggle({
  isDark,
  onToggle,
}: ThemeToggleProps) {
  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isDark ? 1 : 0, {
      damping: 14,
      stiffness: 90,
    });
  }, [isDark, progress]);

  // Arka Plan Şeridi (Track)
  const trackStyle = useAnimatedStyle(() => {
    return {
      width: TRACK_WIDTH,
      height: TRACK_HEIGHT,
      borderRadius: TRACK_HEIGHT / 2,
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ["#38BDF8", "#0F172A"] // Gündüz Gökyüzü -> Gece Uzayı
      ),
      borderColor: interpolateColor(
        progress.value,
        [0, 1],
        ["#7DD3FC", "#1E293B"]
      ),
      borderWidth: 1,
      justifyContent: "center",
      padding: PADDING,
      overflow: "hidden",
    };
  });

  // Bulutlar (Gündüz)
  const dayBackgroundStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      right: interpolate(progress.value, [0, 1], [4, TRACK_WIDTH * 0.5]),
      opacity: interpolate(progress.value, [0, 0.4, 1], [1, 0, 0]),
      transform: [
        { scale: interpolate(progress.value, [0, 0.5, 1], [1, 0.8, 0.5]) },
      ],
    };
  });

  // Yıldızlar (Gece)
  const nightBackgroundStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      left: interpolate(progress.value, [0, 1], [TRACK_WIDTH * 0.5, 6]),
      opacity: interpolate(progress.value, [0, 0.6, 1], [0, 0, 1]),
      transform: [
        { scale: interpolate(progress.value, [0, 0.5, 1], [0.5, 0.8, 1]) },
      ],
    };
  });

  // Hareketli Şeffaf Çekirdek (Indicator)
  const indicatorStyle = useAnimatedStyle(() => {
    const maxTranslate = TRACK_WIDTH - INDICATOR_SIZE - PADDING * 2 - 2; // -2 border payı
    return {
      width: INDICATOR_SIZE,
      height: INDICATOR_SIZE,
      // HATA BURADAYDI: Artık tamamen şeffaf, arkası katı renk değil.
      backgroundColor: "transparent",
      transform: [
        { translateX: interpolate(progress.value, [0, 1], [0, maxTranslate]) },
      ],
      justifyContent: "center",
      alignItems: "center",
    };
  });

  // Güneş İkonu Animasyonu
  const sunStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      opacity: interpolate(progress.value, [0, 0.5, 1], [1, 0, 0]),
      transform: [
        { rotate: `${progress.value * 90}deg` },
        { scale: interpolate(progress.value, [0, 1], [1, 0.3]) },
      ],
    };
  });

  // Ay İkonu Animasyonu
  const moonStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]),
      transform: [
        { scale: interpolate(progress.value, [0, 1], [0.3, 1]) },
        { rotate: `${(1 - progress.value) * -90}deg` },
      ],
    };
  });

  return (
    <Pressable onPress={onToggle} style={styles.container}>
      <Animated.View style={trackStyle}>
        
        {/* Bulutlar */}
        <Animated.View style={dayBackgroundStyle}>
          <Svg width={28} height={20} viewBox="0 0 24 24" fill="none">
            <Path d={BULUT_PATH} fill="white" opacity={0.8} />
          </Svg>
        </Animated.View>

        {/* Yıldızlar */}
        <Animated.View style={nightBackgroundStyle}>
          <Svg width={28} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx="6" cy="10" r="1.5" fill="#FEF3C7" opacity={0.9} />
            <Circle cx="16" cy="6" r="1" fill="white" opacity={0.8} />
            <Circle cx="20" cy="14" r="1.2" fill="#FEF3C7" opacity={0.7} />
            <Circle cx="10" cy="16" r="0.8" fill="white" opacity={0.5} />
          </Svg>
        </Animated.View>

        {/* Taşıyıcı Çekirdek (Şeffaf) */}
        <Animated.View style={indicatorStyle}>
          
          {/* Güneş SVG */}
          <Animated.View style={sunStyle}>
            <Svg width={INDICATOR_SIZE} height={INDICATOR_SIZE} viewBox="0 0 24 24" fill="none">
              <G stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round">
                <Circle cx="12" cy="12" r="5.5" fill="#FBBF24" stroke="none" />
                <Path d="M12,2v2" />
                <Path d="M12,20v2" />
                <Path d="M4.93,4.93l1.41,1.41" />
                <Path d="M17.66,17.66l1.41,1.41" />
                <Path d="M2,12H4" />
                <Path d="M20,12h2" />
                <Path d="M4.93,19.07l1.41,-1.41" />
                <Path d="M17.66,6.34l1.41,-1.41" />
              </G>
            </Svg>
          </Animated.View>

          {/* Gerçekçi Ay SVG (Çukurlu) */}
          <Animated.View style={moonStyle}>
            <Svg width={INDICATOR_SIZE} height={INDICATOR_SIZE} viewBox="0 0 24 24" fill="none">
              <G fill="#E2E8F0">
                <Circle cx="12" cy="12" r="8" />
                <Circle cx="15" cy="9" r="1.5" fill="#CBD5E1" />
                <Circle cx="9" cy="14" r="2" fill="#CBD5E1" />
                <Circle cx="11" cy="7" r="1" fill="#CBD5E1" />
                <Circle cx="14" cy="15" r="1.2" fill="#CBD5E1" />
              </G>
            </Svg>
          </Animated.View>

        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});