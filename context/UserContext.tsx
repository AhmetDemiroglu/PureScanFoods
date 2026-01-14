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

    // Helpers
    getActiveProfile: () => FamilyMember;
    getActiveData: () => UserProfileData;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const AVATAR_COLORS = ["#F59E0B", "#EA580C", "#DC2626", "#DB2777", "#9333EA", "#4F46E5", "#2563EB", "#0284C7", "#059669", "#65A30D"];

export function UserProvider({ children }: { children: React.ReactNode }) {
    // --- STATE ---
    const [activeProfileId, setActiveProfileId] = useState<string>("main_user");

    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
        { id: "main_user", name: "Ahmet Demiroğlu", role: "myself", color: Colors.primary, avatarIcon: "person" }
    ]);

    const [profilesData, setProfilesData] = useState<Record<string, UserProfileData>>({
        "main_user": { diet: null, allergens: [] }
    });

    // --- ACTIONS ---
    const addFamilyMember = (name: string, role: FamilyRole) => {
        const icons: Record<string, string> = {
            spouse: "heart",
            child: "baby-face",
            mother: "face-woman",
            father: "face-man",
            sibling: "human-greeting",
            friend: "emoticon-happy",
            other: "account",
            myself: "account"
        };

        const newMember: FamilyMember = {
            id: Date.now().toString(),
            name: name,
            role: role,
            color: AVATAR_COLORS[familyMembers.length % AVATAR_COLORS.length],
            avatarIcon: icons[role] || "person"
        };

        setFamilyMembers(prev => [...prev, newMember]);
        setProfilesData(prev => ({ ...prev, [newMember.id]: { diet: null, allergens: [] } }));
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

    // --- HELPERS ---
    const getActiveProfile = () => familyMembers.find(m => m.id === activeProfileId) || familyMembers[0];
    const getActiveData = () => profilesData[activeProfileId] || { diet: null, allergens: [] };

    return (
        <UserContext.Provider value={{
            familyMembers,
            profilesData,
            activeProfileId,
            setActiveProfileId,
            addFamilyMember,
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