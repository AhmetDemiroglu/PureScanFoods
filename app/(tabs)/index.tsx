import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { CameraView, useCameraPermissions } from "expo-camera";
import { View, Pressable, StyleSheet, TextInput, ActivityIndicator, Modal, TouchableOpacity, Animated, ScrollView, Keyboard, useWindowDimensions } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Text } from "../../components/ui/AppText";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { AppColors } from "../../constants/colors";
import Header from "../../components/ui/Header";
import Hero from "../../components/ui/Hero";
import SegmentedControl from "../../components/ui/SegmentedControl";
import ScanSweep from "../../components/ui/ScanSweep";
import LastScanStrip, { LAST_SCAN_STRIP_HEIGHT } from "../../components/home/LastScanStrip";
import { getScanHistoryFromDB, type ScanResult } from "../../lib/firestore";
import { scanToResultData } from "../../lib/scanHistory";
import { computeHeroLayout, COMPACT_CARD_SAVING } from "../../lib/heroLayout";
import BrandLogo from "../../components/brand/BrandLogo";
import { callGemini } from "../../lib/api";
import { TempStore } from "../../lib/tempStore";
import { generateAnalysisPrompt, generateBarcodeDataPrompt } from "../../lib/prompt";
import { endpointFor, extractText, jsonConfig } from "../../lib/aiModels";
import { ANALYSIS_SCHEMA } from "../../lib/analysisSchema";
import { readIngredientLabel, labelToAnalysisInput } from "../../lib/labelReader";
import { auditAnalysis } from "../../lib/auditAnalysis";
import { getIngredientsByBarcode } from "../../lib/openFoodFacts";
import { useIsFocused } from "@react-navigation/native";
import { useTour, useTourTarget } from "../../components/tour/TourContext";
import { HOME_TOUR } from "../../components/tour/tours";
import * as ImagePicker from "expo-image-picker";
import * as ScreenOrientation from "expo-screen-orientation";
import * as ImageManipulator from "expo-image-manipulator";
import CaptureFrame, { TurnSpin } from "../../components/scan/CaptureFrame";
import { cropToPixels, frameToCrop, type Frame, type Turn } from "../../components/scan/captureGeometry";
import { useUser } from "../../context/UserContext";
import { useLocalSearchParams } from "expo-router";
import { useShell } from '../../context/ShellContext';
import * as haptics from '../../lib/haptics';
import LimitWarningModal from "../../components/ui/LimitWarningModal";
import { ScanFailGraphic } from "../../components/ui/ScanFailGraphic";
import PaywallModal from "../../components/ui/PaywallModal";
import ProcessingView, { ProcessingMode } from "../../components/ui/ProcessingView";
import { useTheme } from "../../context/ThemeContext";
import { DISPLAY_FONT_SCALE_CAP, FONT_SCALE_CAP, Radii, shadow } from "../../constants/design";

type ScanTab = "camera" | "barcode" | "text";

// Kırpılmış fotoğrafın en uzun kenarı. Çerçeveye kırpınca yazı zaten büyür; bu sınır isteği
// küçük tutar. Tam kareye göre daha az piksel, etiket başına daha çok piksel.
const SHOT_MAX_EDGE = 1600;
const SHOT_QUALITY = 0.7;

/** Analize giden kare: isteğe base64, sonuç ekranına dosya yolu. */
type Shot = { base64: string; uri: string };


// Barkod / metin / fotoğraf analizi: 3.5 Flash-Lite, düşünme "low", şemalı JSON.
// "minimal" uzun içerik listelerinde madde atlıyordu (2026-11-15, 12 ürün ölçümü).
const analysisRequest = (parts: any[]) => ({
  contents: [{ role: "user", parts }],
  generationConfig: jsonConfig("low", ANALYSIS_SCHEMA),
});

// Şemalı istekte cevap doğrudan JSON'dur; eski model (yedek yol) metne JSON gömebilir.
const parseAnalysisJson = (apiResult: any) => {
  const rawText = extractText(apiResult);
  try {
    return JSON.parse(rawText);
  } catch {
    const startIndex = rawText.indexOf("{");
    const endIndex = rawText.lastIndexOf("}");
    if (startIndex === -1 || endIndex === -1) throw new Error("JSON bulunamadı");
    return JSON.parse(rawText.substring(startIndex, endIndex + 1));
  }
};

