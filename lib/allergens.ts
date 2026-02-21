export type AllergenType = "GLUTEN" | "CRUSTACEANS" | "EGGS" | "FISH" | "PEANUTS" | "SOYBEANS" | "MILK" | "TREE_NUTS" | "CELERY" | "MUSTARD" | "SESAME" | "SULPHITES" | "LUPIN" | "MOLLUSCS" | "CORN" | "NIGHTSHADES" | "COCONUT" | "BANANA" | "AVOCADO" | "KIWI" | "LATEX_FRUITS" | "NICKEL";

export interface AllergenDefinition {
    type: AllergenType;
    name: string;
    nameTr: string;
    nameEs: string;
    description: string;
    descriptionTr: string;
    descriptionEs: string;
    euRegulated: boolean;
    severity: "severe" | "moderate" | "mild";
}

export const ALLERGEN_DEFINITIONS: Record<AllergenType, AllergenDefinition> = {
    GLUTEN: { type: "GLUTEN", name: "Gluten", nameTr: "Gluten", nameEs: "Gluten", description: "Wheat, barley, rye, oats", descriptionTr: "Buğday, arpa, çavdar, yulaf", descriptionEs: "Trigo, cebada, centeno, avena", euRegulated: true, severity: "severe" },
    CRUSTACEANS: { type: "CRUSTACEANS", name: "Crustaceans", nameTr: "Kabuklular", nameEs: "Crustáceos", description: "Shrimp, crab, lobster", descriptionTr: "Karides, yengeç, ıstakoz", descriptionEs: "Camarones, cangrejo, langosta", euRegulated: true, severity: "severe" },
    EGGS: { type: "EGGS", name: "Eggs", nameTr: "Yumurta", nameEs: "Huevos", description: "Chicken eggs and derivatives", descriptionTr: "Tavuk yumurtası ve türevleri", descriptionEs: "Huevos de gallina y derivados", euRegulated: true, severity: "moderate" },
    FISH: { type: "FISH", name: "Fish", nameTr: "Balık", nameEs: "Pescado", description: "All fish species", descriptionTr: "Tüm balık türleri", descriptionEs: "Todas las especies de pescado", euRegulated: true, severity: "severe" },
    PEANUTS: { type: "PEANUTS", name: "Peanuts", nameTr: "Yer Fıstığı", nameEs: "Cacahuetes", description: "Peanuts and derivatives", descriptionTr: "Yer fıstığı ve türevleri", descriptionEs: "Cacahuetes y derivados", euRegulated: true, severity: "severe" },
    SOYBEANS: { type: "SOYBEANS", name: "Soybeans", nameTr: "Soya", nameEs: "Soja", description: "Soy and derivatives", descriptionTr: "Soya ve türevleri", descriptionEs: "Soja y derivados", euRegulated: true, severity: "moderate" },
    MILK: { type: "MILK", name: "Milk", nameTr: "Süt", nameEs: "Leche", description: "Cow's milk and dairy", descriptionTr: "İnek sütü ve süt ürünleri", descriptionEs: "Leche de vaca y lácteos", euRegulated: true, severity: "moderate" },
    TREE_NUTS: { type: "TREE_NUTS", name: "Tree Nuts", nameTr: "Ağaç Kabukluları", nameEs: "Frutos secos", description: "Almonds, hazelnuts, walnuts, etc.", descriptionTr: "Badem, fındık, ceviz vb.", descriptionEs: "Almendras, avellanas, nueces, etc.", euRegulated: true, severity: "severe" },
    CELERY: { type: "CELERY", name: "Celery", nameTr: "Kereviz", nameEs: "Apio", description: "Celery and celeriac", descriptionTr: "Kereviz ve kereviz kökü", descriptionEs: "Apio y raíz de apio", euRegulated: true, severity: "moderate" },
    MUSTARD: { type: "MUSTARD", name: "Mustard", nameTr: "Hardal", nameEs: "Mostaza", description: "Mustard seeds and derivatives", descriptionTr: "Hardal tohumu ve türevleri", descriptionEs: "Semillas de mostaza y derivados", euRegulated: true, severity: "moderate" },
    SESAME: { type: "SESAME", name: "Sesame", nameTr: "Susam", nameEs: "Sésamo", description: "Sesame seeds and oil", descriptionTr: "Susam tohumu ve yağı", descriptionEs: "Semillas de sésamo y aceite", euRegulated: true, severity: "severe" },
    SULPHITES: { type: "SULPHITES", name: "Sulphites", nameTr: "Sülfitler", nameEs: "Sulfitos", description: "Sulphur dioxide and sulphites >10ppm", descriptionTr: "Kükürt dioksit ve sülfitler >10ppm", descriptionEs: "Dióxido de azufre y sulfitos >10ppm", euRegulated: true, severity: "moderate" },
    LUPIN: { type: "LUPIN", name: "Lupin", nameTr: "Acı Bakla", nameEs: "Altramuz", description: "Lupin beans and flour", descriptionTr: "Acı bakla ve unu", descriptionEs: "Altramuz y harina de altramuz", euRegulated: true, severity: "severe" },
    MOLLUSCS: { type: "MOLLUSCS", name: "Molluscs", nameTr: "Yumuşakçalar", nameEs: "Moluscos", description: "Squid, octopus, oysters, mussels", descriptionTr: "Kalamar, ahtapot, istiridye, midye", descriptionEs: "Calamar, pulpo, ostras, mejillones", euRegulated: true, severity: "severe" },
    CORN: { type: "CORN", name: "Corn", nameTr: "Mısır", nameEs: "Maíz", description: "Corn and derivatives", descriptionTr: "Mısır ve türevleri", descriptionEs: "Maíz y derivados", euRegulated: false, severity: "moderate" },
    NIGHTSHADES: { type: "NIGHTSHADES", name: "Nightshades", nameTr: "Patlıcangiller", nameEs: "Solanáceas", description: "Tomatoes, peppers, potatoes, eggplant", descriptionTr: "Domates, biber, patates, patlıcan", descriptionEs: "Tomates, pimientos, patatas, berenjenas", euRegulated: false, severity: "mild" },
    COCONUT: { type: "COCONUT", name: "Coconut", nameTr: "Hindistan Cevizi", nameEs: "Coco", description: "Coconut and derivatives", descriptionTr: "Hindistan cevizi ve türevleri", descriptionEs: "Coco y derivados", euRegulated: false, severity: "moderate" },
    BANANA: { type: "BANANA", name: "Banana", nameTr: "Muz", nameEs: "Plátano", description: "Banana - latex cross-reaction", descriptionTr: "Muz - lateks çapraz reaksiyonu", descriptionEs: "Plátano - reacción cruzada con látex", euRegulated: false, severity: "moderate" },
    AVOCADO: { type: "AVOCADO", name: "Avocado", nameTr: "Avokado", nameEs: "Aguacate", description: "Avocado - latex cross-reaction", descriptionTr: "Avokado - lateks çapraz reaksiyonu", descriptionEs: "Aguacate - reacción cruzada con látex", euRegulated: false, severity: "moderate" },
    KIWI: { type: "KIWI", name: "Kiwi", nameTr: "Kivi", nameEs: "Kiwi", description: "Kiwifruit - latex cross-reaction", descriptionTr: "Kivi - lateks çapraz reaksiyonu", descriptionEs: "Kiwi - reacción cruzada con látex", euRegulated: false, severity: "moderate" },
    LATEX_FRUITS: { type: "LATEX_FRUITS", name: "Latex-Reactive Fruits", nameTr: "Lateks Çapraz Meyveler", nameEs: "Frutas reactivas al látex", description: "Fruits that cross-react with latex allergy", descriptionTr: "Lateks alerjisi ile çapraz reaksiyon veren meyveler", descriptionEs: "Frutas que reaccionan cruzadamente con alergia al látex", euRegulated: false, severity: "moderate" },
    NICKEL: { type: "NICKEL", name: "Nickel", nameTr: "Nikel", nameEs: "Níquel", description: "High-nickel foods", descriptionTr: "Yüksek nikel içeren gıdalar", descriptionEs: "Alimentos con alto contenido de níquel", euRegulated: false, severity: "mild" },
};

export function getAllergenDefinition(type: AllergenType): AllergenDefinition {
    return ALLERGEN_DEFINITIONS[type];
}

export function getAllAllergenTypes(): AllergenType[] {
    return Object.keys(ALLERGEN_DEFINITIONS) as AllergenType[];
}
