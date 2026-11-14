// Ürün analizi için yapılandırılmış çıktı şeması (Gemini responseJsonSchema).
// lib/prompt.ts içindeki "OUTPUT FORMAT" ile birebir aynı alanlar. Prompt değişirse burası da değişir.
// Şema modelin geçerli JSON üretmesini garanti eder; değer kuralları (eşikler, enum anlamları) prompt'ta kalır.

const str = { type: "string" };
const num = { type: "number" };
const bool = { type: "boolean" };
const nullableNum = { type: ["number", "null"] };
const nullableStr = { type: ["string", "null"] };

const LAYER_TYPES = [
    "base_grain", "sugar", "syrup_honey", "fat_oil", "flour", "nuts_seeds", "dried_fruit", "fruit",
    "dairy", "water", "cocoa", "protein", "fiber", "salt", "additives", "other",
];

const BADGES = [
    "EU_BANNED", "FDA_WARN", "NO_ADDITIVES", "HIGH_PROTEIN", "SUGAR_FREE", "WHOLE_GRAIN", "HIGH_FIBER",
    "LOW_FAT", "LOW_SODIUM", "ORGANIC", "HIGH_SUGAR", "HIGH_SODIUM", "HIGH_FAT", "CONTAINS_ALLERGENS",
    "VEGAN", "VEGETARIAN", "GLUTEN_FREE", "LACTOSE_FREE",
];

export const ANALYSIS_SCHEMA = {
    type: "object",
    properties: {
        product: {
            type: "object",
            properties: { name: str, brand: str, category: str, isFood: bool },
            required: ["name", "brand", "category", "isFood"],
        },
        badges: { type: "array", items: { type: "string", enum: BADGES } },
        scores: {
            type: "object",
            properties: {
                safety: {
                    type: "object",
                    properties: {
                        value: num,
                        level: { type: "string", enum: ["Hazardous", "Poor", "Average", "Good", "Excellent"] },
                        color: { type: "string", enum: ["red", "orange", "yellow", "lightgreen", "green"] },
                        breakdown: str,
                    },
                    required: ["value", "level", "color", "breakdown"],
                },
                compatibility: {
                    type: "object",
                    properties: {
                        value: num,
                        level: { type: "string", enum: ["Bad Match", "Risky", "Neutral", "Good Match", "Perfect"] },
                        color: { type: "string", enum: ["red", "orange", "yellow", "lightgreen", "green"] },
                        verdict: str,
                    },
                    required: ["value", "level", "color", "verdict"],
                },
            },
            required: ["safety", "compatibility"],
        },
        details: {
            type: "object",
            properties: {
                ingredients_full_text: str,
                ingredients: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            display_name: str,
                            technical_name: str,
                            isAllergen: bool,
                            riskLevel: { type: "string", enum: ["High", "Medium", "Low", "Safe"] },
                        },
                        required: ["display_name", "technical_name", "isAllergen", "riskLevel"],
                    },
                },
                additives: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            code: str,
                            name: str,
                            risk: { type: "string", enum: ["Hazardous", "Caution", "Safe"] },
                            description: str,
                        },
                        required: ["code", "name", "risk", "description"],
                    },
                },
                processing: {
                    type: "object",
                    properties: { classification: str, nova_group: { type: "integer" }, description: str },
                    required: ["classification", "nova_group", "description"],
                },
                nutritional_highlights: {
                    type: "object",
                    properties: {
                        pros: { type: "array", items: str },
                        cons: { type: "array", items: str },
                    },
                    required: ["pros", "cons"],
                },
            },
            required: ["ingredients_full_text", "ingredients", "additives", "processing", "nutritional_highlights"],
        },
        nutrition_facts: {
            type: "object",
            properties: {
                data_available: bool,
                serving_size: nullableStr,
                carbohydrates: nullableNum,
                fiber: nullableNum,
                sugar: nullableNum,
                protein: nullableNum,
                sodium: nullableNum,
                saturated_fat: nullableNum,
                trans_fat: nullableNum,
            },
            required: ["data_available"],
        },
        keto_analysis: {
            type: "object",
            properties: {
                is_keto_friendly: bool,
                net_carb_estimate: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "UNKNOWN"] },
                reasoning: str,
            },
            required: ["is_keto_friendly", "net_carb_estimate", "reasoning"],
        },
        composition: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    display_name: str,
                    type: { type: "string", enum: LAYER_TYPES },
                    percent_min: num,
                    percent_max: num,
                    source: { type: "string", enum: ["label_percent", "nutrition", "openfoodfacts", "order_estimate"] },
                },
                required: ["display_name", "type", "percent_min", "percent_max", "source"],
            },
        },
        sugar_per_100g: nullableNum,
    },
    required: ["product", "badges", "scores", "details", "nutrition_facts", "keto_analysis", "composition"],
};
