import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, TextInput } from "react-native";
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
  const [barcodeInput, setBarcodeInput] = useState("");
  const [textInput, setTextInput] = useState("");

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

            {/* DİNAMİK İÇERİK ALANI */}
            <View style={styles.dynamicContent}>

              {/* DURUM 1: KAMERA MODU */}
              {activeTab === "camera" && (
                <>
                  <Pressable style={styles.mainButtonWrapper}>
                    <LinearGradient
                      colors={[Colors.primary, "#E65100"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.mainButton}
                    >
                      <Ionicons name="scan" size={32} color={Colors.white} />
                      <Text style={styles.mainButtonText}>{t("home.actions.scanIngredients")}</Text>
                    </LinearGradient>
                  </Pressable>

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

              {/* DURUM 2: BARKOD MODU (Revize) */}
              {activeTab === "barcode" && (
                <>
                  {/* 1. Büyük Tarama Butonu (Kamera ile aynı stilde) */}
                  <Pressable style={styles.mainButtonWrapper}>
                    <LinearGradient
                      colors={[Colors.secondary, "#0F172A"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.mainButton}
                    >
                      <Ionicons name="barcode-outline" size={32} color={Colors.white} />
                      <Text style={styles.mainButtonText}>{t("home.actions.scanBarcode")}</Text>
                    </LinearGradient>
                  </Pressable>

                  {/* 2. VEYA Ayracı */}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>{t("home.actions.or")}</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* 3. Manuel Giriş Satırı (Tek satır: Input + Search Butonu) */}
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.smallInput}
                      placeholder="Örn: 869052..."
                      placeholderTextColor={Colors.gray[400]}
                      keyboardType="numeric"
                      value={barcodeInput}
                      onChangeText={setBarcodeInput}
                    />
                    <Pressable style={styles.smallSearchButton}>
                      <Ionicons name="search" size={20} color={Colors.white} />
                    </Pressable>
                  </View>

                  <Text style={styles.disclaimerText}>{t("home.disclaimer.off")}</Text>
                </>
              )}

              {/* DURUM 3: METİN MODU (Revize - Kompakt) */}
              {activeTab === "text" && (
                <View style={{ gap: 12 }}>
                  <TextInput
                    style={[styles.inputField, styles.textArea]}
                    placeholder={t("home.actions.enterText")}
                    placeholderTextColor={Colors.gray[400]}
                    multiline
                    textAlignVertical="top"
                    value={textInput}
                    onChangeText={setTextInput}
                  />

                  {/* Daha ince, tek satır buton */}
                  <Pressable style={styles.slimButton}>
                    <Text style={styles.slimButtonText}>{t("home.actions.analyzeText")}</Text>
                    <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                  </Pressable>
                </View>
              )}
            </View>
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
  dynamicContent: {
    marginTop: 16,
  },
  inputField: {
    backgroundColor: Colors.gray[100],
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  textArea: {
    height: 120,
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.gray[400],
    textAlign: "center",
    marginTop: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  smallInput: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    color: Colors.secondary,
  },
  smallSearchButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  slimButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  slimButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 15,
  },
});