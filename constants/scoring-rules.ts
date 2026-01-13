export type AdditiveRisk = "HAZARDOUS" | "CAUTION" | "SAFE";

export interface AdditiveInfo {
    risk: AdditiveRisk;
    reason: string;
    euStatus?: "BANNED" | "RESTRICTED" | "ALLOWED";
    fdaStatus?: "BANNED" | "WARNING" | "GRAS";
}

export const ADDITIVE_DATABASE: Record<string, AdditiveInfo> = {
    E171: {
        risk: "HAZARDOUS",
        reason: "Titanium Dioxide - DNA hasarı riski",
        euStatus: "BANNED",
        fdaStatus: "GRAS",
    },
    E249: {
        risk: "HAZARDOUS",
        reason: "Potassium Nitrite - Kanserojen nitrozamin oluşumu",
        euStatus: "RESTRICTED",
        fdaStatus: "WARNING",
    },
    E250: {
        risk: "HAZARDOUS",
        reason: "Sodium Nitrite - Kanserojen nitrozamin oluşumu",
        euStatus: "RESTRICTED",
        fdaStatus: "WARNING",
    },
    E251: {
        risk: "HAZARDOUS",
        reason: "Sodium Nitrate - İşlenmiş etlerde kanser riski",
        euStatus: "RESTRICTED",
        fdaStatus: "WARNING",
    },
    E252: {
        risk: "HAZARDOUS",
        reason: "Potassium Nitrate - İşlenmiş etlerde kanser riski",
        euStatus: "RESTRICTED",
        fdaStatus: "WARNING",
    },
    E127: {
        risk: "HAZARDOUS",
        reason: "Erythrosine (Red 3) - Tiroid tümörü riski",
        euStatus: "RESTRICTED",
        fdaStatus: "WARNING",
    },
    E131: {
        risk: "HAZARDOUS",
        reason: "Patent Blue V - Alerjik reaksiyonlar",
        euStatus: "ALLOWED",
        fdaStatus: "BANNED",
    },
    E143: {
        risk: "HAZARDOUS",
        reason: "Fast Green FCF - AB'de yasaklı",
        euStatus: "BANNED",
        fdaStatus: "GRAS",
    },
    E924: {
        risk: "HAZARDOUS",
        reason: "Potassium Bromate - Kanserojen",
        euStatus: "BANNED",
        fdaStatus: "BANNED",
    },
    E925: {
        risk: "HAZARDOUS",
        reason: "Chlorine - Besin değeri kaybı",
        euStatus: "BANNED",
        fdaStatus: "GRAS",
    },
    E926: {
        risk: "HAZARDOUS",
        reason: "Chlorine Dioxide - Vitamin yıkımı",
        euStatus: "RESTRICTED",
        fdaStatus: "GRAS",
    },
    E102: {
        risk: "CAUTION",
        reason: "Tartrazine - Hiperaktivite, alerji riski",
        euStatus: "RESTRICTED",
        fdaStatus: "GRAS",
    },
    E104: {
        risk: "CAUTION",
        reason: "Quinoline Yellow - Çocuklarda dikkat eksikliği",
        euStatus: "RESTRICTED",
        fdaStatus: "BANNED",
    },
    E110: {
        risk: "CAUTION",
        reason: "Sunset Yellow - Hiperaktivite riski",
        euStatus: "RESTRICTED",
        fdaStatus: "GRAS",
    },
    E122: {
        risk: "CAUTION",
        reason: "Carmoisine - Alerji, astım tetikleyici",
        euStatus: "RESTRICTED",
        fdaStatus: "BANNED",
    },
    E124: {
        risk: "CAUTION",
        reason: "Ponceau 4R - Hiperaktivite riski",
        euStatus: "RESTRICTED",
        fdaStatus: "BANNED",
    },
    E129: {
        risk: "CAUTION",
        reason: "Allura Red - Çocuklarda davranış sorunları",
        euStatus: "RESTRICTED",
        fdaStatus: "GRAS",
    },
    E133: {
        risk: "CAUTION",
        reason: "Brilliant Blue - Alerjik reaksiyonlar",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E150C: {
        risk: "CAUTION",
        reason: "Ammonia Caramel - 4-MEI kanserojen yan ürün",
        euStatus: "ALLOWED",
        fdaStatus: "WARNING",
    },
    E150D: {
        risk: "CAUTION",
        reason: "Sulphite Ammonia Caramel - 4-MEI riski",
        euStatus: "ALLOWED",
        fdaStatus: "WARNING",
    },
    E211: {
        risk: "CAUTION",
        reason: "Sodium Benzoate - C vitamini ile benzen oluşumu",
        euStatus: "RESTRICTED",
        fdaStatus: "GRAS",
    },
    E320: {
        risk: "CAUTION",
        reason: "BHA - Muhtemel kanserojen",
        euStatus: "RESTRICTED",
        fdaStatus: "GRAS",
    },
    E321: {
        risk: "CAUTION",
        reason: "BHT - Endokrin bozucu şüphesi",
        euStatus: "RESTRICTED",
        fdaStatus: "GRAS",
    },
    E407: {
        risk: "CAUTION",
        reason: "Carrageenan - Bağırsak iltihabı riski",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E450: {
        risk: "CAUTION",
        reason: "Diphosphates - Aşırı tüketimde böbrek yükü",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E451: {
        risk: "CAUTION",
        reason: "Triphosphates - Mineral emilim engeli",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E452: {
        risk: "CAUTION",
        reason: "Polyphosphates - Kalsiyum dengesizliği",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E621: {
        risk: "CAUTION",
        reason: "MSG - Hassas kişilerde baş ağrısı",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E951: {
        risk: "CAUTION",
        reason: "Aspartame - Fenilketonüri hastaları için tehlikeli",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E950: {
        risk: "CAUTION",
        reason: "Acesulfame K - Uzun vadeli etkileri belirsiz",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E955: {
        risk: "CAUTION",
        reason: "Sucralose - Bağırsak florası etkisi",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E100: {
        risk: "SAFE",
        reason: "Curcumin - Doğal, antioksidan",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E101: {
        risk: "SAFE",
        reason: "Riboflavin (B2) - Vitamin",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E160A: {
        risk: "SAFE",
        reason: "Beta-Carotene - Doğal, A vitamini öncüsü",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E160C: {
        risk: "SAFE",
        reason: "Paprika Extract - Doğal renklendirici",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E162: {
        risk: "SAFE",
        reason: "Beetroot Red - Doğal",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E163: {
        risk: "SAFE",
        reason: "Anthocyanins - Doğal antioksidan",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E170: {
        risk: "SAFE",
        reason: "Calcium Carbonate - Mineral",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E270: {
        risk: "SAFE",
        reason: "Lactic Acid - Doğal koruyucu",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E290: {
        risk: "SAFE",
        reason: "Carbon Dioxide - Gazlandırıcı",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E296: {
        risk: "SAFE",
        reason: "Malic Acid - Meyvelerde doğal",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E300: {
        risk: "SAFE",
        reason: "Ascorbic Acid (C vitamini) - Antioksidan",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E301: {
        risk: "SAFE",
        reason: "Sodium Ascorbate - C vitamini tuzu",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E306: {
        risk: "SAFE",
        reason: "Tocopherols (E vitamini) - Doğal antioksidan",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E322: {
        risk: "SAFE",
        reason: "Lecithin - Doğal emülgatör",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E330: {
        risk: "SAFE",
        reason: "Citric Acid - Meyvelerde doğal",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E331: {
        risk: "SAFE",
        reason: "Sodium Citrate - Sitrik asit tuzu",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E332: {
        risk: "SAFE",
        reason: "Potassium Citrate - Sitrik asit tuzu",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E333: {
        risk: "SAFE",
        reason: "Calcium Citrate - Kalsiyum kaynağı",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E334: {
        risk: "SAFE",
        reason: "Tartaric Acid - Üzümde doğal",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E335: {
        risk: "SAFE",
        reason: "Sodium Tartrate - Tartarik asit tuzu",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E336: {
        risk: "SAFE",
        reason: "Potassium Tartrate - Cream of tartar",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E392: {
        risk: "SAFE",
        reason: "Rosemary Extract - Doğal antioksidan",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E400: {
        risk: "SAFE",
        reason: "Alginic Acid - Deniz yosunundan",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E401: {
        risk: "SAFE",
        reason: "Sodium Alginate - Doğal kıvam arttırıcı",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E406: {
        risk: "SAFE",
        reason: "Agar - Deniz yosunundan, vegan jelatin",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E410: {
        risk: "SAFE",
        reason: "Locust Bean Gum - Doğal kıvam arttırıcı",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E412: {
        risk: "SAFE",
        reason: "Guar Gum - Doğal kıvam arttırıcı",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E414: {
        risk: "SAFE",
        reason: "Acacia Gum - Doğal stabilizatör",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E415: {
        risk: "SAFE",
        reason: "Xanthan Gum - Fermantasyon ürünü",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E440: {
        risk: "SAFE",
        reason: "Pectin - Meyvelerden doğal",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E460: {
        risk: "SAFE",
        reason: "Cellulose - Bitkisel lif",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E500: {
        risk: "SAFE",
        reason: "Sodium Bicarbonate - Kabartma tozu",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E501: {
        risk: "SAFE",
        reason: "Potassium Carbonate - Kabartma ajanı",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E503: {
        risk: "SAFE",
        reason: "Ammonium Carbonate - Kabartma ajanı",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E509: {
        risk: "SAFE",
        reason: "Calcium Chloride - Mineral",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E516: {
        risk: "SAFE",
        reason: "Calcium Sulfate - Tofu yapımında kullanılır",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E903: {
        risk: "SAFE",
        reason: "Carnauba Wax - Doğal parlatıcı",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
    E901: {
        risk: "SAFE",
        reason: "Beeswax - Doğal (vegan değil)",
        euStatus: "ALLOWED",
        fdaStatus: "GRAS",
    },
};

export type NovaGroup = 1 | 2 | 3 | 4;

export interface NovaInfo {
    group: NovaGroup;
    label: string;
    labelTr: string;
    description: string;
    descriptionTr: string;
}

export const NOVA_GROUPS: Record<NovaGroup, NovaInfo> = {
    1: {
        group: 1,
        label: "Unprocessed",
        labelTr: "İşlenmemiş",
        description: "Fresh foods with no processing",
        descriptionTr: "İşlem görmemiş taze gıdalar",
    },
    2: {
        group: 2,
        label: "Processed Culinary",
        labelTr: "Mutfak İşlemesi",
        description: "Oils, butter, sugar, salt for cooking",
        descriptionTr: "Yemek yapmak için yağ, tereyağı, şeker, tuz",
    },
    3: {
        group: 3,
        label: "Processed",
        labelTr: "İşlenmiş",
        description: "Canned vegetables, cheese, bread",
        descriptionTr: "Konserve sebzeler, peynir, ekmek",
    },
    4: {
        group: 4,
        label: "Ultra-Processed",
        labelTr: "Aşırı İşlenmiş",
        description: "Industrial formulations with additives",
        descriptionTr: "Katkı maddeleri içeren endüstriyel ürünler",
    },
};

export const SCORING_RULES = {
    // Base score
    BASE_SCORE: 100,
    MIN_SCORE: 0,
    MAX_SCORE: 100,

    PENALTY_HAZARDOUS_ADDITIVE: 15,
    PENALTY_CAUTION_ADDITIVE: 5,

    PENALTY_NOVA_4: 20,
    PENALTY_NOVA_3: 10,

    PENALTY_EU_BANNED: 25,
    PENALTY_FDA_WARNING: 15,

    BONUS_NO_ADDITIVES: 5,
    BONUS_ORGANIC: 5,

    COMPATIBILITY_ALLERGEN_MATCH: 0,
    COMPATIBILITY_DIET_VIOLATION: 0,
} as const;

export interface ScoreLevel {
    min: number;
    max: number;
    level: string;
    levelTr: string;
    color: string;
}

export const SAFETY_LEVELS: ScoreLevel[] = [
    { min: 0, max: 20, level: "Hazardous", levelTr: "Tehlikeli", color: "#DC2626" },
    { min: 21, max: 40, level: "Poor", levelTr: "Zayıf", color: "#EA580C" },
    { min: 41, max: 60, level: "Average", levelTr: "Orta", color: "#EAB308" },
    { min: 61, max: 80, level: "Good", levelTr: "İyi", color: "#84CC16" },
    { min: 81, max: 100, level: "Excellent", levelTr: "Mükemmel", color: "#22C55E" },
];

export const COMPATIBILITY_LEVELS: ScoreLevel[] = [
    { min: 0, max: 20, level: "Bad Match", levelTr: "Uyumsuz", color: "#DC2626" },
    { min: 21, max: 40, level: "Risky", levelTr: "Riskli", color: "#EA580C" },
    { min: 41, max: 60, level: "Neutral", levelTr: "Nötr", color: "#EAB308" },
    { min: 61, max: 80, level: "Good Match", levelTr: "Uyumlu", color: "#84CC16" },
    { min: 81, max: 100, level: "Perfect", levelTr: "Mükemmel Uyum", color: "#22C55E" },
];

export function getAdditiveInfo(code: string): AdditiveInfo | null {
    const normalized = code.toUpperCase().replace(/\s/g, "");
    return ADDITIVE_DATABASE[normalized] || null;
}

export function getSafetyLevel(score: number, lang: "en" | "tr" = "en"): ScoreLevel {
    const level = SAFETY_LEVELS.find((l) => score >= l.min && score <= l.max);
    return level || SAFETY_LEVELS[0];
}

export function getCompatibilityLevel(score: number, lang: "en" | "tr" = "en"): ScoreLevel {
    const level = COMPATIBILITY_LEVELS.find((l) => score >= l.min && score <= l.max);
    return level || COMPATIBILITY_LEVELS[0];
}

export function getNovaInfo(group: NovaGroup): NovaInfo {
    return NOVA_GROUPS[group];
}
