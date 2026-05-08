import { LifeStageType } from "./lifestages";
import { SeverityLevel } from "./analysisEngine";

interface LifeStageRule {
    keyword: string;
    severity: SeverityLevel;
    messageKey: string;
}

function expandRules(keywords: string[], severity: SeverityLevel, messageKey: string): LifeStageRule[] {
    return keywords.map((keyword) => ({ keyword, severity, messageKey }));
}

// English keywords
const HONEY_KEYWORDS_EN = ["honey"];
const SALT_KEYWORDS_EN = ["salt", "sodium"];
const SUGAR_KEYWORDS_EN = ["sugar", "sucrose", "glucose", "fructose", "dextrose", "corn syrup", "cane sugar"];
const CAFFEINE_KEYWORDS_EN = ["caffeine", "coffee", "espresso", "matcha", "guarana", "energy drink"];
const WHOLE_NUT_KEYWORDS_EN = ["whole almond", "whole hazelnut", "whole walnut", "whole cashew", "whole pistachio", "whole peanut"];
const NUT_BUTTER_KEYWORDS_EN = ["peanut butter", "peanut paste", "almond butter", "hazelnut spread", "nut butter"];
const RAW_EGG_KEYWORDS_EN = ["raw egg", "undercooked egg", "soft boiled egg"];
const EGG_WHITE_KEYWORDS_EN = ["egg white", "albumin", "albumen", "meringue"];
const RAW_FISH_KEYWORDS_EN = ["raw fish", "sushi", "sashimi", "ceviche", "raw salmon", "raw tuna"];
const SHELLFISH_KEYWORDS_EN = ["shrimp", "prawn", "crab", "lobster", "oyster", "mussel", "clam", "scallop"];
const CHOCOLATE_KEYWORDS_EN = ["chocolate", "cocoa", "cacao"];
const PROCESSED_MEAT_KEYWORDS_EN = ["sausage", "hot dog", "bacon", "salami", "pepperoni", "ham", "bologna", "deli meat", "cured meat", "smoked meat"];
const ARTIFICIAL_SWEETENER_KEYWORDS_EN = [
    "aspartame", "sucralose", "saccharin", "acesulfame", "neotame", "advantame", "cyclamate",
    "e950", "e951", "e952", "e954", "e955", "e961", "e962",
];
const UNPASTEURIZED_KEYWORDS_EN = ["unpasteurized", "raw milk", "raw cheese"];
const SOFT_CHEESE_KEYWORDS_EN = ["brie", "camembert", "feta", "blue cheese", "gorgonzola", "roquefort"];
const HIGH_MERCURY_FISH_EN = ["shark", "swordfish", "king mackerel", "tilefish", "bigeye tuna", "marlin"];
const ALCOHOL_KEYWORDS_EN = ["alcohol", "wine", "beer", "vodka", "rum", "whiskey", "liqueur", "ethanol"];
const CHOKING_HAZARD_KEYWORDS_EN = ["whole nut", "popcorn", "hard candy", "whole grape", "cherry tomato", "raw carrot"];
const LIVER_KEYWORDS_EN = ["liver", "pate", "liverwurst"];
const PALM_HYDROGENATED_KEYWORDS_EN = [
    "palm oil", "palm fat", "palm kernel", "palm olein", "palm stearin",
    "hydrogenated", "partially hydrogenated", "fully hydrogenated", "trans fat", "trans fatty",
];
const ARTIFICIAL_FLAVOR_KEYWORDS_EN = [
    "artificial flavor", "artificial flavour", "artificial flavoring", "artificial flavouring",
    "flavoring", "flavouring", "flavour enhancer", "flavor enhancer", "nature-identical",
];
const ARTIFICIAL_COLOR_KEYWORDS_EN = [
    "tartrazine", "sunset yellow", "ponceau", "carmoisine", "azorubine", "quinoline yellow",
    "allura red", "brilliant blue", "patent blue", "indigo carmine",
    "e102", "e104", "e110", "e122", "e124", "e129", "e131", "e132", "e133", "e142", "e151",
];
const HARMFUL_PRESERVATIVE_KEYWORDS_EN = [
    "sodium nitrite", "sodium nitrate", "potassium nitrite", "potassium nitrate",
    "bha", "bht", "tbhq", "propyl gallate",
    "e249", "e250", "e251", "e252", "e320", "e321", "e310",
];
const INDUSTRIAL_EMULSIFIER_KEYWORDS_EN = [
    "polyglycerol polyricinoleate", "carboxymethylcellulose", "polysorbate",
    "e471", "e472", "e433", "e466", "e476", "e477",
];
const ULTRA_PROCESSED_MARKER_KEYWORDS_EN = [
    "maltodextrin", "modified starch", "high fructose corn syrup", "glucose-fructose syrup",
    "glucose syrup", "invert sugar", "isolated soy protein", "hydrolyzed protein",
];

