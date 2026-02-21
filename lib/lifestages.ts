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
    nameEs: string;
    description: string;
    descriptionTr: string;
    descriptionEs: string;
    ageRange?: string;
}

export const LIFESTAGE_DEFINITIONS: Record<LifeStageType, LifeStageDefinition> = {
    INFANT_0_6: {
        type: "INFANT_0_6",
        name: "Infant (0-6 months)",
        nameTr: "Bebek (0-6 ay)",
        nameEs: "Lactante (0-6 meses)",
        description: "Breast milk or formula only",
        descriptionTr: "Sadece anne sütü veya mama",
        descriptionEs: "Solo leche materna o fórmula",
        ageRange: "0-6 months",
    },
    INFANT_6_12: {
        type: "INFANT_6_12",
        name: "Infant (6-12 months)",
        nameTr: "Bebek (6-12 ay)",
        nameEs: "Lactante (6-12 meses)",
        description: "Complementary feeding stage",
        descriptionTr: "Ek gıdaya geçiş dönemi",
        descriptionEs: "Etapa de alimentación complementaria",
        ageRange: "6-12 months",
    },
    TODDLER_1_3: {
        type: "TODDLER_1_3",
        name: "Toddler (1-3 years)",
        nameTr: "Küçük Çocuk (1-3 yaş)",
        nameEs: "Niño pequeño (1-3 años)",
        description: "Transition to family foods",
        descriptionTr: "Aile yemeklerine geçiş",
        descriptionEs: "Transición a alimentos familiares",
        ageRange: "1-3 years",
    },
    CHILD_3_12: {
        type: "CHILD_3_12",
        name: "Child (3-12 years)",
        nameTr: "Çocuk (3-12 yaş)",
        nameEs: "Niño (3-12 años)",
        description: "Growing child",
        descriptionTr: "Büyüyen çocuk",
        descriptionEs: "Niño en crecimiento",
        ageRange: "3-12 years",
    },
    TEEN: {
        type: "TEEN",
        name: "Teenager (12-18 years)",
        nameTr: "Ergen (12-18 yaş)",
        nameEs: "Adolescente (12-18 años)",
        description: "Adolescent growth period",
        descriptionTr: "Ergenlik büyüme dönemi",
        descriptionEs: "Período de crecimiento adolescente",
        ageRange: "12-18 years",
    },
    ADULT: {
        type: "ADULT",
        name: "Adult",
        nameTr: "Yetişkin",
        nameEs: "Adulto",
        description: "Standard adult",
        descriptionTr: "Standart yetişkin",
        descriptionEs: "Adulto estándar",
        ageRange: "18-65 years",
    },
    ELDERLY: {
        type: "ELDERLY",
        name: "Elderly (65+)",
        nameTr: "Yaşlı (65+)",
        nameEs: "Adulto mayor (65+)",
        description: "Senior nutrition needs",
        descriptionTr: "Yaşlı beslenme ihtiyaçları",
        descriptionEs: "Necesidades nutricionales de adultos mayores",
        ageRange: "65+ years",
    },
    PREGNANT: {
        type: "PREGNANT",
        name: "Pregnant",
        nameTr: "Hamile",
        nameEs: "Embarazada",
        description: "Pregnancy nutrition",
        descriptionTr: "Hamilelik beslenmesi",
        descriptionEs: "Nutrición durante el embarazo",
    },
    BREASTFEEDING: {
        type: "BREASTFEEDING",
        name: "Breastfeeding",
        nameTr: "Emziren",
        nameEs: "Lactancia",
        description: "Lactation nutrition",
        descriptionTr: "Emzirme dönemi beslenmesi",
        descriptionEs: "Nutrición durante la lactancia",
    },
};

export function getLifeStageDefinition(type: LifeStageType): LifeStageDefinition {
    return LIFESTAGE_DEFINITIONS[type];
}

export function getAllLifeStageTypes(): LifeStageType[] {
    return Object.keys(LIFESTAGE_DEFINITIONS) as LifeStageType[];
}
