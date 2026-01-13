export type AllergenType = "GLUTEN" | "CRUSTACEANS" | "EGGS" | "FISH" | "PEANUTS" | "SOYBEANS" | "MILK" | "TREE_NUTS" | "CELERY" | "MUSTARD" | "SESAME" | "SULPHITES" | "LUPIN" | "MOLLUSCS" | "CORN" | "NIGHTSHADES" | "COCONUT" | "BANANA" | "AVOCADO" | "KIWI" | "LATEX_FRUITS" | "NICKEL";

export interface AllergenDefinition {
    type: AllergenType;
    name: string;
    nameTr: string;
    description: string;
    descriptionTr: string;
    keywords: string[];
    euRegulated: boolean;
    severity: "severe" | "moderate" | "mild";
}

export const ALLERGEN_DEFINITIONS: Record<AllergenType, AllergenDefinition> = {
    GLUTEN: {
        type: "GLUTEN",
        name: "Gluten",
        nameTr: "Gluten",
        description: "Wheat, barley, rye, oats",
        descriptionTr: "Buğday, arpa, çavdar, yulaf",
        keywords: ["gluten", "wheat", "barley", "rye", "oat", "spelt", "kamut", "triticale", "semolina", "durum", "farina", "flour", "bread", "pasta", "couscous", "bulgur", "seitan", "malt", "brewer's yeast"],
        euRegulated: true,
        severity: "severe",
    },

    CRUSTACEANS: {
        type: "CRUSTACEANS",
        name: "Crustaceans",
        nameTr: "Kabuklular",
        description: "Shrimp, crab, lobster",
        descriptionTr: "Karides, yengeç, ıstakoz",
        keywords: ["crustacean", "shrimp", "prawn", "crab", "lobster", "crayfish", "crawfish", "langoustine", "scampi", "krill"],
        euRegulated: true,
        severity: "severe",
    },

    EGGS: {
        type: "EGGS",
        name: "Eggs",
        nameTr: "Yumurta",
        description: "Chicken eggs and derivatives",
        descriptionTr: "Tavuk yumurtası ve türevleri",
        keywords: ["egg", "albumin", "albumen", "globulin", "lysozyme", "mayonnaise", "meringue", "ovalbumin", "ovomucin", "ovomucoid", "ovovitellin", "livetin", "lecithin", "vitellin"],
        euRegulated: true,
        severity: "moderate",
    },

    FISH: {
        type: "FISH",
        name: "Fish",
        nameTr: "Balık",
        description: "All fish species",
        descriptionTr: "Tüm balık türleri",
        keywords: ["fish", "salmon", "tuna", "cod", "haddock", "mackerel", "sardine", "anchovy", "trout", "bass", "tilapia", "pollock", "sole", "halibut", "herring", "fish sauce", "fish oil", "omega-3", "isinglass", "surimi", "roe", "caviar"],
        euRegulated: true,
        severity: "severe",
    },

    PEANUTS: {
        type: "PEANUTS",
        name: "Peanuts",
        nameTr: "Yer Fıstığı",
        description: "Peanuts and derivatives",
        descriptionTr: "Yer fıstığı ve türevleri",
        keywords: ["peanut", "groundnut", "arachis", "peanut butter", "peanut oil", "peanut flour", "monkey nut", "earth nut", "goober"],
        euRegulated: true,
        severity: "severe",
    },

    SOYBEANS: {
        type: "SOYBEANS",
        name: "Soybeans",
        nameTr: "Soya",
        description: "Soy and derivatives",
        descriptionTr: "Soya ve türevleri",
        keywords: ["soy", "soya", "soybean", "soy sauce", "soy milk", "soy protein", "soy lecithin", "tofu", "tempeh", "miso", "edamame", "textured vegetable protein", "tvp", "hydrolyzed soy"],
        euRegulated: true,
        severity: "moderate",
    },

    MILK: {
        type: "MILK",
        name: "Milk",
        nameTr: "Süt",
        description: "Cow's milk and dairy",
        descriptionTr: "İnek sütü ve süt ürünleri",
        keywords: [
            "milk",
            "cream",
            "butter",
            "cheese",
            "yogurt",
            "yoghurt",
            "whey",
            "casein",
            "caseinate",
            "lactose",
            "lactalbumin",
            "lactoglobulin",
            "ghee",
            "dairy",
            "milk powder",
            "milk solids",
            "buttermilk",
            "sour cream",
            "ice cream",
            "condensed milk",
            "evaporated milk",
            "curds",
            "custard",
            "paneer",
            "kefir",
            "quark",
            "ricotta",
            "mascarpone",
        ],
        euRegulated: true,
        severity: "moderate",
    },

    TREE_NUTS: {
        type: "TREE_NUTS",
        name: "Tree Nuts",
        nameTr: "Ağaç Kabukluları",
        description: "Almonds, hazelnuts, walnuts, etc.",
        descriptionTr: "Badem, fındık, ceviz vb.",
        keywords: ["almond", "hazelnut", "walnut", "cashew", "pistachio", "pecan", "brazil nut", "macadamia", "chestnut", "pine nut", "praline", "marzipan", "nougat", "gianduja", "nut butter", "nut oil", "nut paste", "nut flour", "tree nut"],
        euRegulated: true,
        severity: "severe",
    },

    CELERY: {
        type: "CELERY",
        name: "Celery",
        nameTr: "Kereviz",
        description: "Celery and celeriac",
        descriptionTr: "Kereviz ve kereviz kökü",
        keywords: ["celery", "celeriac", "celery salt", "celery seed", "celery powder"],
        euRegulated: true,
        severity: "moderate",
    },

    MUSTARD: {
        type: "MUSTARD",
        name: "Mustard",
        nameTr: "Hardal",
        description: "Mustard seeds and derivatives",
        descriptionTr: "Hardal tohumu ve türevleri",
        keywords: ["mustard", "mustard seed", "mustard oil", "mustard flour", "mustard powder", "dijon"],
        euRegulated: true,
        severity: "moderate",
    },

    SESAME: {
        type: "SESAME",
        name: "Sesame",
        nameTr: "Susam",
        description: "Sesame seeds and oil",
        descriptionTr: "Susam tohumu ve yağı",
        keywords: ["sesame", "sesame seed", "sesame oil", "tahini", "tahina", "halvah", "halva", "hummus", "benne seed", "gingelly oil"],
        euRegulated: true,
        severity: "severe",
    },

    SULPHITES: {
        type: "SULPHITES",
        name: "Sulphites",
        nameTr: "Sülfitler",
        description: "Sulphur dioxide and sulphites >10ppm",
        descriptionTr: "Kükürt dioksit ve sülfitler >10ppm",
        keywords: ["sulphite", "sulfite", "sulphur dioxide", "sulfur dioxide", "metabisulphite", "metabisulfite", "sodium sulphite", "sodium sulfite", "potassium sulphite", "potassium sulfite", "e220", "e221", "e222", "e223", "e224", "e225", "e226", "e227", "e228"],
        euRegulated: true,
        severity: "moderate",
    },

    LUPIN: {
        type: "LUPIN",
        name: "Lupin",
        nameTr: "Acı Bakla",
        description: "Lupin beans and flour",
        descriptionTr: "Acı bakla ve unu",
        keywords: ["lupin", "lupine", "lupini", "lupin flour", "lupin seed"],
        euRegulated: true,
        severity: "severe",
    },

    MOLLUSCS: {
        type: "MOLLUSCS",
        name: "Molluscs",
        nameTr: "Yumuşakçalar",
        description: "Squid, octopus, oysters, mussels",
        descriptionTr: "Kalamar, ahtapot, istiridye, midye",
        keywords: ["mollusc", "mollusk", "squid", "octopus", "oyster", "mussel", "clam", "scallop", "snail", "escargot", "abalone", "cuttlefish", "calamari"],
        euRegulated: true,
        severity: "severe",
    },

    CORN: {
        type: "CORN",
        name: "Corn",
        nameTr: "Mısır",
        description: "Corn and derivatives",
        descriptionTr: "Mısır ve türevleri",
        keywords: ["corn", "maize", "corn starch", "corn syrup", "corn flour", "cornmeal", "popcorn", "dextrose", "maltodextrin", "high fructose corn syrup", "hfcs", "polenta"],
        euRegulated: false,
        severity: "moderate",
    },

    NIGHTSHADES: {
        type: "NIGHTSHADES",
        name: "Nightshades",
        nameTr: "Patlıcangiller",
        description: "Tomatoes, peppers, potatoes, eggplant",
        descriptionTr: "Domates, biber, patates, patlıcan",
        keywords: ["tomato", "pepper", "bell pepper", "chili", "paprika", "cayenne", "potato", "eggplant", "aubergine", "nightshade", "tobacco", "goji"],
        euRegulated: false,
        severity: "mild",
    },

    COCONUT: {
        type: "COCONUT",
        name: "Coconut",
        nameTr: "Hindistan Cevizi",
        description: "Coconut and derivatives",
        descriptionTr: "Hindistan cevizi ve türevleri",
        keywords: ["coconut", "coconut milk", "coconut cream", "coconut oil", "coconut flour", "coconut water", "copra", "coir"],
        euRegulated: false,
        severity: "moderate",
    },

    BANANA: {
        type: "BANANA",
        name: "Banana",
        nameTr: "Muz",
        description: "Banana - latex cross-reaction",
        descriptionTr: "Muz - lateks çapraz reaksiyonu",
        keywords: ["banana", "plantain"],
        euRegulated: false,
        severity: "moderate",
    },

    AVOCADO: {
        type: "AVOCADO",
        name: "Avocado",
        nameTr: "Avokado",
        description: "Avocado - latex cross-reaction",
        descriptionTr: "Avokado - lateks çapraz reaksiyonu",
        keywords: ["avocado", "guacamole"],
        euRegulated: false,
        severity: "moderate",
    },

    KIWI: {
        type: "KIWI",
        name: "Kiwi",
        nameTr: "Kivi",
        description: "Kiwifruit - latex cross-reaction",
        descriptionTr: "Kivi - lateks çapraz reaksiyonu",
        keywords: ["kiwi", "kiwifruit", "chinese gooseberry"],
        euRegulated: false,
        severity: "moderate",
    },

    LATEX_FRUITS: {
        type: "LATEX_FRUITS",
        name: "Latex-Reactive Fruits",
        nameTr: "Lateks Çapraz Meyveler",
        description: "Fruits that cross-react with latex allergy",
        descriptionTr: "Lateks alerjisi ile çapraz reaksiyon veren meyveler",
        keywords: ["banana", "avocado", "kiwi", "chestnut", "papaya", "fig", "mango", "passion fruit", "pineapple", "melon", "peach", "nectarine", "plum", "cherry", "grape", "celery", "carrot", "potato", "tomato"],
        euRegulated: false,
        severity: "moderate",
    },

    NICKEL: {
        type: "NICKEL",
        name: "Nickel",
        nameTr: "Nikel",
        description: "High-nickel foods (for nickel allergy)",
        descriptionTr: "Yüksek nikel içeren gıdalar",
        keywords: ["cocoa", "chocolate", "oat", "buckwheat", "lentil", "bean", "pea", "soy", "nut", "seed", "spinach", "asparagus", "canned food"],
        euRegulated: false,
        severity: "mild",
    },
};

