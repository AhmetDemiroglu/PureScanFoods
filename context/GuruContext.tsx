import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useAuth } from "./AuthContext";
import { useUser } from "./UserContext";
import { useTranslation } from "react-i18next";
import { sendGuruMessage } from "../lib/guru";

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
    weeklyUsed: number;
    weeklyLimit: number;
    isLoading: boolean;
    activeProduct: ActiveProduct | null;
    userName: string;
    familyMembers: Array<{
        id: string;
        name: string;
        diet?: string | null;
        allergens?: string[];
    }>;
    sendMessage: (text: string) => Promise<void>;
    clearHistory: () => void;
    setActiveProduct: (product: ActiveProduct | null) => void;
    remainingMessages: number;
}

const GURU_WEEKLY_FREE_LIMIT = 5;
const STORAGE_KEY = "@purescan_guru_messages";

const GuruContext = createContext<GuruContextType>({} as GuruContextType);

export const GuruProvider = ({ children }: { children: React.ReactNode }) => {
    const { userProfile, isPremium: authIsPremium, usageStats } = useAuth();
    const { familyMembers, activeProfileId, getActiveProfile } = useUser();

    const [messages, setMessages] = useState<GuruMessage[]>([]);
    const [weeklyUsed, setWeeklyUsed] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [activeProduct, setActiveProductState] = useState<ActiveProduct | null>(null);

    const { i18n } = useTranslation();
    const isTr = i18n.language === "tr";

    useEffect(() => {
        const load = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const data = JSON.parse(stored);
                    setMessages(data.messages || []);
                    setWeeklyUsed(data.weeklyUsed || 0);
                }
            } catch (e) {
                console.error("Guru storage load error:", e);
            }
        };
        load();
    }, []);

    const saveToStorage = async (newMessages: GuruMessage[], used: number) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
                messages: newMessages,
                weeklyUsed: used,
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
        const limit = GURU_WEEKLY_FREE_LIMIT;

        if (!userIsPremium && weeklyUsed >= limit) {
            Alert.alert(
                isTr ? "Limit Doldu" : "Limit Reached",
                isTr ? "Bu haftalık ücretsiz mesaj hakkınızı doldurdunuz." : "You've used all your free messages this week."
            );
            return;
        }

        setIsLoading(true);

        const userMessage: GuruMessage = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);

        try {
            // Context hazırla
            const guruContext = {
                userProfile: {
                    allergens: getActiveProfile()?.allergens || [],
                    dietaryPreferences: getActiveProfile()?.diet ? [getActiveProfile()!.diet!] : [],
                    lifeStage: getActiveProfile()?.lifeStage || null
                },
                userName,
                familyMembers: memberList,
                activeProduct: activeProduct,
                recentScans: [] // TODO: Firestore'dan recent scans çekilebilir
            };

            const response = await sendGuruMessage(
                text,
                guruContext,
                [...messages, userMessage],
                i18n.language
            );

            const assistantMessage: GuruMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, assistantMessage]);
            setWeeklyUsed(prev => prev + 1);
            saveToStorage([...messages, userMessage, assistantMessage], weeklyUsed + 1);

        } catch (error) {
            console.error("Guru Error:", error);
            const errorMsg: GuruMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: isTr ? "Bir hata oluştu. Lütfen tekrar deneyin." : "An error occurred. Please try again.",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = () => {
        setMessages([]);
        setWeeklyUsed(0);
        saveToStorage([], 0);
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
            weeklyUsed,
            weeklyLimit: GURU_WEEKLY_FREE_LIMIT,
            isLoading,
            activeProduct,
            userName,
            familyMembers: memberList,
            sendMessage,
            clearHistory,
            setActiveProduct,
            remainingMessages: GURU_WEEKLY_FREE_LIMIT - weeklyUsed
        }}>
            {children}
        </GuruContext.Provider>
    );
};

export const useGuru = () => useContext(GuruContext);
