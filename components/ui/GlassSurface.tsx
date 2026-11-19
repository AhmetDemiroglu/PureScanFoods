// Ortak cam yüzey. Ahmet'in onayladığı Anıl Boya alt barı deseni:
//  - iOS 26+ (Liquid Glass): GlassView arka katman, dış kabuk şeffaf (boya, kenarlık, gölge yok).
//  - Eski iOS: BlurView ayrı kırpma katmanında, ince boya + hairline kenarlık, gölge dış katmanda
//    (iOS'ta overflow:hidden gölgeyi de keser, o yüzden kırpma ve gölge ayrı katmanda).
//  - Android: tema uyumlu düz yüzey + hairline kenarlık + elevation.
// İçerik her zaman ayrı katmanda durur; cam katmanının atalarında opacity < 1 kullanılmaz.

import React from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect";
import { useTheme } from "../../context/ThemeContext";
import { glassTint, shadow } from "../../constants/design";

const isIOS = Platform.OS === "ios";

function detectNativeGlass(): boolean {
  if (!isIOS) return false;
  try {
    return isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  } catch {
    return false;
  }
}

/** Cihaz gerçek Liquid Glass çiziyor mu (iOS 26+ ve uygun derleme). */
export const hasNativeGlass = detectNativeGlass();

type Props = {
  radius: number;
  style?: StyleProp<ViewStyle>;
  /** İçerik katmanının stili (yerleşim, padding). Yüzey sabit boyutluysa { flex: 1 } verilir. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Native olmayan yolda gölge seviyesi. */
  elevation?: "sm" | "md" | "lg" | "none";
  /** Koyu zemin üstünde (fotoğraf, turuncu başlık) duran küçük düğmeler için koyu cam. */
  tone?: "auto" | "dark";
  /**
   * Yazısı doğrudan camın üstünde duran ve altından yazı geçen yüzeyler (alt bar, eylem çubuğu).
   * Cam biraz daha yoğun boyanır: etiketler alttan geçen yazıyla karışmaz. Kenar kırılması aynı.
   */
  dense?: boolean;
  pointerEvents?: "auto" | "none" | "box-none" | "box-only";
  children?: React.ReactNode;
};

export default function GlassSurface({
  radius,
  style,
  contentStyle,
  elevation = "md",
  tone = "auto",
  dense = false,
  pointerEvents,
  children,
}: Props) {
  const { colors, isDark } = useTheme();
  const tint = glassTint(colors, isDark);
  const dark = tone === "dark" || isDark;

  if (hasNativeGlass) {
    return (
      <View pointerEvents={pointerEvents} style={[{ borderRadius: radius }, style]}>
        <GlassView
          pointerEvents="none"
          glassEffectStyle="regular"
          colorScheme={dark ? "dark" : "light"}
          tintColor={dense ? (dark ? "rgba(21,16,12,0.42)" : "rgba(255,250,245,0.46)") : undefined}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
        <View style={contentStyle}>{children}</View>
      </View>
    );
  }

  const shell: ViewStyle =
    tone === "dark"
      ? { backgroundColor: isIOS ? "rgba(20,12,6,0.32)" : "rgba(20,12,6,0.55)" }
      : {
          backgroundColor: isIOS ? tint.iosFill : tint.androidFill,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: tint.border,
        };

  return (
    <View
      pointerEvents={pointerEvents}
      style={[{ borderRadius: radius }, shell, elevation !== "none" && shadow(elevation, isDark), style]}
    >
      {isIOS ? (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: "hidden" }]}>
          <BlurView
            intensity={tone === "dark" ? 40 : 75}
            tint={dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"}
            style={StyleSheet.absoluteFill}
          />
        </View>
      ) : null}
      <View style={contentStyle}>{children}</View>
    </View>
  );
}
