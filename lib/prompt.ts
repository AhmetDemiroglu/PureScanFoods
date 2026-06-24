export function generateAnalysisPrompt(lang: string, userProfile: { allergens: string[]; dietaryPreferences: string[]; lifeStage?: string | null } | null): string {
    const targetLang = lang === "tr" ? "TURKISH" : lang?.startsWith("es") ? "SPANISH" : "ENGLISH";

    const diet = userProfile?.dietaryPreferences?.join(", ") || "None";
    const allergens = userProfile?.allergens?.join(", ") || "None";
    const lifeStage = userProfile?.lifeStage || "ADULT";

    return `
ROLE: Senior Food Scientist & Clinical Nutritionist
OUTPUT LANGUAGE: ${targetLang}
MODE: STRICT & EXHAUSTIVE

USER PROFILE:
- Allergens: ${allergens}
- Diet: ${diet}
- Life Stage: ${lifeStage}

LIFE STAGE CONTEXT:
${getLifeStageContext(lifeStage, lang)}

TASK: 
0. CRITICAL VALIDATION (FIRST STEP):
   - Check if the input is a valid food product and if the ingredient list is LEGIBLE.
   - If the text/image is NOT food, OR if ingredients are blurry/unreadable/missing:
     -> Set "isFood": false
     -> Set "ingredients": [] (EMPTY ARRAY)
     -> Set "scores": safety value 0, compatibility value 0
     -> STOP ANALYSIS IMMEDIATELY. DO NOT HALLUCINATE OR GUESS DATA.

1. READ EVERY SINGLE WORD in the ingredient list. DO NOT SUMMARIZE. DO NOT SKIP minor ingredients.
2. Analyze product and calculate scores using STRICT MATHEMATICAL RULES below.

SAFETY SCORE CALCULATION (Start at 100, apply penalties):

NOVA PENALTIES (mandatory):
- NOVA 4 (Ultra-processed): -25
- NOVA 3 (Processed): -10

INGREDIENT PENALTIES (check each):
- Sugar/sweetener in first 3 ingredients: -15
- Palm oil, hydrogenated fat, vegetable fat: -10
- Maltodextrin, modified starch, corn syrup: -10
- Artificial flavoring/coloring mentioned: -5

ADDITIVE PENALTIES (per additive):
- HAZARDOUS (E171, E249-252, E127, E924): -15 each
- CAUTION (E102, E110, E129, E211, E320-321, E621, E951): -8 each
- Unknown/unlisted additive: -5 each

NUTRITIONAL PENALTIES:
- No significant protein/fiber/vitamins detected: -10
- High sodium indicated: -5
- Trans fat present: -15

BONUSES (max +10 total):
- Organic certified: +5
- No artificial additives: +5
- Whole grain as main ingredient: +5

FLOOR: Minimum score is 5 (never 0 for edible food)

NOVA CLASSIFICATION RULES (set processing.nova_group as an integer 1-4):
- nova_group = 4 (ULTRA-PROCESSED) if the product contains ANY of: a sweetener (INCLUDING natural steviol glycosides / stevia), a flavoring (INCLUDING natural aroma / "aroma verici"), a colorant, an emulsifier, OR an ultra-processing marker (maltodextrin, glucose-fructose / high-fructose corn syrup, protein isolate, modified starch).
- nova_group = 3 (PROCESSED): a recognizable whole food with added salt/sugar/oil (canned vegetables, cheese, cured meat, fresh bread), few ingredients, and NONE of the NOVA 4 markers above.
- nova_group = 2: processed culinary ingredients (oils, butter, sugar, salt, flour).
- nova_group = 1: unprocessed / minimally processed whole foods.
- Benign acidity regulators / antioxidants ALONE (citric acid E330, ascorbic acid E300, sodium citrate E331) do NOT make a product NOVA 4.

COMPATIBILITY SCORE:
- Start with SAFETY score
- If contains ANY user allergen → Score = 0
- If violates user diet (e.g., milk for vegan) → Score = 0
- If no profile set → Use safety score, note "profile not set"

OUTPUT FORMAT (Raw JSON only, no markdown):
{
  "product": {
    "name": "string (${targetLang}) - If unknown, say 'Bilinmeyen Ürün' or '${targetLang}' equivalent",
    "brand": "string - If unknown, say 'Belirsiz Marka' or '${targetLang}' equivalent",
    "category": "string (${targetLang})",
    "isFood": boolean
  },
  "badges": ["ONLY use from this list - no other values allowed: EU_BANNED", "FDA_WARN", "NO_ADDITIVES", "HIGH_PROTEIN", "SUGAR_FREE", "WHOLE_GRAIN", "HIGH_FIBER", "LOW_FAT", "LOW_SODIUM", "ORGANIC", "HIGH_SUGAR", "HIGH_SODIUM", "HIGH_FAT", "CONTAINS_ALLERGENS", "VEGAN", "VEGETARIAN", "GLUTEN_FREE", "LACTOSE_FREE"],  
  "scores": {
    "safety": {
      "value": number (5-100),
      "level": "Hazardous|Poor|Average|Good|Excellent",
      "color": "red|orange|yellow|lightgreen|green",
      "breakdown": "Show calculation: 100 - 25(NOVA4) - 15(sugar) - ... = X"
    },
    "compatibility": {
      "value": number (0-100),
      "level": "Bad Match|Risky|Neutral|Good Match|Perfect",
      "color": "red|orange|yellow|lightgreen|green",
      "verdict": "string (${targetLang}) - explain match/mismatch with user profile"
    }
  },
  "details": {
    "ingredients_full_text": "string (ORIGINAL package language) - the COMPLETE verbatim ingredient list EXACTLY as printed on the package: no summarizing, no reordering, no translation, keep all sub-ingredients and percentages. Empty string only if truly not legible.",
    "ingredients": [
      { 
        "display_name": "string (${targetLang} - common name for UI)", 
        "technical_name": "string (ENGLISH - standardized scientific/common name for Engine matching)",
        "isAllergen": boolean, 
        "riskLevel": "High|Medium|Low|Safe" 
      }
    ],
    "additives": [
      { "code": "E-number", "name": "string (${targetLang})", "risk": "Hazardous|Caution|Safe", "description": "string (${targetLang})" }
    ],
    "processing": {
      "classification": "string (${targetLang}) - MUST match nova_group and include '(NOVA <n>)'",
      "nova_group": number (1-4) - REQUIRED integer NOVA group,
      "description": "string (${targetLang}) - detailed explanation why this classification"
    },
    "nutritional_highlights": {
      "pros": ["string (${targetLang}) - with brief explanation"],
      "cons": ["string (${targetLang}) - with brief explanation"]
    }
  },
  "nutrition_facts": {
      // INSTRUCTION: Set 'data_available' to true ONLY if you can clearly read BOTH 'Carbohydrate' AND 'Fiber' values in a table.
      // If the table is cut off, blurry, or partial, set this to false. DO NOT GUESS NUMBERS.
      "data_available": boolean, 
      "serving_size": "string or null",
      "carbohydrates": number, // null if data_available is false
      "fiber": number,         // null if data_available is false
      "sugar": number,         // null if data_available is false
      "protein": number,       // null if data_available is false
      "sodium": number,        // sodium in mg if readable on the label, else null
      "saturated_fat": number, // saturated fat in grams if readable, else null
      "trans_fat": number      // trans fat in grams if readable, else null
  },
  "keto_analysis": {
      "is_keto_friendly": boolean,
      // STRICT ENUM: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN"
      "net_carb_estimate": "LOW | MEDIUM | HIGH | UNKNOWN",
      "reasoning": "string (${targetLang}) - If data_available is false, explain estimation based on ingredient list order."
  },
  "composition": [
    // VISUAL LAYER BREAKDOWN for an honest "what's really inside" jar graphic. 5-8 layers, ordered MOST -> LEAST. See COMPOSITION RULES below.
    {
      "display_name": "string (${targetLang}) - short layer label, e.g. 'Şeker', 'Yulaf', 'Bitkisel yağ'",
      "type": "base_grain | sugar | syrup_honey | fat_oil | flour | nuts_seeds | dried_fruit | fruit | dairy | water | cocoa | protein | fiber | salt | additives | other",
      "percent_min": number, // 0-100
      "percent_max": number, // 0-100, MUST be >= percent_min
      "source": "label_percent | nutrition | openfoodfacts | order_estimate"
    }
  ],
  "sugar_per_100g": number // grams of sugar per 100g from nutrition table / OpenFoodFacts (nutriments.sugars_100g). null if genuinely unknown - DO NOT guess.
}

CRITICAL DATA INSTRUCTION:
- "display_name": Must be in ${targetLang} (e.g., "Buğday Unu").
- "technical_name": Must be in ENGLISH (e.g., "Wheat Flour"). This is vital for the analysis engine.
- If ingredient is "Maltodextrin", technical_name MUST be "Maltodextrin".
- ADDITIVES (EXHAUSTIVE): List EVERY additive, preservative, antioxidant, colorant, emulsifier, acidity regulator, sweetener, flavor enhancer and raising agent you can identify, each with its E-number (when known) AND plain name. Do NOT stop at the first few. If an additive is written in words (e.g. "sodium metabisulfite", "potassium sorbate", "polyglycerol polyricinoleate"), still add it to "additives" with its E-number when known (e.g. E223, E202, E476).
- CONS (be specific): If the product is NOVA 4 (ultra-processed) OR has any HIGH_SUGAR / HIGH_SODIUM / HIGH_FAT badge, "nutritional_highlights.cons" MUST contain at least 3 concrete concerns, explicitly mentioning things like preservatives/additives present, ultra-processing, trans or saturated fat, and high sugar/sodium. Never leave a clearly unhealthy product with only one con.
- "ingredients_full_text": transcribe the FULL ingredient line verbatim in its original language; never summarize or omit sub-ingredients or percentages.
- If ingredient is "Aroma/Flavor", technical_name MUST be "Flavoring".

COMPOSITION (VISUAL LAYERS) RULES — for the "composition" array:
- GOAL: estimate the PROPORTIONS of the product as 5-8 stacked layers for an honest "what's really inside" jar graphic.
- ORDER: layers MUST follow the legal descending weight order of the ingredient list (layer 1 >= layer 2 >= ...). Group related ingredients into ONE layer by "type": all sugars / glucose-fructose syrup -> a "sugar" or "syrup_honey" layer; all oils/fats -> "fat_oil"; flours -> "flour"; nuts & seeds -> "nuts_seeds"; ALL additives / E-numbers together -> ONE "additives" layer.
- NUMBERS — never invent a single precise value; ALWAYS give a min–max RANGE and set "source" honestly:
  * Exact % printed on the label (QUID, e.g. "%30 fındık") -> use it, narrow range, source "label_percent".
  * OpenFoodFacts percent_estimate / percent_min / percent_max provided in context -> use those bounds, source "openfoodfacts".
  * Nutrition table gives sugar/fat per 100g -> anchor that layer to it, source "nutrition".
  * Otherwise estimate from descending order with a WIDE range (e.g. 20-35), source "order_estimate".
- The midpoints of all layers should sum to roughly 100. The "additives" layer is usually < 2%.
- "sugar_per_100g": grams of sugar per 100g from the nutrition table or OpenFoodFacts (nutriments.sugars_100g). If genuinely unknown, set null. DO NOT guess a precise number — null is better than a fabricated value.

BADGE RULES (CRITICAL):
- ONLY use badges from the allowed list above
- DO NOT create custom badges like "WHOLE_GRAIN_BASE" or "HIGH_SUGAR_CONTENT"
- Use exact values: "WHOLE_GRAIN" not "WHOLE_GRAIN_BASE", "HIGH_SUGAR" not "HIGH_SUGAR_CONTENT"
- Maximum 4 badges per product

LEVEL THRESHOLDS:
- 0-20: Hazardous/Bad Match (red)
- 21-40: Poor/Risky (orange)
- 41-60: Average/Neutral (yellow)
- 61-80: Good/Good Match (lightgreen)
- 81-100: Excellent/Perfect (green)

EXAMPLE CALCULATION (for a chocolate wafer with palm oil, sugar, additives):
- Base: 100
- NOVA 4: -25 → 75
- Sugar first ingredient: -15 → 60
- Palm oil present: -10 → 50
- Modified starch: -10 → 40
- E322 (safe): 0 → 40
- E476 (caution): -8 → 32
- No nutritional value: -10 → 22
- Final: max(5, 22) = 22 (Poor)

PROCESSING vs HARM ARE SEPARATE AXES: nova_group measures PROCESSING degree; the safety score measures HARM (hazardous additives, sugar, sodium, saturated/trans fat). A NOVA 4 product that is otherwise clean (e.g. a stevia-sweetened diet drink with no hazardous additives and no high sugar) may legitimately score ~65-72. Reserve 5-30 for NOVA 4 products that ALSO carry hazardous additives and/or high sugar/sodium/saturated or trans fat. Do NOT slam every ultra-processed product to a low score by default.
`.trim();
}

