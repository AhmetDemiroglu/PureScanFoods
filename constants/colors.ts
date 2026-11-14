export type ThemeMode = "light" | "dark";

export interface AppColors {
  primary: string;
  /** Vurgu geçişlerinin koyu ucu (buton ve kart geçişleri). */
  primaryDeep: string;
  secondary: string;
  surface: string;
  white: string;
  text: string;
  textMuted: string;
  card: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  overlay: string;
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

export const LightColors: AppColors = {
  // Mandalina teması (2026-11 marka yenilemesi): derin turuncu, sıcak nötrler.
  primary: "#F2600C",
  primaryDeep: "#D9480A",
  secondary: "#2A1F18",
  surface: "#FFFAF5",
  white: "#FFFFFF",
  text: "#1F1611",
  textMuted: "#76675A",
  card: "#FFFFFF",
  border: "#EFE4D8",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  overlay: "rgba(24,14,8,0.6)",
  gray: {
    50: "#FBF8F4",
    100: "#F5EFE8",
    200: "#EBE2D8",
    300: "#D8CCBF",
    400: "#A99A8C",
    500: "#7A6B5E",
    600: "#5D5045",
    700: "#433830",
    800: "#2A1F18",
    900: "#1F1611",
  },
};

export const DarkColors: AppColors = {
  primary: "#FF8B3D",
  primaryDeep: "#E2550B",
  secondary: "#EDE4DA",
  surface: "#15100C",
  white: "#FBF7F2",
  text: "#FBF7F2",
  textMuted: "#B3A496",
  card: "#221912",
  border: "#382A1F",
  success: "#34D399",
  error: "#F87171",
  warning: "#FBBF24",
  overlay: "rgba(10,6,3,0.82)",
  gray: {
    50: "#15100C",
    100: "#1C1510",
    200: "#2A2019",
    300: "#3E3127",
    400: "#6E5F52",
    500: "#A39384",
    600: "#CFC2B5",
    700: "#E7DDD2",
    800: "#F3ECE4",
    900: "#FBF7F2",
  },
};

export const Colors = LightColors;

export const getColorsByTheme = (mode: ThemeMode): AppColors =>
  mode === "dark" ? DarkColors : LightColors;
