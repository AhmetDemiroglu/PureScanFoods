import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import tr from "../locales/tr.json";
import en from "../locales/en.json";

const resources = {
    tr: { translation: tr },
    en: { translation: en },
};

const deviceLang = Localization.getLocales()[0]?.languageCode || "en";
const defaultLang = deviceLang === "tr" ? "tr" : "en";

i18n.use(initReactI18next).init({
    resources,
    lng: defaultLang,
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
