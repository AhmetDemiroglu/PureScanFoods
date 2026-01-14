import { LifeStageType } from "./lifestages";
import { SeverityLevel } from "./analysisEngine";

/**
 * Yaş grubuna göre ingredient kısıtlamaları
 * Kaynak: WHO, AAP, T.C. Sağlık Bakanlığı Bebek Beslenmesi Rehberi
 */

interface LifeStageRule {
    keyword: string;
    severity: SeverityLevel;
    messageKey: string;
}

export const LIFESTAGE_RULES: Record<LifeStageType, LifeStageRule[]> = {
    // 0-6 AY: Sadece anne sütü/mama - neredeyse her şey yasak
    INFANT_0_6: [
        { keyword: "honey", severity: "forbidden", messageKey: "infant_honey" },
        { keyword: "salt", severity: "forbidden", messageKey: "infant_salt" },
        { keyword: "sugar", severity: "forbidden", messageKey: "infant_sugar" },
        { keyword: "peanut", severity: "forbidden", messageKey: "infant_peanut" },
        { keyword: "nut", severity: "forbidden", messageKey: "infant_nut" },
        { keyword: "whole milk", severity: "forbidden", messageKey: "infant_whole_milk" },
        { keyword: "cow milk", severity: "forbidden", messageKey: "infant_cow_milk" },
        { keyword: "egg white", severity: "forbidden", messageKey: "infant_egg_white" },
        { keyword: "shellfish", severity: "forbidden", messageKey: "infant_shellfish" },
        { keyword: "caffeine", severity: "forbidden", messageKey: "infant_caffeine" },
        { keyword: "coffee", severity: "forbidden", messageKey: "infant_caffeine" },
        { keyword: "tea", severity: "forbidden", messageKey: "infant_caffeine" },
        { keyword: "chocolate", severity: "forbidden", messageKey: "infant_chocolate" },
        { keyword: "raw", severity: "forbidden", messageKey: "infant_raw" },
    ],

    // 6-12 AY: Ek gıdaya geçiş - bazı kısıtlamalar devam
    INFANT_6_12: [
        { keyword: "honey", severity: "forbidden", messageKey: "infant_honey" },
        { keyword: "salt", severity: "restricted", messageKey: "baby_salt" },
        { keyword: "sugar", severity: "restricted", messageKey: "baby_sugar" },
        { keyword: "whole nut", severity: "forbidden", messageKey: "baby_whole_nut" },
        { keyword: "peanut butter", severity: "caution", messageKey: "baby_peanut_intro" },
        { keyword: "whole milk", severity: "restricted", messageKey: "baby_whole_milk" },
        { keyword: "cow milk", severity: "restricted", messageKey: "baby_cow_milk" },
        { keyword: "caffeine", severity: "forbidden", messageKey: "infant_caffeine" },
        { keyword: "coffee", severity: "forbidden", messageKey: "infant_caffeine" },
        { keyword: "chocolate", severity: "restricted", messageKey: "baby_chocolate" },
        { keyword: "raw egg", severity: "forbidden", messageKey: "baby_raw_egg" },
        { keyword: "raw fish", severity: "forbidden", messageKey: "baby_raw_fish" },
        { keyword: "sushi", severity: "forbidden", messageKey: "baby_raw_fish" },
        { keyword: "high sodium", severity: "restricted", messageKey: "baby_sodium" },
        { keyword: "processed meat", severity: "restricted", messageKey: "baby_processed" },
        { keyword: "sausage", severity: "restricted", messageKey: "baby_processed" },
        { keyword: "hot dog", severity: "restricted", messageKey: "baby_processed" },
    ],

    // 1-3 YAŞ: Çoğu şey serbest ama dikkat gerekli
    TODDLER_1_3: [
        { keyword: "honey", severity: "monitor", messageKey: "toddler_honey_ok" },
        { keyword: "whole nut", severity: "restricted", messageKey: "toddler_choking" },
        { keyword: "popcorn", severity: "restricted", messageKey: "toddler_choking" },
        { keyword: "hard candy", severity: "restricted", messageKey: "toddler_choking" },
        { keyword: "raw fish", severity: "caution", messageKey: "toddler_raw_fish" },
        { keyword: "sushi", severity: "caution", messageKey: "toddler_raw_fish" },
        { keyword: "caffeine", severity: "restricted", messageKey: "child_caffeine" },
        { keyword: "coffee", severity: "restricted", messageKey: "child_caffeine" },
        { keyword: "energy drink", severity: "forbidden", messageKey: "child_energy_drink" },
        { keyword: "high sodium", severity: "caution", messageKey: "toddler_sodium" },
        { keyword: "artificial sweetener", severity: "caution", messageKey: "toddler_sweetener" },
        { keyword: "aspartame", severity: "caution", messageKey: "toddler_sweetener" },
        { keyword: "sucralose", severity: "caution", messageKey: "toddler_sweetener" },
    ],

    // 3-12 YAŞ: Genel çocuk beslenmesi
    CHILD_3_12: [
        { keyword: "caffeine", severity: "restricted", messageKey: "child_caffeine" },
        { keyword: "coffee", severity: "restricted", messageKey: "child_caffeine" },
        { keyword: "energy drink", severity: "forbidden", messageKey: "child_energy_drink" },
        { keyword: "alcohol", severity: "forbidden", messageKey: "child_alcohol" },
        { keyword: "raw fish", severity: "caution", messageKey: "child_raw_fish" },
        { keyword: "high sodium", severity: "caution", messageKey: "child_sodium" },
        { keyword: "artificial sweetener", severity: "limit", messageKey: "child_sweetener" },
    ],

    // 12-18 YAŞ: Ergen
    TEEN: [
        { keyword: "energy drink", severity: "restricted", messageKey: "teen_energy_drink" },
        { keyword: "alcohol", severity: "forbidden", messageKey: "teen_alcohol" },
        { keyword: "caffeine", severity: "limit", messageKey: "teen_caffeine" },
    ],

    // YETİŞKİN: Varsayılan, kısıtlama yok
    ADULT: [],

    // 65+ YAŞ: Yaşlı beslenme
    ELDERLY: [
        { keyword: "high sodium", severity: "caution", messageKey: "elderly_sodium" },
        { keyword: "raw egg", severity: "caution", messageKey: "elderly_raw" },
        { keyword: "raw fish", severity: "caution", messageKey: "elderly_raw" },
        { keyword: "unpasteurized", severity: "restricted", messageKey: "elderly_unpasteurized" },
    ],

    // HAMİLE
    PREGNANT: [
        { keyword: "alcohol", severity: "forbidden", messageKey: "pregnant_alcohol" },
        { keyword: "raw fish", severity: "forbidden", messageKey: "pregnant_raw_fish" },
        { keyword: "sushi", severity: "forbidden", messageKey: "pregnant_raw_fish" },
        { keyword: "raw egg", severity: "forbidden", messageKey: "pregnant_raw_egg" },
        { keyword: "unpasteurized", severity: "forbidden", messageKey: "pregnant_unpasteurized" },
        { keyword: "raw milk", severity: "forbidden", messageKey: "pregnant_unpasteurized" },
        { keyword: "soft cheese", severity: "restricted", messageKey: "pregnant_soft_cheese" },
        { keyword: "brie", severity: "restricted", messageKey: "pregnant_soft_cheese" },
        { keyword: "camembert", severity: "restricted", messageKey: "pregnant_soft_cheese" },
        { keyword: "high mercury", severity: "forbidden", messageKey: "pregnant_mercury" },
        { keyword: "shark", severity: "forbidden", messageKey: "pregnant_mercury" },
        { keyword: "swordfish", severity: "forbidden", messageKey: "pregnant_mercury" },
        { keyword: "king mackerel", severity: "forbidden", messageKey: "pregnant_mercury" },
        { keyword: "tuna", severity: "caution", messageKey: "pregnant_tuna" },
        { keyword: "caffeine", severity: "limit", messageKey: "pregnant_caffeine" },
        { keyword: "liver", severity: "restricted", messageKey: "pregnant_liver" },
        { keyword: "deli meat", severity: "caution", messageKey: "pregnant_deli" },
    ],

    // EMZİREN
    BREASTFEEDING: [
        { keyword: "alcohol", severity: "restricted", messageKey: "breastfeeding_alcohol" },
        { keyword: "caffeine", severity: "limit", messageKey: "breastfeeding_caffeine" },
        { keyword: "high mercury", severity: "restricted", messageKey: "breastfeeding_mercury" },
        { keyword: "shark", severity: "restricted", messageKey: "breastfeeding_mercury" },
        { keyword: "swordfish", severity: "restricted", messageKey: "breastfeeding_mercury" },
    ],
};

export function getLifeStageRules(lifeStage: LifeStageType): LifeStageRule[] {
    return LIFESTAGE_RULES[lifeStage] || [];
}
