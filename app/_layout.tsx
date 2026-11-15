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
import * as SplashScreen from "expo-splash-screen";
import AnimatedSplash from "../components/brand/AnimatedSplash";
import { ShellProvider } from "../context/ShellContext";
import AppShellSidebar from "../components/shell/AppShellSidebar";

// Yerel açılış ekranı, hareketli açılışın ilk karesi çizilene kadar kalır (geçiş görünmesin).
SplashScreen.preventAutoHideAsync().catch(() => {});
// Hareketli açılış ilk karesi yerel ekranla aynı: solarak kapanma yerine anında kapansın
// (Android varsayılanı 400 ms solma, o sırada sabit logo hareketli çubuğun üstünde kalıyordu).
SplashScreen.setOptions({ duration: 0, fade: false });

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

    const persisted =
      status === PermissionStatus.GRANTED ? "granted" : "denied";
    await AsyncStorage.setItem(ATT_STATUS_KEY, persisted);
  } catch (err) {
    if (__DEV__) console.warn("[ATT] tracking decision failed:", err);
  }
}

function AppShell() {
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState<
    boolean | null
  >(null);
  const [splashDone, setSplashDone] = useState(false);
  const { isDark, isReady } = useTheme();

  // Custom fontlar runtime'da yüklenir (prebuild gerekmez). Türkçe tam destekli.
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
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
      })
      .catch(() => {
        if (!mounted) return;
        setHasAcceptedDisclaimer(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // ATT izni yalnız açılış animasyonu bittikten sonra ve onboarding kabul edilmişse sorulur:
  // iOS, ekranda geçiş varken gelen ATT dialogunu sessizce düşürüyor (Apple 2.1 reddi).
  useEffect(() => {
    if (splashDone && hasAcceptedDisclaimer === true) {
      ensureTrackingDecision();
    }
  }, [splashDone, hasAcceptedDisclaimer]);

  const handleOnboardingAccept = async () => {
    await AsyncStorage.setItem(APP_ONBOARDING_ACCEPTED_KEY, "true");
    // ATT izni yukarıdaki effect ile sorulur (kullanıcı uygulama bağlamını anladıktan sonra).
    setHasAcceptedDisclaimer(true);
  };

  const appReady = isReady && fontsLoaded;

  const splash = splashDone ? null : (
    <AnimatedSplash
      ready={appReady}
      onFirstFrame={() => {
        // İki kare bekle: SVG'ler çizilmeden yerel ekran kalkarsa boş bir kare görünür.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            SplashScreen.hideAsync().catch(() => {});
          }),
        );
      }}
      onFinish={() => setSplashDone(true)}
    />
  );

  // Açılış bileşeni ağaçta hep aynı yerde durur; uygulama hazır olunca yeniden mount olup baştan başlamaz.
  return (
    <>
      {appReady && (
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
              <Stack.Screen
                name="compare"
                options={{
                  gestureEnabled: true,
                  gestureDirection: "horizontal",
                  animation: "slide_from_right",
                }}
              />
            </Stack>
          </AppShellSidebar>
          <AppOnboardingModal
            visible={splashDone && hasAcceptedDisclaimer === false}
            onAccept={handleOnboardingAccept}
          />
        </>
      )}
      <StatusBar style={splashDone ? (isDark ? "light" : "dark") : "dark"} />
      {splash}
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
