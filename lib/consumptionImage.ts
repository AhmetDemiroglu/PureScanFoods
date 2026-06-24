// "Gerçekte ne tüketiyorsun?" AI fotogerçekçi kavanoz üretimi.
// Mevcut geminiProxy üzerinden gemini-2.5-flash-image çağrılır (yeni fonksiyon/deploy gerekmez).
// AI sadece KAVANOZU çizer (metinsiz); etiket/yüzde/kaşık native overlay'de (ConsumptionJar) kalır.

import { callGemini } from "./api";
import { CompositionLayer } from "./composition";

// Katmanın FİZİKSEL formu (kimliği değil — kimlik display_name'den gelir).
// Böylece model "fındık"ı kajuya çevirmez; sadece nasıl göründüğüne dair ipucu alır.
const FORM_HINT: Record<string, string> = {
    base_grain: "dry grains or flakes",
    flour: "fine powder",
    sugar: "fine white crystals",
    syrup_honey: "thick glossy syrup",
    fat_oil: "a clear oily liquid",
    nuts_seeds: "whole or chopped pieces",
    dried_fruit: "small dried pieces",
    fruit: "fresh pulp",
    dairy: "creamy powder",
    water: "a clear liquid",
    cocoa: "fine brown powder",
    protein: "fine powder",
    fiber: "fine powder",
    salt: "coarse crystals",
    additives: "a very thin fine powder",
    other: "its natural form",
};

export const buildJarImagePrompt = (layers: CompositionLayer[], hasReference = false): string => {
    const ordered = [...layers]
        .map((l) => ({ ...l, mid: ((l.percent_min || 0) + (l.percent_max || 0)) / 2 }))
        .filter((l) => l.mid > 0)
        .sort((a, b) => b.mid - a.mid);

    const layerLines = ordered
        .map((l, i) => {
            const pct = Math.max(1, Math.round(l.mid));
            const form = FORM_HINT[l.type] || "its natural form";
            return `${i + 1}. ${l.display_name} — shown as ${form} — fills about ${pct}% of the jar height`;
        })
        .join("\n");

    const topName = ordered[0]?.display_name || "the main ingredient";

    // img2img: elimizdeki DOĞRU oranlı kavanoz diyagramı referans olarak verildiğinde,
    // model oranı/sırayı uydurmaz; sadece her bandı gerçek malzemeyle fotogerçekçi yapar.
    if (hasReference) {
        return [
            "The attached image is a DIAGRAM of a glass jar split into colored horizontal layers. These layers define the EXACT number of layers, their order, and their relative thickness. You MUST reproduce this structure precisely.",
            "Recreate it as a PHOTOREALISTIC studio product photo of ONE tall clear glass jar on a clean neutral beige background, soft natural light, subtle shadow, square 1:1.",
            "Replace each colored band, FROM TOP TO BOTTOM, with the real ingredient it represents (rendered with realistic texture):",
            layerLines,
            "Keep the SAME proportions and order as the diagram — do not merge, add, or drop layers. Ingredient names may be Turkish; show the EXACT ingredient, never a similar-looking substitute (e.g. hazelnut/fındık → hazelnuts, never cashews or almonds). Render liquids (water/oil/syrup) as translucent liquid.",
            "Ignore the diagram's flat colors and white background — output a realistic photo on a beige background.",
            "STRICT: NO text, NO numbers, NO labels, NO logos, NO packaging anywhere. Only the single photorealistic layered glass jar.",
        ].join("\n");
    }

    return [
        "Photorealistic studio product photo of ONE tall clear glass jar, centered on a clean neutral beige background, soft natural light, subtle shadow. Square 1:1.",
        "Inside the jar, the real raw ingredients are stacked as DISTINCT HORIZONTAL LAYERS. Each layer's thickness MUST be proportional to its percentage. From TOP (most) to BOTTOM (least):",
        layerLines,
        `The top layer (${topName}) must clearly dominate the jar when its percentage is large; a tiny percentage must be only a thin band.`,
        "Ingredient names may be written in Turkish — interpret each correctly and show that EXACT ingredient. Do NOT replace an ingredient with a different but similar-looking one (e.g. if it says hazelnut/fındık, show hazelnuts, never cashews or almonds; if it says water/su, show clear liquid, never powder).",
        "Render liquids (water, oil, syrup) as translucent liquid filling their portion; powders and solids settle as their own distinct bands.",
        "STRICT: NO text, NO labels, NO numbers, NO letters, NO logos, NO packaging anywhere. Only the single layered glass jar.",
    ].join("\n");
};

// Üretilen görselin base64 (PNG) verisini döner. Görsel parçası yoksa hata fırlatır.
export const requestJarImageBase64 = async (
    layers: CompositionLayer[],
    referenceBase64?: string | null,
): Promise<string> => {
    const prompt = buildJarImagePrompt(layers, !!referenceBase64);

    // Referans (etiketsiz oranlı kavanoz) varsa görsel + metin; yoksa sadece metin.
    const reqParts: any[] = [];
    if (referenceBase64) reqParts.push({ inlineData: { mimeType: "image/png", data: referenceBase64 } });
    reqParts.push({ text: prompt });

    const result: any = await callGemini("gemini-2.5-flash-image:generateContent", {
        contents: [{ parts: reqParts }],
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