export default function ScanScreen() {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [activeTab, setActiveTab] = useState<ScanTab>("camera");
  const { user, userProfile, usageStats, isPremium } = useAuth();
  const { familyMembers } = useUser();
  const [flashOn, setFlashOn] = useState(false);

  const { width, fontScale } = useWindowDimensions();

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isScanning, setIsScanning] = useState(false);
  // Barkod tarayıcı SENKRON kilidi: expo-camera onBarcodeScanned aynı barkodu
  // saniyede birçok kez (her kare) tetikler. `isScanning` state'i async güncellendiği
  // için arka arkaya gelen 2 kare guard'ı geçip AI'ya İKİ istek atabiliyordu
  // (aynı ürüne 2 farklı sonuç). Ref anında güncellenir → çift tetikleme imkânsız.
  const scanLockRef = useRef(false);
  const [processingMode, setProcessingMode] = useState<ProcessingMode>("camera");
  const router = useRouter();

  const [showCamera, setShowCamera] = useState(false);
  // Telefonun fiziksel tutuşu (CaptureFrame yerçekiminden okur). Arayüz dikey kilitli kalır,
  // çerçeve ve düğme simgeleri buna göre döner.
  const [camTurn, setCamTurn] = useState<Turn>(0);
  // Deklanşör anındaki çerçeve: fotoğraf buna göre kırpılır.
  const captureGeoRef = useRef<Frame | null>(null);
  // Deklanşöre iki kez basılmasını engelleyen senkron kilit (isScanning async güncellenir).
  const shootLockRef = useRef(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [barcodeInput, setBarcodeInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const { openSidebar } = useShell();
  const tabBarHeight = useBottomTabBarHeight();
  // insets'i ana ağaçta (provider altında) hesapla; kamera Modal'ı ayrı native
  // pencereye portal olduğu için içindeki SafeAreaView güvenilmez (aralıklı 0).
  // Bu değeri Modal'a dışarıdan geçiririz → kapatma butonu hep notch'un altında kalmaz.
  const insets = useSafeAreaInsets();
  // Klavye açılınca input görünür olsun: alt boşluk aç + focus'ta scrollToEnd.
  // Kapalıyken EKSTRA boşluk YOK → ana sayfa dengesi birebir korunur.
  // İçerik tab bar'da bittiği, keyboard yüksekliği ekran altından ölçüldüğü için
  // tabBarHeight çıkarılır (yoksa tab bar kadar fazla boşluk kalır).
  const scrollRef = useRef<ScrollView>(null);

  // Ana ekran kaymadan sığsın: logo, başlık ve kart kalan yüksekliğe göre ayarlanır (lib/heroLayout.ts).
  // Hesap klavye kapalıykenki yüksekliğe göre yapılır: klavye açılınca logo zıplamaz.
  // Kart yalnız TAM düzende ölçülür; kompakt düzenin kazancı sabit (COMPACT_CARD_SAVING), salınım olmaz.
  const [viewportH, setViewportH] = useState(0);
  const [cardH, setCardH] = useState(0);
  // Alt bar içeriğin üstünde yüzer: klavye kapalıyken içerik bar kadar (+ taşan tarama düğmesi payı) boşluk bırakır.
  const homeBottomPad = tabBarHeight + 16;
  // Klavye kapalıykenki kaydırma alanı yüksekliği (Android'de klavye pencereyi küçültebilir).
  const [baseViewportH, setBaseViewportH] = useState(0);
  const heroLayout = useMemo(
    () =>
      computeHeroLayout({
        width,
        available: (baseViewportH || viewportH) - homeBottomPad,
        cardH,
        fontScale,
        bodyCap: FONT_SCALE_CAP,
        displayCap: DISPLAY_FONT_SCALE_CAP,
      }),
    [width, baseViewportH, viewportH, homeBottomPad, cardH, fontScale],
  );
  const compact = heroLayout.compactCard;

  // Son tarama şeridi: ana ekran odaklandığında en fazla 30 sn'de bir tek kayıt okunur (tarama dönüşünde
  // de güncellenir). Hata olursa şerit görünmez. Yalnız kamera sekmesinde ve yer varsa çizilir.
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const lastScanLoadedAt = useRef(0);

  // Kullanım turu: ilk girişte tarama yolları, alt çubuk ve geçmiş vurgulanır.
  const isFocused = useIsFocused();
  const tabsTarget = useTourTarget("home.tabs");
  const scanTarget = useTourTarget("home.scan");
  useTour("home", HOME_TOUR, { ready: isFocused && !showCamera && !isScanning, delay: 500 });
  useEffect(() => {
    if (!isFocused || !user?.uid) return;
    if (Date.now() - lastScanLoadedAt.current < 30_000) return;
    lastScanLoadedAt.current = Date.now();
    let alive = true;
    getScanHistoryFromDB(user.uid, null, 1)
      .then(({ data }) => {
        if (alive) setLastScan(data[0] ?? null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [isFocused, user?.uid]);
  // Yeni tarama başladıysa dönüşte şerit beklemeden yenilensin.
  useEffect(() => {
    if (isScanning) lastScanLoadedAt.current = 0;
  }, [isScanning]);
  const openLastScan = useCallback(() => {
    if (!lastScan) return;
    try {
      TempStore.setResult(scanToResultData(lastScan), lastScan.imageUrl || "");
      haptics.impactLight();
      router.push({ pathname: "/product-result", params: { viewMode: "history" } });
    } catch {}
  }, [lastScan, router]);
  const [kbHeight, setKbHeight] = useState(0);
  useEffect(() => {
    const s = Keyboard.addListener("keyboardDidShow", (e) =>
      setKbHeight(e.endCoordinates?.height ?? 0)
    );
    const h = Keyboard.addListener("keyboardDidHide", () => setKbHeight(0));
    return () => {
      s.remove();
      h.remove();
    };
  }, []);
  // Kamera her (yeniden) açıldığında tarama kilidini sıfırla → önceki taramanın
  // kilidi yeni taramayı engellemesin. Tüm çıkış yollarını (bulunamadı/hata/geçersiz/
  // başarılı) tek noktadan garantiler.
  useEffect(() => {
    if (showCamera) scanLockRef.current = false;
  }, [showCamera]);
  // Klavye açıkken: iOS'ta klavye içeriğin üstüne biner (pencere küçülmez); Android'de pencere küçülebilir.
  // Pencere ne kadar küçüldüyse o kadar düşülür, yalnız klavyenin gerçekten örttüğü kısım kadar boşluk açılır.
  useEffect(() => {
    if (kbHeight === 0 && viewportH > 0) setBaseViewportH(viewportH);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kbHeight, viewportH]);
  const kbOverlap = kbHeight > 0 ? Math.max(0, kbHeight - Math.max(0, baseViewportH - viewportH)) : 0;
  const kbPad = kbHeight > 0 ? kbOverlap + 16 : homeBottomPad;
  const onInputFocus = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 220);
  }, []);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showInvalidScanModal, setShowInvalidScanModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDescription, setErrorDescription] = useState("");
  const params = useLocalSearchParams();

  const { getActiveData } = useUser();

  const checkLimit = () => {
    if (!isPremium && usageStats.scanCount >= usageStats.scanLimit) {
      setShowLimitModal(true);
      return false;
    }
    return true;
  };

  const openErrorModal = (title: string, description: string) => {
    setErrorTitle(title);
    setErrorDescription(description);
    setShowErrorModal(true);
  };

  const handleBarcodeSearch = async () => {
    if (!checkLimit()) return; // EKLENDİ

    if (!barcodeInput || barcodeInput.length < 3) {
      openErrorModal(
        t("common.tryAgain", { defaultValue: "Tekrar Deneyin" }),
        t("scan.enterValidBarcode")
      );
      return;
    }

    setProcessingMode("barcode");
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

      const apiResult = await callGemini(endpointFor("analysis"), analysisRequest([{ text: systemPrompt }]));

      processGeminiResult(apiResult, productData.image || null, productData);

    } catch (error) {
      console.error("Barcode Scan Error:", error);
      openErrorModal(
        t("errors.generic", { defaultValue: "Bir hata oluştu, lütfen tekrar deneyin." }),
        t("scan.invalidScanDesc", { defaultValue: "Görüntüde okunabilir bir gıda içeriği tespit edilemedi veya bu bir gıda ürünü değil." })
      );
      setIsScanning(false);
    }
  };

  const handleCameraBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
    // Senkron kilit ÖNCE kontrol edilir: aynı anda gelen 2. kare buradan döner.
    if (scanLockRef.current || activeTab !== "barcode" || !showCamera || isScanning) return;
    scanLockRef.current = true;

    setShowCamera(false);
    setBarcodeInput(data);
    setProcessingMode("barcode");
    setIsScanning(true);

    try {
      const productData = await getIngredientsByBarcode(data);

      if (!productData.found) {
        setShowNotFoundModal(true);
        setIsScanning(false);
        scanLockRef.current = false;
        return;
      }

      const currentLang = i18n.language;
      const profileData = getActiveData();

      const promptProfile = {
        allergens: profileData.allergens,
        dietaryPreferences: profileData.diet ? [profileData.diet] : []
      };

      const systemPrompt = generateBarcodeDataPrompt(currentLang, promptProfile, productData);

      const apiResult = await callGemini(endpointFor("analysis"), analysisRequest([{ text: systemPrompt }]));

      processGeminiResult(apiResult, productData.image || null, productData);

    } catch (error) {
      console.error("Camera Barcode Error:", error);
      openErrorModal(
        t("errors.barcodeProcessing"),
        t("scan.invalidScanDesc", { defaultValue: "Görüntüde okunabilir bir gıda içeriği tespit edilemedi veya bu bir gıda ürünü değil." })
      );
      setIsScanning(false);
      scanLockRef.current = false;
    }
  };

  const handleTextAnalyze = async () => {
    if (!checkLimit()) return;

    if (!textInput || textInput.length < 10) {
      openErrorModal(
        t("common.tryAgain", { defaultValue: "Tekrar Deneyin" }),
        t("scan.textTooShort", { defaultValue: "Lütfen analiz için yeterli içerik girin." })
      );
      return;
    }

    setProcessingMode("text");
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

      const apiResult = await callGemini(endpointFor("analysis"), analysisRequest([{ text: combinedPrompt }]));

      processGeminiResult(apiResult, null, undefined);

    } catch (error) {
      console.error("Text Analyze Error:", error);
      openErrorModal(
        t("errors.generic", { defaultValue: "Bir hata oluştu." }),
        t("scan.invalidScanDesc", { defaultValue: "Görüntüde okunabilir bir gıda içeriği tespit edilemedi veya bu bir gıda ürünü değil." })
      );
      setIsScanning(false);
    }
  };

  const processGeminiResult = (apiResult: any, imageUri?: string | null, offData?: any) => {
    try {
      const parsedData = parseAnalysisJson(apiResult);

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

      // Tam (verbatim) içindekiler metnini sakla: barkodda OFF metni öncelikli,
      // kamera/metinde AI'ın verbatim transkripsiyonu. ~4KB ile sınırla (miniData boyutu).
      if (parsedData.details) {
        const offText = offData?.ingredients ? String(offData.ingredients).trim() : "";
        const aiText = parsedData.details.ingredients_full_text
          ? String(parsedData.details.ingredients_full_text).trim() : "";
        parsedData.details.ingredients_full_text = (offText || aiText).slice(0, 4000);
        parsedData.details.ingredients_source = offText
          ? "openfoodfacts" : (activeTab === "text" ? "text" : "pack");
      }

      // Denetçi (son kontrol): AI çıktısını NOVA floor + güvenlik puanı bandı ile
      // tutarlılık açısından denetle. AI karar verir, kod yalnızca net hataları düzeltir.
      const auditLang = i18n.language?.startsWith("tr") ? "tr" : i18n.language?.startsWith("es") ? "es" : "en";
      // Barkodda OFF'un kesin besin değerleri, katkı kodları ve NOVA'sı puanın girdisi olur.
      const audited = auditAnalysis(parsedData, auditLang, offData ? {
        additiveTags: offData.additives_tags,
        nutriments: offData.nutriments,
        novaGroup: offData.nova_group,
      } : undefined);

      TempStore.setResult(audited, imageUri || "", {
        source: offData ? "barcode" : (activeTab === "text" ? "text" : "camera")
      });
      router.push("/product-result");

      setTimeout(() => setIsScanning(false), 500);

    } catch (e) {
      console.error("Parsing Error:", e);
      openErrorModal(
        t("errors.analysisFailed"),
        t("scan.invalidScanDesc", { defaultValue: "Görüntüde okunabilir bir gıda içeriği tespit edilemedi veya bu bir gıda ürünü değil." })
      );
      setIsScanning(false);
    }
  };

  // Fotoğraf: önce 3.8 Flash etiketi madde madde okur, sonra 3.5 Flash-Lite metin olarak analiz eder.
  // Okuma kesilirse (RECITATION/ağ) fotoğraf tek adımda analiz modeline, o da kesilirse eski 3.1 isteğine gider.
  // getWideImage: çerçeveye kırpılmış kare gönderildiyse, kırpılmamış tam kareyi üreten işlev.
  // Liste çerçeveden taşmışsa okuma kırpılmış karede başarısız olur; o zaman tam kare denenir.
  // Böylece kırpma hiçbir zaman tek başına sonucu belirlemez.
  const analyzeImageWithGemini = async (
    base64Image: string,
    imageUri?: string,
    getWideImage?: () => Promise<Shot | null>
  ) => {
    const currentLang = i18n.language;
    const profileData = getActiveData();

    const promptProfile = {
      allergens: profileData.allergens,
      dietaryPreferences: profileData.diet ? [profileData.diet] : []
    };

    const systemPrompt = generateAnalysisPrompt(currentLang, promptProfile);

    let label = await readIngredientLabel(base64Image);
    let wide: Shot | null = null;

    if (label.status !== "ok" && getWideImage) {
      try {
        wide = await getWideImage();
      } catch (err) {
        console.warn("Tam kare hazırlanamadı:", err);
      }
      if (wide) {
        const second = await readIngredientLabel(wide.base64);
        if (second.status === "ok" || label.status === "failed") label = second;
      }
    }

    // Sonuç ekranında ve geçmişte, analize GİDEN kare görünür: kırpmanın doğru yerden
    // kesip kesmediği cihazda tek bakışta anlaşılır.
    const shownUri = wide?.uri ?? imageUri;
    const imagePart = { inlineData: { mimeType: "image/jpeg", data: wide?.base64 ?? base64Image } };

    if (label.status === "notFood") {
      setIsScanning(false);
      setShowInvalidScanModal(true);
      return;
    }

    if (label.status === "ok") {
      const apiResult = await callGemini(
        endpointFor("analysis"),
        analysisRequest([{ text: `${systemPrompt}\n\n${labelToAnalysisInput(label)}` }])
      );
      processGeminiResult(apiResult, shownUri, undefined);
      return;
    }

    console.warn("Label read failed, single-step fallback:", label.reason);
    let apiResult: any = await callGemini(endpointFor("analysis"), analysisRequest([{ text: systemPrompt }, imagePart]));
    if (!extractText(apiResult)) {
      apiResult = await callGemini(endpointFor("legacyFallback"), {
        contents: [{ role: "user", parts: [{ text: systemPrompt }, imagePart] }]
      });
    }
    processGeminiResult(apiResult, shownUri, undefined);
  };

  // Çekilen fotoğrafı ekrandaki çerçeveye kırpar, küçültür ve base64 döndürür.
  // frame=null verilince yalnız küçültür: kırpmanın güvenlik ağı olan tam kare böyle üretilir.
  //
  // Kırpma iki gerçeğe dayanır: önizleme ekranı doldurur (kenarlar taşar) ve expo-camera çekimi
  // telefonun fiziksel yönüne göre düzeltir (iOS videoOrientation, Android targetRotation).
  // Dönüşüm captureGeometry içinde, sınaması components/scan/__tests__ altında.
  const cropShot = async (
    photo: { uri: string; width?: number; height?: number },
    frame: Frame | null,
    turn: Turn
  ): Promise<Shot | null> => {
    const W = photo.width ?? 0;
    const H = photo.height ?? 0;
    const actions: ImageManipulator.Action[] = [];
    let edgeW = W;
    let edgeH = H;

    if (frame && W > 0 && H > 0) {
      const box = cropToPixels(frameToCrop(frame, W, H, turn), W, H);
      actions.push({ crop: box });
      edgeW = box.width;
      edgeH = box.height;
    }
    if (Math.max(edgeW, edgeH) > SHOT_MAX_EDGE) {
      actions.push(edgeW >= edgeH ? { resize: { width: SHOT_MAX_EDGE } } : { resize: { height: SHOT_MAX_EDGE } });
    }

    const out = await ImageManipulator.manipulateAsync(photo.uri, actions, {
      compress: SHOT_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    return out.base64 ? { base64: out.base64, uri: out.uri } : null;
  };

  const captureAndAnalyze = async () => {
    const cam = cameraRef.current;
    if (!cam || shootLockRef.current || isScanning) return;
    shootLockRef.current = true;

    const frame = captureGeoRef.current;
    const turnNow = camTurn;

    try {
      haptics.impactMedium();
      // skipProcessing KULLANILMAZ: Android'de yön düzeltmesi piksellere işlenmeden gelir ve
      // bildirilen en/boy ham sensör ölçüsü olur; kırpma o zaman yanlış yerden keser.
      const photo = await cam.takePictureAsync({ quality: SHOT_QUALITY, shutterSound: false });

      setProcessingMode("camera");
      setIsScanning(true);
      setShowCamera(false);

      let framed: Shot | null = null;
      try {
        framed = await cropShot(photo, frame, turnNow);
      } catch (err) {
        console.warn("Çerçeveye kırpma başarısız, tam kare kullanılıyor:", err);
      }
      if (!framed) framed = await cropShot(photo, null, turnNow);
      if (!framed) throw new Error("Fotoğraf hazırlanamadı");

      await analyzeImageWithGemini(
        framed.base64,
        framed.uri,
        frame ? () => cropShot(photo, null, turnNow) : undefined
      );
    } catch (e) {
      console.error("Çekim hatası:", e);
      openErrorModal(
        t("errors.generic", { defaultValue: "Bir hata oluştu." }),
        t("scan.invalidScanDesc", { defaultValue: "Görüntüde okunabilir bir gıda içeriği tespit edilemedi veya bu bir gıda ürünü değil." })
      );
      setIsScanning(false);
    } finally {
      shootLockRef.current = false;
    }
  };

  const handleGalleryPick = async () => {
    if (!checkLimit()) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        base64: true,
        quality: 0.3,
      });

      if (!result.canceled && result.assets[0].base64) {
        setProcessingMode("camera");
        setIsScanning(true);
        setShowCamera(false); // Modal açıksa kapat

        await analyzeImageWithGemini(result.assets[0].base64, result.assets[0].uri);
      }
    } catch (err) {
      console.error("Galeri Hatası:", err);
      openErrorModal(
        t("errors.imageLoad"),
        t("scan.invalidScanDesc", { defaultValue: "Görüntüde okunabilir bir gıda içeriği tespit edilemedi veya bu bir gıda ürünü değil." })
      );
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
    let scanLoop: Animated.CompositeAnimation | null = null;
    let pulseLoop: Animated.CompositeAnimation | null = null;

    if (showCamera) {
      scanLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      );
      scanLoop.start();

      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();
    }

    return () => {
      scanLoop?.stop();
      pulseLoop?.stop();
      scanLineAnim.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, [showCamera]);

  // Arayüz HER ZAMAN dikey kilitli. Eskiden kamera açılınca kilit açılıyordu; telefonun kendi
  // ekran döndürme kilidi kapalıysa hiçbir şey dönmüyor, açıksa arayüz dönüp çerçeve bozuluyordu.
  // Artık dönen tek şey çekim çerçevesi ve yazılar: telefonun fiziksel tutuşu yerçekiminden okunur,
  // böylece kilit açık da olsa kapalı da olsa kamera aynı davranır.
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  // Kamera kapanınca tutuş sıfırlanır: bir sonraki açılışta eski yönden başlamaz.
  useEffect(() => {
    if (!showCamera) {
      setCamTurn(0);
      captureGeoRef.current = null;
      shootLockRef.current = false;
    }
  }, [showCamera]);

  if (isScanning) {
    return <ProcessingView mode={processingMode} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>

        {/* 1. Header: Sabit Üstte */}
        <Header onHistoryPress={() => { haptics.impactLight(); openSidebar(); }} />

        {/* 2. Orta Alan: Hero ve Kart'ı kapsar ve ortalar — klavye açılınca input'lar görünür kalsın diye ScrollView */}
        <ScrollView
          ref={scrollRef}
          // marginHorizontal:-20, content'in paddingHorizontal:20'sini iptal eder →
          // ScrollView tam ekran genişliği olur. Kart, contentContainer'ın
          // paddingHorizontal:20'siyle 20px içeride kalır; böylece kartın gölgesi
          // ScrollView'un İÇİNDE render olur ve yanlardan kırpılmaz (bıçak-gölge fix).
          style={{ flex: 1, marginHorizontal: -20 }}
          contentContainerStyle={[styles.centerContainer, { paddingBottom: kbPad, gap: heroLayout.gap }]}
          onLayout={(e) => setViewportH(e.nativeEvent.layout.height)}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Hero
            markSize={heroLayout.mark}
            wordmarkWidth={heroLayout.word}
            showSubheadline={heroLayout.showSub}
            showWordmark={heroLayout.showWord}
            showHeadline={heroLayout.showHeadline}
          />

          {/* Scan Card */}
          <View
            style={[styles.scanCard, compact && styles.scanCardCompact]}
            onLayout={(e) => {
              // Ölçü kamera sekmesinde ve TAM düzende alınır: sekme ya da düzen değişince logo zıplamasın.
              if (activeTab === "camera" && !compact) setCardH(e.nativeEvent.layout.height);
            }}
          >
            <View {...tabsTarget}>
              <SegmentedControl
                value={activeTab}
                onChange={(k) => setActiveTab(k)}
                items={[
                  { key: "camera", label: t("home.tabs.camera"), icon: "camera-outline", iconActive: "camera" },
                  { key: "barcode", label: t("home.tabs.barcode"), icon: "barcode-outline", iconActive: "barcode" },
                  { key: "text", label: t("home.tabs.text"), icon: "document-text-outline", iconActive: "document-text" },
                ]}
              />
            </View>

            {/* DİNAMİK İÇERİK ALANI */}
            <View style={[styles.dynamicContent, compact && styles.dynamicContentCompact]}>

              {/* DURUM 1: KAMERA MODU (Düzeltilmiş) */}
              {activeTab === "camera" && (
                <>
                  {/* 1. Ana Sayfa Büyük Tara Butonu */}
                  {/* Üst boşluk tur hedefinin DIŞINDA: vurgu düğmenin kendisine otursun. */}
                  <View {...scanTarget} style={compact ? styles.mainButtonWrapperCompact : styles.mainButtonSlot}>
                  <Pressable
                    style={({ pressed }) => [styles.mainButtonWrapper, styles.mainButtonNoMargin, pressed && styles.mainButtonPressed]}
                    onPress={() => {
                      if (!checkLimit()) return;

                      if (!permission?.granted) {
                        requestPermission();
                      } else {
                        setShowCamera(true);
                      }
                    }}
                    accessibilityRole="button"
                  >
                    <LinearGradient
                      colors={["#FF7A2B", colors.primary, colors.primaryDeep]}
                      locations={[0, 0.45, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.mainButton, compact && styles.mainButtonCompact]}
                    >
                      <ScanSweep active={isFocused && !showCamera} />
                      <Ionicons name="scan" size={compact ? 24 : 32} color={colors.white} />
                      {/* İzin yoksa düğme yine "Tara" der; izin basınca istenir (akış aynı). */}
                      <Text style={[styles.mainButtonText, compact && styles.mainButtonTextCompact]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                        {t("home.actions.scanIngredients")}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                  </View>

                  {/* 2. Galeri Seçeneği */}
                  <View style={[styles.divider, compact && styles.dividerCompact]}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>{t("home.actions.or")}</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]} onPress={handleGalleryPick}>
                    <Ionicons name="images-outline" size={20} color={colors.gray[500]} />
                    <Text style={styles.secondaryButtonText}>{t("home.actions.fromGallery")}</Text>
                  </Pressable>
                </>
              )}

              {/* DURUM 2: BARKOD MODU (Revize) */}
              {activeTab === "barcode" && (
                <>
                  {/* 1. Büyük Tarama Butonu (Kamera ile aynı stilde) */}
                  <Pressable
                    style={({ pressed }) => [styles.mainButtonWrapper, compact && styles.mainButtonWrapperCompact, pressed && styles.mainButtonPressed]}
                    onPress={() => {
                      if (!checkLimit()) return;

                      if (!permission?.granted) {
                        requestPermission();
                      } else {
                        setShowCamera(true);
                      }
                    }}
                    accessibilityRole="button"
                  >
                    <LinearGradient
                      colors={isDark ? [colors.gray[300], colors.gray[200]] : [colors.secondary, colors.gray[900]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.mainButton, compact && styles.mainButtonCompact]}
                    >
                      <Ionicons name="barcode-outline" size={compact ? 24 : 32} color={colors.white} />
                      <Text style={[styles.mainButtonText, compact && styles.mainButtonTextCompact]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                        {t("home.actions.scanBarcode")}
                      </Text>
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
                        maxFontSizeMultiplier={FONT_SCALE_CAP}
                        style={styles.inputWithIcon}
                        placeholder={t("home.placeholders.barcode")}
                        placeholderTextColor={colors.gray[400]}
                        keyboardType="numeric"
                        value={barcodeInput}
                        onChangeText={setBarcodeInput}
                        onFocus={onInputFocus}
                      />
                      {barcodeInput.length > 0 && (
                        <Pressable onPress={() => setBarcodeInput("")} style={styles.clearIcon}>
                          <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
                        </Pressable>
                      )}
                    </View>
                    <Pressable style={styles.smallSearchButton} onPress={handleBarcodeSearch}>
                      <Ionicons name="search" size={20} color={colors.white} />
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
                      maxFontSizeMultiplier={FONT_SCALE_CAP}
                      style={[styles.inputField, styles.textArea, { flex: 1, borderWidth: 0 }]}
                      placeholder={t("home.actions.enterText")}
                      placeholderTextColor={colors.gray[400]}
                      multiline
                      textAlignVertical="top"
                      value={textInput}
                      onChangeText={setTextInput}
                      onFocus={onInputFocus}
                    />
                    {textInput.length > 0 && (
                      <Pressable onPress={() => setTextInput("")} style={styles.clearIconTopRight}>
                        <Ionicons name="close-circle" size={22} color={colors.gray[400]} />
                      </Pressable>
                    )}
                  </View>
                  {/* Daha ince, tek satır buton */}
                  <Pressable style={styles.slimButton} onPress={handleTextAnalyze}>
                    <Text style={styles.slimButtonText}>{t("home.actions.analyzeText")}</Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.white} />
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {lastScan && activeTab === "camera" && heroLayout.spare >= heroLayout.gap + LAST_SCAN_STRIP_HEIGHT ? (
            <LastScanStrip item={lastScan} onPress={openLastScan} />
          ) : null}
        </ScrollView>
        {/* 2. Kamera Modalı */}
        <Modal
          visible={showCamera}
          animationType="slide"
          supportedOrientations={["portrait"]}
          onRequestClose={() => setShowCamera(false)}
        >
          <View style={styles.cameraContainer}>
            {/* Kamera */}
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              ref={cameraRef}
              enableTorch={flashOn}
              // iOS: arayüz dikey kilitli olsa da fotoğraf telefonun fiziksel yönüne göre çekilir.
              // Eşiği (0.75 g) captureGeometry'deki turnFromGravity ile aynı; çerçeve ile fotoğraf ayrışmaz.
              responsiveOrientationWhenOrientationLocked
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
              pointerEvents="none"
              colors={["rgba(0,0,0,0.7)", "transparent"]}
              style={styles.topOverlay}
            />

            {/* Alt Gradient Overlay */}
            <LinearGradient
              pointerEvents="none"
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.bottomOverlay}
            />

            {/* Header. Simgeler yan tutuşta kullanıcıya döner, logo düz kalır. */}
            <View style={[styles.cameraHeaderNew, { paddingTop: insets.top + 8 }]}>
              <TouchableOpacity
                style={styles.closeButtonNew}
                onPress={() => setShowCamera(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <TurnSpin turn={camTurn}>
                  <Ionicons name="close" size={24} color={colors.white} />
                </TurnSpin>
              </TouchableOpacity>
              <View style={styles.headerTitle}>
                <BrandLogo variant="compact" height={22} tone="dark" />
              </View>
              <View style={{ width: 40 }} />
            </View>

            {activeTab === "camera" ? (
              /* Fotoğraf: çerçeve telefonun fiziksel tutuşuna göre şekillenir, köşelerinden
                 boyutlandırılır ve fotoğraf tam o alandan kırpılır. */
              <CaptureFrame
                live={!isScanning}
                topOffset={insets.top + 52}
                bottomOffset={142}
                geoRef={captureGeoRef}
                onTurnChange={setCamTurn}
              />
            ) : (
              /* Barkod: barkod her yönde okunduğu için sabit çerçeve yeterli. */
              <>
                <View
                  pointerEvents="none"
                  style={[
                    styles.scanFrameContainer,
                    {
                      width: width * 0.85,
                      height: 180,
                      marginLeft: -(width * 0.85) / 2,
                      marginTop: -90,
                    },
                  ]}
                >
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />

                  <Animated.View
                    style={[
                      styles.scanLine,
                      {
                        transform: [
                          {
                            translateY: scanLineAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 160],
                            }),
                          },
                        ],
                      },
                    ]}
                  />

                  <View style={styles.centerIcon}>
                    <Ionicons name="barcode-outline" size={32} color="rgba(255,255,255,0.3)" />
                  </View>
                </View>

                <View pointerEvents="none" style={styles.guidanceContainer}>
                  <Text style={styles.guidanceTitle}>{t("scan.barcodeFrameTitle")}</Text>
                  <Text style={styles.guidanceSubtitle}>{t("scan.barcodeFrameHint")}</Text>
                </View>
              </>
            )}

            {/* Alt Kontroller (Modal İçi). Simgeler yan tutuşta kullanıcıya döner. */}
            <View style={styles.cameraControls}>
              {/* Flash Toggle */}
              <TouchableOpacity
                style={[styles.controlButton, flashOn && styles.controlButtonActive]}
                onPress={() => setFlashOn(!flashOn)}
              >
                <TurnSpin turn={camTurn}>
                  <Ionicons
                    name={flashOn ? "flash" : "flash-off-outline"}
                    size={24}
                    color={flashOn ? colors.primary : colors.white}
                  />
                </TurnSpin>
              </TouchableOpacity>

              {/* Ana Çekim Butonu */}
              {activeTab === "camera" && (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Pressable style={styles.captureButtonNew} onPress={captureAndAnalyze}>
                    {isScanning ? (
                      <ActivityIndicator size="large" color={colors.primary} />
                    ) : (
                      <View style={styles.captureButtonInner}>
                        <TurnSpin turn={camTurn}>
                          <Ionicons name="scan" size={28} color={colors.white} />
                        </TurnSpin>
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
                <TurnSpin turn={camTurn}>
                  <Ionicons name="images-outline" size={24} color={colors.white} />
                </TurnSpin>
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
                <Ionicons name="alert-circle" size={48} color={colors.warning} />
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
                  <Ionicons name="camera" size={18} color={colors.white} />
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View >
      <LimitWarningModal
        visible={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onGoPremium={() => {
          setShowLimitModal(false);
          setShowPaywall(true);
        }}
        stats={usageStats}
        user={{
          ...userProfile,
          familyMembers: familyMembers
        }}
      />
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
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
            <Text style={[styles.modalTitle, { marginTop: 16, color: colors.secondary }]}>
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
                <Ionicons name="refresh" size={18} color={colors.white} style={{ marginLeft: 4 }} />
                <Text style={styles.modalButtonTextPrimary}>
                  {t("common.tryAgain", { defaultValue: "Tekrar Dene" })}
                </Text>
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="alert-circle" size={48} color={colors.warning} />
            </View>
            <Text style={styles.modalTitle}>{errorTitle}</Text>
            <Text style={styles.modalText}>{errorDescription}</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => setShowErrorModal(false)}
              >
                <Text style={styles.modalButtonTextPrimary}>{t("common.ok", { defaultValue: "Tamam" })}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView >
  );
}

const createStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: "center",
    gap: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  scanCard: {
    backgroundColor: colors.card,
    borderRadius: Radii.sheet - 2,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: isDark ? colors.border : "rgba(42,31,24,0.06)",
    ...shadow("md", isDark),
    width: "100%",
  },
  // Kompakt düzen (küçük ekran). Kazanç lib/heroLayout.ts COMPACT_CARD_SAVING ile uyumlu:
  // kart dolgusu 4 + içerik üstü 6 + düğme üstü 8 + düğme (yan yana simge) ~50 + ayraç 8 = ~76.
  scanCardCompact: {
    padding: 14,
  },
  dynamicContentCompact: {
    marginTop: 10,
  },
  // Gölge dış katmanda, kırpma içteki geçişte (iOS'ta overflow:hidden gölgeyi de keser).
  mainButtonWrapper: {
    marginTop: 16,
    borderRadius: Radii.card - 2,
    ...(isDark ? null : { shadowColor: colors.primaryDeep, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 14 }),
  },
  mainButtonWrapperCompact: {
    marginTop: 8,
  },
  mainButtonSlot: {
    marginTop: 16,
  },
  mainButtonNoMargin: {
    marginTop: 0,
  },
  mainButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  mainButton: {
    borderRadius: Radii.card - 2,
    overflow: "hidden",
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mainButtonCompact: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  mainButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
    width: "100%",
  },
  mainButtonTextCompact: {
    width: "auto",
    flexShrink: 1,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },
  dividerCompact: {
    marginVertical: 10,
  },
  secondaryPressed: {
    opacity: 0.85,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  dividerText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.gray[400],
    marginHorizontal: 12,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[600],
  },
  dynamicContent: {
    marginTop: 16,
  },
  inputField: {
    backgroundColor: colors.gray[100],
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.secondary,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  textArea: {
    height: 120,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.gray[400],
    textAlign: "center",
    marginTop: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  smallInput: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.gray[200],
    color: colors.secondary,
  },
  smallSearchButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  slimButton: {
    backgroundColor: isDark ? colors.primary : colors.secondary,
    borderRadius: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  slimButtonText: {
    color: colors.white,
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
    zIndex: 1,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 1,
  },
  cameraHeaderNew: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 20,
    elevation: 6,
  },
  closeButtonNew: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 21,
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
    color: colors.white,
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
    borderColor: colors.primary,
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
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
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
    color: colors.white,
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
    zIndex: 20,
    elevation: 6,
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
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  // Input UX Stilleri
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingRight: 10,
  },
  inputWithIcon: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.secondary,
  },
  clearIcon: {
    padding: 4,
  },
  textAreaWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 4,
  },
  clearIconTopRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: colors.gray[100],
    borderRadius: 10,
  },

  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.card,
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
    color: colors.secondary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalText: {
    fontSize: 15,
    color: colors.gray[500],
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
    backgroundColor: colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: colors.gray[100],
  },
  modalButtonTextPrimary: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  modalButtonTextSecondary: {
    color: colors.gray[600],
    fontWeight: '600',
    fontSize: 15,
  },
});



