import { db } from "./firebase";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, increment, collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, startAfter } from "firebase/firestore";

export interface UserProfile {
    uid: string;
    email: string | null;
    isAnonymous: boolean;
    subscriptionStatus: "free" | "premium";
    dietaryPreferences: string[];
    allergens: string[];
    displayName?: string;
    avatarIcon?: string;
    color?: string;
    createdAt: any;
    lifeStage?: string;
}
export interface UsageStats {
    scanCount: number;
    scanLimit: number;
    aiChatCount: number;
    aiChatLimit: number;
    weekStartDate: string;
}

export interface FamilyMember {
    id: string;
    name: string;
    role: "spouse" | "child" | "mother" | "father" | "sibling" | "friend" | "other" | "self";
    avatarIcon: string;
    color: string;
    diet: string | null;
    allergens: string[];
    createdAt: any;
    lifeStage: string | null;
}

export interface ScanResult {
    id: string;
    productName: string;
    brand: string;
    imageUrl?: string | null;
    score: number;
    verdict: string;
    badges: string[];
    createdAt: any;
    miniData: string;
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

            const statsRef = doc(db, "users", user.uid, "stats", "weekly");
            await setDoc(statsRef, {
                scanCount: 0,
                weekStartDate: serverTimestamp(),
            });
        } else {
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
export const updateUserPreferences = async (uid: string, updates: Partial<UserProfile>) => {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, updates);
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

// --- 4. CİHAZ LİMİT KONTROLÜ (MİSAFİRLER İÇİN) ---
export const checkDeviceLimit = async (deviceId: string): Promise<UsageStats> => {
    const defaultStats: UsageStats = {
        scanCount: 0,
        scanLimit: 3,
        aiChatCount: 0,
        aiChatLimit: 5,
        weekStartDate: new Date().toISOString(),
    };

    if (!deviceId) return defaultStats;

    const deviceRef = doc(db, "device_limits", deviceId);
    const deviceSnap = await getDoc(deviceRef);

    const now = new Date();

    if (!deviceSnap.exists()) {
        await setDoc(deviceRef, {
            scanCount: 0,
            aiChatCount: 0,
            weekStartDate: serverTimestamp(),
            firstSeenAt: serverTimestamp(),
        });
        return defaultStats;
    }

    const data = deviceSnap.data();
    const weekStart = data.weekStartDate?.toDate() || now;
    const daysDiff = (now.getTime() - weekStart.getTime()) / (1000 * 3600 * 24);

    if (daysDiff >= 7) {
        await updateDoc(deviceRef, {
            scanCount: 0,
            aiChatCount: 0,
            weekStartDate: serverTimestamp(),
        });
        return defaultStats;
    }

    return {
        scanCount: data.scanCount || 0,
        scanLimit: 3,
        aiChatCount: data.aiChatCount || 0,
        aiChatLimit: 5,
        weekStartDate: formatDateSafe(weekStart),
    };
};

export const getUserStats = async (uid: string): Promise<{ scanCount: number; weekStartDate: any }> => {
    try {
        const statsRef = doc(db, "users", uid, "stats", "weekly");
        const docSnap = await getDoc(statsRef);

        if (docSnap.exists()) {
            return docSnap.data() as { scanCount: number; weekStartDate: any };
        } else {
            return { scanCount: 0, weekStartDate: serverTimestamp() };
        }
    } catch (error) {
        console.error("Error getting user stats:", error);
        return { scanCount: 0, weekStartDate: new Date() };
    }
};

// --- 5. TARAMA HAKKI DÜŞME (DÜZELTİLEN KISIM BURASI) ---
export const incrementScanCount = async (uid: string, deviceId: string | null) => {
    try {
        const promises = [];

        // 1. Kullanıcı İstatistiği
        if (uid) {
            const statsRef = doc(db, "users", uid, "stats", "weekly");
            // updateDoc YERİNE setDoc + merge kullanıyoruz.
            // Bu sayede doküman yoksa hata vermez, yenisini oluşturur.
            promises.push(
                setDoc(
                    statsRef,
                    {
                        scanCount: increment(1),
                        lastScanAt: serverTimestamp(),
                    },
                    { merge: true },
                ),
            );
        }

        // 2. Cihaz İstatistiği
        if (deviceId) {
            const deviceRef = doc(db, "device_limits", deviceId);
            // Burada da aynısı. Cihaz kaydı yoksa oluşturur.
            promises.push(
                setDoc(
                    deviceRef,
                    {
                        scanCount: increment(1),
                        lastScanAt: serverTimestamp(),
                    },
                    { merge: true },
                ),
            );
        }

        await Promise.all(promises);
        console.log("✅ Sayaç başarıyla artırıldı (incrementScanCount)");
    } catch (error) {
        // Hata olsa bile uygulamayı durdurma, sadece logla.
        console.error("⚠️ Error incrementing scan (but continuing):", error);
    }
};

// --- 5b. AI CHAT HAKKI DÜŞME ---
export const incrementAiChatCount = async (uid: string, deviceId: string | null) => {
    try {
        const promises = [];

        // 1. Kullanıcı İstatistiği
        if (uid) {
            const statsRef = doc(db, "users", uid, "stats", "weekly");
            promises.push(
                setDoc(
                    statsRef,
                    {
                        aiChatCount: increment(1),
                        lastChatAt: serverTimestamp(),
                    },
                    { merge: true },
                ),
            );
        }

        // 2. Cihaz İstatistiği
        if (deviceId) {
            const deviceRef = doc(db, "device_limits", deviceId);
            promises.push(
                setDoc(
                    deviceRef,
                    {
                        aiChatCount: increment(1),
                        lastChatAt: serverTimestamp(),
                    },
                    { merge: true },
                ),
            );
        }

        await Promise.all(promises);
        console.log("✅ AI Chat sayacı başarıyla artırıldı (incrementAiChatCount)");
    } catch (error) {
        console.error("⚠️ Error incrementing AI chat (but continuing):", error);
    }
};

// --- 6. AİLE ÜYESİ YÖNETİMİ (ALT KOLEKSİYON) ---

// Aile Üyesi Ekle
export const addFamilyMemberToDB = async (uid: string, member: Omit<FamilyMember, "id" | "createdAt">) => {
    try {
        const membersRef = collection(db, "users", uid, "family_members");
        const docRef = await addDoc(membersRef, {
            ...member,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding family member:", error);
        throw error;
    }
};

// Aile Üyelerini Getir
export const getFamilyMembersFromDB = async (uid: string): Promise<FamilyMember[]> => {
    try {
        const membersRef = collection(db, "users", uid, "family_members");
        const q = query(membersRef, orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(
            (doc) =>
                ({
                    id: doc.id,
                    ...doc.data(),
                }) as FamilyMember,
        );
    } catch (error) {
        console.error("Error fetching family members:", error);
        return [];
    }
};

// Aile Üyesi Sil
export const deleteFamilyMemberFromDB = async (uid: string, memberId: string) => {
    try {
        const memberRef = doc(db, "users", uid, "family_members", memberId);
        await deleteDoc(memberRef);
    } catch (error) {
        console.error("Error deleting family member:", error);
        throw error;
    }
};

// Aile Üyesi Güncelle
export const updateFamilyMemberInDB = async (uid: string, memberId: string, updates: Partial<FamilyMember>) => {
    try {
        const memberRef = doc(db, "users", uid, "family_members", memberId);
        await updateDoc(memberRef, updates);
    } catch (error) {
        console.error("Error updating family member:", error);
        throw error;
    }
};

// --- 7. TARAMA GEÇMİŞİ YÖNETİMİ  ---

// Taramayı Kaydet
export const saveScanResultToDB = async (uid: string, scanData: Omit<ScanResult, "id" | "createdAt">) => {
    try {
        const scansRef = collection(db, "users", uid, "scans");
        await addDoc(scansRef, {
            ...scanData,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error saving scan:", error);
    }
};

// Geçmişi Getir
export const getScanHistoryFromDB = async (uid: string, lastDoc: any = null, limitCount = 15) => {
    try {
        const scansRef = collection(db, "users", uid, "scans");

        let q;
        if (lastDoc) {
            q = query(scansRef, orderBy("createdAt", "desc"), startAfter(lastDoc), limit(limitCount));
        } else {
            q = query(scansRef, orderBy("createdAt", "desc"), limit(limitCount));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(
            (doc) =>
                ({
                    id: doc.id,
                    ...doc.data(),
                }) as ScanResult,
        );

        return { data, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
    } catch (error) {
        console.error("Error fetching history:", error);
        return { data: [], lastDoc: null };
    }
};
