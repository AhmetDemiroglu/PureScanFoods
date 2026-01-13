import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { CameraView, useCameraPermissions } from "expo-camera";
import { View, Text, Pressable, StyleSheet, Dimensions, TextInput, ActivityIndicator, Modal, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "../../constants/colors";
import Header from "../../components/ui/Header";
import Hero from "../../components/ui/Hero";
import { callGemini } from "../../lib/api";
import ProcessingView from "../../components/ui/ProcessingView";
import { TempStore } from "../../lib/tempStore";

type ScanTab = "camera" | "barcode" | "text";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const generateAnalysisPrompt = (lang: string, userProfile: any) => {
  const targetLang = lang === "tr" ? "TURKISH" : "ENGLISH";

  const diet = userProfile?.dietaryPreferences?.join(", ") || "None";
  const allergens = userProfile?.allergens?.join(", ") || "None";

  return `
    ROLE: Senior Food Scientist & Clinical Nutritionist.
    TARGET LANGUAGE: ${targetLang} (Translate ALL output values to this language).
    
    USER PROFILE:
    - Diet: ${diet}
    - Allergens: ${allergens}

    TASK:
    Analyze the product image/text provided. You must generate two distinct scores, a detailed breakdown, and regulatory badges.

    SCORING LOGIC (STRICT MATHEMATICAL RULES):
    1. SAFETY SCORE (Start at 100 points):
       - If NOVA Group 4 (Ultra-processed): SUBTRACT 20.
       - If High Sugar (>10g/100g): SUBTRACT 15.
       - If High Saturated Fat (>5g/100g): SUBTRACT 10.
       - For EACH 'Hazardous' additive: SUBTRACT 15.
       - For EACH 'Risk' additive: SUBTRACT 5.
       - If Organic: ADD 5 (Max 100).
       - Minimum Score Floor: 0.
    
    2. COMPATIBILITY SCORE (Based on User Profile):
       - Start with the calculated SAFETY SCORE.
       - CRITICAL: If product contains ANY user allergen -> Force Score = 0.
       - CRITICAL: If product violates user diet (e.g. Vegan but has milk) -> Force Score = 0.
       - If no blocks, use the Safety Score as base and explain the match.

    3. BADGE LOGIC (Detect regulatory status):
       - "EU_BANNED": If contains additives banned in the EU (e.g., Titanium Dioxide E171, Potassium Bromate, BVO).
       - "FDA_WARN": If contains additives with specific FDA warnings (e.g., Red 3).
       - "NO_ADDITIVES": If the product has NO E-numbers/additives.
       - "HIGH_PROTEIN": If protein > 20g/100g.
       - "SUGAR_FREE": If sugar < 0.5g/100g.

    OUTPUT FORMAT (Raw JSON only, no markdown):
    {
      "product": {
        "name": "string",
        "brand": "string",
        "category": "string",
        "isFood": boolean
      },
      "badges": ["string (Enum: EU_BANNED, FDA_WARN, NO_ADDITIVES, HIGH_PROTEIN, SUGAR_FREE)"],
      "scores": {
        "safety": {
          "value": number (0-100),
          "level": "string (Hazardous/Poor/Average/Good/Excellent)",
          "color": "string (red/orange/yellow/lightgreen/green)"
        },
        "compatibility": {
          "value": number (0-100),
          "level": "string (Bad Match/Risky/Neutral/Good Match/Perfect)",
          "color": "string (red/orange/yellow/lightgreen/green)",
          "verdict": "string (Short sentence explaining why it fits or fails the user profile)"
        }
      },
      "details": {
        "ingredients": [
           { "name": "string", "isAllergen": boolean, "riskLevel": "string (High/Medium/Low/Safe)" }
        ],
        "additives": [
           { "code": "string (e.g. E330)", "name": "string", "risk": "string (Hazardous/Caution/Safe)", "description": "Short explanation" }
        ],
        "nutritional_highlights": {
           "pros": ["string"],
           "cons": ["string"]
        },
        "processing": {
           "classification": "string (e.g. Ultra Processed)",
           "description": "string"
        }
      }
    }
  `;
};

export default function ScanScreen() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<ScanTab>("camera");
  const { userProfile } = useAuth();

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();

  const [showCamera, setShowCamera] = useState(false);

  const [barcodeInput, setBarcodeInput] = useState("");
  const [textInput, setTextInput] = useState("");

  if (isScanning) {
    return <ProcessingView />;
  }

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
                  {/* 1. Ana Sayfa Butonu (Eski Tasarım Geri Geldi) */}
                  <Pressable
                    style={styles.mainButtonWrapper}
                    onPress={() => {
                      if (!permission?.granted) {
                        requestPermission();
                      } else {
                        setShowCamera(true);
                      }
                    }}
                  >
                    <LinearGradient
                      colors={[Colors.primary, "#E65100"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.mainButton}
                    >
                      <Ionicons name="scan" size={32} color={Colors.white} />
                      <Text style={styles.mainButtonText}>
                        {permission?.granted ? t("home.actions.scanIngredients") : t("permissions.request", { defaultValue: "Kamera İzni Ver" })}</Text>
                    </LinearGradient>
                  </Pressable>

                  {/* 2. Kamera Modalı */}
                  <Modal
                    visible={showCamera}
                    animationType="slide"
                    onRequestClose={() => setShowCamera(false)}
                  >
                    <View style={{ flex: 1, backgroundColor: "black" }}>
                      {/* 1. Kamera Katmanı */}
                      <CameraView
                        style={StyleSheet.absoluteFill}
                        facing="back"
                        ref={cameraRef}
                      />

                      {/* 2. Üst Bar: Kapatma Butonu  */}
                      <View style={styles.cameraHeader}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setShowCamera(false)}>
                          <Ionicons name="close" size={28} color={Colors.white} />
                        </TouchableOpacity>
                      </View>

                      {/* 3. Alt Bar: Çekim Butonu  */}
                      <View style={styles.cameraFooter}>
                        <Pressable
                          style={styles.captureButton}
                          onPress={async () => {
                            if (cameraRef.current) {
                              try {
                                console.log("📸 Çekim komutu gönderildi...");

                                const photo = await cameraRef.current.takePictureAsync({
                                  base64: true,
                                  quality: 0.3,
                                  skipProcessing: true,
                                  shutterSound: false
                                });

                                console.log("✅ Fotoğraf başarıyla hafızada.");

                                setIsScanning(true);
                                setShowCamera(false);

                                if (photo.base64) {
                                  const currentLang = i18n.language;
                                  const systemPrompt = generateAnalysisPrompt(currentLang, userProfile);

                                  const result = await callGemini("gemini-2.5-flash-preview-09-2025:generateContent", {
                                    contents: [{
                                      parts: [
                                        { text: systemPrompt },
                                        { inlineData: { mimeType: "image/jpeg", data: photo.base64 } }
                                      ]
                                    }]
                                  });

                                  try {
                                    const rawText = (result as any).candidates[0].content.parts[0].text;
                                    console.log("🔍 Ham Gemini Yanıtı:", rawText); // Log'a bakalım ne gelmiş

                                    // CIMBIZ YÖNTEMİ: İlk '{' ve son '}' arasını bul
                                    const startIndex = rawText.indexOf('{');
                                    const endIndex = rawText.lastIndexOf('}');

                                    if (startIndex === -1 || endIndex === -1) {
                                      throw new Error("Yanıtta JSON bulunamadı.");
                                    }

                                    // Sadece JSON kısmını kesip alıyoruz
                                    const cleanJson = rawText.substring(startIndex, endIndex + 1);

                                    const parsedData = JSON.parse(cleanJson);

                                    console.log("✅ Ayrıştırılmış Veri:", parsedData);

                                    TempStore.setResult(parsedData, photo.uri);
                                    router.push("/product-result");

                                    setTimeout(() => {
                                      setIsScanning(false);
                                    }, 500);

                                  } catch (parseError) {
                                    console.error("JSON Parse Hatası:", parseError);
                                    alert("Veri işlenemedi. Tekrar deneyin.");
                                    setIsScanning(false);
                                  }
                                }

                              } catch (e) {
                                console.error("❌ Hata:", e);
                                alert("Hata oluştu, tekrar deneyin.");
                                setIsScanning(false);
                              }
                            }
                          }}
                        >
                          {isScanning ? (
                            <ActivityIndicator size="large" color={Colors.primary} />
                          ) : (
                            <View style={styles.captureInner} />
                          )}
                        </Pressable>
                      </View>
                    </View>
                  </Modal>

                  {/* Galeri Seçeneği (Aynen Kalıyor) */}
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
    textAlign: "center",
    width: "100%",
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

  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  fullScreenCamera: {
    flex: 1,
    backgroundColor: "black",
  },
  cameraHeader: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraFooter: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
  },
});