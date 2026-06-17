import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import mobileAds, { InterstitialAd, RewardedAd, AdEventType, RewardedAdEventType, TestIds } from "react-native-google-mobile-ads";

// --- AD UNIT IDs (platform & env aware) ---
// iOS production unit ID'leri AdMob panelinden alınıp env'e konacak.
// Dev'de Google'ın resmi test ID'leri kullanılır (Apple sandbox + AdMob için zorunlu).
const AD_UNITS = {
    INTERSTITIAL:
        Platform.OS === "ios"
            ? __DEV__
                ? TestIds.INTERSTITIAL
                : (process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID ?? "")
            : "ca-app-pub-5745551393591703/2046586821",
    REWARDED:
        Platform.OS === "ios"
            ? __DEV__
                ? TestIds.REWARDED
                : (process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID ?? "")
            : "ca-app-pub-5745551393591703/5414481619",
};

const ATT_STATUS_KEY = "@purescan_att_status";

// --- SDK INIT ---
// Google Mobile Ads SDK, reklam istenmeden ÖNCE initialize edilmiş olmalı.
// iOS'ta auto-init zamanlaması Android'den farklı; explicit initialize çağrılmazsa
// erken reklam istekleri sessizce başarısız olur (iOS'ta reklamların hiç görünmeme sebebi).
let initPromise: Promise<unknown> | null = null;
export const initializeAds = (): Promise<unknown> => {
    if (!initPromise) {
        initPromise = mobileAds()
            .initialize()
            .then((statuses) => {
                if (__DEV__) console.log("✅ Mobile Ads SDK initialized", statuses);
                return statuses;
            })
            .catch((err) => {
                if (__DEV__) console.warn("⚠️ Mobile Ads init failed:", err);
                initPromise = null; // sonraki denemede tekrar başlatılabilsin
                throw err;
            });
    }
    return initPromise;
};

// ATT durumuna göre personalized ad isteğini ayarla.
const getNonPersonalizedFlag = async (): Promise<boolean> => {
    if (Platform.OS !== "ios") return true; // Android'de mevcut davranışı koru
    try {
        const status = await AsyncStorage.getItem(ATT_STATUS_KEY);
        return status !== "granted";
    } catch {
        return true;
    }
};

// --- INTERSTITIAL AD (Tarama Sonrası) ---
let interstitialAd: InterstitialAd | null = null;
let isInterstitialLoaded = false;

export const loadInterstitialAd = async (): Promise<void> => {
    if (!AD_UNITS.INTERSTITIAL) {
        if (__DEV__) console.warn("[AdMob] Interstitial ID tanımlı değil, yükleme atlandı.");
        return;
    }

    await initializeAds().catch(() => {}); // SDK hazır olmadan istek atma
    const nonPersonalized = await getNonPersonalizedFlag();

    return new Promise((resolve, reject) => {
        try {
            interstitialAd = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL, {
                requestNonPersonalizedAdsOnly: nonPersonalized,
            });

            const unsubscribeLoaded = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
                if (__DEV__) console.log("✅ Interstitial Ad Loaded");
                isInterstitialLoaded = true;
                unsubscribeLoaded();
                resolve();
            });

            const unsubscribeError = interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
                if (__DEV__) console.error("❌ Interstitial Ad Error:", error);
                isInterstitialLoaded = false;
                unsubscribeError();
                reject(error);
            });

            interstitialAd.load();
        } catch (error) {
            if (__DEV__) console.error("❌ Interstitial Ad Creation Error:", error);
            reject(error);
        }
    });
};

export const showInterstitialAd = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (!interstitialAd || !isInterstitialLoaded) {
            if (__DEV__) console.warn("⚠️ Interstitial Ad not loaded");
            resolve(false);
            return;
        }

        const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
            if (__DEV__) console.log("✅ Interstitial Ad Closed (Completed)");
            isInterstitialLoaded = false;
            unsubscribeClosed();
            loadInterstitialAd().catch(() => {});
            resolve(true);
        });

        const unsubscribeError = interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
            if (__DEV__) console.error("❌ Interstitial Ad Show Error:", error);
            unsubscribeError();
            resolve(false);
        });

        interstitialAd.show().catch((error) => {
            if (__DEV__) console.error("❌ Interstitial Ad Show Failed:", error);
            resolve(false);
        });
    });
};

