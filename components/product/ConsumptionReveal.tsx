import React, { useMemo, useRef, useState } from "react";
import {
    View,
    Modal,
    Pressable,
    StyleSheet,
    Image,
    ScrollView,
    Dimensions,
    Share,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from "react-native";
import { Text } from "../ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import ConsumptionJar from "./ConsumptionJar";
import ShareCard from "./ShareCard";
import {
    buildRenderLayers,
    resolveSugarGrams,
    sugarToSpoons,
    isFullyEstimated,
    deriveCompositionFromIngredients,
} from "../../lib/composition";
import { requestJarImageBase64 } from "../../lib/consumptionImage";
import { uploadImage } from "../../lib/storageHelper";
import { incrementImageGenCount, updateScanGeneratedImage } from "../../lib/firestore";
import * as FileSystem from "expo-file-system/legacy";
import { captureRef } from "react-native-view-shot";

interface Props {
    data: any;
    scanId?: string | null;
    isHistoryView?: boolean;
    onRequirePaywall: () => void;
}

type ViewMode = "chart" | "photo";

export default function ConsumptionReveal({ data, scanId, onRequirePaywall }: Props) {
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();
    const { isPremium, usageStats, user } = useAuth();
    const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const rawComposition = useMemo(() => {
        const c = data?.composition;
        if (Array.isArray(c) && c.length > 0) return c;
        return deriveCompositionFromIngredients(
            data?.details?.ingredients,
            data?.details?.additives,
            t("consumption.additives_layer", { defaultValue: "Katkı maddeleri" }),
        );
    }, [data, t]);

    const layers = useMemo(() => buildRenderLayers(rawComposition), [rawComposition]);
    const sugar = useMemo(
        () => resolveSugarGrams(rawComposition, data?.sugar_per_100g ?? data?.nutrition_facts?.sugar),
        [rawComposition, data?.sugar_per_100g, data?.nutrition_facts?.sugar],
    );
    const spoons = useMemo(() => sugarToSpoons(sugar.grams), [sugar.grams]);
    const fullyEstimated = useMemo(() => isFullyEstimated(rawComposition), [rawComposition]);

    const [showModal, setShowModal] = useState(false);
    const [aiUrl, setAiUrl] = useState<string | null>(data?.generatedImageUrl || null);
    const [viewMode, setViewMode] = useState<ViewMode>(data?.generatedImageUrl ? "photo" : "chart");
    const [generating, setGenerating] = useState(false);
    const [genError, setGenError] = useState<string | null>(null);
    const [sharing, setSharing] = useState(false);
    const shareRef = useRef<View>(null);

    if (!layers || layers.length === 0) return null;

    const jarWidth = Dimensions.get("window").width - 40;
    const limitReached = usageStats.imageGenLimit > 0 && usageStats.imageGenCount >= usageStats.imageGenLimit;
    const showPhoto = viewMode === "photo" && !!aiUrl;

    const closeModal = () => setShowModal(false);

    const handleGenerate = async () => {
        if (generating || aiUrl) return;
        setGenError(null);

        // Free kullanıcı: modalı KAPAT, sonra paywall'ı aç (yoksa paywall modalın arkasında kalıyor).
        if (!isPremium) {
            closeModal();
            setTimeout(() => onRequirePaywall(), 320);
            return;
        }
        if (limitReached) {
            setGenError(t("consumption.weekly_limit", { defaultValue: "Bu haftaki hakkını kullandın." }));
            return;
        }

        setGenerating(true);
        try {
            const base64 = await requestJarImageBase64(rawComposition);
            const uid = user?.uid;
            const tmpUri = `${FileSystem.cacheDirectory}gen_${Date.now()}.png`;
            await FileSystem.writeAsStringAsync(tmpUri, base64, { encoding: FileSystem.EncodingType.Base64 });
            const path = `scans/${uid || "anon"}/gen_${scanId || Date.now()}.jpg`;
            const url = await uploadImage(tmpUri, path);
            if (!url) throw new Error("Yükleme başarısız (Storage izni/kural).");

            setAiUrl(url);
            setViewMode("photo");
            if (data) data.generatedImageUrl = url;
            if (uid) {
                incrementImageGenCount(uid);
                if (scanId) updateScanGeneratedImage(uid, scanId, url);
            }
        } catch (e: any) {
            console.error("Consumption image generation failed:", e);
            const detail = e?.message ? `\n(${String(e.message).slice(0, 180)})` : "";
            setGenError(
                t("consumption.generate_failed", { defaultValue: "Görsel üretilemedi, lütfen tekrar deneyin." }) + detail,
            );
        } finally {
            setGenerating(false);
        }
    };

    const handleShare = async () => {
        if (sharing) return;
        setSharing(true);
        try {
            if (showPhoto && aiUrl) {
                try {
                    await Image.prefetch(aiUrl);
                } catch {}
            }
            // Markalı paylaşım kartını (off-screen) tek görsele yakala.
            await new Promise((r) => setTimeout(r, 280));
            let fileToShare: string | null = null;
            try {
                fileToShare = await captureRef(shareRef, { format: "jpg", quality: 0.92, result: "tmpfile" });
            } catch (capErr) {
                // view-shot linklenmemişse (pod install yapılmadıysa) yedek: AI fotoyu paylaş.
                if (showPhoto && aiUrl) {
                    const f = `${FileSystem.cacheDirectory}share_${Date.now()}.jpg`;
                    const dl = await FileSystem.downloadAsync(aiUrl, f);
                    fileToShare = dl.uri;
                }
            }

            const caption = t("consumption.share_caption", {
                defaultValue: "PureScan Foods 👀 Gördüğünü değil, gerçekte ne tükettiğini gör! #PureScanFoods",
            });
            if (fileToShare) {
                await Share.share({ url: fileToShare, message: caption });
            } else {
                await Share.share({ message: caption });
            }
        } catch {
            /* kullanıcı iptal etti */
        } finally {
            setSharing(false);
        }
    };

    const ShareButton = ({ wide }: { wide?: boolean }) => (
        <TouchableOpacity
            style={[styles.shareBtn, wide && styles.shareBtnWide]}
            onPress={handleShare}
            disabled={sharing}
            activeOpacity={0.85}
        >
            {sharing ? (
                <ActivityIndicator size="small" color={colors.primary} />
            ) : (
                <Ionicons name="share-social-outline" size={18} color={colors.primary} />
            )}
            <Text style={styles.shareBtnText}>
                {sharing
                    ? t("consumption.preparing", { defaultValue: "Hazırlanıyor…" })
                    : t("consumption.share", { defaultValue: "Paylaş" })}
            </Text>
        </TouchableOpacity>
    );

    return (
        <>
            {/* CTA Kartı */}
            <Pressable
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
                onPress={() => setShowModal(true)}
            >
                <View style={styles.cardIconWrap}>
                    <Ionicons name="eye" size={20} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                        {t("consumption.cta_title", { defaultValue: "Gerçekte ne tüketiyorsun?" })}
                    </Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                        {aiUrl
                            ? t("consumption.cta_view", { defaultValue: "Görseli gör" })
                            : t("consumption.cta_subtitle", { defaultValue: "İçindekileri kavanozda gör" })}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
            </Pressable>

            {/* Modal — iOS pageSheet: native swipe-down ile kapanır */}
            <Modal
                visible={showModal}
                animationType="slide"
                presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
                onRequestClose={closeModal}
            >
                <View style={styles.modalRoot}>
                    {/* Grabber */}
                    <View style={styles.grabber} />

                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.modalTitle}>
                                {t("consumption.modal_title", { defaultValue: "Gerçekte Ne Tüketiyorsun?" })}
                            </Text>
                            {!!data?.product?.name && (
                                <Text style={styles.modalSub} numberOfLines={1}>
                                    {data.product.name}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={closeModal} hitSlop={10} style={styles.closeBtn}>
                            <Ionicons name="close" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {generating ? (
                        <View style={styles.loaderWrap}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loaderTitle}>
                                {t("consumption.preparing", { defaultValue: "Görsel hazırlanıyor…" })}
                            </Text>
                            <Text style={styles.loaderSub}>
                                {t("consumption.estimated_note", { defaultValue: "Oranlar mevcut verilerden tahminidir" })}
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            contentContainerStyle={{ paddingBottom: 28 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* "tahmini" rozeti */}
                            <View style={styles.estimateBadge}>
                                <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
                                <Text style={styles.estimateBadgeText}>
                                    {fullyEstimated
                                        ? t("consumption.fully_estimated", {
                                              defaultValue: "Tahmini görselleştirme (içindekiler sırasından)",
                                          })
                                        : t("consumption.estimated_note", {
                                              defaultValue: "Oranlar mevcut verilerden tahminidir",
                                          })}
                                </Text>
                            </View>

                            {/* Görsel */}
                            {showPhoto ? (
                                <Image
                                    source={{ uri: aiUrl! }}
                                    style={[styles.aiImage, { width: jarWidth, height: jarWidth }]}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={{ marginTop: 8 }}>
                                    <ConsumptionJar
                                        layers={layers}
                                        spoons={spoons}
                                        sugarEstimated={sugar.estimated}
                                        fullyEstimated={fullyEstimated}
                                        width={jarWidth}
                                        servingLabel={
                                            data?.nutrition_facts?.serving_size
                                                ? `${data.nutrition_facts.serving_size}`
                                                : undefined
                                        }
                                    />
                                </View>
                            )}

                            {/* Grafik <-> Foto geçişi */}
                            {aiUrl && (
                                <View style={styles.toggleRow}>
                                    <ToggleChip
                                        label={t("consumption.toggle_chart", { defaultValue: "Grafik" })}
                                        active={viewMode === "chart"}
                                        onPress={() => setViewMode("chart")}
                                        colors={colors}
                                    />
                                    <ToggleChip
                                        label={t("consumption.toggle_photo", { defaultValue: "Fotoğraf" })}
                                        active={viewMode === "photo"}
                                        onPress={() => setViewMode("photo")}
                                        colors={colors}
                                    />
                                </View>
                            )}

                            {genError && (
                                <View style={styles.errorBox}>
                                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                                    <Text style={styles.errorText}>{genError}</Text>
                                </View>
                            )}

                            {/* Aksiyonlar */}
                            {!aiUrl ? (
                                <View style={styles.actionsRow}>
                                    <TouchableOpacity
                                        style={[styles.genBtn, limitReached && styles.genBtnLocked]}
                                        onPress={handleGenerate}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons
                                            name={!isPremium || limitReached ? "lock-closed" : "sparkles"}
                                            size={18}
                                            color="#FFF"
                                        />
                                        <Text style={styles.genBtnText}>
                                            {t("consumption.make_photoreal", { defaultValue: "Fotogerçekçi yap" })}
                                        </Text>
                                        {!isPremium && (
                                            <View style={styles.cornerPill}>
                                                <Text style={styles.cornerPillText}>PRO</Text>
                                            </View>
                                        )}
                                        {isPremium && limitReached && (
                                            <View style={styles.cornerLock}>
                                                <Ionicons name="lock-closed" size={11} color="#FFF" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    <ShareButton />
                                </View>
                            ) : (
                                <View style={styles.actionsCenter}>
                                    <ShareButton wide />
                                </View>
                            )}

                            <Text style={styles.disclaimer}>
                                {t("consumption.disclaimer", {
                                    defaultValue:
                                        "Bu görselleştirme, içindekiler listesinin yasal sıralaması ve (varsa) besin/barkod verisinden hesaplanan TAHMİNİ oranlara dayanır.",
                                })}
                            </Text>
                        </ScrollView>
                    )}
                </View>
            </Modal>

            {/* Off-screen markalı paylaşım kartı (view-shot ile yakalanır) — sadece modal açıkken */}
            {showModal && (
                <View style={styles.offscreen} pointerEvents="none">
                    <View ref={shareRef} collapsable={false}>
                        <ShareCard
                            layers={layers}
                            spoons={spoons}
                            sugarEstimated={sugar.estimated}
                            aiUrl={showPhoto ? aiUrl : null}
                            productName={data?.product?.name}
                            width={360}
                        />
                    </View>
                </View>
            )}
        </>
    );
}

function ToggleChip({ label, active, onPress, colors }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                paddingHorizontal: 18,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: active ? colors.primary : colors.gray[100],
            }}
        >
            <Text style={{ fontSize: 13, fontWeight: "700", color: active ? "#FFF" : colors.gray[500] }}>{label}</Text>
        </TouchableOpacity>
    );
}

const createStyles = (colors: any, isDark: boolean) =>
    StyleSheet.create({
        card: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 14,
            marginBottom: 16,
            borderRadius: 16,
            backgroundColor: isDark ? "rgba(255,111,0,0.10)" : "#FFF7ED",
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,138,51,0.30)" : "rgba(255,111,0,0.18)",
        },
        cardIconWrap: {
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
        },
        cardTitle: { fontSize: 14.5, fontWeight: "800", color: colors.text },
        cardSubtitle: { fontSize: 12, fontWeight: "500", color: colors.gray[500], marginTop: 2 },
        modalRoot: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: 4 },
        grabber: {
            width: 40,
            height: 5,
            borderRadius: 3,
            backgroundColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)",
            alignSelf: "center",
            marginTop: 8,
            marginBottom: 4,
        },
        modalHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 },
        modalTitle: { fontSize: 19, fontWeight: "900", color: colors.text, letterSpacing: -0.3 },
        modalSub: { fontSize: 13, fontWeight: "500", color: colors.gray[500], marginTop: 1 },
        closeBtn: {
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isDark ? "rgba(255,255,255,0.06)" : colors.gray[100],
        },

        loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingBottom: 60 },
        loaderTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
        loaderSub: { fontSize: 13, color: colors.gray[500], textAlign: "center", paddingHorizontal: 40 },

        estimateBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            alignSelf: "center",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            marginBottom: 6,
            backgroundColor: isDark ? "rgba(255,138,51,0.12)" : "#FFF7ED",
        },
        estimateBadgeText: { fontSize: 11.5, fontWeight: "700", color: colors.primary },
        aiImage: {
            alignSelf: "center",
            borderRadius: 18,
            marginTop: 8,
            backgroundColor: isDark ? "rgba(255,255,255,0.03)" : colors.gray[100],
        },
        toggleRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 16 },
        errorBox: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginHorizontal: 16,
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            backgroundColor: isDark ? "rgba(239,68,68,0.10)" : "#FEF2F2",
        },
        errorText: { flex: 1, fontSize: 12.5, color: isDark ? "#FCA5A5" : "#B91C1C", fontWeight: "600" },

        actionsRow: { flexDirection: "row", gap: 12, marginHorizontal: 16, marginTop: 18, alignItems: "stretch" },
        actionsCenter: { alignItems: "center", marginTop: 18, paddingHorizontal: 16 },
        genBtn: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 14,
        },
        genBtnLocked: { backgroundColor: colors.gray[400] },
        genBtnText: { color: "#FFF", fontSize: 14.5, fontWeight: "800" },
        cornerPill: {
            position: "absolute",
            top: -7,
            right: -6,
            backgroundColor: "#16203A",
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderRadius: 9,
            borderWidth: 1.5,
            borderColor: colors.surface,
        },
        cornerPillText: { color: "#FFD479", fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
        cornerLock: {
            position: "absolute",
            top: -8,
            right: -8,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: "#16203A",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: colors.surface,
        },
        shareBtn: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: colors.primary,
            minWidth: 120,
        },
        shareBtnWide: { alignSelf: "center", paddingHorizontal: 48 },
        shareBtnText: { color: colors.primary, fontSize: 14.5, fontWeight: "800" },
        disclaimer: {
            fontSize: 11,
            lineHeight: 16,
            color: colors.gray[400],
            textAlign: "center",
            marginHorizontal: 22,
            marginTop: 18,
        },
        offscreen: { position: "absolute", left: -10000, top: 0, opacity: 0 },
    });
