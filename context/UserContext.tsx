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
import { LifeStageType } from '../lib/lifestages';
import { updateUserPreferences } from '../lib/firestore';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import i18n from '../lib/i18n';

// --- TİPLER ---
export type FamilyRole = "spouse" | "child" | "mother" | "father" | "sibling" | "friend" | "other" | "self";

export interface FamilyMember extends Omit<FirestoreMember, 'diet' | 'allergens' | 'lifeStage'> {
    diet: DietType | null;
    allergens: AllergenType[];
    lifeStage: LifeStageType | null;
}

export interface ProfileData {
    diet: DietType | null;
    allergens: AllergenType[];
    dietaryPreferences: string[];
    lifeStage: LifeStageType | null;
}

export interface UserContextType {
    familyMembers: FamilyMember[];
    profilesData: Record<string, ProfileData>;
    activeProfileId: string;
    setActiveProfileId: (id: string) => void;

    addFamilyMember: (name: string, role: FamilyRole, icon?: string, color?: string, lifeStage?: LifeStageType | null) => Promise<void>;
    deleteFamilyMember: (id: string) => Promise<void>;
    updateMemberInfo: (id: string, updates: Partial<FamilyMember>) => Promise<void>;
    updateProfileData: (id: string, field: keyof ProfileData, value: any) => Promise<void>;

    getActiveProfile: () => FamilyMember | undefined;
    getActiveData: () => ProfileData;

    isLoading: boolean;
}

const UserContext = createContext<UserContextType>({} as UserContextType);


// --- AVATAR ASSETS ---
export const AVATAR_COLOR_CATEGORIES = {
    red: {
        labelTr: "Kırmızı",
        labelEn: "Red",
        colors: ["#FEE2E2", "#FECACA", "#FCA5A5", "#F87171", "#EF4444", "#DC2626", "#B91C1C", "#991B1B", "#7F1D1D"]
    },
    orange: {
        labelTr: "Turuncu",
        labelEn: "Orange",
        colors: ["#FFEDD5", "#FED7AA", "#FDBA74", "#FB923C", "#F97316", "#EA580C", "#C2410C", "#9A3412", "#7C2D12"]
    },
    yellow: {
        labelTr: "Sarı",
        labelEn: "Yellow",
        colors: ["#FEF9C3", "#FEF08A", "#FDE047", "#FACC15", "#EAB308", "#CA8A04", "#A16207", "#854D0E", "#713F12"]
    },
    green: {
        labelTr: "Yeşil",
        labelEn: "Green",
        colors: ["#DCFCE7", "#BBF7D0", "#86EFAC", "#4ADE80", "#22C55E", "#16A34A", "#15803D", "#166534", "#14532D"]
    },
    teal: {
        labelTr: "Turkuaz",
        labelEn: "Teal",
        colors: ["#CCFBF1", "#99F6E4", "#5EEAD4", "#2DD4BF", "#14B8A6", "#0D9488", "#0F766E", "#115E59", "#134E4A"]
    },
    blue: {
        labelTr: "Mavi",
        labelEn: "Blue",
        colors: ["#DBEAFE", "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A"]
    },
    purple: {
        labelTr: "Mor",
        labelEn: "Purple",
        colors: ["#F3E8FF", "#E9D5FF", "#D8B4FE", "#C084FC", "#A855F7", "#9333EA", "#7E22CE", "#6B21A8", "#581C87"]
    },
    pink: {
        labelTr: "Pembe",
        labelEn: "Pink",
        colors: ["#FCE7F3", "#FBCFE8", "#F9A8D4", "#F472B6", "#EC4899", "#DB2777", "#BE185D", "#9D174D", "#831843"]
    },
    gray: {
        labelTr: "Gri",
        labelEn: "Gray",
        colors: ["#F8FAFC", "#E2E8F0", "#CBD5E1", "#94A3B8", "#64748B", "#475569", "#334155", "#1E293B", "#0F172A"]
    }
};

type AvatarIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export const AVATAR_COLORS = Object.values(AVATAR_COLOR_CATEGORIES).flatMap(cat => cat.colors);

