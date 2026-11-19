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
  /** Kartta açıklamanın altında simgeli satırlar (locales: tour.<key>.items.<item>). */
  items?: { key: string; icon: IconName }[];
};

// Alt sekme: hedef sekme hücresinin tamamı (simge + yazı, AppTabBar), delik hücreye oturur.
const TAB = { padding: 2 } as const;

// Turlar kısa tutulur (Ahmet: "eğitime boğmayalım"), her sayfada ilk girişte bir kez.
// Guru, Beslenme ve Sözlük turları ilk girişte kendiliğinden açılır; info simgesi yeniden açar.
export const HOME_TOUR: TourStep[] = [
  { target: "home.scan", key: "home.scan", icon: "scan-outline", padding: 6 },
  { target: "home.tabs", key: "home.modes", icon: "apps-outline", padding: 6 },
  { target: "tab.nutrition", key: "home.profile", icon: "people-outline", ...TAB },
  { target: "home.history", key: "home.history", icon: "time-outline", shape: "circle", padding: 6 },
  { target: "tab.guru", key: "home.guru", icon: "sparkles-outline", ...TAB },
];

export const RESULT_TOUR: TourStep[] = [
  { target: "result.score", key: "result.score", icon: "speedometer-outline", padding: 4 },
  { target: "result.consumption", key: "result.consumption", icon: "flask-outline", padding: 6 },
  { target: "result.family", key: "result.family", icon: "people-outline", padding: 4 },
  { target: "result.details", key: "result.details", icon: "list-outline", padding: 6 },
  {
    target: "result.actions",
    key: "result.actions",
    icon: "flash-outline",
    padding: 4,
    items: [
      { key: "guru", icon: "sparkles-outline" },
      { key: "compare", icon: "git-compare-outline" },
      { key: "rescan", icon: "scan-outline" },
    ],
  },
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
