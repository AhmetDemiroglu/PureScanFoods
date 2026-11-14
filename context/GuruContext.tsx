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
    failed?: boolean;
}

export interface ActiveProduct {
    id: string;
    name: string;
    brand: string;
    score: number;
    verdict: string;
    ingredients?: string[];
    imageUrl?: string;
    analysisSummary?: string;
    additives?: { code: string; name: string; risk: string }[];
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
    sendMessage: (text: string) => Promise<GuruSendResult>;
    retryMessage: (messageId: string) => Promise<GuruSendResult>;
    clearHistory: () => void;
    setActiveProduct: (product: ActiveProduct | null) => void;
    remainingMessages: number;
}

export type GuruSendResult = "sent" | "failed" | "limit" | "skipped";

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

    // Mesajı gönderir. Hata olursa kullanıcı mesajı "failed" işaretlenir, hak düşmez,
    // hata metni cevap olarak kaydedilmez; arayüz "Tekrar dene" gösterir.
    const deliver = async (text: string, prior: GuruMessage[], userMessage: GuruMessage): Promise<GuruSendResult> => {
        const activeProfile = getActiveProfile();
        setIsLoading(true);
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

            const response = await sendGuruMessage(text, guruContext, prior, i18n.language);

            const assistantMessage: GuruMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response,
                timestamp: Date.now()
            };

            setMessages(prev => {
                const updated = [
                    ...prev.map(m => (m.id === userMessage.id ? { ...m, failed: false } : m)),
                    assistantMessage
                ];
                saveToStorage(updated);
                return updated;
            });

            if (user?.uid) {
                try {
                    await incrementAiChatCount(user.uid, deviceId);
                } catch (e) {
                    console.error("Guru count error:", e);
                }
            }
            return "sent";
        } catch (error) {
            console.error("Guru Error:", error);
            setMessages(prev => {
                const updated = prev.map(m => (m.id === userMessage.id ? { ...m, failed: true } : m));
                saveToStorage(updated);
                return updated;
            });
            return "failed";
        } finally {
            setIsLoading(false);
        }
    };

    const canSend = () => (authIsPremium ?? false) || remainingMessages > 0;

    const sendMessage = async (text: string): Promise<GuruSendResult> => {
        if (!userProfile || !getActiveProfile) {
            console.warn("UserProfile or ActiveProfile is null");
            return "skipped";
        }
        if (isLoading) return "skipped";
        if (!canSend()) return "limit";

        const userMessage: GuruMessage = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            timestamp: Date.now()
        };

        const prior = messages;
        setMessages([...prior, userMessage]);
        return deliver(text, prior, userMessage);
    };

    const retryMessage = async (messageId: string): Promise<GuruSendResult> => {
        if (!userProfile || !getActiveProfile || isLoading) return "skipped";
        const index = messages.findIndex(m => m.id === messageId);
        const target = messages[index];
        if (!target || target.role !== "user" || !target.failed) return "skipped";
        if (!canSend()) return "limit";

        // Tekrar denenen mesaj sona taşınır, geçmiş yalnız ondan öncekilerdir.
        const prior = messages.filter(m => m.id !== messageId);
        const moved: GuruMessage = { ...target, failed: false, timestamp: Date.now() };
        setMessages([...prior, moved]);
        return deliver(target.content, prior, moved);
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
            retryMessage,
            clearHistory,
            setActiveProduct,
            remainingMessages
        }}>
            {children}
        </GuruContext.Provider>
    );
};

export const useGuru = () => useContext(GuruContext);
