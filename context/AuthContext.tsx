import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import {
    onAuthStateChanged,
    signInAnonymously,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User,
    GoogleAuthProvider,
    signInWithCredential
} from "firebase/auth";
import { initializeUser, getUserProfile, checkDeviceLimit, getUserStats, UserProfile, UsageStats } from "../lib/firestore"
import * as Application from "expo-application";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import * as Crypto from "expo-crypto";
import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    usageStats: UsageStats;
    deviceId: string | null;
    refreshLimits: () => Promise<void>;
    isPremium: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

// --- DEVICE ID LOGIC ---
async function getPersistentDeviceId() {
    try {
        let storedId = await SecureStore.getItemAsync("purescan_device_id");

        if (!storedId) {
            if (Platform.OS === 'android') {
                storedId = Application.getAndroidId();
            } else if (Platform.OS === 'ios') {
                storedId = await Application.getIosIdForVendorAsync();
            }

            if (!storedId) {
                storedId = Crypto.randomUUID();
            }

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

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: "333478186372-mvrgjh408gp3jrpojqtc2kogmf3ha403.apps.googleusercontent.com",
        });
    }, []);

    // --- AUTH ACTIONS ---
    const login = async (email: string, pass: string) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error: any) {
            setLoading(false);
            throw error;
        }
    };

    const register = async (email: string, pass: string) => {
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
        } catch (error: any) {
            setLoading(false);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken; // v11+ syntax

            if (!idToken) throw new Error("Google Token alınamadı");

            const credential = GoogleAuthProvider.credential(idToken);
            await signInWithCredential(auth, credential);
            // Listener gerisini halleder
        } catch (error: any) {
            setLoading(false);
            console.error("Google Sign-In Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
        } catch (error: any) {
            console.error("Logout error:", error);
            setLoading(false);
        }
    };

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
            const id = await getPersistentDeviceId();
            if (mounted) setDeviceId(id);

            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (!mounted) return;

                if (currentUser) {
                    console.log("✅ User Authenticated:", currentUser.uid, "IsAnon:", currentUser.isAnonymous);
                    setUser(currentUser);

                    await initializeUser(currentUser);
                    const profile = await getUserProfile(currentUser.uid);
                    if (mounted) setUserProfile(profile);

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
        login,
        register,
        loginWithGoogle,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
