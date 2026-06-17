import React, { forwardRef } from "react";
import { Text as RNText, TextProps, StyleSheet, TextStyle } from "react-native";
import i18n from "../../lib/i18n";
import { upper as toUpper } from "../../lib/text";

/**
 * Uygulama-geneli metin bileşeni. RN `Text`'in birebir yerine geçer (drop-in).
 *
 * - fontWeight'i Inter static varyantına eşler (Inter custom font'unda numeric
 *   fontWeight çalışmaz; doğru aile adı seçilmeli).
 * - `upper` prop'u ile Türkçe-doğru büyük harf (textTransform:'uppercase' yerine).
 * - style'da explicit fontFamily varsa (ör. Hero "foods" → Caveat-Bold) korunur.
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
}

export const Text = forwardRef<React.ElementRef<typeof RNText>, AppTextProps>(
  function AppText({ style, upper, children, ...rest }, ref) {
    const flat = (StyleSheet.flatten(style) || {}) as TextStyle;
    const resolvedStyle = flat.fontFamily
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
      <RNText ref={ref} {...rest} style={resolvedStyle}>
        {content}
      </RNText>
    );
  }
);

export default Text;
