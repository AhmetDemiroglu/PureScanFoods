import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { I18nextProvider } from "react-i18next";
import i18n from "../lib/i18n";
import { AuthProvider } from "../context/AuthContext";
import { UserProvider } from "../context/UserContext";

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <UserProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </UserProvider>
        <StatusBar style="dark" />
      </AuthProvider>
    </I18nextProvider>
  );
}