// Turkish keywords
const HONEY_KEYWORDS_TR = ["bal"];
const SALT_KEYWORDS_TR = ["tuz"];
const SUGAR_KEYWORDS_TR = ["şeker", "sukroz", "glikoz", "fruktoz", "dekstroz", "mısır şurubu", "kamış şekeri"];
const CAFFEINE_KEYWORDS_TR = ["kafein", "kahve", "espresso", "matcha", "guarana", "enerji içeceği"];
const WHOLE_NUT_KEYWORDS_TR = ["bütün badem", "bütün fındık", "bütün ceviz", "bütün kaju", "bütün fıstık"];
const NUT_BUTTER_KEYWORDS_TR = ["fıstık ezmesi", "badem ezmesi", "fındık ezmesi"];
const RAW_EGG_KEYWORDS_TR = ["çiğ yumurta", "az pişmiş yumurta"];
const EGG_WHITE_KEYWORDS_TR = ["yumurta akı", "albümin", "mereng"];
const RAW_FISH_KEYWORDS_TR = ["çiğ balık", "sushi", "sashimi"];
const SHELLFISH_KEYWORDS_TR = ["karides", "yengeç", "ıstakoz", "istiridye", "midye", "deniz tarağı"];
const CHOCOLATE_KEYWORDS_TR = ["çikolata", "kakao"];
const PROCESSED_MEAT_KEYWORDS_TR = ["sosis", "salam", "pastırma", "jambon", "füme et", "sucuk"];
const ARTIFICIAL_SWEETENER_KEYWORDS_TR = [
    "aspartam", "sukraloz", "sakarin", "asesülfam", "neotam", "siklamat",
];
const UNPASTEURIZED_KEYWORDS_TR = ["pastörize edilmemiş", "çiğ süt", "çiğ peynir"];
const SOFT_CHEESE_KEYWORDS_TR = ["brie", "camembert", "feta", "rokfur", "gorgonzola"];
const HIGH_MERCURY_FISH_TR = ["köpek balığı", "kılıç balığı", "ton balığı", "marlin"];
const ALCOHOL_KEYWORDS_TR = ["alkol", "şarap", "bira", "votka", "viski", "rakı"];
const CHOKING_HAZARD_KEYWORDS_TR = ["bütün fındık", "patlamış mısır", "şekerleme", "çiğ havuç"];
const LIVER_KEYWORDS_TR = ["karaciğer", "ciğer", "karaciğer sosisi"];
const PALM_HYDROGENATED_KEYWORDS_TR = [
    "palm yağı", "palm yagi", "palm çekirdek", "palm cekirdek",
    "hidrojenize", "kısmen hidrojenize", "kismen hidrojenize", "tam hidrojenize",
    "trans yağ", "trans yag",
];
const ARTIFICIAL_FLAVOR_KEYWORDS_TR = [
    "aroma verici", "aroma vericiler", "yapay aroma", "yapay aromalar",
    "doğaya özdeş aroma", "dogaya ozdes aroma", "tat arttırıcı",
];
const ARTIFICIAL_COLOR_KEYWORDS_TR = [
    "tartrazin", "günbatımı sarısı", "ponso", "karmoisin", "kinolin sarısı", "allura kırmızısı",
    "e102", "e104", "e110", "e122", "e124", "e129",
];
const HARMFUL_PRESERVATIVE_KEYWORDS_TR = [
    "sodyum nitrit", "sodyum nitrat", "potasyum nitrit", "potasyum nitrat",
    "bha", "bht", "e249", "e250", "e251", "e252", "e320", "e321",
];
const INDUSTRIAL_EMULSIFIER_KEYWORDS_TR = [
    "poligliserol polirisinoleat", "polisorbat", "karboksimetil selüloz",
    "e471", "e472", "e433", "e466", "e476", "e477",
];
const ULTRA_PROCESSED_MARKER_KEYWORDS_TR = [
    "maltodekstrin", "modifiye nişasta", "yüksek fruktozlu mısır şurubu", "glukoz-fruktoz şurubu",
    "glukoz şurubu", "invert şeker", "izole soya proteini", "hidrolize protein",
];

