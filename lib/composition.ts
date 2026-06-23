// "Gerçekte ne tüketiyorsun?" görseli için içerik kompozisyonu yardımcıları.
// Yüzdeler AI tarafından (gemini-3.1-flash-lite) içindekiler sırası + OFF/QUID/besin
// verisinden TAHMİN edilir. Burada sadece normalize eder, renklendirir ve kaşık hesabı yaparız.
// Model rakam icat etmez; bu modül de uydurmaz — yalnızca eldeki aralıkları görselleştirir.

export type LayerType =
    | "base_grain" | "sugar" | "syrup_honey" | "fat_oil" | "flour"
    | "nuts_seeds" | "dried_fruit" | "fruit" | "dairy" | "water"
    | "cocoa" | "protein" | "fiber" | "salt" | "additives" | "other";

export type CompositionSource = "label_percent" | "nutrition" | "openfoodfacts" | "order_estimate";

export interface CompositionLayer {
    display_name: string;
    type: LayerType;
    percent_min: number;
    percent_max: number;
    source?: CompositionSource;
}

export interface RenderLayer extends CompositionLayer {
    mid: number;            // (min+max)/2
    renderFraction: number; // 0-1, görselde kapladığı oran (min görünürlük uygulanmış)
    color: string;          // katman rengi
    rangeLabel: string;     // "%20–30" veya "%25"
}

// Gıda-benzeri sabit renkler (tema bağımsız; kavanoz arka planı temaya uyum sağlar).
const LAYER_COLORS: Record<LayerType, string> = {
    base_grain: "#E3B96B",
    flour: "#EAD9B0",
    sugar: "#F3F4F6",
    syrup_honey: "#C8741E",
    fat_oil: "#F2C14E",
    nuts_seeds: "#9C6B3F",
    dried_fruit: "#6E2A3C",
    fruit: "#C0392B",
    dairy: "#FBF6EC",
    water: "#BFE3F0",
    cocoa: "#5B3A29",
    protein: "#D98A5B",
    fiber: "#B5A36A",
    salt: "#E6ECF1",
    additives: "#9AA0A6",
    other: "#C7BFB0",
};

export const getLayerColor = (type: LayerType): string =>
    LAYER_COLORS[type] ?? LAYER_COLORS.other;

const clampPct = (n: any): number => {
    const v = typeof n === "number" && isFinite(n) ? n : 0;
    return Math.max(0, Math.min(100, v));
};

export const formatRange = (min: number, max: number): string => {
    const lo = Math.round(min);
    const hi = Math.round(max);
    return lo === hi ? `%${lo}` : `%${lo}–${hi}`;
};

// Ham composition'ı görsele hazır katmanlara çevir: doğrula, sırala, min görünürlük uygula.
export const buildRenderLayers = (
    raw: CompositionLayer[] | undefined | null,
    opts: { minFraction?: number; maxLayers?: number } = {}
): RenderLayer[] => {
    const minFraction = opts.minFraction ?? 0.035;
    const maxLayers = opts.maxLayers ?? 8;

    if (!Array.isArray(raw) || raw.length === 0) return [];

    const cleaned = raw
        .filter((l) => l && typeof l.display_name === "string")
        .map((l) => {
            const min = clampPct(l.percent_min);
            const max = Math.max(min, clampPct(l.percent_max));
            return { ...l, percent_min: min, percent_max: max, mid: (min + max) / 2 };
        })
        .filter((l) => l.mid > 0)
        .sort((a, b) => b.mid - a.mid)
        .slice(0, maxLayers);

    if (cleaned.length === 0) return [];

    const totalMid = cleaned.reduce((s, l) => s + l.mid, 0) || 1;

    // Min görünürlük: çok küçük katmanlar (katkı maddeleri) bile görülebilsin,
    // ama etiket gerçek % aralığını gösterir.
    const floored = cleaned.map((l) => Math.max(l.mid / totalMid, minFraction));
    const flooredSum = floored.reduce((s, f) => s + f, 0) || 1;

    return cleaned.map((l, i) => ({
        ...l,
        color: getLayerColor(l.type),
        renderFraction: floored[i] / flooredSum,
        rangeLabel: formatRange(l.percent_min, l.percent_max),
    }));
};

// Şeker kaşığı (yemek kaşığı) hesabı: 1 yemek kaşığı ≈ 12.5g şeker.
const GRAMS_PER_TBSP = 12.5;

export const sugarToSpoons = (grams: number): number => {
    if (!isFinite(grams) || grams <= 0) return 0;
    return Math.round((grams / GRAMS_PER_TBSP) * 2) / 2; // en yakın 0.5
};

// Şeker gramını belirle: nutrition/OFF varsa onu kullan; yoksa şeker tipli katmanların
// orta noktasından TAHMİN et (100g üzerinden ≈ yüzde). 'estimated' bayrağı UI'da "tahmini" gösterir.
export const resolveSugarGrams = (
    layers: CompositionLayer[] | undefined | null,
    sugarPer100g: number | null | undefined
): { grams: number; estimated: boolean } => {
    if (typeof sugarPer100g === "number" && isFinite(sugarPer100g) && sugarPer100g >= 0) {
        return { grams: sugarPer100g, estimated: false };
    }
    if (Array.isArray(layers)) {
        const sugarMid = layers
            .filter((l) => l && (l.type === "sugar" || l.type === "syrup_honey"))
            .reduce((s, l) => s + (clampPct(l.percent_min) + clampPct(l.percent_max)) / 2, 0);
        if (sugarMid > 0) return { grams: sugarMid, estimated: true };
    }
    return { grams: 0, estimated: true };
};

