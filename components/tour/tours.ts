// Tur adımları. Metinler locales/*.json içinde "tour.<tur>.<adım>.title|desc" anahtarlarında.
import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type TourStep = {
  /** useTourTarget ile kaydedilen hedef adı */
  target: string;
  /** locales anahtarı: tour.<key>.title / tour.<key>.desc */
  key: string;
  icon: IconName;
  /** circle: yuvarlak düğmeler; varsayılan yuvarlatılmış dikdörtgen */
  shape?: "circle" | "rect";
  /** hedefin çevresindeki boşluk (pt) */
  padding?: number;
  /** deliği tek yönde büyütür (ör. sekme simgesinin altındaki yazıyı da almak için) */
  grow?: { top?: number; bottom?: number; left?: number; right?: number };
};

// Alt sekme: simge hedef, delik altındaki yazıyı da kapsar.
const TAB = { padding: 4, grow: { bottom: 17, left: 14, right: 14 } } as const;

// Otomatik turlar yalnız ana ekranda ve ilk sonuçta, kısa tutulur (Ahmet: "eğitime boğmayalım").
// Guru, Beslenme ve Sözlük turları yalnız o sayfanın info simgesinden açılır.
export const HOME_TOUR: TourStep[] = [
  { target: "home.tabs", key: "home.modes", icon: "albums-outline", padding: 6 },
  { target: "home.scan", key: "home.scan", icon: "scan-outline", padding: 6 },
  { target: "tab.nutrition", key: "home.profile", icon: "people-outline", ...TAB },
  { target: "home.history", key: "home.history", icon: "time-outline", shape: "circle", padding: 6 },
  { target: "tab.guru", key: "home.guru", icon: "sparkles-outline", ...TAB },
];

export const RESULT_TOUR: TourStep[] = [
  { target: "result.score", key: "result.score", icon: "speedometer-outline", padding: 4 },
  { target: "result.summary", key: "result.summary", icon: "chatbox-ellipses-outline", padding: 6 },
  { target: "result.consumption", key: "result.consumption", icon: "flask-outline", padding: 6 },
  { target: "result.details", key: "result.details", icon: "list-outline", padding: 6 },
  { target: "result.guru", key: "result.guru", icon: "sparkles-outline", padding: 6 },
];

export const GURU_TOUR: TourStep[] = [
  { target: "guru.product", key: "guru.product", icon: "pricetag-outline", padding: 6 },
  { target: "guru.suggestions", key: "guru.suggestions", icon: "bulb-outline", padding: 6 },
  { target: "guru.input", key: "guru.input", icon: "chatbubble-ellipses-outline", padding: 6 },
];

export const NUTRITION_TOUR: TourStep[] = [
  { target: "nutrition.profile", key: "nutrition.profile", icon: "person-circle-outline", padding: 6 },
  { target: "nutrition.family", key: "nutrition.family", icon: "people-outline", padding: 6 },
  { target: "nutrition.diet", key: "nutrition.diet", icon: "leaf-outline", padding: 6 },
  { target: "nutrition.allergens", key: "nutrition.allergens", icon: "warning-outline", padding: 6 },
];

export const ENCYCLOPEDIA_TOUR: TourStep[] = [
  { target: "encyclopedia.tabs", key: "encyclopedia.tabs", icon: "library-outline", padding: 6 },
  { target: "encyclopedia.search", key: "encyclopedia.search", icon: "search-outline", padding: 6 },
];
