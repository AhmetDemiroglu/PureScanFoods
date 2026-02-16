import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import tr from "../locales/tr.json";
import en from "../locales/en.json";
import es from "../locales/es.json";

const resources = {
    tr: { translation: tr },
    en: { translation: en },
    es: { translation: es },
};

export const LANGUAGE_STORAGE_KEY = "@app_language";

const primaryLocale = Localization.getLocales()[0];
const regionCode = primaryLocale?.regionCode;
const languageCode = (primaryLocale?.languageCode || "").toLowerCase();

const SPANISH_REGIONS = new Set([
    "ES",
    "MX",
    "AR",
    "CO",
    "CL",
    "PE",
    "VE",
    "EC",
    "GT",
    "CU",
    "BO",
    "DO",
    "HN",
    "PY",
    "SV",
    "NI",
    "CR",
    "PA",
    "UY",
    "GQ",
    "PR",
]);

const defaultLang =
    regionCode === "TR"
        ? "tr"
        : (languageCode === "es" || (regionCode ? SPANISH_REGIONS.has(regionCode) : false))
            ? "es"
            : "en";

i18n.use(initReactI18next).init({
    resources,
    lng: defaultLang,
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
    .then((savedLang) => {
        if (savedLang === "tr" || savedLang === "en" || savedLang === "es") {
            if (i18n.language !== savedLang) {
                i18n.changeLanguage(savedLang);
            }
        }
    })
    .catch(() => {
        // keep locale-based default language
    });

export default i18n;
