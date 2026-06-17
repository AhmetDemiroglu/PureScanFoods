/**
 * Locale-aware (Türkçe-doğru) büyük harf dönüşümü.
 *
 * React Native'in `textTransform: 'uppercase'` özelliği locale-agnostiktir:
 * "eksiler" → "EKSILER" (yanlış). Türkçe'de "i" → "İ" olmalı: "EKSİLER".
 * Bu helper `toLocaleUpperCase('tr-TR')` ile doğru sonucu üretir.
 */
export function upper(s: unknown, lang?: string): string {
  if (s == null) return "";
  const str = String(s);
  const locale = lang && lang.toLowerCase().startsWith("tr") ? "tr-TR" : lang;
  try {
    return locale ? str.toLocaleUpperCase(locale) : str.toLocaleUpperCase();
  } catch {
    return str.toUpperCase();
  }
}
