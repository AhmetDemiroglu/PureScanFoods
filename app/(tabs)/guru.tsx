import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { View, Pressable, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from "react-native";
import { Text } from "../../components/ui/AppText";
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getScanHistoryFromDB } from '../../lib/firestore';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors } from "../../constants/colors";
import { useGuru } from "../../context/GuruContext";
import { useIsFocused } from "@react-navigation/native";
import { useTour, useTourReplay, useTourTarget } from "../../components/tour/TourContext";
import { GURU_TOUR } from "../../components/tour/tours";
import { ChatBubble } from "../../components/guru/ChatBubble";
import { ProductContextCard } from "../../components/guru/ProductContextCard";
import { GuruEmptyState } from "../../components/guru/GuruEmptyState";
import { TypingIndicator } from "../../components/guru/TypingIndicator";
import { ChatInput } from "../../components/guru/ChatInput";
import { ScanSelector } from "../../components/guru/ScanSelector";
import LimitWarningModal from "../../components/ui/LimitWarningModal";
import { useShell } from "../../context/ShellContext";
import * as haptics from "../../lib/haptics";
import PaywallModal from "../../components/ui/PaywallModal";
import { useTheme } from "../../context/ThemeContext";
import PageHeader from "../../components/ui/PageHeader";




export default function GuruScreen() {
    const { t, i18n } = useTranslation();
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();
    const keyboard = useAnimatedKeyboard();
    // Alt bar içeriğin üstünde yüzer ve içerik ekranın altına kadar uzanır. Klavye kapalıyken giriş
    // kutusu barın üstünde durur (+18: ortadaki tarama düğmesi kapsülden taşar, kutuya binmesin).
    // Klavye açıkken keyboard.height ekranın altından ölçülür, giriş kutusu klavyenin hemen üstüne çıkar.
    const inputAreaStyle = useAnimatedStyle(() => ({
        paddingBottom: Math.max(tabBarHeight + 18, keyboard.height.value + 8),
    }));
    const { user } = useAuth();
    const [recentScans, setRecentScans] = useState<any[]>([]);
    const [loadingScans, setLoadingScans] = useState(false);

    // --- CONTEXT ---
    const { usageStats, userProfile } = useAuth();
    const guru = useGuru() || {};
    const {
        messages = [],
        isLoading = false,
        sendMessage = async () => "skipped" as const,
        retryMessage = async () => "skipped" as const,
        clearHistory = () => { },
        activeProduct = null,
        setActiveProduct = () => { },
        remainingMessages = 0,
        isPremium = false
    } = guru;

    // --- STATE ---
    const [inputText, setInputText] = useState("");
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const { openSidebar } = useShell();

    const flatListRef = useRef<FlatList>(null);
    const showTyping = isLoading;
    const isTr = i18n.language === "tr";
    const isEs = i18n.language?.startsWith("es");

    // Karşılama ekranı yok: ilk girişte ipuçları (vurgulamalı tur) kendiliğinden açılır, info simgesi yeniden açar.
    const productTarget = useTourTarget("guru.product");
    const suggestionsTarget = useTourTarget("guru.suggestions");
    const inputTarget = useTourTarget("guru.input");
    const isFocused = useIsFocused();
    useTour("guru", GURU_TOUR, { ready: isFocused && !showLimitModal && !showPaywall });
    const replayTour = useTourReplay("guru", GURU_TOUR);

    // --- EFFECTS ---

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

    const refreshScansOnFocus = useCallback(async () => {
        if (!user?.uid) {
            setRecentScans([]);
            return;
        }
        setLoadingScans(true);
        try {
            const { data } = await getScanHistoryFromDB(user.uid, null, 10);
            setRecentScans(data);
        } catch (error) {
            console.error("Geçmiş çekilemedi:", error);
        } finally {
            setLoadingScans(false);
        }
    }, [user?.uid]);

    useFocusEffect(
        useCallback(() => {
            refreshScansOnFocus();
        }, [refreshScansOnFocus])
    );

    // --- HANDLERS ---
    const handleClearHistory = async () => {
        clearHistory();
    };

    const handleSuggestion = async (text: string) => {
        if (isLoading) return;

        if (!isPremium && remainingMessages <= 0) {
            setShowLimitModal(true);
            return;
        }

        const result = await sendMessage(text);
        if (result === "limit") {
            setShowLimitModal(true);
        }
    };

    const handleRetry = async (messageId: string) => {
        if (isLoading) return;
        const result = await retryMessage(messageId);
        if (result === "limit") {
            setShowLimitModal(true);
        }
    };

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
        const result = await sendMessage(text);

        if (result === "limit") {
            setShowLimitModal(true);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.surface }}>
            {/* --- HEADER (ortak PageHeader) --- */}
            <PageHeader
                title={t("guru.title")}
                subtitle={isPremium ? t("guru.premium_subtitle") : t("guru.limits.free", { count: remainingMessages })}
                onBack={() => router.replace("/")}
                onInfo={replayTour}
                onHistory={openSidebar}
                actions={[{ icon: "trash-outline", onPress: handleClearHistory, label: "Clear" }]}
            />

            {/* --- CONTENT & INPUT --- */}
            <Animated.View style={[{ flex: 1 }, inputAreaStyle]}>
                <View style={styles.contentWrapper}>
                    <View {...productTarget}>
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
                    </View>

                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <ChatBubble
                                role={item.role}
                                content={item.content}
                                failed={item.failed}
                                onRetry={() => handleRetry(item.id)}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View {...suggestionsTarget}>
                                <GuruEmptyState onSelectSuggestion={handleSuggestion} />
                            </View>
                        }
                        ListFooterComponent={
                            showTyping ? <TypingIndicator /> : <View style={{ height: 12 }} />
                        }
                    />
                </View>

                {/* --- BOTTOM AREA (Warning + Input) --- */}
                <View style={styles.bottomArea}>
                    <View style={styles.warningBox}>
                        <Ionicons name="shield-checkmark-outline" size={12} color={colors.gray[500]} />
                        <Text style={styles.warningText} numberOfLines={2}>
                            {t("guru.fixedWarning")}
                        </Text>
                    </View>

                    <View {...inputTarget}>
                    <ChatInput
                        value={inputText}
                        onChangeText={setInputText}
                        onSend={handleSend}
                        isLoading={isLoading}
                    />
                    </View>
                </View>
            </Animated.View>

            
            <LimitWarningModal
                visible={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                onGoPremium={() => {
                    setShowLimitModal(false);
                    setShowPaywall(true);
                }}
                stats={usageStats}
                user={userProfile}
                limitType="weekly"
            />
            <PaywallModal
                visible={showPaywall}
                onClose={() => setShowPaywall(false)}
            />
        </View>
    );
}

const createStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
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
    infoButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    headerTitleArea: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.white,
    },
    headerSubtitle: {
        fontSize: 12,
        color: "rgba(255,255,255,0.9)",
        marginTop: 2,
    },
    contentWrapper: {
        flex: 1,
        backgroundColor: colors.surface,
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
        backgroundColor: colors.card,
    },
    warningBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 16,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200]
    },
    warningText: {
        fontSize: 10,
        lineHeight: 14,
        color: colors.gray[500],
        textAlign: "center",
        flexShrink: 1,
    },
});

