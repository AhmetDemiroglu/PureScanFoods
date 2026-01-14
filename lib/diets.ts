export type DietType =
    | "VEGAN"
    | "VEGETARIAN"
    | "PESCATARIAN"
    | "KETO"
    | "LOW_CARB"
    | "PALEO"
    | "WHOLE30"
    | "MEDITERRANEAN"
    | "DUKAN"
    | "ATKINS"
    | "GLUTEN_FREE"
    | "LACTOSE_FREE"
    | "DAIRY_FREE"
    | "SUGAR_FREE"
    | "LOW_SODIUM"
    | "HALAL"
    | "KOSHER"
    | "RAW_FOOD"
    | "FODMAP";

export interface DietDefinition {
    type: DietType;
    name: string;
    nameTr: string;
    description: string;
    descriptionTr: string;
    aiExplanation: string;
    aiExplanationTr: string;
    severity: "strict" | "moderate";
}

export const DIET_DEFINITIONS: Record<DietType, DietDefinition> = {
    VEGAN: {
        type: "VEGAN",
        name: "Vegan",
        nameTr: "Vegan",
        description: "No animal products",
        descriptionTr: "Hiçbir hayvansal ürün yok",
        aiExplanation: "AI scans for meat, dairy, eggs, honey, and animal-derived additives (e.g. E120).",
        aiExplanationTr: "Yapay zeka; et, süt, yumurta, bal ve hayvansal katkıları tarar.",
        severity: "strict",
    },
    VEGETARIAN: {
        type: "VEGETARIAN",
        name: "Vegetarian",
        nameTr: "Vejetaryen",
        description: "No meat or fish",
        descriptionTr: "Et ve balık yok",
        aiExplanation: "AI scans for all types of meat, poultry, fish, and slaughter by-products.",
        aiExplanationTr: "Yapay zeka; her türlü et, kümes hayvanı ve balığı tarar.",
        severity: "strict",
    },
    PESCATARIAN: {
        type: "PESCATARIAN",
        name: "Pescatarian",
        nameTr: "Pesketaryen",
        description: "No meat, fish allowed",
        descriptionTr: "Et yok, balık serbest",
        aiExplanation: "AI flags red meat and poultry but allows fish and seafood.",
        aiExplanationTr: "Kırmızı et ve kümes hayvanları işaretlenir, balık serbesttir.",
        severity: "strict",
    },
    KETO: {
        type: "KETO",
        name: "Ketogenic",
        nameTr: "Ketojenik",
        description: "Very low carb, high fat",
        descriptionTr: "Çok düşük karbonhidrat, yüksek yağ",
        aiExplanation: "AI checks for sugar, grains, starches, and high-carb additives.",
        aiExplanationTr: "Şeker, tahıl, nişasta ve yüksek karbonhidratlı katkılar taranır.",
        severity: "strict",
    },
    LOW_CARB: {
        type: "LOW_CARB",
        name: "Low Carb",
        nameTr: "Düşük Karbonhidrat",
        description: "Reduced carbohydrate intake",
        descriptionTr: "Azaltılmış karbonhidrat alımı",
        aiExplanation: "AI identifies added sugars and refined grains.",
        aiExplanationTr: "Eklenmiş şekerler ve rafine tahıllar tespit edilir.",
        severity: "moderate",
    },
    ATKINS: {
        type: "ATKINS",
        name: "Atkins",
        nameTr: "Atkins",
        description: "Low carb, high protein",
        descriptionTr: "Düşük karbonhidrat, yüksek protein",
        aiExplanation: "AI looks for high-carb ingredients like sugar, flour, and syrup.",
        aiExplanationTr: "Şeker, un ve şurup gibi yüksek karbonhidratlılar aranır.",
        severity: "strict",
    },
    DUKAN: {
        type: "DUKAN",
        name: "Dukan",
        nameTr: "Dukan",
        description: "High protein, low carb/fat phases",
        descriptionTr: "Yüksek protein, aşamalı",
        aiExplanation: "AI focuses on prohibiting sugar, oils, and non-protein sources.",
        aiExplanationTr: "Şeker, yağ ve protein dışı kaynaklar kontrol edilir.",
        severity: "moderate",
    },
    PALEO: {
        type: "PALEO",
        name: "Paleo",
        nameTr: "Paleo",
        description: "No grains, dairy, legumes",
        descriptionTr: "Tahıl, süt, baklagil yok",
        aiExplanation: "AI scans for processed foods, grains, dairy, and legumes.",
        aiExplanationTr: "İşlenmiş gıdalar, tahıllar, süt ürünleri ve baklagiller taranır.",
        severity: "strict",
    },
    WHOLE30: {
        type: "WHOLE30",
        name: "Whole30",
        nameTr: "Whole30",
        description: "30-day elimination diet",
        descriptionTr: "30 günlük eliminasyon",
        aiExplanation: "AI strictly flags sugar, alcohol, grains, legumes, and dairy.",
        aiExplanationTr: "Şeker, alkol, tahıl ve süt ürünleri katı şekilde işaretlenir.",
        severity: "strict",
    },
    MEDITERRANEAN: {
        type: "MEDITERRANEAN",
        name: "Mediterranean",
        nameTr: "Akdeniz",
        description: "Balanced, olive oil, fish",
        descriptionTr: "Dengeli, zeytinyağı, balık",
        aiExplanation: "AI flags heavily processed foods and red meats.",
        aiExplanationTr: "Aşırı işlenmiş gıdalar ve kırmızı etler işaretlenir.",
        severity: "moderate",
    },
    RAW_FOOD: {
        type: "RAW_FOOD",
        name: "Raw Food",
        nameTr: "Çiğ Beslenme",
        description: "Uncooked, unprocessed",
        descriptionTr: "Pişirilmemiş, işlenmemiş",
        aiExplanation: "AI flags roasted, baked, or cooked ingredients.",
        aiExplanationTr: "Kavrulmuş veya pişirilmiş bileşenler işaretlenir.",
        severity: "moderate",
    },
    GLUTEN_FREE: {
        type: "GLUTEN_FREE",
        name: "Gluten Free",
        nameTr: "Glutensiz",
        description: "No gluten-containing grains",
        descriptionTr: "Gluten içeren tahıl yok",
        aiExplanation: "AI scans for wheat, barley, rye, and hidden gluten.",
        aiExplanationTr: "Buğday, arpa, çavdar ve gizli gluten taranır.",
        severity: "strict",
    },
    LACTOSE_FREE: {
        type: "LACTOSE_FREE",
        name: "Lactose Free",
        nameTr: "Laktozsuz",
        description: "No lactose (milk sugar)",
        descriptionTr: "Laktoz (süt şekeri) yok",
        aiExplanation: "AI checks for milk, cream, whey, and milk solids.",
        aiExplanationTr: "Süt, krema, peynir altı suyu ve süt katıları kontrol edilir.",
        severity: "strict",
    },
    DAIRY_FREE: {
        type: "DAIRY_FREE",
        name: "Dairy Free",
        nameTr: "Süt Ürünsüz",
        description: "No dairy products",
        descriptionTr: "Süt ürünleri yok",
        aiExplanation: "AI scans for all milk-derived ingredients.",
        aiExplanationTr: "Tüm süt türevleri taranır.",
        severity: "strict",
    },
    SUGAR_FREE: {
        type: "SUGAR_FREE",
        name: "Sugar Free",
        nameTr: "Şekersiz",
        description: "No added sugars",
        descriptionTr: "Eklenen şeker yok",
        aiExplanation: "AI detects various names for sugar (syrups, -ose).",
        aiExplanationTr: "Şekerin farklı isimleri (şuruplar, -ose) tespit edilir.",
        severity: "strict",
    },
    LOW_SODIUM: {
        type: "LOW_SODIUM",
        name: "Low Sodium",
        nameTr: "Az Tuzlu",
        description: "Reduced sodium intake",
        descriptionTr: "Azaltılmış sodyum",
        aiExplanation: "AI looks for salt, MSG, and sodium-based preservatives.",
        aiExplanationTr: "Tuz, MSG ve sodyum bazlı koruyucular aranır.",
        severity: "moderate",
    },
    FODMAP: {
        type: "FODMAP",
        name: "Low FODMAP",
        nameTr: "Düşük FODMAP",
        description: "For IBS - limited carbs",
        descriptionTr: "IBS için - kısıtlı",
        aiExplanation: "AI scans for high-FODMAP ingredients like onions, garlic, wheat.",
        aiExplanationTr: "Soğan, sarımsak ve buğday gibi yüksek FODMAP içerenler taranır.",
        severity: "strict",
    },
    HALAL: {
        type: "HALAL",
        name: "Halal",
        nameTr: "Helal",
        description: "Islamic dietary laws",
        descriptionTr: "İslami kurallar",
        aiExplanation: "AI checks for pork, alcohol, and non-halal additives.",
        aiExplanationTr: "Domuz eti, alkol ve helal olmayan katkılar kontrol edilir.",
        severity: "strict",
    },
    KOSHER: {
        type: "KOSHER",
        name: "Kosher",
        nameTr: "Koşer",
        description: "Jewish dietary laws",
        descriptionTr: "Yahudi kuralları",
        aiExplanation: "AI checks for pork, shellfish, and meat/dairy mixing.",
        aiExplanationTr: "Domuz eti, kabuklular ve et/süt karışımı kontrol edilir.",
        severity: "strict",
    },
};

export function getDietDefinition(type: DietType): DietDefinition {
    return DIET_DEFINITIONS[type];
}

export function getAllDietTypes(): DietType[] {
    return Object.keys(DIET_DEFINITIONS) as DietType[];
}
