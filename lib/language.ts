// Uygulama dili: seçim, kalıcı kayıt ve bayraklar tek yerden. Önceden ana ekran başlığındaydı;
// artık Ayarlar'daki "Görünüm ve dil" kartı kullanıyor. Davranış aynı: AsyncStorage'a yazılır,
// i18n anında değişir.
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ImageSourcePropType } from "react-native";
import i18n, { LANGUAGE_STORAGE_KEY } from "./i18n";

export type AppLanguage = "en" | "tr" | "es";

export const APP_LANGUAGES: { code: AppLanguage; label: string; flag: ImageSourcePropType }[] = [
  { code: "tr", label: "Türkçe", flag: require("../assets/turkey-flag-round.png") },
  { code: "en", label: "English", flag: require("../assets/us-flag-round.png") },
  { code: "es", label: "Español", flag: require("../assets/spain-flag-round.png") },
];

export function currentLanguage(lang: string | undefined = i18n.language): AppLanguage {
  if (lang?.startsWith("tr")) return "tr";
  if (lang?.startsWith("es")) return "es";
  return "en";
}

export function setAppLanguage(code: AppLanguage) {
  AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code).catch(() => {});
  i18n.changeLanguage(code);
}
