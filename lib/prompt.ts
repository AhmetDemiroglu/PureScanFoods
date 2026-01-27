export function generateAnalysisPrompt(lang: string, userProfile: { allergens: string[]; dietaryPreferences: string[]; lifeStage?: string | null } | null): string {
    const targetLang = lang === "tr" ? "TURKISH" : "ENGLISH";

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
${getLifeStageContext(lifeStage)}

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
      "classification": "string (${targetLang})",
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
      "protein": number        // null if data_available is false
  },
  "keto_analysis": {
      "is_keto_friendly": boolean,
      // STRICT ENUM: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN"
      "net_carb_estimate": "LOW | MEDIUM | HIGH | UNKNOWN", 
      "reasoning": "string (${targetLang}) - If data_available is false, explain estimation based on ingredient list order."
  }
}

CRITICAL DATA INSTRUCTION:
- "display_name": Must be in ${targetLang} (e.g., "Buğday Unu").
- "technical_name": Must be in ENGLISH (e.g., "Wheat Flour"). This is vital for the analysis engine.
- If ingredient is "Maltodextrin", technical_name MUST be "Maltodextrin".
- If ingredient is "Aroma/Flavor", technical_name MUST be "Flavoring".



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

BE STRICT. Unhealthy ultra-processed foods should score 5-30, not 50+.
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

function getLifeStageContext(lifeStage: string): string {
    const contexts: Record<string, string> = {
        INFANT_0_6: "Baby 0-6 months. ONLY breast milk or formula. Flag ALL solid food ingredients as inappropriate.",
        INFANT_6_12: "Baby 6-12 months. No honey (botulism risk), limit salt/sugar, no whole nuts, no raw eggs/fish, no caffeine.",
        TODDLER_1_3: "Toddler 1-3 years. Choking hazards (whole nuts, popcorn, hard candy). Limit artificial sweeteners, no energy drinks.",
        CHILD_3_12: "Child 3-12 years. No alcohol, limit caffeine, avoid energy drinks.",
        TEEN: "Teenager 12-18 years. No alcohol, limit energy drinks and excessive caffeine.",
        ADULT: "Adult. Standard analysis, no age-specific restrictions.",
        ELDERLY: "Senior 65+. Caution with high sodium, raw foods, unpasteurized products.",
        PREGNANT: "Pregnant woman. No alcohol, raw fish/eggs, unpasteurized dairy, high-mercury fish, limit caffeine to 200mg/day.",
        BREASTFEEDING: "Breastfeeding mother. Limit alcohol and caffeine, avoid high-mercury fish.",
    };
    return contexts[lifeStage] || contexts.ADULT;
}
