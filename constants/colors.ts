export type ThemeMode = "light" | "dark";

export interface AppColors {
  primary: string;
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
  primary: "#FF6F00",
  secondary: "#1E293B",
  surface: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  textMuted: "#64748B",
  card: "#FFFFFF",
  border: "#E2E8F0",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  overlay: "rgba(0,0,0,0.6)",
  gray: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A",
  },
};

export const DarkColors: AppColors = {
  primary: "#FF8A33",
  secondary: "#E2E8F0",
  surface: "#0B1220",
  white: "#F8FAFC",
  text: "#F8FAFC",
  textMuted: "#94A3B8",
  card: "#111827",
  border: "#243245",
  success: "#34D399",
  error: "#F87171",
  warning: "#FBBF24",
  overlay: "rgba(2,6,23,0.82)",
  gray: {
    50: "#0F172A",
    100: "#111827",
    200: "#1F2937",
    300: "#334155",
    400: "#64748B",
    500: "#94A3B8",
    600: "#CBD5E1",
    700: "#E2E8F0",
    800: "#F1F5F9",
    900: "#F8FAFC",
  },
};

export const Colors = LightColors;

export const getColorsByTheme = (mode: ThemeMode): AppColors =>
  mode === "dark" ? DarkColors : LightColors;