export const isInterstitialReady = (): boolean => {
    return isInterstitialLoaded;
};

// --- REWARDED AD (Limit Artırma) ---
let rewardedAd: RewardedAd | null = null;
let isRewardedLoaded = false;
let isRewardedLoading = false;

export const loadRewardedAd = async (): Promise<void> => {
    // Zaten yüklüyse veya yükleniyorsa tekrar yükleme
    if (isRewardedLoaded || isRewardedLoading) {
        return Promise.resolve();
    }

    if (!AD_UNITS.REWARDED) {
        if (__DEV__) console.warn("[AdMob] Rewarded ID tanımlı değil, yükleme atlandı.");
        return;
    }

    isRewardedLoading = true;
    await initializeAds().catch(() => {}); // SDK hazır olmadan istek atma
    const nonPersonalized = await getNonPersonalizedFlag();

    return new Promise((resolve, reject) => {
        try {
            rewardedAd = RewardedAd.createForAdRequest(AD_UNITS.REWARDED, {
                requestNonPersonalizedAdsOnly: nonPersonalized,
            });

            const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
                if (__DEV__) console.log("✅ Rewarded Ad Loaded");
                isRewardedLoaded = true;
                isRewardedLoading = false;
                unsubscribeLoaded();
                resolve();
            });

            const unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
                if (__DEV__) console.error("❌ Rewarded Ad Error:", error);
                isRewardedLoaded = false;
                isRewardedLoading = false;
                unsubscribeError();
                reject(error);
            });

            rewardedAd.load();
        } catch (error) {
            if (__DEV__) console.error("❌ Rewarded Ad Creation Error:", error);
            isRewardedLoading = false;
            reject(error);
        }
    });
};

export type RewardType = "scan" | "chat";

export const showRewardedAd = (rewardType: RewardType): Promise<{ success: boolean; rewardType: RewardType }> => {
    return new Promise((resolve) => {
        if (!rewardedAd || !isRewardedLoaded) {
            if (__DEV__) console.warn("⚠️ Rewarded Ad not loaded");
            resolve({ success: false, rewardType });
            return;
        }

        let rewarded = false;
        // Gösterilecek ad instance'ını yakala, closure içinde kullan
        const currentAd = rewardedAd;

        const unsubscribeEarned = currentAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
            if (__DEV__) console.log("🎁 Reward Earned:", reward);
            rewarded = true;
            unsubscribeEarned();
        });

        const unsubscribeClosed = currentAd.addAdEventListener(AdEventType.CLOSED, () => {
            if (__DEV__) console.log("✅ Rewarded Ad Closed, Rewarded:", rewarded);
            isRewardedLoaded = false;
            unsubscribeClosed();
            // Sonraki reklam için önceden yükle
            loadRewardedAd().catch(() => {});
            resolve({ success: rewarded, rewardType });
        });

        const unsubscribeError = currentAd.addAdEventListener(AdEventType.ERROR, (error) => {
            if (__DEV__) console.error("❌ Rewarded Ad Show Error:", error);
            unsubscribeError();
            resolve({ success: false, rewardType });
        });

        currentAd.show().catch((error) => {
            if (__DEV__) console.error("❌ Rewarded Ad Show Failed:", error);
            resolve({ success: false, rewardType });
        });
    });
};

export const isRewardedReady = (): boolean => {
    return isRewardedLoaded;
};

// --- PRELOAD ADS (Uygulama Başlangıcında) ---
export const preloadAds = async (): Promise<void> => {
    if (__DEV__) console.log("📺 Preloading Ads...");

    try {
        await initializeAds().catch(() => {});
        await Promise.allSettled([loadInterstitialAd(), loadRewardedAd()]);
        if (__DEV__) console.log("✅ Ads Preloaded");
    } catch (error) {
        if (__DEV__) console.error("⚠️ Some ads failed to preload:", error);
    }
};
