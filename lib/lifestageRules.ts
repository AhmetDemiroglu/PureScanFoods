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
const PROCESSED_MEAT_KEYWORDS_TR = ["sosis", "salam", "pastırma", "jambon", "füme et"];
const ARTIFICIAL_SWEETENER_KEYWORDS_TR = [
    "aspartam", "sukraloz", "sakarin", "asesülfam", "neotam", "siklamat"
];
const UNPASTEURIZED_KEYWORDS_TR = ["pastörize edilmemiş", "çiğ süt", "çiğ peynir"];
const SOFT_CHEESE_KEYWORDS_TR = ["brie", "camembert", "feta", "rokfur", "gorgonzola"];
const HIGH_MERCURY_FISH_TR = ["köpek balığı", "kılıç balığı", "ton balığı", "marlin"];
const ALCOHOL_KEYWORDS_TR = ["alkol", "şarap", "bira", "votka", "viski", "rakı"];
const CHOKING_HAZARD_KEYWORDS_TR = ["bütün fındık", "patlamış mısır", "şekerleme", "çiğ havuç"];
const LIVER_KEYWORDS_TR = ["karaciğer", "ciğer", "karaciğer sosisi"];

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
    "e950", "e951", "e952", "e954", "e955", "e961", "e962"
];
const UNPASTEURIZED_KEYWORDS_ES = ["no pasteurizado", "sin pasteurizar", "leche cruda", "queso crudo"];
const SOFT_CHEESE_KEYWORDS_ES = ["brie", "camembert", "feta", "queso azul", "gorgonzola", "roquefort"];
const HIGH_MERCURY_FISH_ES = ["tiburón", "pez espada", "caballa", "atún rojo", "marlin", "merlín"];
const ALCOHOL_KEYWORDS_ES = ["alcohol", "vino", "cerveza", "vodka", "ron", "whisky", "licor", "etanol"];
const CHOKING_HAZARD_KEYWORDS_ES = ["nuez entera", "palomitas", "caramelo duro", "uva entera", "tomate cherry", "zanahoria cruda"];
const LIVER_KEYWORDS_ES = ["hígado", "higado", "paté", "pate", "embutido de hígado"];

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

export const LIFESTAGE_RULES: Record<LifeStageType, LifeStageRule[]> = {
    // 0-6 AY: Neredeyse sadece anne sütü/mama
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
    ],

    // 1-3 YAŞ: Çoğu şey serbest ama dikkat gerekli
    TODDLER_1_3: [
        ...expandRules(CHOKING_HAZARD_KEYWORDS, "restricted", "toddler_choking"),
        ...expandRules(RAW_FISH_KEYWORDS, "caution", "toddler_raw_fish"),
        ...expandRules(CAFFEINE_KEYWORDS, "restricted", "child_caffeine"),
        ...expandRules(["energy drink"], "forbidden", "child_energy_drink"),
        ...expandRules(SALT_KEYWORDS, "caution", "toddler_sodium"),
        ...expandRules(ARTIFICIAL_SWEETENER_KEYWORDS, "caution", "toddler_sweetener"),
        ...expandRules(ALCOHOL_KEYWORDS, "forbidden", "child_alcohol"),
    ],

    // 3-12 YAŞ: Genel çocuk beslenmesi
    CHILD_3_12: [
        ...expandRules(CAFFEINE_KEYWORDS, "restricted", "child_caffeine"),
        ...expandRules(["energy drink"], "forbidden", "child_energy_drink"),
        ...expandRules(ALCOHOL_KEYWORDS, "forbidden", "child_alcohol"),
        ...expandRules(RAW_FISH_KEYWORDS, "caution", "child_raw_fish"),
        ...expandRules(ARTIFICIAL_SWEETENER_KEYWORDS, "limit", "child_sweetener"),
    ],

    // 12-18 YAŞ: Ergen
    TEEN: [
        ...expandRules(["energy drink"], "restricted", "teen_energy_drink"),
        ...expandRules(ALCOHOL_KEYWORDS, "forbidden", "teen_alcohol"),
        ...expandRules(CAFFEINE_KEYWORDS, "limit", "teen_caffeine"),
    ],

    // YETİŞKİN: Varsayılan, kısıtlama yok
    ADULT: [],

    // 65+ YAŞ: Yaşlı beslenme
    ELDERLY: [
        ...expandRules(SALT_KEYWORDS, "caution", "elderly_sodium"),
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
    ],

    // EMZİREN
    BREASTFEEDING: [
        ...expandRules(ALCOHOL_KEYWORDS, "restricted", "breastfeeding_alcohol"),
        ...expandRules(CAFFEINE_KEYWORDS, "limit", "breastfeeding_caffeine"),
        ...expandRules(HIGH_MERCURY_FISH, "restricted", "breastfeeding_mercury"),
    ],
};

export function getLifeStageRules(lifeStage: LifeStageType): LifeStageRule[] {
    return LIFESTAGE_RULES[lifeStage] || [];
}
