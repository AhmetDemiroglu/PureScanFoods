import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import * as StoreReview from "expo-store-review";

/**
 * Uygulama içi yorum/puan isteği yönetimi (soft-ask kalıbı).
 *
 * Native In-App Review API'leri (iOS SKStoreReviewController, Android In-App Review)
 * tamamen OS kontrolündedir: "daha sonra / sorma" butonu yoktur, kullanıcının gerçekten
 * puan verip vermediği öğrenilemez ve OS sessizce kısıtlar. Bu yüzden "değer anında"
 * önce bizim kontrol ettiğimiz bir soft-ask modal gösterilir; pozitif kullanıcı native
 * API'ye, negatif kullanıcı özel geri bildirime yönlendirilir.
 *
 * Sayaç tamamen lokaldir (AsyncStorage) — anonim/device kullanıcılarda da çalışır,
 * Firestore / auth bağımlılığı yoktur.
 */

// --- AsyncStorage anahtarları (proje @purescan_* kalıbı, versiyonlu) ---
const SCAN_COUNT_KEY = "@purescan_review_scan_count_v1";
const STATUS_KEY = "@purescan_review_status_v1";
const LAST_PROMPT_KEY = "@purescan_review_last_prompt_v1";
const PROMPT_COUNT_KEY = "@purescan_review_prompt_count_v1";

type ReviewStatus = "idle" | "rated" | "dismissed_forever";

// --- Eligibility ayarları ---
const MIN_SCANS = 2; // ilk gösterim: 2. başarılı tarama
const COOLDOWN_DAYS = 45; // snooze sonrası tekrar sormadan önceki bekleme
const MAX_PROMPTS = 3; // ömür boyu soft-prompt üst sınırı
const DAY_MS = 24 * 60 * 60 * 1000;

async function getNumber(key: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(key);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/** Başarılı bir tarama sonucu görüntülendiğinde çağrılır; sayacı artırır. */
export async function recordSuccessfulScan(): Promise<number> {
  const next = (await getNumber(SCAN_COUNT_KEY)) + 1;
  try {
    await AsyncStorage.setItem(SCAN_COUNT_KEY, String(next));
  } catch {}
  return next;
}

/** Soft-ask modal gösterilmeli mi? Tüm eligibility kurallarını uygular. */
export async function shouldShowSoftPrompt(): Promise<boolean> {
  try {
    const status = ((await AsyncStorage.getItem(STATUS_KEY)) as ReviewStatus) || "idle";
    if (status !== "idle") return false;

    const scanCount = await getNumber(SCAN_COUNT_KEY);
    if (scanCount < MIN_SCANS) return false;

    const promptCount = await getNumber(PROMPT_COUNT_KEY);
    if (promptCount >= MAX_PROMPTS) return false;

    const lastRaw = await AsyncStorage.getItem(LAST_PROMPT_KEY);
    if (lastRaw) {
      const last = Date.parse(lastRaw);
      if (Number.isFinite(last) && Date.now() - last < COOLDOWN_DAYS * DAY_MS) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/** Modal gösterildiği an çağrılır: gösterim sayacını artırır + cooldown'u başlatır. */
export async function markSoftPromptShown(): Promise<void> {
  try {
    const promptCount = (await getNumber(PROMPT_COUNT_KEY)) + 1;
    await AsyncStorage.multiSet([
      [PROMPT_COUNT_KEY, String(promptCount)],
      [LAST_PROMPT_KEY, new Date().toISOString()],
    ]);
  } catch {}
}

/** Kullanıcı pozitif akışı tamamladı → bir daha sorma. */
export async function markRated(): Promise<void> {
  try {
    await AsyncStorage.setItem(STATUS_KEY, "rated");
  } catch {}
}

/** Kullanıcı "bir daha sorma" dedi → kalıcı kapat. */
export async function markDismissedForever(): Promise<void> {
  try {
    await AsyncStorage.setItem(STATUS_KEY, "dismissed_forever");
  } catch {}
}

/** "Daha sonra" / kapat: status idle kalır, cooldown sonrası tekrar sorulabilir. */
export async function markSnoozed(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_PROMPT_KEY, new Date().toISOString());
  } catch {}
}

/** Native mağaza yorum diyaloğunu tetikler; mümkün değilse mağaza sayfasına düşer. */
export async function requestNativeReview(): Promise<void> {
  try {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
      return;
    }
  } catch {}
  // Fallback: native prompt yoksa mağaza URL'sini aç (app config'de tanımlıysa).
  try {
    const url = StoreReview.storeUrl();
    if (url) await Linking.openURL(url);
  } catch {}
}

/** QA / "verileri sıfırla" için: tüm review state'ini temizler. */
export async function resetReviewState(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([SCAN_COUNT_KEY, STATUS_KEY, LAST_PROMPT_KEY, PROMPT_COUNT_KEY]);
  } catch {}
}
