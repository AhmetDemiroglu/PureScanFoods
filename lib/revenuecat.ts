import { Platform } from "react-native";
import Purchases, { LOG_LEVEL, PurchasesPackage, CustomerInfo } from "react-native-purchases";

// RevenueCat API Key'ler - Public key'ler env'den okunur.
// iOS key'i RevenueCat panelinden alınıp EXPO_PUBLIC_REVENUECAT_APPLE_KEY olarak tanımlanmalı.
const API_KEYS = {
    apple: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY ?? "",
    google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY ?? "goog_HuNdEyovEaZwmqMsypStOzQjhJo",
};

// Entitlement ID - RevenueCat panelinde tanımlanan
export const ENTITLEMENT_ID = "premium";

let _isConfigured = false;

export const isRevenueCatAvailable = (): boolean => _isConfigured;

// RevenueCat'i başlat
export const initializeRevenueCat = async (uid?: string) => {
    try {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);

        // Dev modda billing hatalarını console.error'a düşürme (Metro HMR overlay tetikler)
        if (__DEV__) {
            Purchases.setLogHandler((logLevel, message) => {
                if (
                    message.includes("BILLING_UNAVAILABLE") ||
                    message.includes("billing client") ||
                    message.includes("Billing is not available") ||
                    message.includes("Billing service unavailable")
                ) {
                    return; // emülatörde beklenen hata, bastır
                }
                if (logLevel === LOG_LEVEL.ERROR || logLevel === LOG_LEVEL.WARN) {
                    if (__DEV__) console.warn("[RevenueCat]", message);
                } else {
                    if (__DEV__) console.log("[RevenueCat]", message);
                }
            });
        }

        const apiKey = Platform.OS === "ios" ? API_KEYS.apple : API_KEYS.google;

        if (!apiKey) {
            if (__DEV__) {
                console.warn(
                    `[RevenueCat] ${Platform.OS} API key tanımlı değil. Premium akışı bu platformda devre dışı.`
                );
            }
            _isConfigured = false;
            return;
        }

        if (uid) {
            await Purchases.configure({ apiKey, appUserID: uid });
            if (__DEV__) console.log(`[RevenueCat] INIT: Başarılı! (Kullanıcı: ${uid})`);
        } else {
            await Purchases.configure({ apiKey });
            if (__DEV__) console.log("[RevenueCat] INIT: Başarılı! (Misafir Kullanıcı)");
        }
        _isConfigured = true;
    } catch (error) {
        if (__DEV__) console.error("[RevenueCat] INIT HATA:", error);
        _isConfigured = false;
    }
};

// Mevcut paketleri getir
export const getOfferings = async () => {
    if (!_isConfigured) return null;
    try {
        const offerings = await Purchases.getOfferings();

        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
            if (__DEV__) console.log("[RevenueCat] getOfferings: Paketler başarıyla çekildi.");
            return offerings.current;
        }

        if (__DEV__) console.log("[RevenueCat] getOfferings: Aktif paket bulunamadı.");
        return null;
    } catch (error) {
        if (__DEV__) console.error("[RevenueCat] getOfferings HATA:", error);
        return null;
    }
};

// Paket satın al
export const purchasePackage = async (packageToBuy: PurchasesPackage) => {
    if (!_isConfigured) {
        return { success: false, error: "RevenueCat not configured" };
    }
    try {
        const { customerInfo } = await Purchases.purchasePackage(packageToBuy);

        const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";

        if (isPremium) {
            return { success: true, isPremium: true, customerInfo };
        }

        return { success: false, isPremium: false };
    } catch (error: any) {
        if (error.userCancelled) {
            return { success: false, cancelled: true };
        }
        if (__DEV__) console.error("[RevenueCat] purchasePackage HATA:", error);
        return { success: false, error: error.message };
    }
};

// Abonelik durumunu kontrol et
export const checkSubscriptionStatus = async (): Promise<boolean> => {
    if (!_isConfigured) return false;
    try {
        const customerInfo = await Purchases.getCustomerInfo();
        const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";

        if (__DEV__) console.log(`[RevenueCat] checkSubscriptionStatus: Premium = ${isPremium ? "AKTİF" : "YOK"}`);
        return isPremium;
    } catch (error) {
        if (__DEV__) console.error("[RevenueCat] checkSubscriptionStatus HATA:", error);
        return false;
    }
};

// Satın almaları geri yükle
export const restorePurchases = async (): Promise<boolean> => {
    if (!_isConfigured) return false;
    try {
        const customerInfo = await Purchases.restorePurchases();
        const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";

        if (__DEV__) console.log(`[RevenueCat] restorePurchases: Sonuç = ${isPremium ? "BAŞARILI" : "YOK"}`);
        return isPremium;
    } catch (error) {
        if (__DEV__) console.error("[RevenueCat] restorePurchases HATA:", error);
        return false;
    }
};

// RevenueCat'ten çıkış yap (logout)
export const logoutRevenueCat = async () => {
    if (!_isConfigured) return;
    try {
        await Purchases.logOut();
        if (__DEV__) console.log("[RevenueCat] Logout: Başarılı");
    } catch (error) {
        if (__DEV__) console.error("[RevenueCat] Logout HATA:", error);
    }
};

// CustomerInfo değişikliklerini dinle
export const addCustomerInfoUpdateListener = (callback: (customerInfo: CustomerInfo) => void) => {
    if (!_isConfigured) return () => {};
    return Purchases.addCustomerInfoUpdateListener(callback);
};

// Premium durumunu customerInfo'dan kontrol et
export const isPremiumFromCustomerInfo = (customerInfo: CustomerInfo): boolean => {
    return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
};
