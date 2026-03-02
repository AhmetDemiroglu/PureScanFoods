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
import { initializeUser, getUserProfile, checkDeviceLimit, getUserStats, UserProfile, UsageStats } from "../lib/firestore";
import { initializeRevenueCat, checkSubscriptionStatus, logoutRevenueCat, addCustomerInfoUpdateListener } from "../lib/revenuecat";
import * as Application from "expo-application";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import * as Crypto from "expo-crypto";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { doc, onSnapshot, updateDoc, serverTimestamp, deleteDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { deleteUser } from "firebase/auth";

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    usageStats: UsageStats;
    deviceId: string | null;
    isPremium: boolean;
    isRevenueCatPremium: boolean;
    refreshPremiumStatus: () => Promise<void>;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    deleteUserData: () => Promise<void>;
    deleteAccount: () => Promise<void>;
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
    const [isRevenueCatPremium, setIsRevenueCatPremium] = useState(false);

    const [usageStats, setUsageStats] = useState<UsageStats>({
        scanCount: 0,
        scanLimit: 3,
        aiChatCount: 0,
        aiChatLimit: 5,
        weekStartDate: new Date().toISOString(),
    });

    const [rawDeviceStats, setRawDeviceStats] = useState<any>(null);
    const [rawUserProfile, setRawUserProfile] = useState<UserProfile | null>(null);
    const [rawUserStats, setRawUserStats] = useState<any>(null);

    const isWeekExpired = (weekStartDate: any): boolean => {
        if (weekStartDate === undefined) return true;
        if (weekStartDate === null) return false;

        const startDate = weekStartDate.toDate ? weekStartDate.toDate() : new Date(weekStartDate);
        const now = new Date();
        const daysDiff = (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

        return daysDiff >= 7;
    };

    const resetDeviceLimits = async (devId: string) => {
        try {
            const deviceRef = doc(db, "device_limits", devId);
            await updateDoc(deviceRef, {
                scanCount: 0,
                aiChatCount: 0,
                weekStartDate: serverTimestamp()
            });
            console.log("✅ Device limitleri sıfırlandı (hafta doldu)");
        } catch (error) {
            console.error("Device reset error:", error);
        }
    };

    const resetUserLimits = async (uid: string) => {
        try {
            const statsRef = doc(db, "users", uid, "stats", "weekly");
            await updateDoc(statsRef, {
                scanCount: 0,
                aiChatCount: 0,
                weekStartDate: serverTimestamp()
            });
            console.log("✅ User limitleri sıfırlandı (hafta doldu)");
        } catch (error) {
            console.error("User reset error:", error);
        }
    };

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: "333478186372-mvrgjh408gp3jrpojqtc2kogmf3ha403.apps.googleusercontent.com",
        });
    }, []);

    // 1. CİHAZ LİMİTLERİNİ DİNLE (device_limits/{deviceId})
    useEffect(() => {
        if (!deviceId || !user) return;

        const unsubDevice = onSnapshot(doc(db, "device_limits", deviceId), async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("📡 Device snapshot fired - scanCount:", data.scanCount, "aiChatCount:", data.aiChatCount, "fromCache:", docSnap.metadata.fromCache, "hasPendingWrites:", docSnap.metadata.hasPendingWrites);

                if (isWeekExpired(data.weekStartDate)) {
                    await resetDeviceLimits(deviceId);
                    return;
                }

                setRawDeviceStats(data);
            } else {
                setRawDeviceStats({ scanCount: 0, aiChatCount: 0, weekStartDate: null });
            }
        }, (err) => console.error("Device Listener Error:", err));

        return () => unsubDevice();
    }, [deviceId, user]);

    // 2. KULLANICI PROFİLİNİ DİNLE (users/{uid})
    useEffect(() => {
        if (!user) {
            setRawUserProfile(null);
            return;
        }

        const unsubUser = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // TS Hatası Çözümü: Veriyi güvenli şekilde cast ediyoruz
                const profileData = { id: user.uid, ...data } as unknown as UserProfile;

                setUserProfile(profileData);
                setRawUserProfile(profileData);
            }
        }, (err) => console.error("User Profile Listener Error:", err));

        return () => unsubUser();
    }, [user]);

    // 3. KULLANICI İSTATİSTİKLERİNİ DİNLE (users/{uid}/stats/weekly)
    useEffect(() => {
        if (!user) {
            setRawUserStats(null);
            return;
        }

        const unsubStats = onSnapshot(doc(db, "users", user.uid, "stats", "weekly"), async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("📡 User stats snapshot fired - scanCount:", data.scanCount, "aiChatCount:", data.aiChatCount, "fromCache:", docSnap.metadata.fromCache, "hasPendingWrites:", docSnap.metadata.hasPendingWrites);

                // Hafta geçtiyse sıfırla
                if (isWeekExpired(data.weekStartDate)) {
                    await resetUserLimits(user.uid);
                    // Reset sonrası listener tekrar tetiklenecek, return et
                    return;
                }

                setRawUserStats(data);
            } else {
                setRawUserStats({ scanCount: 0, aiChatCount: 0 });
            }
        }, (err) => console.error("User Stats Listener Error:", err));

        return () => unsubStats();
    }, [user]);

    // 4. LİMİT HESAPLAMA MOTORU
    useEffect(() => {
        const deviceData = rawDeviceStats || { scanCount: 0, aiChatCount: 0 };
        const deviceScanLimit = 3;
        const deviceChatLimit = 5;

        // Ortak weekStartDate hesaplama helper'ı
        const getWeekStartDate = (source: any) => {
            if (!source?.weekStartDate) return new Date().toISOString();
            return source.weekStartDate.toDate
                ? source.weekStartDate.toDate().toISOString()
                : new Date().toISOString();
        };

        if (!user || !rawUserProfile) {
            setUsageStats({
                scanCount: deviceData.scanCount || 0,
                scanLimit: deviceScanLimit,
                aiChatCount: deviceData.aiChatCount || 0,
                aiChatLimit: deviceChatLimit,
                weekStartDate: getWeekStartDate(deviceData)
            });
            return;
        }

        const isPremium = rawUserProfile.subscriptionStatus === "premium";

        // PREMIUM KONTROLÜ
        if (isPremium) {
            setUsageStats({
                scanCount: rawUserStats?.scanCount || 0,
                scanLimit: 9999,
                aiChatCount: rawUserStats?.aiChatCount || 0,
                aiChatLimit: 9999,
                weekStartDate: new Date().toISOString()
            });
            return;
        }

        // STANDART KULLANICI KONTROLÜ - SCAN
        const userScanLimit = 5;
        const userScanCount = rawUserStats?.scanCount || 0;
        const deviceScanCount = deviceData.scanCount || 0;

        const deviceScanRemaining = deviceScanLimit - deviceScanCount;
        const userScanRemaining = userScanLimit - userScanCount;

        // STANDART KULLANICI KONTROLÜ - AI CHAT
        const userChatLimit = 5;
        const userChatCount = rawUserStats?.aiChatCount || 0;
        const deviceChatCount = deviceData.aiChatCount || 0;

        const deviceChatRemaining = deviceChatLimit - deviceChatCount;
        const userChatRemaining = userChatLimit - userChatCount;

        // Scan için hangisi daha kısıtlayıcı?
        console.log("📊 LIMIT ENGINE - Device scan:", deviceScanCount, "/", deviceScanLimit, "remaining:", deviceScanRemaining, "| User scan:", userScanCount, "/", userScanLimit, "remaining:", userScanRemaining);
        let finalScanCount: number;
        let finalScanLimit: number;
        if (deviceScanRemaining < userScanRemaining) {
            console.log("🔒 Scan: Limiting by DEVICE");
            finalScanCount = deviceScanCount;
            finalScanLimit = deviceScanLimit;
        } else {
            console.log("🔒 Scan: Limiting by USER");
            finalScanCount = userScanCount;
            finalScanLimit = userScanLimit;
        }

        // Chat için hangisi daha kısıtlayıcı?
        let finalChatCount: number;
        let finalChatLimit: number;
        if (deviceChatRemaining < userChatRemaining) {
            console.log("🔒 Chat: Limiting by DEVICE");
            finalChatCount = deviceChatCount;
            finalChatLimit = deviceChatLimit;
        } else {
            console.log("🔒 Chat: Limiting by USER");
            finalChatCount = userChatCount;
            finalChatLimit = userChatLimit;
        }

        // weekStartDate: Scan veya Chat'ten hangisi varsa onu al
        const weekStart = getWeekStartDate(rawUserStats) || getWeekStartDate(deviceData);

        setUsageStats({
            scanCount: finalScanCount,
            scanLimit: finalScanLimit,
            aiChatCount: finalChatCount,
            aiChatLimit: finalChatLimit,
            weekStartDate: weekStart
        });

    }, [rawDeviceStats, rawUserProfile, rawUserStats, user]);

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

    // Kullanıcı verilerini sil (hesap kalır)
    const deleteUserData = async () => {
        if (!user) throw new Error("No user");
        const uid = user.uid;

        const batch = writeBatch(db);

        // family_members subcollection
        const familySnap = await getDocs(collection(db, "users", uid, "family_members"));
        familySnap.forEach((d) => batch.delete(d.ref));

        // scans subcollection
        const scansSnap = await getDocs(collection(db, "users", uid, "scans"));
        scansSnap.forEach((d) => batch.delete(d.ref));

        // stats/weekly doc
        batch.delete(doc(db, "users", uid, "stats", "weekly"));

        await batch.commit();

        // Reset user profile fields (keep the doc itself)
        await updateDoc(doc(db, "users", uid), {
            dietType: null,
            allergens: [],
            lifeStage: null,
            displayName: null,
            avatarIcon: "account",
            color: null,
        });
    };

    // Hesabı tamamen sil
    const deleteAccount = async () => {
        if (!user) throw new Error("No user");
        const uid = user.uid;

        const batch = writeBatch(db);

        // family_members
        const familySnap = await getDocs(collection(db, "users", uid, "family_members"));
        familySnap.forEach((d) => batch.delete(d.ref));

        // scans
        const scansSnap = await getDocs(collection(db, "users", uid, "scans"));
        scansSnap.forEach((d) => batch.delete(d.ref));

        // stats/weekly
        batch.delete(doc(db, "users", uid, "stats", "weekly"));

        // user doc itself
        batch.delete(doc(db, "users", uid));

        await batch.commit();

        // Delete Firebase Auth user
        await deleteUser(auth.currentUser!);

        setUser(null);
        setUserProfile(null);
    };

    const logout = async () => {
        setLoading(true);
        try {
            await logoutRevenueCat();
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
            setIsRevenueCatPremium(false);
        } catch (error: any) {
            console.error("Logout error:", error);
            setLoading(false);
        }
    };

    // RevenueCat premium durumunu yenile
    const refreshPremiumStatus = async () => {
        try {
            const isPremium = await checkSubscriptionStatus();
            setIsRevenueCatPremium(isPremium);
            console.log("[AuthContext] refreshPremiumStatus:", isPremium ? "PREMIUM" : "FREE");
        } catch (error) {
            console.error("[AuthContext] refreshPremiumStatus HATA:", error);
        }
    };

    useEffect(() => {
        let mounted = true;
        let unsubscribeAuth: (() => void) | null = null;

        const initAuth = async () => {
            const id = await getPersistentDeviceId();
            if (mounted) setDeviceId(id);

            unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
                if (!mounted) return;

                if (currentUser) {
                    console.log("✅ User Authenticated:", currentUser.uid, "IsAnon:", currentUser.isAnonymous);
                    setUser(currentUser);

                    // RevenueCat'i başlat
                    await initializeRevenueCat(currentUser.uid);

                    // RevenueCat customer info değişikliklerini dinle
                    const unsubscribeRC: any = addCustomerInfoUpdateListener((customerInfo) => {
                        const hasPremium = typeof customerInfo.entitlements.active["premium"] !== "undefined";
                        setIsRevenueCatPremium(hasPremium);
                        console.log("[RevenueCat] Listener - Premium:", hasPremium ? "AKTİF" : "YOK");
                    });

                    // İlk premium kontrolü
                    await refreshPremiumStatus();

                    await initializeUser(currentUser);
                    const profile = await getUserProfile(currentUser.uid);
                    if (mounted) setUserProfile(profile);

                    if (mounted) setLoading(false);

                    // Cleanup RC listener on auth change
                    return () => {
                        if (typeof unsubscribeRC === 'function') {
                            unsubscribeRC();
                        }
                    };
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
        };

        initAuth();

        return () => {
            mounted = false;
            unsubscribeAuth?.();
        };
    }, []);

    // Premium durumu: RevenueCat öncelikli, Firebase VIP ikincil
    const isFirebaseVip = userProfile?.subscriptionStatus === "premium";
    const finalIsPremium = isRevenueCatPremium || isFirebaseVip;

    const value = {
        user,
        userProfile,
        loading,
        usageStats,
        deviceId,
        isPremium: finalIsPremium,
        isRevenueCatPremium,
        refreshPremiumStatus,
        login,
        register,
        loginWithGoogle,
        logout,
        deleteUserData,
        deleteAccount,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
