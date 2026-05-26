import { ExpoConfig, ConfigContext } from "expo/config";

// Google Sign-In iOS reversed client ID (GoogleService-Info.plist'ten alındı).
// Bu, expo-google-signin plugin'i URL scheme'i otomatik enjekte etsin diye burada tutulur.
const GOOGLE_IOS_REVERSED_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_REVERSED_CLIENT_ID ??
  "com.googleusercontent.apps.333478186372-45uk46nnrt7a99pu20567aas20noi6dd";

const ADMOB_IOS_APP_ID =
  process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ??
  "ca-app-pub-3940256099942544~1458002511"; // Apple test app ID (release öncesi env üzerinden gerçek değerle değiştirilir)
const ADMOB_ANDROID_APP_ID =
  process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ??
  "ca-app-pub-5745551393591703~9022078771";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "PureScan Foods",
  slug: "purescan-foods",
  version: "1.0.0",
  orientation: "default",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  scheme: "purescanfoods",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#FFFFFF",
  },
  ios: {
    bundleIdentifier: "com.purescan.foods",
    supportsTablet: false,
    usesAppleSignIn: true,
    googleServicesFile: "./ios/GoogleService-Info.plist",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSUserTrackingUsageDescription:
        "Allow PureScan Foods to use your device identifier to deliver more relevant ads. Your scan data is never shared.",
    },
    entitlements: {
      "com.apple.developer.applesignin": ["Default"],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    package: "com.purescan.foods",
    googleServicesFile: "./google-services.json",
  },
  plugins: [
    "expo-font",
    "expo-localization",
    "expo-router",
    "expo-secure-store",
    "expo-apple-authentication",
    [
      "expo-tracking-transparency",
      {
        userTrackingPermission:
          "Allow PureScan Foods to use your device identifier to deliver more relevant ads. Your scan data is never shared.",
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission:
          "Allow $(PRODUCT_NAME) to access your camera to scan barcodes and ingredients.",
        recordAudioAndroid: false,
      },
    ],
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: GOOGLE_IOS_REVERSED_CLIENT_ID,
      },
    ],
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: ADMOB_ANDROID_APP_ID,
        iosAppId: ADMOB_IOS_APP_ID,
      },
    ],
  ],
});
