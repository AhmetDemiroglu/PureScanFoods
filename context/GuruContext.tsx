import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useAuth } from "./AuthContext";
import { useUser } from "./UserContext";
import { useTranslation } from "react-i18next";
import { sendGuruMessage } from "../lib/guru";
import { incrementAiChatCount } from "../lib/firestore";

export interface GuruMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

export interface ActiveProduct {
    id: string;
    name: string;
    brand: string;
    score: number;
    verdict: string;
    ingredients?: string[];
    imageUrl?: string;
}

interface GuruContextType {
    messages: GuruMessage[];
    isPremium: boolean;
    aiChatCount: number;
    aiChatLimit: number;
    isLoading: boolean;
    activeProduct: ActiveProduct | null;
    userName: string;
    familyMembers: Array<{
        id: string;
        name: string;
        diet?: string | null;
        allergens?: string[];
    }>;
    sendMessage: (text: string) => Promise<boolean | undefined>;
    clearHistory: () => void;
    setActiveProduct: (product: ActiveProduct | null) => void;
    remainingMessages: number;
}

const STORAGE_KEY = "@purescan_guru_messages";

const GuruContext = createContext<GuruContextType>({} as GuruContextType);

export const GuruProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, userProfile, isPremium: authIsPremium, usageStats, deviceId } = useAuth();
    const { familyMembers, activeProfileId, getActiveProfile } = useUser();

    const [messages, setMessages] = useState<GuruMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeProduct, setActiveProductState] = useState<ActiveProduct | null>(null);

    const { i18n } = useTranslation();
    const isTr = i18n.language === "tr";

    const aiChatCount = usageStats?.aiChatCount || 0;
    const aiChatLimit = usageStats?.aiChatLimit || 5;
    const remainingMessages = Math.max(0, aiChatLimit - aiChatCount);

    useEffect(() => {
        const load = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const data = JSON.parse(stored);
                    setMessages(data.messages || []);
                }
            } catch (e) {
                console.error("Guru storage load error:", e);
            }
        };
        load();
    }, []);

    const saveToStorage = async (newMessages: GuruMessage[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
                messages: newMessages,
                lastUpdate: new Date().toISOString()
            }));
        } catch (e) {
            console.error("Guru storage save error:", e);
        }
    };

    const sendMessage = async (text: string) => {
        if (!userProfile || !getActiveProfile) {
            console.warn("UserProfile or ActiveProfile is null");
            return;
        }

        const userIsPremium = authIsPremium ?? false;

        if (!userIsPremium && remainingMessages <= 0) {
            return false;
        }

        setIsLoading(true);

        const userMessage: GuruMessage = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            timestamp: Date.now()
        };

        const activeProfile = getActiveProfile();
        const nextMessages = [...messages, userMessage];
        setMessages(nextMessages);

        try {
            const guruContext = {
                userProfile: {
                    allergens: activeProfile?.allergens || [],
                    dietaryPreferences: activeProfile?.diet ? [activeProfile.diet] : [],
                    lifeStage: activeProfile?.lifeStage || null
                },
                userName,
                familyMembers: memberList,
                activeProduct: activeProduct,
                recentScans: []
            };

            const response = await sendGuruMessage(
                text,
                guruContext,
                nextMessages,
                i18n.language
            );

            const assistantMessage: GuruMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response,
                timestamp: Date.now()
            };

            setMessages(prev => {
                const updated = [...prev, assistantMessage];
                saveToStorage(updated);
                return updated;
            });

            if (user?.uid) {
                await incrementAiChatCount(user.uid, deviceId);
            }

            return true;

        } catch (error) {
            console.error("Guru Error:", error);
            const errorMsg: GuruMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: isTr ? "Bir hata oluştu. Lütfen tekrar deneyin." : "An error occurred. Please try again.",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
            return false;
        } finally {
            setIsLoading(false);
        }
    };
    const clearHistory = () => {
        setMessages([]);
        saveToStorage([]);
    };

    const setActiveProduct = (product: ActiveProduct | null) => {
        setActiveProductState(product);
    };

    const userName = userProfile?.displayName ||
        userProfile?.email?.split('@')[0] ||
        "Kullanıcı";

    const memberList = (familyMembers || []).map(m => ({
        id: m.id,
        name: m.name,
        diet: m.diet || null,
        allergens: (m.allergens || []).map((a: any) => String(a))
    }));

    return (
        <GuruContext.Provider value={{
            messages: messages || [],
            isPremium: authIsPremium ?? false,
            aiChatCount,
            aiChatLimit,
            isLoading,
            activeProduct,
            userName,
            familyMembers: memberList,
            sendMessage,
            clearHistory,
            setActiveProduct,
            remainingMessages
        }}>
            {children}
        </GuruContext.Provider>
    );
};

export const useGuru = () => useContext(GuruContext);
