import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { I18nextProvider } from "react-i18next";
import i18n from "../lib/i18n";
import { AuthProvider } from "../context/AuthContext";
import { UserProvider } from "../context/UserContext";
import { GuruProvider } from "../context/GuruContext";
import { preloadAds } from "../lib/admob";

export default function RootLayout() {
  useEffect(() => {
    preloadAds();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <UserProvider>
          <GuruProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
          </GuruProvider>
        </UserProvider>
        <StatusBar style="dark" />
      </AuthProvider>
    </I18nextProvider>
  );
}
