import { InterstitialAd, RewardedAd, AdEventType, RewardedAdEventType, TestIds } from "react-native-google-mobile-ads";

// --- TEST AD UNIT IDS ---
const AD_UNITS = {
    INTERSTITIAL: "ca-app-pub-5745551393591703/2046586821",
    REWARDED: "ca-app-pub-5745551393591703/5414481619",
};

// --- INTERSTITIAL AD (Tarama Sonrası) ---
let interstitialAd: InterstitialAd | null = null;
let isInterstitialLoaded = false;

export const loadInterstitialAd = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            interstitialAd = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL, {
                requestNonPersonalizedAdsOnly: true,
            });

            const unsubscribeLoaded = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
                console.log("✅ Interstitial Ad Loaded");
                isInterstitialLoaded = true;
                unsubscribeLoaded();
                resolve();
            });

            const unsubscribeError = interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
                console.error("❌ Interstitial Ad Error:", error);
                isInterstitialLoaded = false;
                unsubscribeError();
                reject(error);
            });

            interstitialAd.load();
        } catch (error) {
            console.error("❌ Interstitial Ad Creation Error:", error);
            reject(error);
        }
    });
};

export const showInterstitialAd = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (!interstitialAd || !isInterstitialLoaded) {
            console.warn("⚠️ Interstitial Ad not loaded");
            resolve(false);
            return;
        }

        const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
            console.log("✅ Interstitial Ad Closed (Completed)");
            isInterstitialLoaded = false;
            unsubscribeClosed();
            loadInterstitialAd().catch(() => {});
            resolve(true);
        });

        const unsubscribeError = interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error("❌ Interstitial Ad Show Error:", error);
            unsubscribeError();
            resolve(false);
        });

        interstitialAd.show().catch((error) => {
            console.error("❌ Interstitial Ad Show Failed:", error);
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

export const loadRewardedAd = (): Promise<void> => {
    // Zaten yüklüyse veya yükleniyorsa tekrar yükleme
    if (isRewardedLoaded || isRewardedLoading) {
        return Promise.resolve();
    }

    isRewardedLoading = true;

    return new Promise((resolve, reject) => {
        try {
            rewardedAd = RewardedAd.createForAdRequest(AD_UNITS.REWARDED, {
                requestNonPersonalizedAdsOnly: true,
            });

            const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
                console.log("✅ Rewarded Ad Loaded");
                isRewardedLoaded = true;
                isRewardedLoading = false;
                unsubscribeLoaded();
                resolve();
            });

            const unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
                console.error("❌ Rewarded Ad Error:", error);
                isRewardedLoaded = false;
                isRewardedLoading = false;
                unsubscribeError();
                reject(error);
            });

            rewardedAd.load();
        } catch (error) {
            console.error("❌ Rewarded Ad Creation Error:", error);
            isRewardedLoading = false;
            reject(error);
        }
    });
};

export type RewardType = "scan" | "chat";

export const showRewardedAd = (rewardType: RewardType): Promise<{ success: boolean; rewardType: RewardType }> => {
    return new Promise((resolve) => {
        if (!rewardedAd || !isRewardedLoaded) {
            console.warn("⚠️ Rewarded Ad not loaded");
            resolve({ success: false, rewardType });
            return;
        }

        let rewarded = false;
        // Gösterilecek ad instance'ını yakala, closure içinde kullan
        const currentAd = rewardedAd;

        const unsubscribeEarned = currentAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
            console.log("🎁 Reward Earned:", reward);
            rewarded = true;
            unsubscribeEarned();
        });

        const unsubscribeClosed = currentAd.addAdEventListener(AdEventType.CLOSED, () => {
            console.log("✅ Rewarded Ad Closed, Rewarded:", rewarded);
            isRewardedLoaded = false;
            unsubscribeClosed();
            // Sonraki reklam için önceden yükle
            loadRewardedAd().catch(() => {});
            resolve({ success: rewarded, rewardType });
        });

        const unsubscribeError = currentAd.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error("❌ Rewarded Ad Show Error:", error);
            unsubscribeError();
            resolve({ success: false, rewardType });
        });

        currentAd.show().catch((error) => {
            console.error("❌ Rewarded Ad Show Failed:", error);
            resolve({ success: false, rewardType });
        });
    });
};

export const isRewardedReady = (): boolean => {
    return isRewardedLoaded;
};

// --- PRELOAD ADS (Uygulama Başlangıcında) ---
export const preloadAds = async (): Promise<void> => {
    console.log("📺 Preloading Ads...");

    try {
        await Promise.allSettled([loadInterstitialAd(), loadRewardedAd()]);
        console.log("✅ Ads Preloaded");
    } catch (error) {
        console.error("⚠️ Some ads failed to preload:", error);
    }
};
