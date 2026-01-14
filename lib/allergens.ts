export type AllergenType = "GLUTEN" | "CRUSTACEANS" | "EGGS" | "FISH" | "PEANUTS" | "SOYBEANS" | "MILK" | "TREE_NUTS" | "CELERY" | "MUSTARD" | "SESAME" | "SULPHITES" | "LUPIN" | "MOLLUSCS" | "CORN" | "NIGHTSHADES" | "COCONUT" | "BANANA" | "AVOCADO" | "KIWI" | "LATEX_FRUITS" | "NICKEL";

export interface AllergenDefinition {
    type: AllergenType;
    name: string;
    nameTr: string;
    description: string;
    descriptionTr: string;
    euRegulated: boolean;
    severity: "severe" | "moderate" | "mild";
}

export const ALLERGEN_DEFINITIONS: Record<AllergenType, AllergenDefinition> = {
    GLUTEN: { type: "GLUTEN", name: "Gluten", nameTr: "Gluten", description: "Wheat, barley, rye, oats", descriptionTr: "Buğday, arpa, çavdar, yulaf", euRegulated: true, severity: "severe" },
    CRUSTACEANS: { type: "CRUSTACEANS", name: "Crustaceans", nameTr: "Kabuklular", description: "Shrimp, crab, lobster", descriptionTr: "Karides, yengeç, ıstakoz", euRegulated: true, severity: "severe" },
    EGGS: { type: "EGGS", name: "Eggs", nameTr: "Yumurta", description: "Chicken eggs and derivatives", descriptionTr: "Tavuk yumurtası ve türevleri", euRegulated: true, severity: "moderate" },
    FISH: { type: "FISH", name: "Fish", nameTr: "Balık", description: "All fish species", descriptionTr: "Tüm balık türleri", euRegulated: true, severity: "severe" },
    PEANUTS: { type: "PEANUTS", name: "Peanuts", nameTr: "Yer Fıstığı", description: "Peanuts and derivatives", descriptionTr: "Yer fıstığı ve türevleri", euRegulated: true, severity: "severe" },
    SOYBEANS: { type: "SOYBEANS", name: "Soybeans", nameTr: "Soya", description: "Soy and derivatives", descriptionTr: "Soya ve türevleri", euRegulated: true, severity: "moderate" },
    MILK: { type: "MILK", name: "Milk", nameTr: "Süt", description: "Cow's milk and dairy", descriptionTr: "İnek sütü ve süt ürünleri", euRegulated: true, severity: "moderate" },
    TREE_NUTS: { type: "TREE_NUTS", name: "Tree Nuts", nameTr: "Ağaç Kabukluları", description: "Almonds, hazelnuts, walnuts, etc.", descriptionTr: "Badem, fındık, ceviz vb.", euRegulated: true, severity: "severe" },
    CELERY: { type: "CELERY", name: "Celery", nameTr: "Kereviz", description: "Celery and celeriac", descriptionTr: "Kereviz ve kereviz kökü", euRegulated: true, severity: "moderate" },
    MUSTARD: { type: "MUSTARD", name: "Mustard", nameTr: "Hardal", description: "Mustard seeds and derivatives", descriptionTr: "Hardal tohumu ve türevleri", euRegulated: true, severity: "moderate" },
    SESAME: { type: "SESAME", name: "Sesame", nameTr: "Susam", description: "Sesame seeds and oil", descriptionTr: "Susam tohumu ve yağı", euRegulated: true, severity: "severe" },
    SULPHITES: { type: "SULPHITES", name: "Sulphites", nameTr: "Sülfitler", description: "Sulphur dioxide and sulphites >10ppm", descriptionTr: "Kükürt dioksit ve sülfitler >10ppm", euRegulated: true, severity: "moderate" },
    LUPIN: { type: "LUPIN", name: "Lupin", nameTr: "Acı Bakla", description: "Lupin beans and flour", descriptionTr: "Acı bakla ve unu", euRegulated: true, severity: "severe" },
    MOLLUSCS: { type: "MOLLUSCS", name: "Molluscs", nameTr: "Yumuşakçalar", description: "Squid, octopus, oysters, mussels", descriptionTr: "Kalamar, ahtapot, istiridye, midye", euRegulated: true, severity: "severe" },
    CORN: { type: "CORN", name: "Corn", nameTr: "Mısır", description: "Corn and derivatives", descriptionTr: "Mısır ve türevleri", euRegulated: false, severity: "moderate" },
    NIGHTSHADES: { type: "NIGHTSHADES", name: "Nightshades", nameTr: "Patlıcangiller", description: "Tomatoes, peppers, potatoes, eggplant", descriptionTr: "Domates, biber, patates, patlıcan", euRegulated: false, severity: "mild" },
    COCONUT: { type: "COCONUT", name: "Coconut", nameTr: "Hindistan Cevizi", description: "Coconut and derivatives", descriptionTr: "Hindistan cevizi ve türevleri", euRegulated: false, severity: "moderate" },
    BANANA: { type: "BANANA", name: "Banana", nameTr: "Muz", description: "Banana - latex cross-reaction", descriptionTr: "Muz - lateks çapraz reaksiyonu", euRegulated: false, severity: "moderate" },
    AVOCADO: { type: "AVOCADO", name: "Avocado", nameTr: "Avokado", description: "Avocado - latex cross-reaction", descriptionTr: "Avokado - lateks çapraz reaksiyonu", euRegulated: false, severity: "moderate" },
    KIWI: { type: "KIWI", name: "Kiwi", nameTr: "Kivi", description: "Kiwifruit - latex cross-reaction", descriptionTr: "Kivi - lateks çapraz reaksiyonu", euRegulated: false, severity: "moderate" },
    LATEX_FRUITS: { type: "LATEX_FRUITS", name: "Latex-Reactive Fruits", nameTr: "Lateks Çapraz Meyveler", description: "Fruits that cross-react with latex allergy", descriptionTr: "Lateks alerjisi ile çapraz reaksiyon veren meyveler", euRegulated: false, severity: "moderate" },
    NICKEL: { type: "NICKEL", name: "Nickel", nameTr: "Nikel", description: "High-nickel foods", descriptionTr: "Yüksek nikel içeren gıdalar", euRegulated: false, severity: "mild" },
};

export function getAllergenDefinition(type: AllergenType): AllergenDefinition {
    return ALLERGEN_DEFINITIONS[type];
}

export function getAllAllergenTypes(): AllergenType[] {
    return Object.keys(ALLERGEN_DEFINITIONS) as AllergenType[];
}
