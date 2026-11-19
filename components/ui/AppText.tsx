import React, { forwardRef } from "react";
import { Text as RNText, TextProps, StyleSheet, TextStyle } from "react-native";
import i18n from "../../lib/i18n";
import { upper as toUpper } from "../../lib/text";
import { FONT_SCALE_CAP, DISPLAY_FONT_SCALE_CAP, Fonts } from "../../constants/design";

/**
 * Uygulama-geneli metin bileşeni. RN `Text`'in birebir yerine geçer (drop-in).
 *
 * - fontWeight'i Inter static varyantına eşler (Inter custom font'unda numeric
 *   fontWeight çalışmaz; doğru aile adı seçilmeli).
 * - `upper` prop'u ile Türkçe-doğru büyük harf (textTransform:'uppercase' yerine).
 * - style'da explicit fontFamily varsa korunur.
 * - Sistem yazı boyutu büyütmesi FONT_SCALE_CAP ile sınırlanır: çok büyük erişilebilirlik
 *   boyutlarında düzen taşıp ekran kullanılmaz hale gelmesin. Gerekirse prop ile değiştirilir.
 * - variant="display": logodaki serif (DM Serif Display). Tek ağırlık, başlık ve büyük rakamlar için.
 */

const FAMILY_BY_WEIGHT: Record<string, string> = {
  "100": "Inter-Regular",
  "200": "Inter-Regular",
  "300": "Inter-Regular",
  "400": "Inter-Regular",
  normal: "Inter-Regular",
  "500": "Inter-Medium",
  "600": "Inter-SemiBold",
  "700": "Inter-Bold",
  "800": "Inter-Bold",
  "900": "Inter-Bold",
  bold: "Inter-Bold",
};

function interFamily(weight?: TextStyle["fontWeight"]): string {
  if (weight == null) return "Inter-Regular";
  return FAMILY_BY_WEIGHT[String(weight)] ?? "Inter-Regular";
}

export interface AppTextProps extends TextProps {
  /** Türkçe-doğru (locale-aware) büyük harf. textTransform:'uppercase' yerine kullan. */
  upper?: boolean;
  /** display: logodaki serif yazı tipi (başlıklar, büyük puan rakamı). */
  variant?: "body" | "display";
}

export const Text = forwardRef<React.ElementRef<typeof RNText>, AppTextProps>(
  function AppText({ style, upper, variant = "body", children, maxFontSizeMultiplier, ...rest }, ref) {
    const flat = (StyleSheet.flatten(style) || {}) as TextStyle;
    const isDisplay = variant === "display";
    const resolvedStyle = isDisplay
      ? [style, { fontFamily: Fonts.display, fontWeight: undefined as TextStyle["fontWeight"] }]
      : flat.fontFamily
        ? style
        : [
            style,
            {
              fontFamily: interFamily(flat.fontWeight),
              // Inter zaten weight'i aile adıyla taşır; numeric fontWeight'i temizle
              // ki iOS/Android sentetik bold uygulamasın.
              fontWeight: undefined as TextStyle["fontWeight"],
            },
          ];

    const content =
      upper && typeof children === "string" ? toUpper(children, i18n.language) : children;

    return (
      <RNText
        ref={ref}
        maxFontSizeMultiplier={maxFontSizeMultiplier ?? (isDisplay ? DISPLAY_FONT_SCALE_CAP : FONT_SCALE_CAP)}
        {...rest}
        style={resolvedStyle}
      >
        {content}
      </RNText>
    );
  }
);

export default Text;