// Spanish keywords
const HONEY_KEYWORDS_ES = ["miel"];
const SALT_KEYWORDS_ES = ["sal", "sodio"];
const SUGAR_KEYWORDS_ES = ["azúcar", "sacarosa", "glucosa", "fructosa", "dextrosa", "jarabe de maíz", "azúcar de caña"];
const CAFFEINE_KEYWORDS_ES = ["cafeína", "café", "espresso", "matcha", "guaraná", "bebida energética", "bebida energetica"];
const WHOLE_NUT_KEYWORDS_ES = ["almendra entera", "avellana entera", "nuez entera", "anacardo entero", "pistacho entero", "cacahuete entero", "mani entero"];
const NUT_BUTTER_KEYWORDS_ES = ["mantequilla de cacahuete", "mantequilla de maní", "pasta de cacahuete", "crema de avellanas", "mantequilla de almendras"];
const RAW_EGG_KEYWORDS_ES = ["huevo crudo", "huevo poco cocido", "huevo cocido blando"];
const EGG_WHITE_KEYWORDS_ES = ["clara de huevo", "albúmina", "albumina", "merengue"];
const RAW_FISH_KEYWORDS_ES = ["pescado crudo", "sushi", "sashimi", "ceviche", "salmón crudo", "salmon crudo", "atún crudo", "atun crudo"];
const SHELLFISH_KEYWORDS_ES = ["camarón", "gamba", "cangrejo", "langosta", "ostra", "mejillón", "vieira", "almeja", "berberecho"];
const CHOCOLATE_KEYWORDS_ES = ["chocolate", "cacao"];
const PROCESSED_MEAT_KEYWORDS_ES = ["salchicha", "salchicha hot dog", "tocino", "beicon", "salami", "pepperoni", "jamón", "jamon", "mortadela", "fiambre", "carne curada", "carne ahumada"];
const ARTIFICIAL_SWEETENER_KEYWORDS_ES = [
    "aspartamo", "sucralosa", "sacarina", "acesulfamo", "neotamo", "ciclamato",
];
const UNPASTEURIZED_KEYWORDS_ES = ["no pasteurizado", "sin pasteurizar", "leche cruda", "queso crudo"];
const SOFT_CHEESE_KEYWORDS_ES = ["brie", "camembert", "feta", "queso azul", "gorgonzola", "roquefort"];
const HIGH_MERCURY_FISH_ES = ["tiburón", "pez espada", "caballa", "atún rojo", "marlin", "merlín"];
const ALCOHOL_KEYWORDS_ES = ["alcohol", "vino", "cerveza", "vodka", "ron", "whisky", "licor", "etanol"];
const CHOKING_HAZARD_KEYWORDS_ES = ["nuez entera", "palomitas", "caramelo duro", "uva entera", "tomate cherry", "zanahoria cruda"];
const LIVER_KEYWORDS_ES = ["hígado", "higado", "paté", "pate", "embutido de hígado"];
const PALM_HYDROGENATED_KEYWORDS_ES = [
    "aceite de palma", "grasa de palma", "palmiste",
    "hidrogenado", "parcialmente hidrogenado", "totalmente hidrogenado",
    "grasa trans", "ácidos grasos trans",
];
const ARTIFICIAL_FLAVOR_KEYWORDS_ES = [
    "aroma artificial", "aromas artificiales", "saborizante artificial", "saborizantes artificiales",
    "aromatizante", "aromatizantes", "potenciador del sabor",
];
const ARTIFICIAL_COLOR_KEYWORDS_ES = [
    "tartrazina", "amarillo ocaso", "ponceau", "carmoisina", "amarillo quinolina", "rojo allura",
    "e102", "e104", "e110", "e122", "e124", "e129",
];
const HARMFUL_PRESERVATIVE_KEYWORDS_ES = [
    "nitrito de sodio", "nitrato de sodio", "nitrito de potasio", "nitrato de potasio",
    "bha", "bht", "e249", "e250", "e251", "e252", "e320", "e321",
];
const INDUSTRIAL_EMULSIFIER_KEYWORDS_ES = [
    "polirricinoleato de poliglicerol", "polisorbato", "carboximetilcelulosa",
    "e471", "e472", "e433", "e466", "e476", "e477",
];
const ULTRA_PROCESSED_MARKER_KEYWORDS_ES = [
    "maltodextrina", "almidón modificado", "jarabe de maíz alto en fructosa", "jarabe de glucosa-fructosa",
    "jarabe de glucosa", "azúcar invertido", "proteína de soja aislada", "proteína hidrolizada",
];

