import { DietType } from "./diets";
import { AllergenType } from "./allergens";

// --- KESİN YASAKLAR / FORBIDDEN KEYWORDS ---
export const DIET_FORBIDDEN_KEYWORDS: Record<DietType, string[]> = {
    VEGAN: [
        // English
        "milk", "cream", "butter", "cheese", "yogurt", "whey", "casein", "lactose", "gelatin", "honey", "beeswax", "egg", "albumin", "meat", "beef", "pork", "chicken", "fish", "shellfish", "carmine", "cochineal", "e120", "collagen",
        // Turkish
        "süt", "krema", "tereyağı", "peynir", "yoğurt", "yogurt", "peynir altı suyu", "jelatin", "bal", "arı sütü", "yumurta", "et", "sığır eti", "domuz eti", "tavuk", "balık", "kabuklu deniz ürünleri", "karmen", "karmen",
        // Spanish
        "leche", "crema", "mantequilla", "queso", "yogur", "suero de leche", "caseína", "caseina", "lactosa", "gelatina", "miel", "cera de abejas", "huevo", "albúmina", "albumina", "carne", "res", "cerdo", "puerco", "pollo", "pescado", "mariscos", "concha", "cochinilla", "e120", "colágeno", "colageno"
    ],
    VEGETARIAN: [
        // English
        "meat", "beef", "pork", "chicken", "turkey", "lamb", "fish", "shellfish", "gelatin", "rennet", "lard", "tallow", "animal fat", "carmine", "cochineal",
        // Turkish
        "et", "kırmızı et", "domuz eti", "tavuk", "hindi", "kuzu", "balık", "kabuklu", "jelatin", "mayda", "iç yağı", "hayvansal yağ",
        // Spanish
        "carne", "res", "cerdo", "puerco", "pollo", "pavo", "cordero", "pescado", "mariscos", "gelatina", "cuajo", "grasa de cerdo", "manteca", "grasa animal", "carmin", "cochinilla"
    ],
    PESCATARIAN: [
        // English
        "meat", "beef", "pork", "chicken", "turkey", "lamb", "gelatin", "lard", "tallow", "animal fat",
        // Turkish
        "et", "kırmızı et", "domuz eti", "tavuk", "hindi", "kuzu", "jelatin", "iç yağı", "hayvansal yağ",
        // Spanish
        "carne", "res", "cerdo", "puerco", "pollo", "pavo", "cordero", "gelatina", "grasa de cerdo", "manteca", "grasa animal"
    ],
    KETO: [
        // English
        "sugar", "corn syrup", "honey", "agave", "maple syrup", "potato", "corn", "starch", "sucrose", "fructose",
        // Turkish
        "şeker", "mısır şurubu", "bal", "agave", "akçaağaç şurubu", "patates", "mısır", "nişasta", "sukroz", "fruktoz",
        // Spanish
        "azúcar", "azucar", "jarabe de maíz", "miel", "agave", "jarabe de arce", "patata", "papa", "maíz", "maiz", "almidón", "almidon", "sacarosa", "fructosa"
    ],
    LOW_CARB: [
        // English
        "sugar", "corn syrup", "high fructose", "bread", "pasta", "rice", "potato",
        // Turkish
        "şeker", "mısır şurubu", "yüksek fruktoz", "ekmek", "makarna", "pilav", "patates",
        // Spanish
        "azúcar", "azucar", "jarabe de maíz", "fructosa alta", "pan", "pasta", "arroz", "patata", "papa"
    ],
    ATKINS: [
        // English
        "sugar", "syrup", "bread", "pasta", "rice", "potato", "corn", "starch",
        // Turkish
        "şeker", "şurup", "ekmek", "makarna", "pilav", "patates", "mısır", "nişasta",
        // Spanish
        "azúcar", "azucar", "jarabe", "pan", "pasta", "arroz", "patata", "papa", "maíz", "maiz", "almidón", "almidon"
    ],
    DUKAN: [
        // English
        "sugar", "oil", "butter", "cream", "starch", "bread", "pasta", "rice", "potato", "corn",
        // Turkish
        "şeker", "yağ", "tereyağı", "krema", "nişasta", "ekmek", "makarna", "pilav", "patates", "mısır",
        // Spanish
        "azúcar", "azucar", "aceite", "mantequilla", "crema", "almidón", "almidon", "pan", "pasta", "arroz", "patata", "papa", "maíz", "maiz"
    ],
    PALEO: [
        // English
        "wheat", "bread", "pasta", "rice", "corn", "oats", "barley", "milk", "cream", "cheese", "yogurt", "butter", "soy", "bean", "lentil", "peanut", "sugar", "vegetable oil",
        // Turkish
        "buğday", "ekmek", "makarna", "pilav", "mısır", "yulaf", "arpa", "süt", "krema", "peynir", "yoğurt", "yogurt", "tereyağı", "soya", "fasulye", "mercimek", "yer fıstığı", "şeker", "bitkisel yağ",
        // Spanish
        "trigo", "pan", "pasta", "arroz", "maíz", "maiz", "avena", "cebada", "leche", "crema", "queso", "yogur", "mantequilla", "soja", "frijol", "poroto", "lenteja", "maní", "cacahuete", "azúcar", "azucar", "aceite vegetal"
    ],
    WHOLE30: [
        // English
        "sugar", "honey", "maple syrup", "agave", "alcohol", "wheat", "corn", "rice", "oats", "soy", "bean", "peanut", "milk", "cheese", "yogurt", "carrageenan", "msg", "sulfites",
        // Turkish
        "şeker", "bal", "akçaağaç şurubu", "agave", "alkol", "buğday", "mısır", "pirinç", "yulaf", "soya", "fasulye", "yer fıstığı", "süt", "peynir", "yoğurt", "yogurt", "karragenan", "sülfit",
        // Spanish
        "azúcar", "azucar", "miel", "jarabe de arce", "agave", "alcohol", "trigo", "maíz", "maiz", "arroz", "avena", "soja", "frijol", "poroto", "maní", "cacahuete", "leche", "queso", "yogur", "carragenina", "sulfitos"
    ],
    MEDITERRANEAN: [
        // English
        "high fructose", "hydrogenated", "trans fat", "margarine",
        // Turkish
        "yüksek fruktoz", "hidrojene", "trans yağ", "margarin",
        // Spanish
        "alto fructosa", "hidrogenado", "grasa trans", "margarina"
    ],
    RAW_FOOD: [
        // English
        "roasted", "baked", "fried", "pasteurized", "cooked",
        // Turkish
        "kavrulmuş", "fırınlanmış", "kızartılmış", "pastörize", "pişmiş",
        // Spanish
        "tostado", "asado", "horneado", "frito", "pasteurizado", "cocido"
    ],
    GLUTEN_FREE: [
        // English
        "wheat", "barley", "rye", "malt", "brewer's yeast", "seitan", "bulgur", "couscous", "durum", "semolina", "farina", "spelt", "kamut", "triticale",
        // Turkish
        "buğday", "arpa", "çavdar", "malt", "bira mayası", "seitan", "bulgur", "kuskus", "durum", "irmik", "spelt", "kamut",
        // Spanish
        "trigo", "cebada", "centeno", "malta", "levadura de cerveza", "seitán", "seitan", "bulgur", "cuscús", "couscous", "durum", "sémola", "semola", "espelta", "triticale"
    ],
    LACTOSE_FREE: [
        // English
        "lactose", "milk", "cream", "butter", "cheese", "yogurt", "whey", "milk solids",
        // Turkish
        "laktoz", "süt", "krema", "tereyağı", "peynir", "yoğurt", "yogurt", "peynir altı suyu",
        // Spanish
        "lactosa", "leche", "crema", "mantequilla", "queso", "yogur", "suero de leche", "sólidos lácteos", "solidos lacteos"
    ],
    DAIRY_FREE: [
        // English
        "milk", "cream", "butter", "cheese", "yogurt", "whey", "casein", "lactose", "ghee", "dairy",
        // Turkish
        "süt", "krema", "tereyağı", "peynir", "yoğurt", "yogurt", "peynir altı suyu", "kazein", "laktoz", "sade yağ",
        // Spanish
        "leche", "crema", "mantequilla", "queso", "yogur", "suero de leche", "caseína", "caseina", "lactosa", "ghee", "lácteo", "lacteo"
    ],
    SUGAR_FREE: [
        // English
        "sugar", "sucrose", "glucose", "fructose", "dextrose", "maltose", "corn syrup", "honey", "agave", "molasses", "cane sugar", "syrup",
        // Turkish
        "şeker", "sukroz", "glikoz", "fruktoz", "dekstroz", "maltoz", "mısır şurubu", "bal", "agave", "pekmez", "kamış şekeri", "şurup",
        // Spanish
        "azúcar", "azucar", "sacarosa", "glucosa", "fructosa", "dextrosa", "maltosa", "jarabe de maíz", "miel", "agave", "melaza", "azúcar de caña", "azucar de caña", "jarabe"
    ],
    LOW_SODIUM: [
        // English
        "salt", "sodium", "msg", "monosodium glutamate", "baking soda", "soy sauce",
        // Turkish
        "tuz", "sodyum", "msg", "monosodyum glutamat", "karbonat", "soda", "soya sosu",
        // Spanish
        "sal", "sodio", "msg", "glutamato monosódico", "glutamato monosodico", "bicarbonato", "salsa de soja"
    ],
    FODMAP: [
        // English
        "garlic", "onion", "wheat", "rye", "honey", "agave", "high fructose", "milk", "yogurt", "apple", "pear", "sorbitol", "mannitol", "xylitol",
        // Turkish
        "sarımsak", "soğan", "sogan", "buğday", "çavdar", "cavdar", "bal", "agave", "yüksek fruktoz", "süt", "yoğurt", "yogurt", "elma", "armut", "sorbitol", "mannitol", "ksilitol",
        // Spanish
        "ajo", "cebolla", "trigo", "centeno", "miel", "agave", "alto fructosa", "leche", "yogur", "manzana", "pera", "sorbitol", "manitol", "xilitol"
    ],
    HALAL: [
        // English
        "pork", "ham", "bacon", "lard", "gelatin", "alcohol", "wine", "beer", "rum", "liqueur", "carmine", "e120",
        // Turkish
        "domuz", "jambon", "pastırma", "domuz yağı", "jelatin", "alkol", "şarap", "bira", "rom", "likör", "karmen", "karmen", "e120",
        // Spanish
        "cerdo", "puerco", "jamón", "jamon", "tocino", "beicon", "manteca de cerdo", "gelatina", "alcohol", "vino", "cerveza", "ron", "licor", "carmin", "e120"
    ],
    KOSHER: [
        // English
        "pork", "ham", "bacon", "shellfish", "shrimp", "crab", "lobster", "clam", "oyster",
        // Turkish
        "domuz", "jambon", "pastırma", "kabuklu deniz ürünleri", "karides", "yengeç", "ıstakoz", "midye", "istiridye",
        // Spanish
        "cerdo", "puerco", "jamón", "jamon", "tocino", "beicon", "mariscos", "camarón", "gamba", "cangrejo", "langosta", "almeja", "ostra", "mejillón"
    ],
};

