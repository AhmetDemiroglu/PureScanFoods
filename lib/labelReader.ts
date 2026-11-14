// Fotoğraftan analiz iki adımdır (GEMINI-MODEL-SECIMI.md, Foods seçenek b; 2026-11-15 ölçümü):
//   1. AI_MODELS.labelReader (3.8 Flash) etiketteki içerik listesini madde madde okur.
//   2. Okunan liste AI_MODELS.analysis (3.5 Flash-Lite) ile metin olarak analiz edilir.
// Liste paragraf olarak birebir istenmez: popüler ürünlerde Google RECITATION filtresi cevabı kesiyor.
// Okuma yine kesilirse (RECITATION, ağ, bozuk JSON) çağıran taraf fotoğrafı tek adımda analiz modeline gönderir.

import { callGemini } from "./api";
import { endpointFor, extractText, jsonConfig } from "./aiModels";

const LABEL_PROMPT = `You read food package labels for an allergy and additive checker.
Read the product name and brand exactly as printed on the package into "product_name" and "brand" ("" if not visible).
Find the INGREDIENT LIST on the image. Return each ingredient as a separate item in "ingredients", in printed order, in the package language.
Keep sub-ingredients inside the item with parentheses, and keep percentages and E-numbers. Do not translate, summarize or skip any ingredient, including minor ones and additives.
List allergen warnings ("may contain", "içerebilir") as items in "allergen_notes".
If the image is not a food package or the ingredient list is not legible, set "legible" to false and return empty arrays.
If a nutrition table is visible, return its per-100 g values as short "name: value" items in "nutrition"; otherwise an empty array.`;

const LABEL_SCHEMA = {
    type: "object",
    properties: {
        isFood: { type: "boolean" },
        legible: { type: "boolean" },
        product_name: { type: "string" },
        brand: { type: "string" },
        ingredients: { type: "array", items: { type: "string" } },
        allergen_notes: { type: "array", items: { type: "string" } },
        nutrition: { type: "array", items: { type: "string" } },
    },
    required: ["isFood", "legible", "product_name", "brand", "ingredients", "allergen_notes", "nutrition"],
};

export type LabelReadResult =
    | { status: "ok"; productName: string; brand: string; ingredients: string[]; allergenNotes: string[]; nutrition: string[] }
    | { status: "notFood" }
    | { status: "failed"; reason: string };

export const readIngredientLabel = async (base64Image: string): Promise<LabelReadResult> => {
    try {
        const apiResult: any = await callGemini(endpointFor("labelReader"), {
            contents: [{
                role: "user",
                parts: [
                    { text: LABEL_PROMPT },
                    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
                ],
            }],
            generationConfig: jsonConfig("low", LABEL_SCHEMA),
        });

        const text = extractText(apiResult);
        if (!text) {
            return { status: "failed", reason: apiResult?.candidates?.[0]?.finishReason || "empty" };
        }

        const data = JSON.parse(text);
        const ingredients: string[] = Array.isArray(data.ingredients)
            ? data.ingredients.map((s: unknown) => String(s).trim()).filter(Boolean)
            : [];

        if (data.isFood === false || data.legible === false || ingredients.length === 0) {
            return { status: "notFood" };
        }

        return {
            status: "ok",
            productName: typeof data.product_name === "string" ? data.product_name.trim() : "",
            brand: typeof data.brand === "string" ? data.brand.trim() : "",
            ingredients,
            allergenNotes: Array.isArray(data.allergen_notes) ? data.allergen_notes.map(String) : [],
            nutrition: Array.isArray(data.nutrition) ? data.nutrition.map(String) : [],
        };
    } catch (error: any) {
        return { status: "failed", reason: error?.message || "error" };
    }
};

/** Okunan etiketi analiz prompt'una eklenecek metne çevirir. */
export const labelToAnalysisInput = (label: Extract<LabelReadResult, { status: "ok" }>): string => {
    let text = "";
    if (label.productName || label.brand) {
        text += `Product as printed on the package: name "${label.productName}", brand "${label.brand}". Use the brand for product.brand. Use the name for product.name, translated to the OUTPUT LANGUAGE if it is printed in another language.\n\n`;
    }
    text += `Analyze this ingredient list (read item by item from the package photo):\n"${label.ingredients.join(", ")}"`;
    if (label.allergenNotes.length) text += `\nAllergen notes on the package: ${label.allergenNotes.join("; ")}`;
    if (label.nutrition.length) text += `\n\nNutrition table from the package (per 100 g): ${label.nutrition.join("; ")}`;
    return text;
};
