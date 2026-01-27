import React, { useRef, useEffect, useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Keyboard,
    Dimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getScanHistoryFromDB } from '../../lib/firestore';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/colors";
import { useGuru } from "../../context/GuruContext";
import { ChatBubble } from "../../components/guru/ChatBubble";
import { ProductContextCard } from "../../components/guru/ProductContextCard";
import { GuruEmptyState } from "../../components/guru/GuruEmptyState";
import { GuruOnboarding } from "../../components/guru/GuruOnboarding";
import { TypingIndicator } from "../../components/guru/TypingIndicator";
import { ChatInput } from "../../components/guru/ChatInput";
import { ScanSelector } from "../../components/guru/ScanSelector";
import LimitWarningModal from "../../components/ui/LimitWarningModal";
import { BrandLoader } from "../../components/ui/BrandLoader";


const { height: SCREEN_HEIGHT } = Dimensions.get("window");


export default function GuruScreen() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [recentScans, setRecentScans] = useState<any[]>([]);
    const [loadingScans, setLoadingScans] = useState(false);

    // --- CONTEXT ---
    const { usageStats, userProfile } = useAuth();
    const guru = useGuru() || {};
    const {
        messages = [],
        isLoading = false,
        sendMessage = async () => { },
        clearHistory = () => { },
        activeProduct = null,
        setActiveProduct = () => { },
        remainingMessages = 0,
        isPremium = false
    } = guru;

    // --- STATE ---
    const [inputText, setInputText] = useState("");
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const showTyping = isLoading;
    const isTr = i18n.language === "tr";

    // --- EFFECTS ---
    useEffect(() => {
        setTimeout(() => setIsPageLoading(false), 500);

        AsyncStorage.getItem("@guru_onboarding_shown_v2").then(shown => {
            if (shown !== "true") setShowOnboarding(true);
        });
    }, []);

    useEffect(() => {
        if (messages?.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages]);

    useEffect(() => {
        const loadScans = async () => {
            if (!user?.uid) return;
            setLoadingScans(true);
            try {
                const { data } = await getScanHistoryFromDB(user.uid, null, 10);
                setRecentScans(data);
            } catch (error) {
                console.error("Geçmiş çekilemedi:", error);
            } finally {
                setLoadingScans(false);
            }
        };
        loadScans();
    }, [user]);

    // --- HANDLERS ---
    const handleOnboardingFinish = async () => {
        await AsyncStorage.setItem("@guru_onboarding_shown_v2", "true");
        setShowOnboarding(false);
    };

    const handleClearHistory = async () => {
        clearHistory();
        await AsyncStorage.removeItem("@guru_onboarding_shown_v2");
        setShowOnboarding(true);
    };

    const handleSuggestion = (text: string) => setInputText(text);

    const handleSelectProduct = (scan: any) => {
        setActiveProduct({
            id: scan.id,
            name: scan.productName,
            brand: scan.brand,
            score: scan.score,
            verdict: scan.verdict,
            ingredients: []
        });
    };

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        if (!isPremium && remainingMessages <= 0) {
            setShowLimitModal(true);
            return;
        }

        const text = inputText.trim();
        setInputText("");
        const success = await sendMessage(text);

        if (success === false && !isPremium) {
            setShowLimitModal(true);
        }
    };

    if (isPageLoading) {
        return <BrandLoader mode="fullscreen" />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: Colors.surface }}>
            {/* --- HEADER --- */}
            <View style={{ backgroundColor: Colors.surface }}>
                {/* SafeArea Üstü */}
                <LinearGradient
                    colors={[Colors.primary, "#E65100"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingTop: insets.top }}
                >
                    <View style={styles.headerContent}>
                        <Pressable onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={Colors.white} />
                        </Pressable>

                        <View style={styles.headerTitleArea}>
                            <Text style={styles.headerTitle}>{t("guru.title")}</Text>
                            <Text style={styles.headerSubtitle}>
                                {isPremium
                                    ? t("guru.premium_subtitle")
                                    : t("guru.limits.free", { count: remainingMessages })}
                            </Text>
                        </View>

                        <Pressable onPress={handleClearHistory} style={styles.backButton}>
                            <Ionicons name="trash-outline" size={22} color={Colors.white} />
                        </Pressable>
                    </View>
                </LinearGradient>
            </View>

            {/* --- CONTENT & INPUT --- */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <View style={styles.contentWrapper}>
                    {activeProduct ? (
                        <ProductContextCard
                            product={activeProduct}
                            onClose={() => setActiveProduct(null)}
                        />
                    ) : (
                        <ScanSelector
                            scans={recentScans}
                            onSelect={handleSelectProduct}
                            isLoading={loadingScans}
                        />
                    )}

                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <ChatBubble role={item.role} content={item.content} />
                        )}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <GuruEmptyState onSelectSuggestion={handleSuggestion} />
                        }
                        ListFooterComponent={
                            showTyping ? <TypingIndicator /> : <View style={{ height: 12 }} />
                        }
                    />
                </View>

                {/* --- BOTTOM AREA (Warning + Input) --- */}
                <View style={styles.bottomArea}>
                    <View style={styles.warningBox}>
                        <Ionicons name="shield-checkmark-outline" size={12} color={Colors.gray[500]} />
                        <Text style={styles.warningText}>
                            {t("guru.fixedWarning")}
                        </Text>
                    </View>

                    <ChatInput
                        value={inputText}
                        onChangeText={setInputText}
                        onSend={handleSend}
                        isLoading={isLoading}
                    />
                </View>
            </KeyboardAvoidingView>

            <GuruOnboarding
                visible={showOnboarding}
                onFinish={handleOnboardingFinish}
            />
            <LimitWarningModal
                visible={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                onGoPremium={() => {
                    setShowLimitModal(false);
                    router.push("/premium");
                }}
                stats={usageStats}
                user={userProfile}
                limitType="weekly"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    headerTitleArea: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: Colors.white,
    },
    headerSubtitle: {
        fontSize: 12,
        color: "rgba(255,255,255,0.9)",
        marginTop: 2,
    },
    contentWrapper: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: 0,
        overflow: "hidden",
    },
    listContent: {
        padding: 20,
        paddingBottom: 10,
        flexGrow: 1
    },
    bottomArea: {
        backgroundColor: Colors.surface,
        paddingBottom: 8,
    },
    warningBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 6,
        backgroundColor: Colors.gray[50],
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200]
    },
    warningText: {
        fontSize: 10,
        color: Colors.gray[500],
        textAlign: "center"
    },
});