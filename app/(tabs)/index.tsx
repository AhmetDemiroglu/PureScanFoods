import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/colors";
import Header from "../../components/ui/Header";
import Hero from "../../components/ui/Hero";

type ScanTab = "camera" | "barcode" | "text";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ScanScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ScanTab>("camera");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>

        {/* 1. Header: Sabit Üstte */}
        <Header />

        {/* 2. Orta Alan: Hero ve Kart'ı kapsar ve ortalar */}
        <View style={styles.centerContainer}>
          <Hero />

          {/* Scan Card */}
          <View style={styles.scanCard}>
            <View style={styles.tabSwitcher}>
              <Pressable
                style={[styles.tab, activeTab === "camera" && styles.tabActive]}
                onPress={() => setActiveTab("camera")}
              >
                <Ionicons
                  name={activeTab === "camera" ? "camera" : "camera-outline"}
                  size={18}
                  color={activeTab === "camera" ? Colors.secondary : Colors.gray[400]}
                />
                <Text style={[styles.tabText, activeTab === "camera" && styles.tabTextActive]}>
                  {t("home.tabs.camera")}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.tab, activeTab === "barcode" && styles.tabActive]}
                onPress={() => setActiveTab("barcode")}
              >
                <Ionicons name="barcode-outline" size={18} color={Colors.gray[400]} />
                <Text style={styles.tabText}>{t("home.tabs.barcode")}</Text>
              </Pressable>

              <Pressable
                style={[styles.tab, activeTab === "text" && styles.tabActive]}
                onPress={() => setActiveTab("text")}
              >
                <Ionicons name="document-text-outline" size={18} color={Colors.gray[400]} />
                <Text style={styles.tabText}>{t("home.tabs.text")}</Text>
              </Pressable>
            </View>

            {/* Main Button Wrapper */}
            <Pressable style={styles.mainButtonWrapper}>
              <LinearGradient
                colors={[Colors.primary, "#E65100"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mainButton}
              >
                <Ionicons name="scan" size={32} color={Colors.white} />
                <Text style={styles.mainButtonText}>
                  {activeTab === "camera" && t("home.actions.scanIngredients")}
                  {activeTab === "barcode" && t("home.actions.scanBarcode")}
                  {activeTab === "text" && t("home.actions.analyzeText")}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Secondary Button */}
            {activeTab !== "text" && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t("home.actions.or")}</Text>
                  <View style={styles.dividerLine} />
                </View>
                <Pressable style={styles.secondaryButton}>
                  <Ionicons name="images-outline" size={20} color={Colors.gray[500]} />
                  <Text style={styles.secondaryButtonText}>{t("home.actions.fromGallery")}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 40,
    paddingBottom: 20,
  },
  scanCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
    width: "100%",
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.gray[400],
  },
  tabTextActive: {
    color: Colors.secondary,
  },
  mainButtonWrapper: {
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  mainButton: {
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mainButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.white,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[200],
  },
  dividerText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.gray[400],
    marginHorizontal: 12,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray[600],
  },
});