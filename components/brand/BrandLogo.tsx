import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { SvgXml } from "react-native-svg";
import { BRAND_SVG, BrandSvgKey } from "./brandSvgs";
import { useTheme } from "../../context/ThemeContext";

/**
 * Uygulamadaki her PureScan Foods logosu bu bileşenden gelir.
 * - mark: yalnız simge (kare)
 * - horizontal: simge + PureScan | FOODS (geniş alanlar)
 * - compact: yatay, küçük boyda okunur ek (üst bar, kamera başlığı, paylaşım kartı)
 * - vertical: simge üstte, yazı altta (açılış, ana ekran)
 * - wordmark: yalnız yazı
 * - icon: yuvarlak köşeli uygulama ikonu
 * Boyut: kare olanlarda `size`, yazılı olanlarda `height` (genişlik orandan hesaplanır).
 * tone: "auto" temayı izler; "light" açık zemin, "dark" koyu zemin için.
 */
export type BrandLogoVariant = "mark" | "horizontal" | "compact" | "vertical" | "wordmark" | "icon";

type Props = {
  variant?: BrandLogoVariant;
  size?: number;
  height?: number;
  width?: number;
  tone?: "auto" | "light" | "dark" | "onBrand";
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const KEY: Record<Exclude<BrandLogoVariant, "icon">, [BrandSvgKey, BrandSvgKey]> = {
  mark: ["markLight", "markDark"],
  horizontal: ["horizontalLight", "horizontalDark"],
  compact: ["compactLight", "compactDark"],
  vertical: ["verticalLight", "verticalDark"],
  wordmark: ["wordmarkLight", "wordmarkDark"],
};

export default function BrandLogo({ variant = "horizontal", size, height, width, tone = "auto", style, accessibilityLabel = "PureScan Foods" }: Props) {
  const { isDark } = useTheme();
  let key: BrandSvgKey;
  if (variant === "icon") key = "icon";
  else if (variant === "mark" && tone === "onBrand") key = "markOnBrand";
  else {
    const dark = tone === "dark" || (tone === "auto" && isDark);
    key = KEY[variant][dark ? 1 : 0];
  }
  const item = BRAND_SVG[key];
  let w: number, h: number;
  if (width && !height) {
    w = width;
    h = width / item.aspect;
  } else {
    h = height ?? size ?? 40;
    w = h * item.aspect;
  }
  return (
    <View style={[{ width: w, height: h }, style]} accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <SvgXml xml={item.xml} width={w} height={h} />
    </View>
  );
}
