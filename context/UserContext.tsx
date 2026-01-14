import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
    getFamilyMembersFromDB,
    addFamilyMemberToDB,
    deleteFamilyMemberFromDB,
    updateFamilyMemberInDB,
    FamilyMember as FirestoreMember
} from '../lib/firestore';
import { Alert } from 'react-native';
import { DietType } from '../lib/diets';
import { AllergenType } from '../lib/allergens';
import { updateUserPreferences } from '../lib/firestore';

// --- TİPLER ---
export type FamilyRole = "spouse" | "child" | "mother" | "father" | "sibling" | "friend" | "other" | "self";

export interface FamilyMember extends Omit<FirestoreMember, 'diet' | 'allergens'> {
    diet: DietType | null;
    allergens: AllergenType[];
}

export interface ProfileData {
    diet: DietType | null;
    allergens: AllergenType[];
    dietaryPreferences: string[];
}

export interface UserContextType {
    familyMembers: FamilyMember[];
    profilesData: Record<string, ProfileData>;
    activeProfileId: string;
    setActiveProfileId: (id: string) => void;

    addFamilyMember: (name: string, role: FamilyRole) => Promise<void>;
    deleteFamilyMember: (id: string) => Promise<void>;
    updateMemberInfo: (id: string, updates: Partial<FamilyMember>) => Promise<void>;
    updateProfileData: (id: string, field: keyof ProfileData, value: any) => Promise<void>;

    getActiveProfile: () => FamilyMember | undefined;
    getActiveData: () => ProfileData;

    isLoading: boolean;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export const AVATAR_COLORS = [
    "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#10B981",
    "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899"
];

export const getSafeIcon = (iconName: string): any => {
    if (!iconName || iconName === "person") return "account";
    return iconName;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, userProfile } = useAuth();

    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string>('main_user');
    const [isLoading, setIsLoading] = useState(true);

    const profilesData: Record<string, ProfileData> = {};
    familyMembers.forEach(m => {
        profilesData[m.id] = {
            diet: m.diet,
            allergens: m.allergens || [],
            dietaryPreferences: []
        };
    });

    // 1. VERİLERİ ÇEKME (FETCH)
    const fetchFamily = async () => {
        if (!user) {
            setFamilyMembers([]);
            return;
        }

        setIsLoading(true);
        try {
            // A) Ana Kullanıcıyı (Kendisi) Oluştur
            const mainUser: FamilyMember = {
                id: 'main_user',
                name: userProfile?.displayName || userProfile?.email?.split('@')[0] || "Ben",
                role: 'self',
                avatarIcon: userProfile?.avatarIcon || "account",
                color: userProfile?.color || AVATAR_COLORS[0],
                diet: (userProfile?.dietaryPreferences?.[0] as DietType) || null,
                allergens: (userProfile?.allergens as AllergenType[]) || [],
                createdAt: userProfile?.createdAt
            };

            // B) Alt Üyeler
            const subMembersDocs = await getFamilyMembersFromDB(user.uid);
            const subMembers: FamilyMember[] = subMembersDocs.map(m => ({
                ...m,
                diet: (m.diet as DietType) || null,
                allergens: (m.allergens as AllergenType[]) || []
            }));

            // C) Birleştir
            setFamilyMembers([mainUser, ...subMembers]);

        } catch (error) {
            console.error("Aile üyeleri çekilemedi:", error);
            Alert.alert("Hata", "Aile bilgileri yüklenemedi.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFamily();
    }, [user, userProfile]);

    // 2. EKLEME (ADD)
    const addFamilyMember = async (name: string, role: FamilyRole) => {
        if (!user) return;

        try {
            const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

            const newMemberData = {
                name,
                role,
                avatarIcon: "account",
                color: randomColor,
                diet: null,
                allergens: []
            };

            await addFamilyMemberToDB(user.uid, newMemberData);
            await fetchFamily();

        } catch (error) {
            console.error("Üye eklenemedi:", error);
            Alert.alert("Hata", "Yeni üye eklenirken sorun oluştu.");
        }
    };

    // 3. SİLME (DELETE)
    const deleteFamilyMember = async (id: string) => {
        if (!user || id === 'main_user') return;
        try {
            await deleteFamilyMemberFromDB(user.uid, id);
            if (activeProfileId === id) setActiveProfileId('main_user');
            setFamilyMembers(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error("Üye silinemedi:", error);
            Alert.alert("Hata", "Üye silinemedi.");
        }
    };

    // 4. GÜNCELLEME (UPDATE)
    const updateMemberInfo = async (id: string, updates: Partial<FamilyMember>) => {
        if (!user) return;

        try {
            setFamilyMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

            if (id === 'main_user') {
                const profileUpdates: any = {};

                if (updates.diet !== undefined) {
                    profileUpdates.dietaryPreferences = updates.diet ? [updates.diet] : [];
                }
                if (updates.allergens !== undefined) {
                    profileUpdates.allergens = updates.allergens;
                }
                if (updates.name) profileUpdates.displayName = updates.name;
                if (updates.avatarIcon) profileUpdates.avatarIcon = updates.avatarIcon;
                if (updates.color) profileUpdates.color = updates.color;

                if (Object.keys(profileUpdates).length > 0) {
                    await updateUserPreferences(user.uid, profileUpdates);
                }

            } else {
                await updateFamilyMemberInDB(user.uid, id, updates as any);
            }

        } catch (error) {
            console.error("Güncelleme hatası:", error);
        }
    };

    // 5. DATA GÜNCELLEME
    const updateProfileData = async (id: string, field: keyof ProfileData, value: any) => {
        if (!user) return;
        const updates: any = {};
        if (field === 'diet') updates.diet = value;
        if (field === 'allergens') updates.allergens = value;
        await updateMemberInfo(id, updates);
    };

    const getActiveProfile = () => familyMembers.find(m => m.id === activeProfileId);

    const getActiveData = () => {
        const profile = getActiveProfile();
        return {
            diet: profile?.diet || null,
            allergens: profile?.allergens || [],
            dietaryPreferences: []
        };
    };

    return (
        <UserContext.Provider value={{
            familyMembers,
            profilesData,
            activeProfileId,
            setActiveProfileId,
            addFamilyMember,
            deleteFamilyMember,
            updateMemberInfo,
            updateProfileData,
            getActiveProfile,
            getActiveData,
            isLoading
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);