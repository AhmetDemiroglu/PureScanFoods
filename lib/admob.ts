import { InterstitialAd, RewardedAd, AdEventType, RewardedAdEventType, TestIds } from "react-native-google-mobile-ads";

// --- TEST AD UNIT IDS ---
const AD_UNITS = {
    INTERSTITIAL: TestIds.INTERSTITIAL, // ca-app-pub-3940256099942544/1033173712
    REWARDED: TestIds.REWARDED, // ca-app-pub-3940256099942544/5224354917
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

export const loadRewardedAd = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            rewardedAd = RewardedAd.createForAdRequest(AD_UNITS.REWARDED, {
                requestNonPersonalizedAdsOnly: true,
            });

            const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
                console.log("✅ Rewarded Ad Loaded");
                isRewardedLoaded = true;
                unsubscribeLoaded();
                resolve();
            });

            const unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
                console.error("❌ Rewarded Ad Error:", error);
                isRewardedLoaded = false;
                unsubscribeError();
                reject(error);
            });

            rewardedAd.load();
        } catch (error) {
            console.error("❌ Rewarded Ad Creation Error:", error);
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

        const unsubscribeEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
            console.log("🎁 Reward Earned:", reward);
            rewarded = true;
            unsubscribeEarned();
        });

        const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
            console.log("✅ Rewarded Ad Closed, Rewarded:", rewarded);
            isRewardedLoaded = false;
            unsubscribeClosed();
            loadRewardedAd().catch(() => {});
            resolve({ success: rewarded, rewardType });
        });

        const unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error("❌ Rewarded Ad Show Error:", error);
            unsubscribeError();
            resolve({ success: false, rewardType });
        });

        rewardedAd.show().catch((error) => {
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
