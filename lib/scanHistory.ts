// Geçmişteki bir taramayı sonuç ekranının beklediği veriye çevirir. Geçmiş çekmecesi ve ana ekrandaki
// son tarama şeridi aynı dönüşümü kullanır (önceden HistoryDrawerBody.openDetail içindeydi, davranış aynı).
import type { ScanResult } from "./firestore";

export function scanToResultData(item: ScanResult) {
  const rawProduct = JSON.parse(item.miniData);
  const isNewFormat = rawProduct.product !== undefined;

  return isNewFormat
    ? {
        product: rawProduct.product,
        details: rawProduct.details,
        scores: rawProduct.scores,
        badges: item.badges,
        nutrition_facts: rawProduct.nutrition_facts,
        keto_analysis: rawProduct.keto_analysis,
        // "Gerçekte ne tüketiyorsun?" verisi: reopen'da modelin oranları + AI cache'i korunsun.
        composition: rawProduct.composition,
        sugar_per_100g: rawProduct.sugar_per_100g,
        generatedImageUrl: item.generatedImageUrl || null,
        scanId: item.id,
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
        generatedImageUrl: item.generatedImageUrl || null,
        scanId: item.id,
      };
}
