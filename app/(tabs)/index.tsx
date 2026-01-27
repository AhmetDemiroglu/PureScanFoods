import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { CameraView, useCameraPermissions } from "expo-camera";
import { View, Text, Pressable, StyleSheet, Dimensions, TextInput, ActivityIndicator, Modal, TouchableOpacity, Animated, useWindowDimensions } from "react-native";
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
import { generateAnalysisPrompt, generateBarcodeDataPrompt } from "../../lib/prompt";
import { getIngredientsByBarcode } from "../../lib/openFoodFacts";
import * as ImagePicker from "expo-image-picker";
import * as ScreenOrientation from "expo-screen-orientation";
import { useUser } from "../../context/UserContext";
import { useLocalSearchParams } from "expo-router";
import HistorySidebar from '../history';
import LimitWarningModal from "../../components/ui/LimitWarningModal";
import { ScanFailGraphic } from "../../components/ui/ScanFailGraphic";

type ScanTab = "camera" | "barcode" | "text";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ScanScreen() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<ScanTab>("barcode");
  const { userProfile, usageStats, isPremium } = useAuth();
  const { familyMembers } = useUser();
  const [flashOn, setFlashOn] = useState(false);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();

  const [showCamera, setShowCamera] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [barcodeInput, setBarcodeInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showInvalidScanModal, setShowInvalidScanModal] = useState(false);
  const params = useLocalSearchParams();

  const { getActiveData } = useUser();

  const checkLimit = () => {
    if (!isPremium && usageStats.scanCount >= usageStats.scanLimit) {
      setShowLimitModal(true);
      return false;
    }
    return true;
  };

  const handleBarcodeSearch = async () => {
    if (!checkLimit()) return; // EKLENDİ

    if (!barcodeInput || barcodeInput.length < 3) {
      alert(t("scan.enterValidBarcode"));
      return;
    }

    setIsScanning(true);
    try {
      const productData = await getIngredientsByBarcode(barcodeInput);

      if (!productData.found) {
        setShowNotFoundModal(true);
        setIsScanning(false);
        return;
      }

      const currentLang = i18n.language;
      const profileData = getActiveData();

      const promptProfile = {
        allergens: profileData.allergens,
        dietaryPreferences: profileData.diet ? [profileData.diet] : []
      };

      const systemPrompt = generateBarcodeDataPrompt(currentLang, promptProfile, productData);

      const apiResult = await callGemini("gemini-2.5-flash-preview-09-2025:generateContent", {
        contents: [{
          parts: [{ text: systemPrompt }]
        }]
      });

      processGeminiResult(apiResult, productData.image || null, productData);

    } catch (error) {
      console.error("Barcode Scan Error:", error);
      alert(t("errors.generic", { defaultValue: "Bir hata oluştu, lütfen tekrar deneyin." }));
      setIsScanning(false);
    }
  };

  const handleCameraBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (activeTab !== "barcode" || !showCamera || isScanning) return;

    setShowCamera(false);
    setBarcodeInput(data);
    setIsScanning(true);

    try {
      const productData = await getIngredientsByBarcode(data);

      if (!productData.found) {
        setShowNotFoundModal(true);
        setIsScanning(false);
        return;
      }

      const currentLang = i18n.language;
      const profileData = getActiveData();

      const promptProfile = {
        allergens: profileData.allergens,
        dietaryPreferences: profileData.diet ? [profileData.diet] : []
      };

      const systemPrompt = generateBarcodeDataPrompt(currentLang, promptProfile, productData);

      const apiResult = await callGemini("gemini-2.5-flash-preview-09-2025:generateContent", {
        contents: [{ parts: [{ text: systemPrompt }] }]
      });

      processGeminiResult(apiResult, productData.image || null, productData);

    } catch (error) {
      console.error("Camera Barcode Error:", error);
      alert(t("errors.barcodeProcessing"));
      setIsScanning(false);
    }
  };

  const handleTextAnalyze = async () => {
    if (!checkLimit()) return;

    if (!textInput || textInput.length < 10) {
      alert(t("scan.textTooShort", { defaultValue: "Lütfen analiz için yeterli içerik girin." }));
      return;
    }

    setIsScanning(true);
    try {
      const currentLang = i18n.language;
      const profileData = getActiveData();

      const promptProfile = {
        allergens: profileData.allergens,
        dietaryPreferences: profileData.diet ? [profileData.diet] : []
      };

      const basePrompt = generateAnalysisPrompt(currentLang, promptProfile);
      const combinedPrompt = `${basePrompt}\n\nAnalyze this ingredient list text:\n"${textInput}"`;

      const apiResult = await callGemini("gemini-2.5-flash-preview-09-2025:generateContent", {
        contents: [{
          parts: [{ text: combinedPrompt }]
        }]
      });

      processGeminiResult(apiResult, null, undefined);

    } catch (error) {
      console.error("Text Analyze Error:", error);
      alert(t("errors.generic", { defaultValue: "Bir hata oluştu." }));
      setIsScanning(false);
    }
  };

  const processGeminiResult = (apiResult: any, imageUri?: string | null, offData?: any) => {
    try {
      const rawText = (apiResult as any).candidates[0].content.parts[0].text;
      const startIndex = rawText.indexOf('{');
      const endIndex = rawText.lastIndexOf('}');

      if (startIndex === -1 || endIndex === -1) throw new Error("JSON bulunamadı");

      const cleanJson = rawText.substring(startIndex, endIndex + 1);
      const parsedData = JSON.parse(cleanJson);

      if (parsedData.product?.isFood === false || !parsedData.details?.ingredients || parsedData.details.ingredients.length === 0) {
        setIsScanning(false);
        setShowInvalidScanModal(true);
        return;
      }

      if (offData) {
        if (parsedData.product) {
          parsedData.product.nutriscore_grade = offData.nutriscore_grade;
          parsedData.product.nutriscore_score = offData.nutriscore_score;
          parsedData.product.nutrient_levels = offData.nutrient_levels;

          if (!parsedData.product.name || parsedData.product.name === "Bilinmeyen Ürün") {
            parsedData.product.name = offData.productName;
          }
          if (!parsedData.product.brand || parsedData.product.brand === "Belirsiz Marka") {
            parsedData.product.brand = offData.brand;
          }
        }
      }

      TempStore.setResult(parsedData, imageUri || "");
      router.push("/product-result");

      setTimeout(() => setIsScanning(false), 500);

    } catch (e) {
      console.error("Parsing Error:", e);
      alert(t("errors.analysisFailed"));
      setIsScanning(false);
    }
  };

  const handleGalleryPick = async () => {
    if (!checkLimit()) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.3,
      });

      if (!result.canceled && result.assets[0].base64) {
        setIsScanning(true);
        setShowCamera(false); // Modal açıksa kapat

        const currentLang = i18n.language;
        const profileData = getActiveData();

        const promptProfile = {
          allergens: profileData.allergens,
          dietaryPreferences: profileData.diet ? [profileData.diet] : []
        };

        const systemPrompt = generateAnalysisPrompt(currentLang, promptProfile);

        const apiResult = await callGemini("gemini-2.5-flash-preview-09-2025:generateContent", {
          contents: [{
            parts: [
              { text: systemPrompt },
              { inlineData: { mimeType: "image/jpeg", data: result.assets[0].base64 } }
            ]
          }]
        });

        processGeminiResult(apiResult, result.assets[0].uri);
      }
    } catch (err) {
      console.error("Galeri Hatası:", err);
      alert(t("errors.imageLoad"));
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (params.autoStart === "true") {
      if (checkLimit()) {
        setShowCamera(true);
        setActiveTab("camera");
      }
    }
  }, [params.autoStart]);

  useEffect(() => {
    if (showCamera) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [showCamera]);

  useEffect(() => {
    if (showCamera) {
      ScreenOrientation.unlockAsync();
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  }, [showCamera]);

  if (isScanning) {
    return <ProcessingView />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>

        {/* 1. Header: Sabit Üstte */}
        <Header onHistoryPress={() => setHistoryOpen(true)} />

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

              {/* DURUM 1: KAMERA MODU (Düzeltilmiş) */}
              {activeTab === "camera" && (
                <>
                  {/* 1. Ana Sayfa Büyük Tara Butonu */}
                  <Pressable
                    style={styles.mainButtonWrapper}
                    onPress={() => {
                      if (!checkLimit()) return;

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
                        {permission?.granted ? t("home.actions.scanIngredients") : t("permissions.request", { defaultValue: "Kamera İzni Ver" })}
                      </Text>
                    </LinearGradient>
                  </Pressable>

                  {/* 2. Galeri Seçeneği */}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>{t("home.actions.or")}</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <Pressable style={styles.secondaryButton} onPress={handleGalleryPick}>
                    <Ionicons name="images-outline" size={20} color={Colors.gray[500]} />
                    <Text style={styles.secondaryButtonText}>{t("home.actions.fromGallery")}</Text>
                  </Pressable>
                </>
              )}

              {/* DURUM 2: BARKOD MODU (Revize) */}
              {activeTab === "barcode" && (
                <>
                  {/* 1. Büyük Tarama Butonu (Kamera ile aynı stilde) */}
                  <Pressable
                    style={styles.mainButtonWrapper}
                    onPress={() => {
                      if (!checkLimit()) return;

                      if (!permission?.granted) {
                        requestPermission();
                      } else {
                        setShowCamera(true);
                      }
                    }}
                  >
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
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.inputWithIcon}
                        placeholder={t("home.placeholders.barcode")}
                        placeholderTextColor={Colors.gray[400]}
                        keyboardType="numeric"
                        value={barcodeInput}
                        onChangeText={setBarcodeInput}
                      />
                      {barcodeInput.length > 0 && (
                        <Pressable onPress={() => setBarcodeInput("")} style={styles.clearIcon}>
                          <Ionicons name="close-circle" size={20} color={Colors.gray[400]} />
                        </Pressable>
                      )}
                    </View>
                    <Pressable style={styles.smallSearchButton} onPress={handleBarcodeSearch}>
                      <Ionicons name="search" size={20} color={Colors.white} />
                    </Pressable>
                  </View>

                  <Text style={styles.disclaimerText}>{t("home.disclaimer.off")}</Text>
                </>
              )}

              {/* DURUM 3: METİN MODU (Revize - Kompakt) */}
              {activeTab === "text" && (
                <View style={{ gap: 12 }}>
                  <View style={styles.textAreaWrapper}>
                    <TextInput
                      style={[styles.inputField, styles.textArea, { flex: 1, borderWidth: 0 }]}
                      placeholder={t("home.actions.enterText")}
                      placeholderTextColor={Colors.gray[400]}
                      multiline
                      textAlignVertical="top"
                      value={textInput}
                      onChangeText={setTextInput}
                    />
                    {textInput.length > 0 && (
                      <Pressable onPress={() => setTextInput("")} style={styles.clearIconTopRight}>
                        <Ionicons name="close-circle" size={22} color={Colors.gray[400]} />
                      </Pressable>
                    )}
                  </View>
                  {/* Daha ince, tek satır buton */}
                  <Pressable style={styles.slimButton} onPress={handleTextAnalyze}>
                    <Text style={styles.slimButtonText}>{t("home.actions.analyzeText")}</Text>
                    <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>
        {/* 2. Kamera Modalı */}
        <Modal
          visible={showCamera}
          animationType="slide"
          supportedOrientations={["portrait", "landscape"]}
          onRequestClose={() => setShowCamera(false)}
        >
          <View style={styles.cameraContainer}>
            {/* Kamera */}
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              ref={cameraRef}
              enableTorch={flashOn}
              onBarcodeScanned={handleCameraBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: [
                  "qr",
                  "ean13", "ean8",
                  "upc_e", "upc_a",
                  "code39", "code128",
                  "pdf417", "aztec", "datamatrix"
                ],
              }}
            />
            {/* Üst Gradient Overlay */}
            <LinearGradient
              colors={["rgba(0,0,0,0.7)", "transparent"]}
              style={styles.topOverlay}
            />

            {/* Alt Gradient Overlay */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.bottomOverlay}
            />

            {/* Header */}
            <SafeAreaView style={styles.cameraHeaderNew}>
              <TouchableOpacity style={styles.closeButtonNew} onPress={() => setShowCamera(false)}>
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
              <View style={styles.headerTitle}>
                <Ionicons name="scan" size={20} color={Colors.primary} />
                <Text style={styles.headerTitleText}>PureScan Foods</Text>
              </View>
              <View style={{ width: 40 }} />
            </SafeAreaView>

            {/* Tarama Çerçevesi */}
            <View style={[
              styles.scanFrameContainer,
              {
                width: isLandscape ? width * 0.75 : width * 0.85,
                height: isLandscape ? 220 : 180,
                marginLeft: isLandscape ? -(width * 0.75) / 2 : -(width * 0.85) / 2,
                marginTop: isLandscape ? -110 : -90,
              }
            ]}>

              {/* Köşe İşaretleri */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

              {/* Animasyonlu Scan Line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{
                      translateY: scanLineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, isLandscape ? 200 : 160],
                      }),
                    }],
                  },
                ]}
              />

              {/* Merkez İkonu */}
              <View style={styles.centerIcon}>
                <Ionicons name="leaf-outline" size={32} color="rgba(255,255,255,0.3)" />
              </View>
            </View>

            {/* Yönlendirme Metni */}
            <View style={styles.guidanceContainer}>
              {!isLandscape && (
                <View style={styles.rotateWarning}>
                  <Ionicons name="phone-landscape-outline" size={20} color={Colors.primary} />
                  <Text style={styles.rotateWarningText}>
                    {t("scan.rotateHint")} {"\n"}
                    <Text style={styles.rotateWarningSubtext}>
                      {t("scan.rotationLockHint")}
                    </Text>
                  </Text>
                </View>
              )}
              <Text style={styles.guidanceTitle}>
                {t("scan.frameTitle")}
              </Text>
              <Text style={styles.guidanceSubtitle}>
                {isLandscape ? t("scan.frameSubtitleLandscape") : t("scan.frameSubtitlePortrait")}
              </Text>
            </View>

            {/* Alt Kontroller (Modal İçi) */}
            <View style={styles.cameraControls}>
              {/* Flash Toggle */}
              <TouchableOpacity
                style={[styles.controlButton, flashOn && styles.controlButtonActive]}
                onPress={() => setFlashOn(!flashOn)}
              >
                <Ionicons
                  name={flashOn ? "flash" : "flash-off-outline"}
                  size={24}
                  color={flashOn ? Colors.primary : Colors.white}
                />
              </TouchableOpacity>

              {/* Ana Çekim Butonu */}
              {activeTab === "camera" && (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Pressable
                    style={styles.captureButtonNew}
                    onPress={async () => {
                      if (cameraRef.current) {
                        try {
                          const photo = await cameraRef.current.takePictureAsync({
                            base64: true,
                            quality: 0.3,
                            skipProcessing: true,
                            shutterSound: false
                          });

                          setIsScanning(true);
                          setShowCamera(false);

                          if (photo.base64) {
                            const currentLang = i18n.language;
                            const profileData = getActiveData();
                            const promptProfile = {
                              allergens: profileData.allergens,
                              dietaryPreferences: profileData.diet ? [profileData.diet] : []
                            };
                            const systemPrompt = generateAnalysisPrompt(currentLang, promptProfile);

                            const apiResult = await callGemini("gemini-2.5-flash-preview-09-2025:generateContent", {
                              contents: [{
                                parts: [
                                  { text: systemPrompt },
                                  { inlineData: { mimeType: "image/jpeg", data: photo.base64 } }
                                ]
                              }]
                            });
                            processGeminiResult(apiResult, photo.uri, undefined);
                          }
                        } catch (e) {
                          console.error("❌ Hata:", e);
                          alert("Hata oluştu.");
                          setIsScanning(false);
                        }
                      }
                    }}
                  >
                    {isScanning ? (
                      <ActivityIndicator size="large" color={Colors.primary} />
                    ) : (
                      <View style={styles.captureButtonInner}>
                        <Ionicons name="scan" size={28} color={Colors.white} />
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              )}

              {/* Barkod Modunda Bilgilendirme Metni */}
              {activeTab === "barcode" && (
                <View style={{ alignItems: 'center', justifyContent: 'center', width: 80, height: 80 }}>
                  <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
                    {t("scan.alignBarcode")}
                  </Text>
                </View>
              )}

              {/* Galeri */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleGalleryPick}
              >
                <Ionicons name="images-outline" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*3. Ürün Bulunamadı Modalı */}
        <Modal
          visible={showNotFoundModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowNotFoundModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="alert-circle" size={48} color={Colors.warning} />
              </View>
              <Text style={styles.modalTitle}>
                {t("scan.notFoundTitle")}
              </Text>
              <Text style={styles.modalText}>
                {t("scan.notFoundDesc")}
              </Text>

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowNotFoundModal(false)}
                >
                  <Text style={styles.modalButtonTextSecondary}>{t("common.cancel")}</Text>
                </Pressable>

                <Pressable
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={() => {
                    setShowNotFoundModal(false);
                    setActiveTab("camera"); // Tab değiştir
                    setTimeout(() => setShowCamera(true), 300); // Kamerayı aç (hafif gecikme ile)
                  }}
                >
                  <Text style={styles.modalButtonTextPrimary}>{t("home.actions.scanIngredients")}</Text>
                  <Ionicons name="camera" size={18} color={Colors.white} />
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View >
      <HistorySidebar
        visible={isHistoryOpen}
        onClose={() => setHistoryOpen(false)}
      />
      <LimitWarningModal
        visible={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onGoPremium={() => {
          setShowLimitModal(false);
          router.push("/paywall");
        }}
        stats={usageStats}
        user={{
          ...userProfile,
          familyMembers: familyMembers
        }}
      />
      <Modal
        visible={showInvalidScanModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInvalidScanModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingTop: 32 }]}>

            {/* 1. Yeni Animasyonlu Grafik */}
            <ScanFailGraphic />

            {/* 2. Başlık ve Açıklama */}
            <Text style={[styles.modalTitle, { marginTop: 16, color: Colors.secondary }]}>
              {t("scan.invalidScanTitle", { defaultValue: "Hmm, Gıda Bulunamadı" })}
            </Text>

            <Text style={[styles.modalText, { marginBottom: 32, maxWidth: '85%' }]}>
              {t("scan.invalidScanDesc", { defaultValue: "Görüntüde okunabilir bir gıda içeriği tespit edilemedi. Işık açısını değiştirip tekrar deneyebilirsin." })}
            </Text>

            {/* 3. Butonlar */}
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowInvalidScanModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>
                  {t("common.cancel", { defaultValue: "Vazgeç" })}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => {
                  setShowInvalidScanModal(false);
                  if (activeTab === "camera") {
                    setTimeout(() => setShowCamera(true), 300);
                  }
                }}
              >
                <Ionicons name="refresh" size={18} color={Colors.white} style={{ marginLeft: 4 }} />
                <Text style={styles.modalButtonTextPrimary}>
                  {t("common.tryAgain", { defaultValue: "Tekrar Dene" })}
                </Text>
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>
    </SafeAreaView >
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
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  cameraHeaderNew: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeButtonNew: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerTitleText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  scanFrameContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: Colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  centerIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -16,
    marginTop: -16,
  },
  guidanceContainer: {
    position: "absolute",
    bottom: 180,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  guidanceTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  guidanceSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  cameraControls: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonNew: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  scanFramePortrait: {
    width: "85%",
    height: 180,
    marginLeft: "-42.5%",
    marginTop: -90,
  },
  scanFrameLandscape: {
    width: "75%",
    height: 220,
    marginLeft: "-37.5%",
    marginTop: -110,
  },
  rotateWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 152, 0, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 152, 0, 0.3)",
  },
  rotateWarningText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  rotateWarningSubtext: {
    fontSize: 11,
    fontWeight: "400",
    color: "rgba(255, 152, 0, 0.8)",
  },
  // Input UX Stilleri
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    paddingRight: 10,
  },
  inputWithIcon: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Colors.secondary,
  },
  clearIcon: {
    padding: 4,
  },
  textAreaWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    padding: 4,
  },
  clearIconTopRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
  },

  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 18,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalText: {
    fontSize: 15,
    color: Colors.gray[500],
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: Colors.gray[100],
  },
  modalButtonTextPrimary: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  modalButtonTextSecondary: {
    color: Colors.gray[600],
    fontWeight: '600',
    fontSize: 15,
  },
});