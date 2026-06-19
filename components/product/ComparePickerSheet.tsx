import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Modal, Pressable, Animated, PanResponder, Dimensions, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "../ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { AppColors } from "../../constants/colors";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { getScanHistoryFromDB, ScanResult } from "../../lib/firestore";
import { TempStore } from "../../lib/tempStore";

interface ComparePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  current: { data: any; image: string }; // ekrandaki mevcut ürün
}

const scoreColor = (s: number) => (s >= 80 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444");

// History miniData -> result data (HistoryDrawerBody.openDetail ile aynı mantık)
const parseItem = (item: ScanResult): { data: any; image: string } => {
  const rawProduct = JSON.parse(item.miniData);
  const isNewFormat = rawProduct.product !== undefined;
  const data = isNewFormat
    ? {
        product: rawProduct.product,
        details: rawProduct.details,
        scores: rawProduct.scores,
        badges: item.badges,
        nutrition_facts: rawProduct.nutrition_facts,
        keto_analysis: rawProduct.keto_analysis,
      }
    : {
        product: rawProduct,
        details: null,
        scores: {
          safety: { value: item.score, level: "unknown" },
          compatibility: { verdict: item.verdict, details: [] },
        },
        badges: item.badges,
        nutrition_facts: null,
        keto_analysis: null,
      };
  return { data, image: item.imageUrl || "" };
};

/**
 * Karşılaştırma için geçmiş taramalardan ürün seçtiren bottomsheet.
 * KENDİ panY/PanResponder'ını taşır (mevcut sheet'lere dokunmaz).
 */
export default function ComparePickerSheet({ visible, onClose, current }: ComparePickerSheetProps) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;
  const panY = useRef(new Animated.Value(0)).current;
  const navigatingRef = useRef(false);

  const [history, setHistory] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
      navigatingRef.current = false;
      loadHistory();
    }
  }, [visible]);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await getScanHistoryFromDB(user.uid, null, 50);
      setHistory(data);
    } catch (e) {
      console.error("Karşılaştırma geçmişi yüklenemedi:", e);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    Animated.timing(panY, { toValue: screenHeight, duration: 240, useNativeDriver: true }).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) panY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.6) close();
        else Animated.spring(panY, { toValue: 0, bounciness: 4, useNativeDriver: true }).start();
      },
    })
  ).current;

  const handlePick = (item: ScanResult) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    try {
      const picked = parseItem(item);
      TempStore.setComparison({ a: current, b: picked });
      onClose();
      router.push("/compare");
    } catch (e) {
      console.error("Karşılaştırma ürünü ayrıştırılamadı:", e);
      navigatingRef.current = false;
    }
    setTimeout(() => { navigatingRef.current = false; }, 600);
  };

  const styles = createStyles(colors, isDark);

  const renderItem = ({ item }: { item: ScanResult }) => (
    <TouchableOpacity style={styles.row} onPress={() => handlePick(item)} activeOpacity={0.8}>
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : require("../../assets/placeholder.png")}
        style={styles.thumb}
        resizeMode="cover"
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName} numberOfLines={1}>{item.productName}</Text>
        {!!item.verdict && <Text style={styles.rowVerdict} numberOfLines={1}>{item.verdict}</Text>}
      </View>
      <View style={[styles.scorePill, { backgroundColor: scoreColor(item.score) }]}>
        <Text style={styles.scorePillText}>{item.score}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={styles.dismiss} onPress={close} />
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 24, transform: [{ translateY: panY }] },
          ]}
        >
          <View style={styles.handleWrap} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>
          <View style={styles.header}>
            <Text style={styles.title}>{t("compare.pickTitle")}</Text>
            <TouchableOpacity onPress={close} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>
          {loading && history.length === 0 ? (
            <View style={styles.loadingWrap}><ActivityIndicator size="small" color={colors.primary} /></View>
          ) : history.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="albums-outline" size={28} color={colors.gray[300]} />
              <Text style={styles.emptyText}>{t("compare.empty")}</Text>
            </View>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              style={{ maxHeight: screenHeight * 0.55 }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
    dismiss: { flex: 1 },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 12,
    },
    handleWrap: { alignItems: "center", paddingVertical: 8, marginBottom: 2 },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 8 },
    title: { fontSize: 16, fontWeight: "700", color: colors.text },
    closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.gray[100], alignItems: "center", justifyContent: "center" },
    loadingWrap: { paddingVertical: 40, alignItems: "center" },
    emptyWrap: { paddingVertical: 40, alignItems: "center", gap: 8 },
    emptyText: { fontSize: 13, color: colors.gray[400] },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 10,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[100],
    },
    thumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.gray[100] },
    rowName: { fontSize: 14, fontWeight: "600", color: colors.text },
    rowVerdict: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
    scorePill: { minWidth: 30, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
    scorePillText: { fontSize: 12, fontWeight: "800", color: "#FFF" },
  });
