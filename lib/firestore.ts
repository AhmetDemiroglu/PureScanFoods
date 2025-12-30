import { db } from "./firebase";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, increment, FieldValue } from "firebase/firestore";

export interface UserProfile {
    uid: string;
    email: string | null;
    isAnonymous: boolean;
    subscriptionStatus: "free" | "premium";
    dietaryPreferences: string[];
    allergens: string[];
    createdAt: any;
}

export interface UsageStats {
    scanCount: number;
    scanLimit: number;
    weekStartDate: string;
}

const formatDateSafe = (timestamp: any) => {
    if (!timestamp) return new Date().toISOString();
    if (timestamp.toDate) return timestamp.toDate().toISOString();
    return new Date(timestamp).toISOString();
};

// --- 1. KULLANICI BAŞLATMA (İLK KAYIT) ---
export const initializeUser = async (user: any) => {
    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Yeni Kullanıcı Şeması
            const newProfile: UserProfile = {
                uid: user.uid,
                email: user.email || null,
                isAnonymous: user.isAnonymous,
                subscriptionStatus: "free",
                dietaryPreferences: [],
                allergens: [],
                createdAt: serverTimestamp(),
            };

            await setDoc(userRef, newProfile);

            // İstatistikleri Başlat
            const statsRef = doc(db, "users", user.uid, "stats", "weekly");
            await setDoc(statsRef, {
                scanCount: 0,
                weekStartDate: serverTimestamp(),
            });
        } else {
            // Mevcut kullanıcı giriş yaptı, son görülmeyi güncelle
            await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
        }
    } catch (error) {
        console.error("Error initializing user:", error);
        throw error;
    }
};

// --- 2. PROFİL GETİRME ---
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);
        return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    } catch (error) {
        console.error("Error getting profile:", error);
        return null;
    }
};

// --- 3. PROFİL GÜNCELLEME (Diyet/Alerjen) ---
export const updateUserPreferences = async (uid: string, preferences: { dietary?: string[]; allergens?: string[] }) => {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, preferences);
    } catch (error) {
        console.error("Error updating preferences:", error);
        throw error;
    }
};

// --- 4. CİHAZ LİMİT KONTROLÜ (MİSAFİRLER İÇİN KRİTİK) ---
export const checkDeviceLimit = async (deviceId: string): Promise<UsageStats> => {
    if (!deviceId) return { scanCount: 0, scanLimit: 3, weekStartDate: new Date().toISOString() };

    const deviceRef = doc(db, "device_limits", deviceId);
    const deviceSnap = await getDoc(deviceRef);

    const now = new Date();

    // Cihaz hiç yoksa oluştur
    if (!deviceSnap.exists()) {
        await setDoc(deviceRef, {
            scanCount: 0,
            weekStartDate: serverTimestamp(),
            firstSeenAt: serverTimestamp(),
        });
        return { scanCount: 0, scanLimit: 3, weekStartDate: now.toISOString() };
    }

    const data = deviceSnap.data();
    const weekStart = data.weekStartDate?.toDate() || now;
    const daysDiff = (now.getTime() - weekStart.getTime()) / (1000 * 3600 * 24);

    // Hafta dolduysa sıfırla
    if (daysDiff >= 7) {
        await updateDoc(deviceRef, {
            scanCount: 0,
            weekStartDate: serverTimestamp(),
        });
        return { scanCount: 0, scanLimit: 3, weekStartDate: now.toISOString() };
    }

    return {
        scanCount: data.scanCount || 0,
        scanLimit: 3,
        weekStartDate: formatDateSafe(weekStart),
    };
};

// --- 5. TARAMA HAKKI DÜŞME (SAYAÇ ARTIRMA) ---
export const incrementScanCount = async (uid: string, deviceId: string | null) => {
    try {
        const promises = [];

        // Kullanıcı sayacını artır
        if (uid) {
            const statsRef = doc(db, "users", uid, "stats", "weekly");
            promises.push(updateDoc(statsRef, { scanCount: increment(1) }));
        }

        // Cihaz sayacını artır (Misafir koruması)
        if (deviceId) {
            const deviceRef = doc(db, "device_limits", deviceId);
            promises.push(updateDoc(deviceRef, { scanCount: increment(1) }));
        }

        await Promise.all(promises);
    } catch (error) {
        console.error("Error incrementing scan:", error);
    }
};
