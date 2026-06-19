import React from "react";
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar } from "react-native";
import { Text } from "../components/ui/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { AppColors } from "../constants/colors";
import { useTheme } from "../context/ThemeContext";
import { TempStore } from "../lib/tempStore";
import { enrichAdditives } from "../lib/additiveEnrichment";

const scoreColor = (s: number) => (s >= 80 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444");

const num = (v: any): number | null =>
  typeof v === "number" && !Number.isNaN(v) ? v : null;

export default function CompareScreen() {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, isDark);

  const lang: "tr" | "en" | "es" = i18n.language?.startsWith("tr")
    ? "tr" : i18n.language?.startsWith("es") ? "es" : "en";

  const pair = TempStore.getComparison();

  const extract = (side: any) => {
    const d = side?.data || {};
    return {
      name: d.product?.name || t("results.unknownProduct"),
      brand: d.product?.brand || t("results.unknownBrand"),
      image: side?.image || "",
      safety: num(d.scores?.safety?.value),
      nova: d.details?.processing?.classification || "-",
      additives: enrichAdditives(d.details?.additives || [], d.details?.ingredients_full_text || "", lang),
      sugar: num(d.nutrition_facts?.sugar),
      sodium: num(d.nutrition_facts?.sodium),
      satfat: num(d.nutrition_facts?.saturated_fat),
    };
  };

  if (!pair?.a?.data || !pair?.b?.data) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("compare.title")}</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.emptyWrap}>
          <Ionicons name="git-compare-outline" size={40} color={colors.gray[300]} />
          <Text style={styles.emptyText}>{t("compare.empty")}</Text>
        </View>
      </View>
    );
  }

  const A = extract(pair.a);
  const B = extract(pair.b);

  const flagged = (e: any[]) => e.filter((x) => x.risk === "Hazardous" || x.risk === "Caution").length;

  // Sayısal metrik satırı. higherBetter=true ise büyük olan daha iyi (yeşil ipucu).
  const renderNumRow = (
    label: string,
    a: number | null,
    b: number | null,
    unit: string,
    higherBetter: boolean,
    colorByScore = false
  ) => {
    let aBetter = false, bBetter = false;
    if (a !== null && b !== null && a !== b) {
      const aWins = higherBetter ? a > b : a < b;
      aBetter = aWins; bBetter = !aWins;
    }
    const fmt = (v: number | null) => (v === null ? "-" : `${v}${unit}`);
    const cellColor = (v: number | null, better: boolean) => {
      if (v === null) return colors.gray[400];
      if (colorByScore) return scoreColor(v);
      return better ? "#10B981" : colors.text;
    };
    return (
      <View style={styles.metricRow}>
        <Text style={[styles.metricVal, { color: cellColor(a, aBetter), fontWeight: aBetter ? "800" : "600" }]}>{fmt(a)}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricVal, { color: cellColor(b, bBetter), fontWeight: bBetter ? "800" : "600" }]}>{fmt(b)}</Text>
      </View>
    );
  };

  const renderTextRow = (label: string, a: string, b: string) => (
    <View style={styles.metricRow}>
      <Text style={[styles.metricValText]} numberOfLines={2}>{a}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValText]} numberOfLines={2}>{b}</Text>
    </View>
  );

  const renderHead = (P: typeof A) => (
    <View style={styles.headCol}>
      <Image
        source={P.image ? { uri: P.image } : require("../assets/placeholder.png")}
        style={styles.headImg}
        resizeMode="cover"
      />
      <Text style={styles.headBrand} numberOfLines={1}>{P.brand}</Text>
      <Text style={styles.headName} numberOfLines={2}>{P.name}</Text>
      <View style={[styles.headScore, { backgroundColor: P.safety !== null ? scoreColor(P.safety) : colors.gray[400] }]}>
        <Text style={styles.headScoreText}>{P.safety !== null ? P.safety : "-"}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("compare.title")}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headRow}>
          {renderHead(A)}
          <View style={styles.vsBadge}><Text style={styles.vsText}>{t("compare.vs")}</Text></View>
          {renderHead(B)}
        </View>

        <View style={styles.table}>
          {renderNumRow(t("compare.safety"), A.safety, B.safety, "", true, true)}
          {renderTextRow(t("compare.processing"), A.nova, B.nova)}
          {renderNumRow(t("compare.additives"), A.additives.length, B.additives.length, "", false)}
          {renderNumRow(t("compare.flagged"), flagged(A.additives), flagged(B.additives), "", false)}
          {renderNumRow(t("compare.sugar"), A.sugar, B.sugar, " g", false)}
          {renderNumRow(t("compare.sodium"), A.sodium, B.sodium, " mg", false)}
          {renderNumRow(t("compare.satfat"), A.satfat, B.satfat, " g", false)}
        </View>

        <Text style={styles.note}>{t("compare.note")}</Text>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingBottom: 10,
    },
    backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: colors.gray[100] },
    headerTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
    emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
    emptyText: { fontSize: 14, color: colors.gray[400] },

    headRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 12, paddingTop: 8 },
    headCol: { flex: 1, alignItems: "center", gap: 4 },
    headImg: { width: 88, height: 88, borderRadius: 16, backgroundColor: colors.gray[100] },
    headBrand: { fontSize: 10, fontWeight: "700", color: colors.gray[400], textTransform: "uppercase", marginTop: 6 },
    headName: { fontSize: 13, fontWeight: "700", color: colors.text, textAlign: "center", minHeight: 34 },
    headScore: { minWidth: 40, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, marginTop: 2 },
    headScoreText: { fontSize: 15, fontWeight: "800", color: "#FFF" },
    vsBadge: { paddingHorizontal: 8, paddingTop: 36 },
    vsText: { fontSize: 12, fontWeight: "800", color: colors.gray[400] },

    table: { marginTop: 18, marginHorizontal: 12, backgroundColor: colors.card, borderRadius: 16, paddingVertical: 4, borderWidth: 1, borderColor: colors.border },
    metricRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.gray[100],
    },
    metricVal: { flex: 1, fontSize: 15, textAlign: "center" },
    metricValText: { flex: 1, fontSize: 12, color: colors.text, textAlign: "center", fontWeight: "600" },
    metricLabel: { flex: 1.2, fontSize: 12, color: colors.gray[500], textAlign: "center", fontWeight: "600" },

    note: { fontSize: 11, color: colors.gray[400], textAlign: "center", marginTop: 16, paddingHorizontal: 32, lineHeight: 16 },
  });
