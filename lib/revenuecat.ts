import { Platform } from "react-native";
import Purchases, { LOG_LEVEL, PurchasesPackage, CustomerInfo } from "react-native-purchases";

// RevenueCat API Key'ler
const API_KEYS = {
    apple: "appl_xxxxxxxxxxxxxxxxxxxxxx", // iOS için ileride eklenecek
    google: "goog_HuNdEyovEaZwmqMsypStOzQjhJo",
};

// Entitlement ID - RevenueCat panelinde tanımlanan
export const ENTITLEMENT_ID = "premium";

// RevenueCat'i başlat
export const initializeRevenueCat = async (uid?: string) => {
    try {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);

        const apiKey = Platform.OS === "ios" ? API_KEYS.apple : API_KEYS.google;

        if (!apiKey) {
            console.error("[RevenueCat] INIT HATA: Platforma uygun API Key bulunamadı!");
            return;
        }

        if (uid) {
            await Purchases.configure({ apiKey, appUserID: uid });
            console.log(`[RevenueCat] INIT: Başarılı! (Kullanıcı: ${uid})`);
        } else {
            await Purchases.configure({ apiKey });
            console.log("[RevenueCat] INIT: Başarılı! (Misafir Kullanıcı)");
        }
    } catch (error) {
        console.error("[RevenueCat] INIT HATA:", error);
    }
};

// Mevcut paketleri getir
export const getOfferings = async () => {
    try {
        const offerings = await Purchases.getOfferings();

        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
            console.log("[RevenueCat] getOfferings: Paketler başarıyla çekildi.");
            console.log("[RevenueCat] Paket ID'leri:", offerings.current.availablePackages.map(p => p.identifier).join(", "));
            return offerings.current;
        }

        console.log("[RevenueCat] getOfferings: Aktif paket bulunamadı.");
        return null;
    } catch (error) {
        console.error("[RevenueCat] getOfferings HATA:", error);
        return null;
    }
};

// Paket satın al
export const purchasePackage = async (packageToBuy: PurchasesPackage) => {
    try {
        console.log(`[RevenueCat] purchasePackage: Başlıyor, paket = ${packageToBuy.identifier}`);

        const { customerInfo } = await Purchases.purchasePackage(packageToBuy);

        console.log("[RevenueCat] purchasePackage: CustomerInfo =", JSON.stringify(customerInfo?.entitlements?.active || {}));

        const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";

        if (isPremium) {
            console.log("[RevenueCat] purchasePackage: BAŞARILI - Premium Aktif!");
            return { success: true, isPremium: true, customerInfo };
        }

        console.log("[RevenueCat] purchasePackage: BAŞARISIZ - Premium bulunamadı!");
        return { success: false, isPremium: false };
    } catch (error: any) {
        if (error.userCancelled) {
            console.log("[RevenueCat] purchasePackage: Kullanıcı işlemi iptal etti.");
            return { success: false, cancelled: true };
        }
        console.error("[RevenueCat] purchasePackage HATA:", error);
        return { success: false, error: error.message };
    }
};

// Abonelik durumunu kontrol et
export const checkSubscriptionStatus = async (): Promise<boolean> => {
    try {
        const customerInfo = await Purchases.getCustomerInfo();
        const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";

        console.log(`[RevenueCat] checkSubscriptionStatus: Premium = ${isPremium ? "AKTİF" : "YOK"}`);
        return isPremium;
    } catch (error) {
        console.error("[RevenueCat] checkSubscriptionStatus HATA:", error);
        return false;
    }
};

// Satın almaları geri yükle
export const restorePurchases = async (): Promise<boolean> => {
    try {
        const customerInfo = await Purchases.restorePurchases();
        const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";

        console.log(`[RevenueCat] restorePurchases: Sonuç = ${isPremium ? "BAŞARILI" : "YOK"}`);
        return isPremium;
    } catch (error) {
        console.error("[RevenueCat] restorePurchases HATA:", error);
        return false;
    }
};

// RevenueCat'ten çıkış yap (logout)
export const logoutRevenueCat = async () => {
    try {
        await Purchases.logOut();
        console.log("[RevenueCat] Logout: Başarılı");
    } catch (error) {
        console.error("[RevenueCat] Logout HATA:", error);
    }
};

// CustomerInfo değişikliklerini dinle
export const addCustomerInfoUpdateListener = (callback: (customerInfo: CustomerInfo) => void) => {
    return Purchases.addCustomerInfoUpdateListener(callback);
};

// Premium durumunu customerInfo'dan kontrol et
export const isPremiumFromCustomerInfo = (customerInfo: CustomerInfo): boolean => {
    return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
};
