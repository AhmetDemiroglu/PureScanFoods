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

const HONEY_KEYWORDS = ["honey", "bal"];
const SALT_KEYWORDS = ["salt", "sodium", "tuz"];
const SUGAR_KEYWORDS = ["sugar", "sucrose", "glucose", "fructose", "dextrose", "corn syrup", "cane sugar"];
const CAFFEINE_KEYWORDS = ["caffeine", "coffee", "espresso", "matcha", "guarana", "energy drink"];
const WHOLE_NUT_KEYWORDS = ["whole almond", "whole hazelnut", "whole walnut", "whole cashew", "whole pistachio", "whole peanut"];
const NUT_BUTTER_KEYWORDS = ["peanut butter", "peanut paste", "almond butter", "hazelnut spread", "nut butter"];
const RAW_EGG_KEYWORDS = ["raw egg", "undercooked egg", "soft boiled egg"];
const EGG_WHITE_KEYWORDS = ["egg white", "albumin", "albumen", "meringue"];
const RAW_FISH_KEYWORDS = ["raw fish", "sushi", "sashimi", "ceviche", "raw salmon", "raw tuna"];
const SHELLFISH_KEYWORDS = ["shrimp", "prawn", "crab", "lobster", "oyster", "mussel", "clam", "scallop"];
const CHOCOLATE_KEYWORDS = ["chocolate", "cocoa", "cacao"];
const PROCESSED_MEAT_KEYWORDS = ["sausage", "hot dog", "bacon", "salami", "pepperoni", "ham", "bologna", "deli meat", "cured meat", "smoked meat"];
const ARTIFICIAL_SWEETENER_KEYWORDS = [
    "aspartame",
    "sucralose",
    "saccharin",
    "acesulfame",
    "neotame",
    "advantame",
    "cyclamate",
    "e950",
    "e951",
    "e952",
    "e954",
    "e955",
    "e961",
    "e962",
];
const UNPASTEURIZED_KEYWORDS = ["unpasteurized", "raw milk", "raw cheese"];
const SOFT_CHEESE_KEYWORDS = ["brie", "camembert", "feta", "blue cheese", "gorgonzola", "roquefort"];
const HIGH_MERCURY_FISH = ["shark", "swordfish", "king mackerel", "tilefish", "bigeye tuna", "marlin"];
const ALCOHOL_KEYWORDS = ["alcohol", "wine", "beer", "vodka", "rum", "whiskey", "liqueur", "ethanol"];
const CHOKING_HAZARD_KEYWORDS = ["whole nut", "popcorn", "hard candy", "whole grape", "cherry tomato", "raw carrot"];
const LIVER_KEYWORDS = ["liver", "pate", "liverwurst"];

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
