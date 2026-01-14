import { DietType } from "./diets";
import { AllergenType } from "./allergens";

// --- KESİN YASAKLAR ---
export const DIET_FORBIDDEN_KEYWORDS: Record<DietType, string[]> = {
    VEGAN: ["milk", "cream", "butter", "cheese", "yogurt", "whey", "casein", "lactose", "gelatin", "honey", "beeswax", "egg", "albumin", "meat", "beef", "pork", "chicken", "fish", "shellfish", "carmine", "cochineal", "e120", "collagen"],
    VEGETARIAN: ["meat", "beef", "pork", "chicken", "turkey", "lamb", "fish", "shellfish", "gelatin", "rennet", "lard", "tallow", "animal fat", "carmine", "cochineal"],
    PESCATARIAN: ["meat", "beef", "pork", "chicken", "turkey", "lamb", "gelatin", "lard", "tallow", "animal fat"],
    KETO: ["sugar", "corn syrup", "honey", "agave", "maple syrup", "potato", "corn", "starch", "sucrose", "fructose"],
    LOW_CARB: ["sugar", "corn syrup", "high fructose", "bread", "pasta", "rice", "potato"],
    ATKINS: ["sugar", "syrup", "bread", "pasta", "rice", "potato", "corn", "starch"],
    DUKAN: ["sugar", "oil", "butter", "cream", "starch", "bread", "pasta", "rice", "potato", "corn"],
    PALEO: ["wheat", "bread", "pasta", "rice", "corn", "oats", "barley", "milk", "cream", "cheese", "yogurt", "butter", "soy", "bean", "lentil", "peanut", "sugar", "vegetable oil"],
    WHOLE30: ["sugar", "honey", "maple syrup", "agave", "alcohol", "wheat", "corn", "rice", "oats", "soy", "bean", "peanut", "milk", "cheese", "yogurt", "carrageenan", "msg", "sulfites"],
    MEDITERRANEAN: ["high fructose", "hydrogenated", "trans fat", "margarine"],
    RAW_FOOD: ["roasted", "baked", "fried", "pasteurized", "cooked"],
    GLUTEN_FREE: ["wheat", "barley", "rye", "malt", "brewer's yeast", "seitan", "bulgur", "couscous", "durum", "semolina", "farina", "spelt", "kamut", "triticale"],
    LACTOSE_FREE: ["lactose", "milk", "cream", "butter", "cheese", "yogurt", "whey", "milk solids"],
    DAIRY_FREE: ["milk", "cream", "butter", "cheese", "yogurt", "whey", "casein", "lactose", "ghee", "dairy"],
    SUGAR_FREE: ["sugar", "sucrose", "glucose", "fructose", "dextrose", "maltose", "corn syrup", "honey", "agave", "molasses", "cane sugar", "syrup"],
    LOW_SODIUM: ["salt", "sodium", "msg", "monosodium glutamate", "baking soda", "soy sauce"],
    FODMAP: ["garlic", "onion", "wheat", "rye", "honey", "agave", "high fructose", "milk", "yogurt", "apple", "pear", "sorbitol", "mannitol", "xylitol"],
    HALAL: ["pork", "ham", "bacon", "lard", "gelatin", "alcohol", "wine", "beer", "rum", "liqueur", "carmine", "e120"],
    KOSHER: ["pork", "ham", "bacon", "shellfish", "shrimp", "crab", "lobster", "clam", "oyster"],
};

// --- KESİN ALERJENLER (STRICT ALLERGENS - 0 SCORE) ---
export const ALLERGEN_KEYWORDS: Record<AllergenType, string[]> = {
    GLUTEN: ["wheat", "barley", "rye", "oat", "malt", "brewer's yeast", "seitan", "bulgur", "durum", "semolina"],
    CRUSTACEANS: ["shrimp", "prawn", "crab", "lobster", "crayfish", "krill"],
    EGGS: ["egg", "albumin", "globulin", "lysozyme", "mayonnaise", "meringue"],
    FISH: ["fish", "salmon", "tuna", "cod", "anchovy", "sardine", "mackerel", "tilapia", "trout"],
    PEANUTS: ["peanut", "groundnut", "arachis"],
    SOYBEANS: ["soy", "tofu", "tempeh", "miso", "edamame", "lecithin"],
    MILK: ["milk", "cream", "butter", "cheese", "yogurt", "whey", "casein", "lactose"],
    TREE_NUTS: ["almond", "hazelnut", "walnut", "cashew", "pistachio", "pecan", "macadamia", "brazil nut"],
    CELERY: ["celery", "celeriac"],
    MUSTARD: ["mustard"],
    SESAME: ["sesame", "tahini", "halva"],
    SULPHITES: ["sulphite", "sulfite", "sulphur", "sulfur", "metabisulphite", "sulfur dioxide"],
    LUPIN: ["lupin", "lupine"],
    MOLLUSCS: ["mollusc", "squid", "octopus", "oyster", "mussel", "clam", "snail", "scallop"],
    CORN: ["corn", "maize", "popcorn", "polenta", "cornstarch"],
    NIGHTSHADES: ["tomato", "potato", "eggplant", "pepper", "paprika", "chili", "capsicum"],
    COCONUT: ["coconut"],
    BANANA: ["banana", "plantain"],
    AVOCADO: ["avocado", "guacamole"],
    KIWI: ["kiwi"],
    LATEX_FRUITS: ["banana", "avocado", "kiwi", "chestnut", "papaya"],
    NICKEL: ["cocoa", "chocolate", "oat", "buckwheat", "nut", "legume"],
};

// --- MUĞLAK / ŞÜPHELİ İÇERİKLER ---
export const AMBIGUOUS_KEYWORDS: Record<string, string[]> = {
    GLUTEN: ["maltodextrin", "dextrose", "glucose syrup", "starch", "modified starch", "flavoring", "aroma", "dextrin", "caramel color", "yeast extract", "hydrolyzed vegetable protein"],
    KETO: ["maltodextrin", "dextrose", "modified starch", "corn starch", "potato starch", "flour", "wheat flour", "rice flour", "pasta", "spaghetti", "macaroni", "noodle", "bread", "bagel", "bun", "toast", "rice", "quinoa", "bulgur", "buckwheat", "lentil", "chickpea"],
    DAIRY_FREE: ["lactic acid", "lactate", "cocoa butter", "flavoring", "aroma", "culture"],
    VEGAN: ["lactic acid", "glycerin", "glycerol", "disodium inosinate", "natural flavor", "flavoring", "aroma", "artificial flavor", "mono- and diglycerides", "stearic acid", "vitamin d", "vitamin d3", "cholecalciferol", "kolekalsiferol", "lanolin", "calciferol", "d3"],
    HALAL: ["gelatin", "emulsifier", "e471", "enzymes", "vanilla extract", "pepsin", "rennet"],
};