// Combined keyword lists
const HONEY_KEYWORDS = [...HONEY_KEYWORDS_EN, ...HONEY_KEYWORDS_TR, ...HONEY_KEYWORDS_ES];
const SALT_KEYWORDS = [...SALT_KEYWORDS_EN, ...SALT_KEYWORDS_TR, ...SALT_KEYWORDS_ES];
const SUGAR_KEYWORDS = [...SUGAR_KEYWORDS_EN, ...SUGAR_KEYWORDS_TR, ...SUGAR_KEYWORDS_ES];
const CAFFEINE_KEYWORDS = [...CAFFEINE_KEYWORDS_EN, ...CAFFEINE_KEYWORDS_TR, ...CAFFEINE_KEYWORDS_ES];
const WHOLE_NUT_KEYWORDS = [...WHOLE_NUT_KEYWORDS_EN, ...WHOLE_NUT_KEYWORDS_TR, ...WHOLE_NUT_KEYWORDS_ES];
const NUT_BUTTER_KEYWORDS = [...NUT_BUTTER_KEYWORDS_EN, ...NUT_BUTTER_KEYWORDS_TR, ...NUT_BUTTER_KEYWORDS_ES];
const RAW_EGG_KEYWORDS = [...RAW_EGG_KEYWORDS_EN, ...RAW_EGG_KEYWORDS_TR, ...RAW_EGG_KEYWORDS_ES];
const EGG_WHITE_KEYWORDS = [...EGG_WHITE_KEYWORDS_EN, ...EGG_WHITE_KEYWORDS_TR, ...EGG_WHITE_KEYWORDS_ES];
const RAW_FISH_KEYWORDS = [...RAW_FISH_KEYWORDS_EN, ...RAW_FISH_KEYWORDS_TR, ...RAW_FISH_KEYWORDS_ES];
const SHELLFISH_KEYWORDS = [...SHELLFISH_KEYWORDS_EN, ...SHELLFISH_KEYWORDS_TR, ...SHELLFISH_KEYWORDS_ES];
const CHOCOLATE_KEYWORDS = [...CHOCOLATE_KEYWORDS_EN, ...CHOCOLATE_KEYWORDS_TR, ...CHOCOLATE_KEYWORDS_ES];
const PROCESSED_MEAT_KEYWORDS = [...PROCESSED_MEAT_KEYWORDS_EN, ...PROCESSED_MEAT_KEYWORDS_TR, ...PROCESSED_MEAT_KEYWORDS_ES];
const ARTIFICIAL_SWEETENER_KEYWORDS = [...ARTIFICIAL_SWEETENER_KEYWORDS_EN, ...ARTIFICIAL_SWEETENER_KEYWORDS_TR, ...ARTIFICIAL_SWEETENER_KEYWORDS_ES];
const UNPASTEURIZED_KEYWORDS = [...UNPASTEURIZED_KEYWORDS_EN, ...UNPASTEURIZED_KEYWORDS_TR, ...UNPASTEURIZED_KEYWORDS_ES];
const SOFT_CHEESE_KEYWORDS = [...SOFT_CHEESE_KEYWORDS_EN, ...SOFT_CHEESE_KEYWORDS_TR, ...SOFT_CHEESE_KEYWORDS_ES];
const HIGH_MERCURY_FISH = [...HIGH_MERCURY_FISH_EN, ...HIGH_MERCURY_FISH_TR, ...HIGH_MERCURY_FISH_ES];
const ALCOHOL_KEYWORDS = [...ALCOHOL_KEYWORDS_EN, ...ALCOHOL_KEYWORDS_TR, ...ALCOHOL_KEYWORDS_ES];
const CHOKING_HAZARD_KEYWORDS = [...CHOKING_HAZARD_KEYWORDS_EN, ...CHOKING_HAZARD_KEYWORDS_TR, ...CHOKING_HAZARD_KEYWORDS_ES];
const LIVER_KEYWORDS = [...LIVER_KEYWORDS_EN, ...LIVER_KEYWORDS_TR, ...LIVER_KEYWORDS_ES];
const PALM_HYDROGENATED_KEYWORDS = [...PALM_HYDROGENATED_KEYWORDS_EN, ...PALM_HYDROGENATED_KEYWORDS_TR, ...PALM_HYDROGENATED_KEYWORDS_ES];
const ARTIFICIAL_FLAVOR_KEYWORDS = [...ARTIFICIAL_FLAVOR_KEYWORDS_EN, ...ARTIFICIAL_FLAVOR_KEYWORDS_TR, ...ARTIFICIAL_FLAVOR_KEYWORDS_ES];
const ARTIFICIAL_COLOR_KEYWORDS = [...ARTIFICIAL_COLOR_KEYWORDS_EN, ...ARTIFICIAL_COLOR_KEYWORDS_TR, ...ARTIFICIAL_COLOR_KEYWORDS_ES];
const HARMFUL_PRESERVATIVE_KEYWORDS = [...HARMFUL_PRESERVATIVE_KEYWORDS_EN, ...HARMFUL_PRESERVATIVE_KEYWORDS_TR, ...HARMFUL_PRESERVATIVE_KEYWORDS_ES];
const INDUSTRIAL_EMULSIFIER_KEYWORDS = [...INDUSTRIAL_EMULSIFIER_KEYWORDS_EN, ...INDUSTRIAL_EMULSIFIER_KEYWORDS_TR, ...INDUSTRIAL_EMULSIFIER_KEYWORDS_ES];
const ULTRA_PROCESSED_MARKER_KEYWORDS = [...ULTRA_PROCESSED_MARKER_KEYWORDS_EN, ...ULTRA_PROCESSED_MARKER_KEYWORDS_TR, ...ULTRA_PROCESSED_MARKER_KEYWORDS_ES];