export const AVATAR_ICON_CATEGORIES: Record<string, { labelTr: string; labelEn: string; icons: AvatarIconName[] }> = {
    people: {
        labelTr: "Kişiler",
        labelEn: "People",
        icons: ["account", "account-circle", "face-man", "face-woman", "human", "human-handsup", "human-greeting", "ninja", "pirate", "baby-face"]
    },
    emotions: {
        labelTr: "Duygular",
        labelEn: "Emotions",
        icons: ["emoticon", "emoticon-happy", "emoticon-cool", "emoticon-wink", "emoticon-kiss", "emoticon-excited", "emoticon-tongue", "emoticon-devil", "emoticon-angry", "emoticon-sad", "emoticon-cry", "emoticon-lol"]
    },
    animals: {
        labelTr: "Hayvanlar",
        labelEn: "Animals",
        icons: ["cat", "dog", "rabbit", "panda", "koala", "penguin", "owl", "bird", "duck", "fish", "dolphin", "turtle", "butterfly", "bee", "ladybug", "elephant", "horse", "unicorn", "cow", "pig", "sheep", "teddy-bear", "paw"]
    },
    food: {
        labelTr: "Yiyecek",
        labelEn: "Food",
        icons: ["food-apple", "fruit-cherries", "fruit-grapes", "fruit-watermelon", "carrot", "corn", "chili-hot", "pizza", "hamburger", "food-hot-dog", "noodles", "bread-slice", "cookie", "cupcake", "cake", "ice-cream", "candy", "coffee", "beer"]
    },
    sports: {
        labelTr: "Spor",
        labelEn: "Sports",
        icons: ["basketball", "soccer", "football", "tennis", "volleyball", "baseball", "golf", "bowling", "bike", "run", "swim", "yoga", "meditation", "dumbbell", "trophy", "medal"]
    },
    fantasy: {
        labelTr: "Fantastik",
        labelEn: "Fantasy",
        icons: ["crown", "diamond-stone", "crystal-ball", "magic-staff", "wizard-hat", "shield", "shield-star", "sword", "lightning-bolt", "heart", "star", "rocket", "ufo", "alien", "robot", "ghost", "skull"]
    },
    nature: {
        labelTr: "Doğa",
        labelEn: "Nature",
        icons: ["flower", "flower-tulip", "clover", "tree", "palm-tree", "pine-tree", "cactus", "leaf", "weather-sunny", "moon-waning-crescent", "star-four-points", "fire", "water", "snowflake", "earth"]
    }
};

export const AVATAR_ICONS = Object.values(AVATAR_ICON_CATEGORIES).flatMap(cat => cat.icons);

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
            lifeStage: m.lifeStage || null,
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
                name: userProfile?.displayName || user?.displayName || userProfile?.email?.split('@')[0] || "Ben",
                role: 'self',
                avatarIcon: userProfile?.avatarIcon || "account",
                color: userProfile?.color || AVATAR_COLORS[0],
                diet: (userProfile?.dietaryPreferences?.[0] as DietType) || null,
                allergens: (userProfile?.allergens as AllergenType[]) || [],
                lifeStage: 'ADULT' as LifeStageType,
                createdAt: userProfile?.createdAt
            };

            // B) Alt Üyeler
            const subMembersDocs = await getFamilyMembersFromDB(user.uid);
            const subMembers: FamilyMember[] = subMembersDocs.map(m => ({
                ...m,
                diet: (m.diet as DietType) || null,
                allergens: (m.allergens as AllergenType[]) || [],
                lifeStage: (m.lifeStage as LifeStageType) || null
            }));

            // C) Birleştir
            setFamilyMembers([mainUser, ...subMembers]);

        } catch (error) {
            console.error("Aile üyeleri çekilemedi:", error);
            Alert.alert(i18n.t("settings.error"), i18n.t("errors.generic"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFamily();
    }, [user, userProfile]);

    // 2. EKLEME (ADD)
    const addFamilyMember = async (
        name: string,
        role: FamilyRole,
        icon?: string,
        color?: string,
        lifeStage?: LifeStageType | null,
    ) => {
        if (!user) return;

        try {
            // Eğer parametre gelmediyse rastgele/varsayılan ata
            const assignedColor = color || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
            const assignedIcon = icon || "account";

            const newMemberData = {
                name,
                role,
                avatarIcon: assignedIcon,
                color: assignedColor,
                diet: null,
                allergens: [],
                lifeStage: lifeStage || null
            };

            await addFamilyMemberToDB(user.uid, newMemberData);
            await fetchFamily();

        } catch (error) {
            console.error("Üye eklenemedi:", error);
            Alert.alert(i18n.t("settings.error"), i18n.t("errors.generic"));
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
            Alert.alert(i18n.t("settings.error"), i18n.t("errors.generic"));
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
            lifeStage: profile?.lifeStage || null,
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