// --- KESİN ALERJENLER (STRICT ALLERGENS - 0 SCORE) ---
export const ALLERGEN_KEYWORDS: Record<AllergenType, string[]> = {
    GLUTEN: [
        // English
        "wheat", "barley", "rye", "oat", "malt", "brewer's yeast", "seitan", "bulgur", "durum", "semolina",
        // Turkish
        "buğday", "arpa", "çavdar", "cavdar", "yulaf", "malt", "bira mayası", "seitan", "bulgur", "durum", "irmik",
        // Spanish
        "trigo", "cebada", "centeno", "avena", "malta", "levadura de cerveza", "seitán", "seitan", "bulgur", "cuscús", "couscous", "durum", "sémola", "semola"
    ],
    CRUSTACEANS: [
        // English
        "shrimp", "prawn", "crab", "lobster", "crayfish", "krill",
        // Turkish
        "karides", "yengeç", "ıstakoz", "kerevit",
        // Spanish
        "camarón", "gamba", "cangrejo", "langosta", "bogavante", "cigala", "krill"
    ],
    EGGS: [
        // English
        "egg", "albumin", "globulin", "lysozyme", "mayonnaise", "meringue",
        // Turkish
        "yumurta", "albümin", "albumin", "globulin", "lizozim", "mayonez", "mereng",
        // Spanish
        "huevo", "albúmina", "albumina", "globulina", "lisozima", "mayonesa", "merengue"
    ],
    FISH: [
        // English
        "fish", "salmon", "tuna", "cod", "anchovy", "sardine", "mackerel", "tilapia", "trout",
        // Turkish
        "balık", "somon", "ton balığı", "morina", "hamsi", "sardalya", "uskumru", "tilapia", "alabalık",
        // Spanish
        "pescado", "pez", "salmón", "salmon", "atún", "atun", "bacalao", "anchoa", "sardina", "caballa", "tilapia", "trucha"
    ],
    PEANUTS: [
        // English
        "peanut", "groundnut", "arachis",
        // Turkish
        "yer fıstığı", "fıstık",
        // Spanish
        "cacahuete", "maní", "mani", "cacahuate", "arachis"
    ],
    SOYBEANS: [
        // English
        "soy", "tofu", "tempeh", "miso", "edamame", "lecithin",
        // Turkish
        "soya", "tofu", "tempeh", "miso", "edamame", "lesitin",
        // Spanish
        "soja", "tofu", "tempeh", "miso", "edamame", "lecitina"
    ],
    MILK: [
        // English
        "milk", "cream", "butter", "cheese", "yogurt", "whey", "casein", "lactose",
        // Turkish
        "süt", "krema", "tereyağı", "peynir", "yoğurt", "yogurt", "peynir altı suyu", "kazein", "laktoz",
        // Spanish
        "leche", "crema", "nata", "mantequilla", "queso", "yogur", "suero de leche", "caseína", "caseina", "lactosa"
    ],
    TREE_NUTS: [
        // English
        "almond", "hazelnut", "walnut", "cashew", "pistachio", "pecan", "macadamia", "brazil nut",
        // Turkish
        "badem", "fındık", "ceviz", "kaju", "fıstık", "pecan", "makademya", "brezilya fıstığı",
        // Spanish
        "almendra", "avellana", "nuez", "pacana", "pecana", "anacardo", "cajú", "caju", "pistacho", "nuez de macadamia", "nuez de brasil"
    ],
    CELERY: [
        // English
        "celery", "celeriac",
        // Turkish
        "kereviz",
        // Spanish
        "apio", "raíz de apio", "rábano picante"
    ],
    MUSTARD: [
        // English
        "mustard",
        // Turkish
        "hardal",
        // Spanish
        "mostaza"
    ],
    SESAME: [
        // English
        "sesame", "tahini", "halva",
        // Turkish
        "susam", "tahin", "helva",
        // Spanish
        "sésamo", "sesamo", "tahini", "tahina", "halva"
    ],
    SULPHITES: [
        // English
        "sulphite", "sulfite", "sulphur", "sulfur", "metabisulphite", "sulfur dioxide",
        // Turkish
        "sülfit", "sulfür", "kükürt", "metabisülfit", "kükürt dioksit",
        // Spanish
        "sulfito", "azufre", "metabisulfito", "dióxido de azufre", "dioxido de azufre"
    ],
    LUPIN: [
        // English
        "lupin", "lupine",
        // Turkish
        "acı bakla", "lupin",
        // Spanish
        "altramuz", "lupino", "chocho"
    ],
    MOLLUSCS: [
        // English
        "mollusc", "squid", "octopus", "oyster", "mussel", "clam", "snail", "scallop",
        // Turkish
        "yumuşakça", "kalamar", "mürekkep balığı", "ahtapot", "istiridye", "midye", "deniz tarağı", "salyangoz",
        // Spanish
        "molusco", "calamar", "pulpo", "ostra", "mejillón", "mejillon", "almeja", "caracol", "vieira"
    ],
    CORN: [
        // English
        "corn", "maize", "popcorn", "polenta", "cornstarch",
        // Turkish
        "mısır", "patlamış mısır", "polenta", "mısır nişastası",
        // Spanish
        "maíz", "maiz", "palomitas", "polenta", "almidón de maíz", "almidon de maiz"
    ],
    NIGHTSHADES: [
        // English
        "tomato", "potato", "eggplant", "pepper", "paprika", "chili", "capsicum",
        // Turkish
        "domates", "patates", "patlıcan", "biber", "paprika", "acı biber",
        // Spanish
        "tomate", "patata", "papa", "berenjena", "pimiento", "pimientos", "paprika", "chile", "guindilla", "capsicum"
    ],
    COCONUT: [
        // English
        "coconut",
        // Turkish
        "hindistan cevizi",
        // Spanish
        "coco", "coco rallado", "leche de coco"
    ],
    BANANA: [
        // English
        "banana", "plantain",
        // Turkish
        "muz",
        // Spanish
        "plátano", "platano", "banana", "plátano macho", "platano macho"
    ],
    AVOCADO: [
        // English
        "avocado", "guacamole",
        // Turkish
        "avokado",
        // Spanish
        "aguacate", "guacamole"
    ],
    KIWI: [
        // English
        "kiwi",
        // Turkish
        "kivi",
        // Spanish
        "kiwi"
    ],
    LATEX_FRUITS: [
        // English
        "banana", "avocado", "kiwi", "chestnut", "papaya",
        // Turkish
        "muz", "avokado", "kivi", "kestane", "papaya",
        // Spanish
        "plátano", "platano", "banana", "aguacate", "kiwi", "castaña", "papaya"
    ],
    NICKEL: [
        // English
        "cocoa", "chocolate", "oat", "buckwheat", "nut", "legume",
        // Turkish
        "kakao", "çikolata", "cikolata", "yulaf", "karabuğday", "karabugday", "fındık", "baklagil",
        // Spanish
        "cacao", "chocolate", "avena", "trigo sarraceno", "nuez", "fruto seco", "legumbre"
    ],
};

