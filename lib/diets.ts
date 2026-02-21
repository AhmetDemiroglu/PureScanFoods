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
    nameEs: string;
    description: string;
    descriptionTr: string;
    descriptionEs: string;
    aiExplanation: string;
    aiExplanationTr: string;
    aiExplanationEs: string;
    severity: "strict" | "moderate";
}

export const DIET_DEFINITIONS: Record<DietType, DietDefinition> = {
    VEGAN: {
        type: "VEGAN",
        name: "Vegan",
        nameTr: "Vegan",
        nameEs: "Vegano",
        description: "No animal products",
        descriptionTr: "Hiçbir hayvansal ürün yok",
        descriptionEs: "Sin productos de origen animal",
        aiExplanation: "AI scans for meat, dairy, eggs, honey, and animal-derived additives (e.g. E120).",
        aiExplanationTr: "Yapay zeka; et, süt, yumurta, bal ve hayvansal katkıları tarar.",
        aiExplanationEs: "La IA escanea carne, lácteos, huevos, miel y aditivos de origen animal (ej. E120).",
        severity: "strict",
    },
    VEGETARIAN: {
        type: "VEGETARIAN",
        name: "Vegetarian",
        nameTr: "Vejetaryen",
        nameEs: "Vegetariano",
        description: "No meat or fish",
        descriptionTr: "Et ve balık yok",
        descriptionEs: "Sin carne ni pescado",
        aiExplanation: "AI scans for all types of meat, poultry, fish, and slaughter by-products.",
        aiExplanationTr: "Yapay zeka; her türlü et, kümes hayvanı ve balığı tarar.",
        aiExplanationEs: "La IA escanea todo tipo de carne, aves, pescado y subproductos de matadero.",
        severity: "strict",
    },
    PESCATARIAN: {
        type: "PESCATARIAN",
        name: "Pescatarian",
        nameTr: "Pesketaryen",
        nameEs: "Pescetariano",
        description: "No meat, fish allowed",
        descriptionTr: "Et yok, balık serbest",
        descriptionEs: "Sin carne, pescado permitido",
        aiExplanation: "AI flags red meat and poultry but allows fish and seafood.",
        aiExplanationTr: "Kırmızı et ve kümes hayvanları işaretlenir, balık serbesttir.",
        aiExplanationEs: "La IA marca carne roja y aves, pero permite pescado y mariscos.",
        severity: "strict",
    },
    KETO: {
        type: "KETO",
        name: "Ketogenic",
        nameTr: "Ketojenik",
        nameEs: "Cetogénica",
        description: "Very low carb, high fat",
        descriptionTr: "Çok düşük karbonhidrat, yüksek yağ",
        descriptionEs: "Muy baja en carbohidratos, alta en grasas",
        aiExplanation: "AI checks for sugar, grains, starches, and high-carb additives.",
        aiExplanationTr: "Şeker, tahıl, nişasta ve yüksek karbonhidratlı katkılar taranır.",
        aiExplanationEs: "La IA verifica azúcar, granos, almidones y aditivos altos en carbohidratos.",
        severity: "strict",
    },
    LOW_CARB: {
        type: "LOW_CARB",
        name: "Low Carb",
        nameTr: "Düşük Karbonhidrat",
        nameEs: "Baja en Carbohidratos",
        description: "Reduced carbohydrate intake",
        descriptionTr: "Azaltılmış karbonhidrat alımı",
        descriptionEs: "Reducción en el consumo de carbohidratos",
        aiExplanation: "AI identifies added sugars and refined grains.",
        aiExplanationTr: "Eklenmiş şekerler ve rafine tahıllar tespit edilir.",
        aiExplanationEs: "La IA identifica azúcares añadidos y granos refinados.",
        severity: "moderate",
    },
    ATKINS: {
        type: "ATKINS",
        name: "Atkins",
        nameTr: "Atkins",
        nameEs: "Atkins",
        description: "Low carb, high protein",
        descriptionTr: "Düşük karbonhidrat, yüksek protein",
        descriptionEs: "Baja en carbohidratos, alta en proteínas",
        aiExplanation: "AI looks for high-carb ingredients like sugar, flour, and syrup.",
        aiExplanationTr: "Şeker, un ve şurup gibi yüksek karbonhidratlılar aranır.",
        aiExplanationEs: "La IA busca ingredientes altos en carbohidratos como azúcar, harina y jarabe.",
        severity: "strict",
    },
    DUKAN: {
        type: "DUKAN",
        name: "Dukan",
        nameTr: "Dukan",
        nameEs: "Dukan",
        description: "High protein, low carb/fat phases",
        descriptionTr: "Yüksek protein, aşamalı",
        descriptionEs: "Alta en proteínas, fases baja en carbos/grasas",
        aiExplanation: "AI focuses on prohibiting sugar, oils, and non-protein sources.",
        aiExplanationTr: "Şeker, yağ ve protein dışı kaynaklar kontrol edilir.",
        aiExplanationEs: "La IA se enfoca en prohibir azúcar, aceites y fuentes no proteicas.",
        severity: "moderate",
    },
    PALEO: {
        type: "PALEO",
        name: "Paleo",
        nameTr: "Paleo",
        nameEs: "Paleo",
        description: "No grains, dairy, legumes",
        descriptionTr: "Tahıl, süt, baklagil yok",
        descriptionEs: "Sin granos, lácteos ni legumbres",
        aiExplanation: "AI scans for processed foods, grains, dairy, and legumes.",
        aiExplanationTr: "İşlenmiş gıdalar, tahıllar, süt ürünleri ve baklagiller taranır.",
        aiExplanationEs: "La IA escanea alimentos procesados, granos, lácteos y legumbres.",
        severity: "strict",
    },
    WHOLE30: {
        type: "WHOLE30",
        name: "Whole30",
        nameTr: "Whole30",
        nameEs: "Whole30",
        description: "30-day elimination diet",
        descriptionTr: "30 günlük eliminasyon",
        descriptionEs: "Dieta de eliminación de 30 días",
        aiExplanation: "AI strictly flags sugar, alcohol, grains, legumes, and dairy.",
        aiExplanationTr: "Şeker, alkol, tahıl ve süt ürünleri katı şekilde işaretlenir.",
        aiExplanationEs: "La IA marca estrictamente azúcar, alcohol, granos, legumbres y lácteos.",
        severity: "strict",
    },
    MEDITERRANEAN: {
        type: "MEDITERRANEAN",
        name: "Mediterranean",
        nameTr: "Akdeniz",
        nameEs: "Mediterránea",
        description: "Balanced, olive oil, fish",
        descriptionTr: "Dengeli, zeytinyağı, balık",
        descriptionEs: "Equilibrada, aceite de oliva, pescado",
        aiExplanation: "AI flags heavily processed foods and red meats.",
        aiExplanationTr: "Aşırı işlenmiş gıdalar ve kırmızı etler işaretlenir.",
        aiExplanationEs: "La IA marca alimentos altamente procesados y carnes rojas.",
        severity: "moderate",
    },
    RAW_FOOD: {
        type: "RAW_FOOD",
        name: "Raw Food",
        nameTr: "Çiğ Beslenme",
        nameEs: "Alimentos Crudos",
        description: "Uncooked, unprocessed",
        descriptionTr: "Pişirilmemiş, işlenmemiş",
        descriptionEs: "Sin cocinar, sin procesar",
        aiExplanation: "AI flags roasted, baked, or cooked ingredients.",
        aiExplanationTr: "Kavrulmuş veya pişirilmiş bileşenler işaretlenir.",
        aiExplanationEs: "La IA marca ingredientes asados, horneados o cocinados.",
        severity: "moderate",
    },
    GLUTEN_FREE: {
        type: "GLUTEN_FREE",
        name: "Gluten Free",
        nameTr: "Glutensiz",
        nameEs: "Sin Gluten",
        description: "No gluten-containing grains",
        descriptionTr: "Gluten içeren tahıl yok",
        descriptionEs: "Sin granos que contengan gluten",
        aiExplanation: "AI scans for wheat, barley, rye, and hidden gluten.",
        aiExplanationTr: "Buğday, arpa, çavdar ve gizli gluten taranır.",
        aiExplanationEs: "La IA escanea trigo, cebada, centeno y gluten oculto.",
        severity: "strict",
    },
    LACTOSE_FREE: {
        type: "LACTOSE_FREE",
        name: "Lactose Free",
        nameTr: "Laktozsuz",
        nameEs: "Sin Lactosa",
        description: "No lactose (milk sugar)",
        descriptionTr: "Laktoz (süt şekeri) yok",
        descriptionEs: "Sin lactosa (azúcar de leche)",
        aiExplanation: "AI checks for milk, cream, whey, and milk solids.",
        aiExplanationTr: "Süt, krema, peynir altı suyu ve süt katıları kontrol edilir.",
        aiExplanationEs: "La IA verifica leche, crema, suero de leche y sólidos lácteos.",
        severity: "strict",
    },
    DAIRY_FREE: {
        type: "DAIRY_FREE",
        name: "Dairy Free",
        nameTr: "Süt Ürünsüz",
        nameEs: "Sin Lácteos",
        description: "No dairy products",
        descriptionTr: "Süt ürünleri yok",
        descriptionEs: "Sin productos lácteos",
        aiExplanation: "AI scans for all milk-derived ingredients.",
        aiExplanationTr: "Tüm süt türevleri taranır.",
        aiExplanationEs: "La IA escanea todos los ingredientes derivados de la leche.",
        severity: "strict",
    },
    SUGAR_FREE: {
        type: "SUGAR_FREE",
        name: "Sugar Free",
        nameTr: "Şekersiz",
        nameEs: "Sin Azúcar",
        description: "No added sugars",
        descriptionTr: "Eklenen şeker yok",
        descriptionEs: "Sin azúcares añadidos",
        aiExplanation: "AI detects various names for sugar (syrups, -ose).",
        aiExplanationTr: "Şekerin farklı isimleri (şuruplar, -ose) tespit edilir.",
        aiExplanationEs: "La IA detecta varios nombres para azúcar (jarabes, -osa).",
        severity: "strict",
    },
    LOW_SODIUM: {
        type: "LOW_SODIUM",
        name: "Low Sodium",
        nameTr: "Az Tuzlu",
        nameEs: "Bajo en Sodio",
        description: "Reduced sodium intake",
        descriptionTr: "Azaltılmış sodyum",
        descriptionEs: "Reducción en el consumo de sodio",
        aiExplanation: "AI looks for salt, MSG, and sodium-based preservatives.",
        aiExplanationTr: "Tuz, MSG ve sodyum bazlı koruyucular aranır.",
        aiExplanationEs: "La IA busca sal, MSG y conservantes a base de sodio.",
        severity: "moderate",
    },
    FODMAP: {
        type: "FODMAP",
        name: "Low FODMAP",
        nameTr: "Düşük FODMAP",
        nameEs: "Bajo en FODMAP",
        description: "For IBS - limited carbs",
        descriptionTr: "IBS için - kısıtlı",
        descriptionEs: "Para SII - carbohidratos limitados",
        aiExplanation: "AI scans for high-FODMAP ingredients like onions, garlic, wheat.",
        aiExplanationTr: "Soğan, sarımsak ve buğday gibi yüksek FODMAP içerenler taranır.",
        aiExplanationEs: "La IA escanea ingredientes altos en FODMAP como cebolla, ajo, trigo.",
        severity: "strict",
    },
    HALAL: {
        type: "HALAL",
        name: "Halal",
        nameTr: "Helal",
        nameEs: "Halal",
        description: "Islamic dietary laws",
        descriptionTr: "İslami kurallar",
        descriptionEs: "Leyes dietéticas islámicas",
        aiExplanation: "AI checks for pork, alcohol, and non-halal additives.",
        aiExplanationTr: "Domuz eti, alkol ve helal olmayan katkılar kontrol edilir.",
        aiExplanationEs: "La IA verifica cerdo, alcohol y aditivos no halal.",
        severity: "strict",
    },
    KOSHER: {
        type: "KOSHER",
        name: "Kosher",
        nameTr: "Koşer",
        nameEs: "Kosher",
        description: "Jewish dietary laws",
        descriptionTr: "Yahudi kuralları",
        descriptionEs: "Leyes dietéticas judías",
        aiExplanation: "AI checks for pork, shellfish, and meat/dairy mixing.",
        aiExplanationTr: "Domuz eti, kabuklular ve et/süt karışımı kontrol edilir.",
        aiExplanationEs: "La IA verifica cerdo, mariscos y mezcla de carne/lácteos.",
        severity: "strict",
    },
};

export function getDietDefinition(type: DietType): DietDefinition {
    return DIET_DEFINITIONS[type];
}

export function getAllDietTypes(): DietType[] {
    return Object.keys(DIET_DEFINITIONS) as DietType[];
}
