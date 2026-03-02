import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppColors, ThemeMode, getColorsByTheme } from "../constants/colors";

const THEME_STORAGE_KEY = "@app_theme_mode";

interface ThemeContextValue {
  themeMode: ThemeMode;
  colors: AppColors;
  isDark: boolean;
  isReady: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((value) => {
        if (!mounted) return;
        const nextMode: ThemeMode = value === "dark" ? "dark" : "light";
        setThemeModeState(nextMode);
      })
      .finally(() => {
        if (mounted) {
          setIsReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = themeMode === "dark" ? "light" : "dark";
    await setThemeMode(next);
  }, [themeMode, setThemeMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      colors: getColorsByTheme(themeMode),
      isDark: themeMode === "dark",
      isReady,
      setThemeMode,
      toggleTheme,
    }),
    [themeMode, isReady, setThemeMode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
