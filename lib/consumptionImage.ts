// "Gerçekte ne tüketiyorsun?" AI fotogerçekçi kavanoz üretimi.
// Mevcut geminiProxy üzerinden gemini-2.5-flash-image çağrılır (yeni fonksiyon/deploy gerekmez).
// AI sadece KAVANOZU çizer (metinsiz); etiket/yüzde/kaşık native overlay'de (ConsumptionJar) kalır.

import { callGemini } from "./api";
import { CompositionLayer } from "./composition";

const TYPE_DESC: Record<string, string> = {
    base_grain: "grain / oat / cereal flakes",
    sugar: "white granulated sugar",
    syrup_honey: "glucose syrup or honey (glossy amber liquid)",
    fat_oil: "vegetable oil / fat (yellow oily layer)",
    flour: "fine flour powder",
    nuts_seeds: "mixed nuts and seeds",
    dried_fruit: "dried fruit pieces",
    fruit: "fresh fruit pulp",
    dairy: "milk / dairy",
    water: "water",
    cocoa: "cocoa / chocolate powder",
    protein: "protein powder",
    fiber: "fiber",
    salt: "salt crystals",
    additives: "a very thin layer of fine powdered additives",
    other: "mixed ingredients",
};

export const buildJarImagePrompt = (layers: CompositionLayer[]): string => {
    const ordered = [...layers]
        .map((l) => ({ ...l, mid: ((l.percent_min || 0) + (l.percent_max || 0)) / 2 }))
        .filter((l) => l.mid > 0)
        .sort((a, b) => b.mid - a.mid);

    const layerLines = ordered
        .map((l, i) => `${i + 1}. ${TYPE_DESC[l.type] || "ingredient"} — about ${Math.round(l.mid)}% of the height`)
        .join("\n");

    return [
        "Create a photorealistic studio product photograph of ONE tall clear glass jar, centered on a clean neutral beige background with soft natural lighting and a subtle shadow.",
        "The jar is filled from top to bottom with DISTINCT HORIZONTAL LAYERS of raw ingredients. Each layer's thickness must be proportional to the percentage below. From TOP (largest) to BOTTOM (smallest):",
        layerLines,
        "Each layer must look like the real, raw ingredient with realistic texture and color, clearly separated from the others.",
        "STRICT: Absolutely NO text, NO labels, NO numbers, NO letters, NO logos anywhere in the image. Do NOT draw any product packaging or pouch. Only the layered glass jar. Square 1:1 composition.",
    ].join("\n");
};

// Üretilen görselin base64 (PNG) verisini döner. Görsel parçası yoksa hata fırlatır.
export const requestJarImageBase64 = async (layers: CompositionLayer[]): Promise<string> => {
    const prompt = buildJarImagePrompt(layers);

    const result: any = await callGemini("gemini-2.5-flash-image:generateContent", {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
    });

    const cand = result?.candidates?.[0];
    const parts = cand?.content?.parts || [];
    const imgPart = parts.find((p: any) => p?.inlineData?.data);
    if (!imgPart) {
        // Görsel yoksa NEDENİNİ topla (safety / finishReason / blok / metin yanıtı) — ekranda göstereceğiz.
        const finish = cand?.finishReason;
        const block = result?.promptFeedback?.blockReason;
        const textPart = parts.find((p: any) => p?.text)?.text;
        const diag = [
            (result?.candidates?.length ?? 0) === 0 ? "no-candidates" : null,
            finish ? `finish=${finish}` : null,
            block ? `block=${block}` : null,
            textPart ? `text=${String(textPart).slice(0, 120)}` : null,
        ]
            .filter(Boolean)
            .join(" | ");
        throw new Error(`Model görsel döndürmedi${diag ? ` (${diag})` : ""}`);
    }
    return imgPart.inlineData.data as string;
};