// --- MUĞLAK / ŞÜPHELİ İÇERİKLER / AMBIGUOUS KEYWORDS ---
export const AMBIGUOUS_KEYWORDS: Record<string, string[]> = {
    GLUTEN: [
        // English
        "maltodextrin", "dextrose", "glucose syrup", "starch", "modified starch", "flavoring", "aroma", "dextrin", "caramel color", "yeast extract", "hydrolyzed vegetable protein",
        // Turkish
        "maltodekstrin", "dekstroz", "glikoz şurubu", "nişasta", "modifiye nişasta", "aroma", "karamel", "karamel renklendirici", "maya özü", "hidrolize bitkisel protein",
        // Spanish
        "maltodextrina", "dextrosa", "jarabe de glucosa", "almidón", "almidon", "almidón modificado", "almidon modificado", "saborizante", "aroma", "dextrina", "color caramelo", "extracto de levadura", "proteína vegetal hidrolizada", "proteina vegetal hidrolizada"
    ],
    KETO: [
        // English
        "maltodextrin", "dextrose", "modified starch", "corn starch", "potato starch", "flour", "wheat flour", "rice flour", "pasta", "spaghetti", "macaroni", "noodle", "bread", "bagel", "bun", "toast", "rice", "quinoa", "bulgur", "buckwheat", "lentil", "chickpea",
        // Turkish
        "maltodekstrin", "dekstroz", "modifiye nişasta", "mısır nişastası", "patates nişastası", "un", "buğday unu", "pirinç unu", "makarna", "spagetti", "şehriye", "noodle", "ekmek", "bagel", "simit", "tost", "pilav", "quinoa", "bulgur", "karabuğday", "karabugday", "mercimek", "nohut",
        // Spanish
        "maltodextrina", "dextrosa", "almidón modificado", "almidon modificado", "almidón de maíz", "almidon de maiz", "almidón de papa", "almidon de papa", "harina", "harina de trigo", "harina de arroz", "pasta", "espagueti", "spaghetti", "macarrones", "fideos", "pan", "bagel", "bollo", "tostada", "arroz", "quinua", "quinoa", "bulgur", "trigo sarraceno", "lenteja", "garbanzo"
    ],
    DAIRY_FREE: [
        // English
        "lactic acid", "lactate", "cocoa butter", "flavoring", "aroma", "culture",
        // Turkish
        "laktik asit", "laktat", "kakao yağı", "aroma", "kültür",
        // Spanish
        "ácido láctico", "acido lactico", "lactato", "manteca de cacao", "saborizante", "aroma", "cultivo"
    ],
    VEGAN: [
        // English
        "lactic acid", "glycerin", "glycerol", "disodium inosinate", "natural flavor", "flavoring", "aroma", "artificial flavor", "mono- and diglycerides", "stearic acid", "vitamin d", "vitamin d3", "cholecalciferol", "kolekalsiferol", "lanolin", "calciferol", "d3",
        // Turkish
        "laktik asit", "gliserin", "gliserol", "dikalsiyum inozinat", "doğal aroma", "aroma", "yapay aroma", "mono- ve digliseritler", "stearik asit", "d vitamini", "kolekalsiferol", "lanolin", "kalsiferol",
        // Spanish
        "ácido láctico", "acido lactico", "glicerina", "glicerol", "inosinato disódico", "inosinato disodico", "sabor natural", "saborizante", "aroma", "sabor artificial", "mono y diglicéridos", "mono y digliceridos", "ácido esteárico", "acido estearico", "vitamina d", "vitamina d3", "colecalciferol", "lanolina", "calciferol"
    ],
    HALAL: [
        // English
        "gelatin", "emulsifier", "e471", "enzymes", "vanilla extract", "pepsin", "rennet",
        // Turkish
        "jelatin", "emülgatör", "e471", "enzimler", "vanilya özü", "pepsin", "mayda",
        // Spanish
        "gelatina", "emulgente", "e471", "enzimas", "extracto de vainilla", "pepsina", "cuajo", "rennet"
    ],
};