// Tüm katmanların kaynağı 'order_estimate' ise görsel tamamen tahminidir → UI'da belirgin "tahmini" rozeti.
export const isFullyEstimated = (layers: CompositionLayer[] | undefined | null): boolean => {
    if (!Array.isArray(layers) || layers.length === 0) return true;
    return layers.every((l) => !l.source || l.source === "order_estimate");
};

// Bir bileşen adından (öncelikle İngilizce technical_name) katman tipini çıkar.
export const inferLayerType = (raw: string): LayerType => {
    const s = (raw || "").toLowerCase();
    const has = (...k: string[]) => k.some((x) => s.includes(x));
    if (has("water")) return "water";
    if (has("cocoa", "cacao", "chocolate", "kakao", "çikolata")) return "cocoa";
    if (has("syrup", "honey", "molasses", "treacle", "bal", "pekmez", "şurup")) return "syrup_honey";
    if (has("sugar", "sucrose", "glucose", "fructose", "dextrose", "maltose", "şeker")) return "sugar";
    if (has("milk", "cream", "cheese", "yogurt", "yoghurt", "whey", "lactose", "casein", "dairy", "süt", "yoğurt", "peynir")) return "dairy";
    if (has("oil", "fat", "butter", "margarine", "palm", "shortening", "ghee", "yağ")) return "fat_oil";
    if (has("flour", "semolina", " meal", "irmik")) return "flour";
    if (has("oat", "wheat", "rice", "corn", "maize", "barley", "rye", "grain", "cereal", "bran", "bulgur", "starch", "yulaf", "buğday", "pirinç", "mısır", "nişasta")) return "base_grain";
    if (has("almond", "hazelnut", "walnut", "peanut", "cashew", "pistachio", "nut", "seed", "sesame", "tahini", "fındık", "badem", "ceviz", "fıstık", "tohum")) return "nuts_seeds";
    if (has("raisin", "date", "cranberry", "sultana", "dried", "kuru üzüm", "kurutulmuş")) return "dried_fruit";
    if (has("apple", "banana", "strawberry", "berry", "mango", "fruit", "cherry", "apricot", "peach", "meyve", "elma", "muz", "çilek")) return "fruit";
    if (has("salt", "sodium chloride", "tuz")) return "salt";
    if (has("protein", "collagen")) return "protein";
    if (has("fiber", "fibre", "inulin", "pectin", "lif")) return "fiber";
    return "other";
};

// E-numarası (E472e, E-524, E 150d) ya da additive tipi → katkı maddesi say.
const isAdditiveIngredient = (ing: any): boolean => {
    const key = `${ing?.technical_name || ""} ${ing?.display_name || ing?.name || ""}`;
    if (/\bE-?\s?\d{3}/i.test(key)) return true;
    if (inferLayerType(key) === "additives") return true;
    return false;
};

// Model 'composition' döndürmediğinde içindekiler SIRASINDAN tahmini kompozisyon üret.
// İçindekiler yasal olarak azalan ağırlık sırasındadır → ilk madde BASKIN olur (geometrik azalma).
// Katkı maddeleri (E-no'lu) ana katman değil, tek bir ince katmanda toplanır.
// Hepsi 'order_estimate' (tahmini) ve geniş aralıklı; UI bunu "tahmini" olarak işaretler.
export const deriveCompositionFromIngredients = (
    ingredients: any[] | undefined | null,
    additives: any[] | undefined | null,
    additivesLabel: string,
): CompositionLayer[] => {
    if (!Array.isArray(ingredients) || ingredients.length === 0) return [];

    const classified = ingredients
        .map((ing) => {
            const display = ing?.display_name || ing?.name || ing?.technical_name || "";
            const key = `${ing?.technical_name || ""} ${ing?.display_name || ing?.name || ""}`;
            return {
                display_name: String(display),
                type: inferLayerType(key),
                additive: isAdditiveIngredient(ing),
            };
        })
        .filter((m) => m.display_name);

    if (classified.length === 0) return [];

    // Gerçek (katkı olmayan) maddeler ana katman; katkılar tek katmanda toplanır.
    let realMains = classified.filter((m) => !m.additive).slice(0, 5);
    if (realMains.length === 0) realMains = classified.slice(0, 5);

    const hasAdditives =
        (Array.isArray(additives) && additives.length > 0) || classified.some((m) => m.additive);
    const additiveShare = hasAdditives ? 3 : 0;
    const mainBudget = 100 - additiveShare;

    // Geometrik azalan (r=0.5): ilk madde ~%50, sonrakiler yarılanarak azalır → gerçekçi.
    const r = 0.5;
    const weights = realMains.map((_, i) => Math.pow(r, i));
    const wsum = weights.reduce((s, w) => s + w, 0) || 1;

    const layers: CompositionLayer[] = realMains.map((m, i) => {
        const est = (weights[i] / wsum) * mainBudget;
        return {
            display_name: m.display_name,
            type: m.type,
            percent_min: Math.max(1, Math.round(est * 0.72)),
            percent_max: Math.round(est * 1.28),
            source: "order_estimate" as const,
        };
    });

    if (hasAdditives) {
        layers.push({
            display_name: additivesLabel,
            type: "additives",
            percent_min: 0,
            percent_max: additiveShare,
            source: "order_estimate",
        });
    }

    return layers;
};
