import React, { createContext, useContext, useState, useEffect } from "react";
import { Colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { DietType } from "../lib/diets";
import { AllergenType } from "../lib/allergens";

// --- TYPES ---
export type FamilyRole = "myself" | "spouse" | "child" | "mother" | "father" | "sibling" | "friend" | "other";

export interface UserProfileData {
    diet: DietType | null;
    allergens: AllergenType[];
}

export interface FamilyMember {
    id: string;
    name: string;
    role: FamilyRole;
    color: string;
    avatarIcon: string;
}

interface UserContextType {
    // Data
    familyMembers: FamilyMember[];
    profilesData: Record<string, UserProfileData>;
    activeProfileId: string;

    // Actions
    setActiveProfileId: (id: string) => void;
    addFamilyMember: (name: string, role: FamilyRole) => void;
    updateProfileData: (profileId: string, key: keyof UserProfileData, value: any) => void;
    updateMemberInfo: (id: string, updates: Partial<FamilyMember>) => void;
    deleteFamilyMember: (id: string) => void;

    // Helpers
    getActiveProfile: () => FamilyMember;
    getActiveData: () => UserProfileData;
}

export const getSafeIcon = (iconName: string): any => {
    if (iconName === "person") return "account";  
    return iconName;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const AVATAR_ICONS = [
    "face-man", "face-woman", "face-man-profile", "face-woman-profile",
    "face-man-shimmer", "face-woman-shimmer", "baby-face", "robot",
    "cat", "dog", "bear", "panda"
];

export const AVATAR_COLORS = [
    "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#10B981",
    "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899"
];

export function UserProvider({ children }: { children: React.ReactNode }) {
    // --- STATE ---
    const [activeProfileId, setActiveProfileId] = useState<string>("main_user");

    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
        { id: "main_user", name: "Ahmet Demiroğlu", role: "myself", color: Colors.primary, avatarIcon: "person" }
    ]);

    const [profilesData, setProfilesData] = useState<Record<string, UserProfileData>>({
        "main_user": { diet: null, allergens: [] }
    });

    const addFamilyMember = (name: string, role: FamilyRole) => {
        const newId = Date.now().toString();

        const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
        const defaultIcon = "account";

        const newMember: FamilyMember = {
            id: newId,
            name,
            role,
            avatarIcon: defaultIcon,
            color: randomColor
        };

        setFamilyMembers(prev => [...prev, newMember]);

        setProfilesData(prev => ({
            ...prev,
            [newId]: { diet: null, allergens: [], dietaryPreferences: [] }
        }));
    };

    const deleteFamilyMember = (id: string) => {
        if (id === 'main_user') return;
        setFamilyMembers(prev => prev.filter(m => m.id !== id));
        setProfilesData(prev => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
        });
    };

    const updateProfileData = (profileId: string, key: keyof UserProfileData, value: any) => {
        setProfilesData(prev => ({
            ...prev,
            [profileId]: { ...prev[profileId], [key]: value }
        }));
    };

    const updateMemberInfo = (id: string, updates: Partial<FamilyMember>) => {
        setFamilyMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const getActiveProfile = () => familyMembers.find(m => m.id === activeProfileId) || familyMembers[0];
    const getActiveData = () => profilesData[activeProfileId] || { diet: null, allergens: [] };

    return (
        <UserContext.Provider value={{
            familyMembers,
            profilesData,
            activeProfileId,
            setActiveProfileId,
            addFamilyMember,
            deleteFamilyMember,
            updateProfileData,
            updateMemberInfo,
            getActiveProfile,
            getActiveData
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}