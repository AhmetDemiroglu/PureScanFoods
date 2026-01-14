export type LifeStageType =
    | "INFANT_0_6" // 0-6 ay (sadece anne sütü/mama)
    | "INFANT_6_12" // 6-12 ay (ek gıdaya geçiş)
    | "TODDLER_1_3" // 1-3 yaş
    | "CHILD_3_12" // 3-12 yaş
    | "TEEN" // 12-18 yaş
    | "ADULT" // 18-65 yaş (varsayılan)
    | "ELDERLY" // 65+ yaş
    | "PREGNANT" // Hamile
    | "BREASTFEEDING"; // Emziren

export interface LifeStageDefinition {
    type: LifeStageType;
    name: string;
    nameTr: string;
    description: string;
    descriptionTr: string;
    ageRange?: string;
}

export const LIFESTAGE_DEFINITIONS: Record<LifeStageType, LifeStageDefinition> = {
    INFANT_0_6: {
        type: "INFANT_0_6",
        name: "Infant (0-6 months)",
        nameTr: "Bebek (0-6 ay)",
        description: "Breast milk or formula only",
        descriptionTr: "Sadece anne sütü veya mama",
        ageRange: "0-6 months",
    },
    INFANT_6_12: {
        type: "INFANT_6_12",
        name: "Infant (6-12 months)",
        nameTr: "Bebek (6-12 ay)",
        description: "Complementary feeding stage",
        descriptionTr: "Ek gıdaya geçiş dönemi",
        ageRange: "6-12 months",
    },
    TODDLER_1_3: {
        type: "TODDLER_1_3",
        name: "Toddler (1-3 years)",
        nameTr: "Küçük Çocuk (1-3 yaş)",
        description: "Transition to family foods",
        descriptionTr: "Aile yemeklerine geçiş",
        ageRange: "1-3 years",
    },
    CHILD_3_12: {
        type: "CHILD_3_12",
        name: "Child (3-12 years)",
        nameTr: "Çocuk (3-12 yaş)",
        description: "Growing child",
        descriptionTr: "Büyüyen çocuk",
        ageRange: "3-12 years",
    },
    TEEN: {
        type: "TEEN",
        name: "Teenager (12-18 years)",
        nameTr: "Ergen (12-18 yaş)",
        description: "Adolescent growth period",
        descriptionTr: "Ergenlik büyüme dönemi",
        ageRange: "12-18 years",
    },
    ADULT: {
        type: "ADULT",
        name: "Adult",
        nameTr: "Yetişkin",
        description: "Standard adult",
        descriptionTr: "Standart yetişkin",
        ageRange: "18-65 years",
    },
    ELDERLY: {
        type: "ELDERLY",
        name: "Elderly (65+)",
        nameTr: "Yaşlı (65+)",
        description: "Senior nutrition needs",
        descriptionTr: "Yaşlı beslenme ihtiyaçları",
        ageRange: "65+ years",
    },
    PREGNANT: {
        type: "PREGNANT",
        name: "Pregnant",
        nameTr: "Hamile",
        description: "Pregnancy nutrition",
        descriptionTr: "Hamilelik beslenmesi",
    },
    BREASTFEEDING: {
        type: "BREASTFEEDING",
        name: "Breastfeeding",
        nameTr: "Emziren",
        description: "Lactation nutrition",
        descriptionTr: "Emzirme dönemi beslenmesi",
    },
};

export function getLifeStageDefinition(type: LifeStageType): LifeStageDefinition {
    return LIFESTAGE_DEFINITIONS[type];
}

export function getAllLifeStageTypes(): LifeStageType[] {
    return Object.keys(LIFESTAGE_DEFINITIONS) as LifeStageType[];
}
