import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
import { useFonts } from "expo-font";
import { ShellProvider } from "../context/ShellContext";
import AppShellSidebar from "../components/shell/AppShellSidebar";

const APP_ONBOARDING_ACCEPTED_KEY = "@app_onboarding_disclaimer_accepted_v1";
export const ATT_STATUS_KEY = "@purescan_att_status";

// ATT sistem dialogu YALNIZCA uygulama "active" durumdayken ve ekranda başka bir
// modal geçiş halinde değilken gösterilir. Onboarding modal'ı kapanırken ATT
// istenirse iOS dialogu sessizce düşürür (Apple 2.1 reddinin sebebi buydu).
// Bu helper: app active olana kadar bekler + modal'ın tam kapanması için kısa gecikme verir.
function waitForActiveAndSettle(delayMs = 700): Promise<void> {
  return new Promise((resolve) => {
    const settle = () => setTimeout(resolve, delayMs);
    if (AppState.currentState === "active") {
      settle();
      return;
    }
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        sub.remove();
        settle();
      }
    });
  });
}

// iOS App Tracking Transparency: izin durumunu sor ve AsyncStorage'a yansıt.
// AdMob bu değeri okur ve personalized ad isteğini buna göre ayarlar.
async function ensureTrackingDecision(): Promise<void> {
  if (Platform.OS !== "ios") return;

  try {
    const current = await getTrackingPermissionsAsync();
    let status = current.status;

    if (current.canAskAgain && status === PermissionStatus.UNDETERMINED) {
      // App active + modal tam kapandıktan sonra iste, yoksa dialog hiç görünmez.
      await waitForActiveAndSettle();
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

  // Custom fontlar runtime'da yüklenir (prebuild gerekmez). Türkçe tam destekli.
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "Caveat-Bold": require("../assets/fonts/Caveat-Bold.ttf"),
  });

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

  if (!isReady || !fontsLoaded) {
    return null;
  }

  return (
    <>
      <AppShellSidebar>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="product-result"
            options={{
              gestureEnabled: true,
              gestureDirection: "horizontal",
              animation: "slide_from_right",
            }}
          />
        </Stack>
      </AppShellSidebar>
      <AppOnboardingModal
        visible={hasAcceptedDisclaimer === false}
        onAccept={handleOnboardingAccept}
      />
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

// AppShell artık AppShellSidebar (X-style history slide-over) ile sarılıdır.

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <AuthProvider>
            <UserProvider>
              <GuruProvider>
                <ShellProvider>
                  <AppShell />
                </ShellProvider>
              </GuruProvider>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
