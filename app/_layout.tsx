import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { I18nextProvider } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync,
  PermissionStatus,
} from "expo-tracking-transparency";
import i18n from "../lib/i18n";
import { AuthProvider } from "../context/AuthContext";
import { UserProvider } from "../context/UserContext";
import { GuruProvider } from "../context/GuruContext";
import { preloadAds } from "../lib/admob";
import { AppOnboardingModal } from "../components/ui/AppOnboardingModal";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

const APP_ONBOARDING_ACCEPTED_KEY = "@app_onboarding_disclaimer_accepted_v1";
export const ATT_STATUS_KEY = "@purescan_att_status";

// iOS App Tracking Transparency: izin durumunu sor ve AsyncStorage'a yansıt.
// AdMob bu değeri okur ve personalized ad isteğini buna göre ayarlar.
async function ensureTrackingDecision(): Promise<void> {
  if (Platform.OS !== "ios") return;

  try {
    const current = await getTrackingPermissionsAsync();
    let status = current.status;

    if (current.canAskAgain && status === PermissionStatus.UNDETERMINED) {
      const result = await requestTrackingPermissionsAsync();
      status = result.status;
    }

    const persisted = status === PermissionStatus.GRANTED ? "granted" : "denied";
    await AsyncStorage.setItem(ATT_STATUS_KEY, persisted);
  } catch (err) {
    if (__DEV__) console.warn("[ATT] tracking decision failed:", err);
  }
}

function AppShell() {
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState<boolean | null>(null);
  const { isDark, isReady } = useTheme();

  useEffect(() => {
    preloadAds();
  }, []);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(APP_ONBOARDING_ACCEPTED_KEY)
      .then(async (value) => {
        if (!mounted) return;
        const accepted = value === "true";
        setHasAcceptedDisclaimer(accepted);
        // Onboarding zaten kabul edilmişse ATT izni hala sorulmadıysa burada tetikle.
        if (accepted) {
          await ensureTrackingDecision();
        }
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
    // ATT izni onboarding sonrasında sorulur (Apple guideline: kullanıcı uygulama
    // bağlamını anladıktan sonra istenmeli).
    await ensureTrackingDecision();
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
