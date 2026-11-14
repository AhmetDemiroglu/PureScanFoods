// Gemini model adları ve istek ayarları TEK yerde durur. Model değişikliği bu dosyada tek satırdır.
// Seçim gerekçesi: /Volumes/KIOXIA/Dev/SaaS/PureScan/GEMINI-MODEL-SECIMI.md (bölüm 4, 2026-11-15).
// Eski sürümler (3.0.x / 1.0.x) "gemini-3.1-flash-lite" göndermeye devam eder; o model yayında, proxy eşlemesi gerekmez.
//
// Gemini 3.x kuralları: temperature/top_p/top_k/candidate_count gönderilmez (ileride 400),
// thinking_budget yerine thinkingConfig.thinkingLevel kullanılır, istek "model" turuyla bitmez.

export const AI_MODELS = {
    /** Barkod (OFF verisi) ve elle girilen metinden ürün analizi */
    analysis: "gemini-3.5-flash-lite",
    /** Fotoğraftan içerik okuma (OCR); analiz adımı `analysis` modeliyle yapılır */
    labelReader: "gemini-3.8-flash",
    /** Fotoğraf analizinde son yedek: okuma ve tek adım RECITATION ile kesilirse bugünkü (3.0.x) istek */
    legacyFallback: "gemini-3.1-flash-lite",
    /** Guru sohbeti */
    guru: "gemini-3.5-flash-lite",
    /** "Gerçekte ne tüketiyorsun?" görseli */
    consumptionImage: "gemini-3.1-flash-lite-image",
} as const;

export type AiModelKey = keyof typeof AI_MODELS;

export const endpointFor = (key: AiModelKey) => `${AI_MODELS[key]}:generateContent`;

type ThinkingLevel = "minimal" | "low" | "medium" | "high";

/** Analiz istekleri: JSON çıktısı zorunlu, düşünme minimal (çıkarma/sınıflandırma işi). */
export const jsonConfig = (thinkingLevel: ThinkingLevel = "minimal", responseJsonSchema?: object) => ({
    responseMimeType: "application/json",
    ...(responseJsonSchema ? { responseJsonSchema } : {}),
    thinkingConfig: { thinkingLevel },
});

/** Gemini cevabındaki düşünce olmayan tüm metin parçalarını birleştirir. */
export const extractText = (apiResult: any): string => {
    const parts = apiResult?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return "";
    return parts
        .filter((p: any) => !p?.thought && typeof p?.text === "string")
        .map((p: any) => p.text)
        .join("")
        .trim();
};