export function generateBarcodeDataPrompt(lang: string, userProfile: { allergens: string[]; dietaryPreferences: string[] } | null, offData: any): string {
    const basePrompt = generateAnalysisPrompt(lang, userProfile);

    return `
${basePrompt}

ADDITIONAL CONTEXT - OpenFoodFacts Data:
${JSON.stringify(offData, null, 2)}

Use this data to enhance your analysis. Apply the same scoring rules.
`.trim();
}

function getLifeStageContext(lifeStage: string, lang: string): string {
    const contexts: Record<string, Record<string, string>> = {
        INFANT_0_6: {
            en: "Baby 0-6 months. ONLY breast milk or formula. Flag ALL solid food ingredients as inappropriate.",
            tr: "Bebek 0-6 ay. SADECE anne sütü veya mama. Tüm katı gıda içeriklerini uygunsuz olarak işaretle.",
            es: "Bebé 0-6 meses. SOLO leche materna o fórmula. Marque TODOS los ingredientes de alimentos sólidos como inapropiados."
        },
        INFANT_6_12: {
            en: "Baby 6-12 months. No honey (botulism risk), limit salt/sugar, no whole nuts, no raw eggs/fish, no caffeine.",
            tr: "Bebek 6-12 ay. Bal yok (botulizm riski), tuz/şekeri sınırla, bütün fındık yok, çiğ yumurta/balık yok, kafein yok.",
            es: "Bebé 6-12 meses. Sin miel (riesgo de botulismo), limitar sal/azúcar, sin frutos secos enteros, sin huevos/pescado crudos, sin cafeína."
        },
        TODDLER_1_3: {
            en: "Toddler 1-3 years. Choking hazards (whole nuts, popcorn, hard candy). Limit artificial sweeteners, no energy drinks.",
            tr: "Küçük çocuk 1-3 yaş. Boğulma riski (bütün fındık, patlamış mısır, sert şeker). Yapay tatlandırıcıları sınırla, enerji içeceği yok.",
            es: "Niño pequeño 1-3 años. Riesgo de asfixia (frutos secos enteros, palomitas, caramelos duros). Limitar edulcorantes artificiales, sin bebidas energéticas."
        },
        CHILD_3_12: {
            en: "Child 3-12 years. No alcohol, limit caffeine, avoid energy drinks.",
            tr: "Çocuk 3-12 yaş. Alkol yok, kafeini sınırla, enerji içeceklerinden kaçın.",
            es: "Niño 3-12 años. Sin alcohol, limitar cafeína, evitar bebidas energéticas."
        },
        TEEN: {
            en: "Teenager 12-18 years. No alcohol, limit energy drinks and excessive caffeine.",
            tr: "Genç 12-18 yaş. Alkol yok, enerji içeceklerini ve aşırı kafeini sınırla.",
            es: "Adolescente 12-18 años. Sin alcohol, limitar bebidas energéticas y cafeína excesiva."
        },
        ADULT: {
            en: "Adult. Standard analysis, no age-specific restrictions.",
            tr: "Yetişkin. Standart analiz, yaş grubuna özel kısıtlama yok.",
            es: "Adulto. Análisis estándar, sin restricciones específicas de edad."
        },
        ELDERLY: {
            en: "Senior 65+. Caution with high sodium, raw foods, unpasteurized products.",
            tr: "Yaşlı 65+. Yüksek sodyum, çiğ gıdalar, pastörize edilmemiş ürünlerde dikkatli ol.",
            es: "Adulto mayor 65+. Precaución con alto sodio, alimentos crudos, productos no pasteurizados."
        },
        PREGNANT: {
            en: "Pregnant woman. No alcohol, raw fish/eggs, unpasteurized dairy, high-mercury fish, limit caffeine to 200mg/day.",
            tr: "Hamile kadın. Alkol, çiğ balık/yumurta, pastörize edilmemiş süt ürünleri, yüksek cıvalı balık yok, kafeini günde 200mg ile sınırla.",
            es: "Mujer embarazada. Sin alcohol, pescado/huevos crudos, lácteos no pasteurizados, pescado con alto mercurio, limitar cafeína a 200mg/día."
        },
        BREASTFEEDING: {
            en: "Breastfeeding mother. Limit alcohol and caffeine, avoid high-mercury fish.",
            tr: "Emziren anne. Alkol ve kafeini sınırla, yüksek cıvalı balıktan kaçın.",
            es: "Madre lactante. Limitar alcohol y cafeína, evitar pescado con alto mercurio."
        },
    };
    const langKey = lang === "tr" ? "tr" : lang?.startsWith("es") ? "es" : "en";
    return contexts[lifeStage]?.[langKey] || contexts.ADULT[langKey];
}
