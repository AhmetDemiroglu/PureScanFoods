import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import { initializeUser, getUserProfile, checkDeviceLimit, getUserStats, UserProfile, UsageStats } from "../lib/firestore";
import * as Application from "expo-application";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import * as Crypto from "expo-crypto";

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    usageStats: UsageStats;
    deviceId: string | null;
    refreshLimits: () => Promise<void>;
    isPremium: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

// --- DEVICE ID LOGIC (KALICI ID) ---
async function getPersistentDeviceId() {
    try {
        // 1. Önce SecureStore'a bak (En kalıcı yöntem)
        let storedId = await SecureStore.getItemAsync("purescan_device_id");

        if (!storedId) {
            // 2. Yoksa donanım ID'sini almayı dene
            if (Platform.OS === 'android') {
                storedId = Application.getAndroidId();
            } else if (Platform.OS === 'ios') {
                storedId = await Application.getIosIdForVendorAsync();
            }

            // 3. Hala yoksa UUID oluştur
            if (!storedId) {
                storedId = Crypto.randomUUID();
            }

            // 4. SecureStore'a kaydet ki silinip yüklenince değişmesin (iOS keychain)
            await SecureStore.setItemAsync("purescan_device_id", storedId);
        }

        return storedId;
    } catch (e) {
        console.warn("Device ID Error:", e);
        return "fallback_" + Math.random().toString(36).substring(7);
    }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [deviceId, setDeviceId] = useState<string | null>(null);

    const [usageStats, setUsageStats] = useState<UsageStats>({
        scanCount: 0,
        scanLimit: 3,
        weekStartDate: new Date().toISOString(),
    });

    // Limitleri Yenileme Fonksiyonu
    const refreshLimits = async (currentUid?: string, currentDeviceId?: string) => {
        const targetDeviceId = currentDeviceId || deviceId;
        const targetUid = currentUid || user?.uid;

        let deviceStats = { scanCount: 0, scanLimit: 3 };
        if (targetDeviceId) {
            const ds = await checkDeviceLimit(targetDeviceId);
            deviceStats = { scanCount: ds.scanCount, scanLimit: 3 };
        }

        let userStats = { scanCount: 0, scanLimit: 5 };
        let isPremium = false;

        if (targetUid) {
            const profile = await getUserProfile(targetUid);
            if (profile) {
                setUserProfile(profile);
                isPremium = profile.subscriptionStatus === "premium";
            }

            const us = await getUserStats(targetUid);
            userStats.scanCount = us.scanCount;
            userStats.scanLimit = isPremium ? 9999 : 5;
        }

        let finalStats: UsageStats;

        if (isPremium) {
            finalStats = {
                scanCount: userStats.scanCount,
                scanLimit: 9999,
                weekStartDate: new Date().toISOString()
            };
        } else {
            const deviceRemaining = deviceStats.scanLimit - deviceStats.scanCount;
            const userRemaining = userStats.scanLimit - userStats.scanCount;

            if (deviceRemaining < userRemaining) {
                finalStats = {
                    scanCount: deviceStats.scanCount,
                    scanLimit: deviceStats.scanLimit,
                    weekStartDate: new Date().toISOString()
                };
                console.log("🔒 Limiting by DEVICE stats");
            } else {
                finalStats = {
                    scanCount: userStats.scanCount,
                    scanLimit: userStats.scanLimit,
                    weekStartDate: new Date().toISOString()
                };
                console.log("🔒 Limiting by USER stats");
            }
        }

        setUsageStats(finalStats);
    };

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            // 1. Cihaz ID'sini al
            const id = await getPersistentDeviceId();
            if (mounted) setDeviceId(id);

            // 2. Auth Listener
            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (!mounted) return;

                if (currentUser) {
                    console.log("✅ User Authenticated:", currentUser.uid, "IsAnon:", currentUser.isAnonymous);
                    setUser(currentUser);

                    // DB Kaydı ve Profil Çekme
                    await initializeUser(currentUser);
                    const profile = await getUserProfile(currentUser.uid);
                    if (mounted) setUserProfile(profile);

                    // Limitleri Kontrol Et
                    await refreshLimits(currentUser.uid, id);

                    if (mounted) setLoading(false);
                } else {
                    console.log("👤 No user, signing in anonymously...");
                    try {
                        await signInAnonymously(auth);
                    } catch (error) {
                        console.error("Anonymous Sign-In Failed:", error);
                        if (mounted) setLoading(false);
                    }
                }
            });
            return unsubscribe;
        };

        initAuth();

        return () => {
            mounted = false;
        };
    }, []);

    const value = {
        user,
        userProfile,
        loading,
        usageStats,
        deviceId,
        refreshLimits,
        isPremium: userProfile?.subscriptionStatus === "premium",
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