export function getAllergenDefinition(type: AllergenType): AllergenDefinition {
    return ALLERGEN_DEFINITIONS[type];
}

export function getAllAllergenTypes(): AllergenType[] {
    return Object.keys(ALLERGEN_DEFINITIONS) as AllergenType[];
}

export function getEURegulatedAllergens(): AllergenType[] {
    return Object.entries(ALLERGEN_DEFINITIONS)
        .filter(([_, def]) => def.euRegulated)
        .map(([type, _]) => type as AllergenType);
}

export function detectAllergens(ingredients: string[]): AllergenType[] {
    const detected: Set<AllergenType> = new Set();
    const normalizedIngredients = ingredients.map((i) => i.toLowerCase());

    for (const [type, definition] of Object.entries(ALLERGEN_DEFINITIONS)) {
        for (const keyword of definition.keywords) {
            const keywordLower = keyword.toLowerCase();
            for (const ingredient of normalizedIngredients) {
                if (ingredient.includes(keywordLower)) {
                    detected.add(type as AllergenType);
                    break;
                }
            }
            if (detected.has(type as AllergenType)) break;
        }
    }

    return Array.from(detected);
}

export function checkAllergenMatch(ingredients: string[], userAllergens: AllergenType[]): { hasMatch: boolean; matchedAllergens: AllergenType[] } {
    const detectedAllergens = detectAllergens(ingredients);
    const matchedAllergens = userAllergens.filter((a) => detectedAllergens.includes(a));

    return {
        hasMatch: matchedAllergens.length > 0,
        matchedAllergens,
    };
}