export const LIFESTAGE_RULES: Record<LifeStageType, LifeStageRule[]> = {
    // 0-6 AY: Sadece anne sütü/mama
    INFANT_0_6: [
        ...expandRules(HONEY_KEYWORDS, "forbidden", "infant_honey"),
        ...expandRules(SALT_KEYWORDS, "forbidden", "infant_salt"),
        ...expandRules(SUGAR_KEYWORDS, "forbidden", "infant_sugar"),
        ...expandRules(WHOLE_NUT_KEYWORDS, "forbidden", "infant_nut"),
        ...expandRules(NUT_BUTTER_KEYWORDS, "forbidden", "infant_nut"),
        ...expandRules(["cow milk", "whole milk", "milk powder"], "forbidden", "infant_cow_milk"),
        ...expandRules(EGG_WHITE_KEYWORDS, "forbidden", "infant_egg_white"),
        ...expandRules(SHELLFISH_KEYWORDS, "forbidden", "infant_shellfish"),
        ...expandRules(CAFFEINE_KEYWORDS, "forbidden", "infant_caffeine"),
        ...expandRules(CHOCOLATE_KEYWORDS, "forbidden", "infant_chocolate"),
        ...expandRules(RAW_FISH_KEYWORDS, "forbidden", "infant_raw"),
        ...expandRules(RAW_EGG_KEYWORDS, "forbidden", "infant_raw"),
        ...expandRules(PALM_HYDROGENATED_KEYWORDS, "forbidden", "infant_palm"),
        ...expandRules(ARTIFICIAL_FLAVOR_KEYWORDS, "forbidden", "infant_flavor"),
        ...expandRules(ARTIFICIAL_COLOR_KEYWORDS, "forbidden", "infant_color"),
        ...expandRules(HARMFUL_PRESERVATIVE_KEYWORDS, "forbidden", "infant_preservative"),
        ...expandRules(INDUSTRIAL_EMULSIFIER_KEYWORDS, "forbidden", "infant_emulsifier"),
        ...expandRules(ULTRA_PROCESSED_MARKER_KEYWORDS, "forbidden", "infant_ultraprocessed"),
        ...expandRules(ARTIFICIAL_SWEETENER_KEYWORDS, "forbidden", "infant_sweetener"),
    ],

    // 6-12 AY: Ek gıdaya geçiş
    INFANT_6_12: [
        ...expandRules(HONEY_KEYWORDS, "forbidden", "infant_honey"),
        ...expandRules(SALT_KEYWORDS, "restricted", "baby_salt"),
        ...expandRules(SUGAR_KEYWORDS, "restricted", "baby_sugar"),
        ...expandRules(WHOLE_NUT_KEYWORDS, "forbidden", "baby_whole_nut"),
        ...expandRules(NUT_BUTTER_KEYWORDS, "caution", "baby_peanut_intro"),
        ...expandRules(["cow milk", "whole milk"], "restricted", "baby_cow_milk"),
        ...expandRules(CAFFEINE_KEYWORDS, "forbidden", "infant_caffeine"),
        ...expandRules(CHOCOLATE_KEYWORDS, "restricted", "baby_chocolate"),
        ...expandRules(RAW_EGG_KEYWORDS, "forbidden", "baby_raw_egg"),
        ...expandRules(RAW_FISH_KEYWORDS, "forbidden", "baby_raw_fish"),
        ...expandRules(PROCESSED_MEAT_KEYWORDS, "restricted", "baby_processed"),
        ...expandRules(ARTIFICIAL_SWEETENER_KEYWORDS, "restricted", "baby_sweetener"),
        ...expandRules(PALM_HYDROGENATED_KEYWORDS, "forbidden", "infant_palm"),
        ...expandRules(ARTIFICIAL_FLAVOR_KEYWORDS, "restricted", "infant_flavor"),
        ...expandRules(ARTIFICIAL_COLOR_KEYWORDS, "restricted", "infant_color"),
        ...expandRules(HARMFUL_PRESERVATIVE_KEYWORDS, "forbidden", "infant_preservative"),
        ...expandRules(INDUSTRIAL_EMULSIFIER_KEYWORDS, "restricted", "infant_emulsifier"),
        ...expandRules(ULTRA_PROCESSED_MARKER_KEYWORDS, "restricted", "infant_ultraprocessed"),
    ],

    // 1-3 YAŞ
    TODDLER_1_3: [
        ...expandRules(SUGAR_KEYWORDS, "restricted", "toddler_sugar"),
        ...expandRules(SALT_KEYWORDS, "restricted", "toddler_sodium"),
        ...expandRules(PALM_HYDROGENATED_KEYWORDS, "restricted", "toddler_palm"),
        ...expandRules(PROCESSED_MEAT_KEYWORDS, "restricted", "toddler_processed"),
        ...expandRules(ARTIFICIAL_COLOR_KEYWORDS, "restricted", "toddler_color"),
        ...expandRules(HARMFUL_PRESERVATIVE_KEYWORDS, "restricted", "toddler_preservative"),
        ...expandRules(CHOKING_HAZARD_KEYWORDS, "restricted", "toddler_choking"),
        ...expandRules(CAFFEINE_KEYWORDS, "restricted", "child_caffeine"),
        ...expandRules(["energy drink"], "forbidden", "child_energy_drink"),
        ...expandRules(ALCOHOL_KEYWORDS, "forbidden", "child_alcohol"),
        ...expandRules(CHOCOLATE_KEYWORDS, "caution", "toddler_chocolate"),
        ...expandRules(ARTIFICIAL_FLAVOR_KEYWORDS, "caution", "toddler_flavor"),
        ...expandRules(INDUSTRIAL_EMULSIFIER_KEYWORDS, "caution", "toddler_emulsifier"),
        ...expandRules(ULTRA_PROCESSED_MARKER_KEYWORDS, "caution", "toddler_ultraprocessed"),
        ...expandRules(ARTIFICIAL_SWEETENER_KEYWORDS, "caution", "toddler_sweetener"),
        ...expandRules(RAW_FISH_KEYWORDS, "caution", "toddler_raw_fish"),
    ],

    // 3-12 YAŞ
    CHILD_3_12: [
        ...expandRules(SUGAR_KEYWORDS, "caution", "child_sugar"),
        ...expandRules(SALT_KEYWORDS, "caution", "child_sodium"),
        ...expandRules(PALM_HYDROGENATED_KEYWORDS, "restricted", "child_palm"),
        ...expandRules(PROCESSED_MEAT_KEYWORDS, "caution", "child_processed"),
        ...expandRules(ARTIFICIAL_COLOR_KEYWORDS, "caution", "child_color"),
        ...expandRules(ARTIFICIAL_FLAVOR_KEYWORDS, "caution", "child_flavor"),
        ...expandRules(HARMFUL_PRESERVATIVE_KEYWORDS, "caution", "child_preservative"),
        ...expandRules(CAFFEINE_KEYWORDS, "restricted", "child_caffeine"),
        ...expandRules(["energy drink"], "forbidden", "child_energy_drink"),
        ...expandRules(ALCOHOL_KEYWORDS, "forbidden", "child_alcohol"),
        ...expandRules(RAW_FISH_KEYWORDS, "caution", "child_raw_fish"),
        ...expandRules(ARTIFICIAL_SWEETENER_KEYWORDS, "limit", "child_sweetener"),
        ...expandRules(INDUSTRIAL_EMULSIFIER_KEYWORDS, "limit", "child_emulsifier"),
        ...expandRules(ULTRA_PROCESSED_MARKER_KEYWORDS, "limit", "child_ultraprocessed"),
    ],

    // 12-18 YAŞ
    TEEN: [
        ...expandRules(SUGAR_KEYWORDS, "limit", "teen_sugar"),
        ...expandRules(SALT_KEYWORDS, "limit", "teen_sodium"),
        ...expandRules(PALM_HYDROGENATED_KEYWORDS, "caution", "teen_palm"),
        ...expandRules(PROCESSED_MEAT_KEYWORDS, "limit", "teen_processed"),
        ...expandRules(ARTIFICIAL_COLOR_KEYWORDS, "limit", "teen_color"),
        ...expandRules(ARTIFICIAL_FLAVOR_KEYWORDS, "limit", "teen_flavor"),
        ...expandRules(HARMFUL_PRESERVATIVE_KEYWORDS, "caution", "teen_preservative"),
        ...expandRules(["energy drink"], "restricted", "teen_energy_drink"),
        ...expandRules(ALCOHOL_KEYWORDS, "forbidden", "teen_alcohol"),
        ...expandRules(CAFFEINE_KEYWORDS, "limit", "teen_caffeine"),
        ...expandRules(ARTIFICIAL_SWEETENER_KEYWORDS, "limit", "teen_sweetener"),
        ...expandRules(INDUSTRIAL_EMULSIFIER_KEYWORDS, "limit", "teen_emulsifier"),
        ...expandRules(ULTRA_PROCESSED_MARKER_KEYWORDS, "limit", "teen_ultraprocessed"),
    ],

    // YETİŞKİN: Kısıtlama yok
    ADULT: [],

    // 65+ YAŞ
    ELDERLY: [
        ...expandRules(SUGAR_KEYWORDS, "limit", "elderly_sugar"),
        ...expandRules(SALT_KEYWORDS, "caution", "elderly_sodium"),
        ...expandRules(PALM_HYDROGENATED_KEYWORDS, "caution", "elderly_palm"),
        ...expandRules(PROCESSED_MEAT_KEYWORDS, "caution", "elderly_processed"),
        ...expandRules(HARMFUL_PRESERVATIVE_KEYWORDS, "caution", "elderly_preservative"),
        ...expandRules(ULTRA_PROCESSED_MARKER_KEYWORDS, "limit", "elderly_ultraprocessed"),
        ...expandRules(RAW_EGG_KEYWORDS, "caution", "elderly_raw"),
        ...expandRules(RAW_FISH_KEYWORDS, "caution", "elderly_raw"),
        ...expandRules(UNPASTEURIZED_KEYWORDS, "restricted", "elderly_unpasteurized"),
    ],

    // HAMİLE
    PREGNANT: [
        ...expandRules(ALCOHOL_KEYWORDS, "forbidden", "pregnant_alcohol"),
        ...expandRules(RAW_FISH_KEYWORDS, "forbidden", "pregnant_raw_fish"),
        ...expandRules(RAW_EGG_KEYWORDS, "forbidden", "pregnant_raw_egg"),
        ...expandRules(UNPASTEURIZED_KEYWORDS, "forbidden", "pregnant_unpasteurized"),
        ...expandRules(SOFT_CHEESE_KEYWORDS, "restricted", "pregnant_soft_cheese"),
        ...expandRules(HIGH_MERCURY_FISH, "forbidden", "pregnant_mercury"),
        ...expandRules(["tuna"], "caution", "pregnant_tuna"),
        ...expandRules(CAFFEINE_KEYWORDS, "limit", "pregnant_caffeine"),
        ...expandRules(LIVER_KEYWORDS, "restricted", "pregnant_liver"),
        ...expandRules(PROCESSED_MEAT_KEYWORDS, "caution", "pregnant_deli"),
        ...expandRules(SUGAR_KEYWORDS, "caution", "pregnant_sugar"),
        ...expandRules(SALT_KEYWORDS, "limit", "pregnant_sodium"),
        ...expandRules(PALM_HYDROGENATED_KEYWORDS, "restricted", "pregnant_palm"),
        ...expandRules(ARTIFICIAL_COLOR_KEYWORDS, "caution", "pregnant_color"),
        ...expandRules(ARTIFICIAL_FLAVOR_KEYWORDS, "caution", "pregnant_flavor"),
        ...expandRules(HARMFUL_PRESERVATIVE_KEYWORDS, "restricted", "pregnant_preservative"),
        ...expandRules(INDUSTRIAL_EMULSIFIER_KEYWORDS, "caution", "pregnant_emulsifier"),
        ...expandRules(ULTRA_PROCESSED_MARKER_KEYWORDS, "caution", "pregnant_ultraprocessed"),
        ...expandRules(ARTIFICIAL_SWEETENER_KEYWORDS, "caution", "pregnant_sweetener"),
        ...expandRules(CHOCOLATE_KEYWORDS, "limit", "pregnant_chocolate"),
    ],

    // EMZİREN
    BREASTFEEDING: [
        ...expandRules(ALCOHOL_KEYWORDS, "restricted", "breastfeeding_alcohol"),
        ...expandRules(CAFFEINE_KEYWORDS, "limit", "breastfeeding_caffeine"),
        ...expandRules(HIGH_MERCURY_FISH, "restricted", "breastfeeding_mercury"),
        ...expandRules(PALM_HYDROGENATED_KEYWORDS, "caution", "breastfeeding_palm"),
        ...expandRules(HARMFUL_PRESERVATIVE_KEYWORDS, "caution", "breastfeeding_preservative"),
        ...expandRules(ARTIFICIAL_SWEETENER_KEYWORDS, "caution", "breastfeeding_sweetener"),
        ...expandRules(CHOCOLATE_KEYWORDS, "limit", "breastfeeding_chocolate"),
    ],
};

export function getLifeStageRules(lifeStage: LifeStageType): LifeStageRule[] {
    return LIFESTAGE_RULES[lifeStage] || [];
}
