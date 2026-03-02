import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { I18nextProvider } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../lib/i18n";
import { AuthProvider } from "../context/AuthContext";
import { UserProvider } from "../context/UserContext";
import { GuruProvider } from "../context/GuruContext";
import { preloadAds } from "../lib/admob";
import { AppOnboardingModal } from "../components/ui/AppOnboardingModal";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

const APP_ONBOARDING_ACCEPTED_KEY = "@app_onboarding_disclaimer_accepted_v1";

function AppShell() {
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState<boolean | null>(null);
  const { isDark, isReady } = useTheme();

  useEffect(() => {
    preloadAds();
  }, []);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(APP_ONBOARDING_ACCEPTED_KEY)
      .then((value) => {
        if (!mounted) return;
        setHasAcceptedDisclaimer(value === "true");
      })
      .catch(() => {
        if (!mounted) return;
        setHasAcceptedDisclaimer(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleOnboardingAccept = async () => {
    await AsyncStorage.setItem(APP_ONBOARDING_ACCEPTED_KEY, "true");
    setHasAcceptedDisclaimer(true);
  };

  if (!isReady) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <AppOnboardingModal
        visible={hasAcceptedDisclaimer === false}
        onAccept={handleOnboardingAccept}
      />
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <GuruProvider>
              <AppShell />
            </GuruProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
