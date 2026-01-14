import { DietType, getDietDefinition } from "./diets";
import { AllergenType } from "./allergens";
import { DIET_FORBIDDEN_KEYWORDS, ALLERGEN_KEYWORDS, AMBIGUOUS_KEYWORDS } from "./matchingRules";

export type CompatibilityStatus = "safe" | "risk" | "avoid" | "uncertain";

function matchesKeyword(text: string, keyword: string): boolean {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "i");
    return regex.test(text);
}

export interface Finding {
    keyword: string;
    source: string;
    type: "allergen" | "diet" | "ambiguous";
    severity: "high" | "medium" | "low";
    message: string;
}

export interface CompatibilityReport {
    score: number;
    status: CompatibilityStatus;
    title: string;
    color: string;
    findings: Finding[];
    summary: string;
}

export interface IngredientInput {
    display_name: string;
    technical_name: string;
    isAllergen?: boolean;
    riskLevel?: string;
}

const STATUS_COLORS = {
    safe: "#10B981",
    risk: "#F59E0B",
    avoid: "#EF4444",
    uncertain: "#64748B",
};

const STRICT_EXCEPTIONS: Record<string, string[]> = {
    malt: ["maltodextrin", "maltodekstrin", "maltitol", "isomalt"],
    flour: ["almond flour", "coconut flour", "flaxseed flour", "flax flour", "hazelnut flour", "chia flour"],
    un: ["badem unu", "hindistan cevizi unu", "keten tohumu unu", "fındık unu", "chia unu"],
    wheat: ["buckwheat", "buck wheat"],
    buğday: ["karabuğday"],
};

export function analyzeEngine(ingredients: IngredientInput[], userProfile: { diet: DietType | null; allergens: AllergenType[] }, safetyScore: number = 50, t: (key: string, options?: any) => string): CompatibilityReport {
    // 1. Profil Yoksa
    if (!userProfile.diet && userProfile.allergens.length === 0) {
        return {
            score: safetyScore,
            status: "uncertain",
            title: t("results.analysis.findings.no_profile_title"),
            color: "#64748B",
            findings: [],
            summary: t("results.analysis.findings.no_profile_summary"),
        };
    }

    const findings: Finding[] = [];
    const processedIndices = new Set<number>();
    let score = 100;

    const techIngredients = ingredients.map((i) => i.technical_name.toLowerCase().trim());

    // A) ÖNCE MUĞLAK (AMBIGUOUS) KONTROLÜ
    userProfile.allergens.forEach((allergen) => {
        const ambiguousKeywords = AMBIGUOUS_KEYWORDS[allergen] || [];

        ambiguousKeywords.forEach((key) => {
            techIngredients.forEach((ingTech, index) => {
                if (processedIndices.has(index)) return;

                if (matchesKeyword(ingTech, key)) {
                    findings.push({
                        keyword: ingredients[index].display_name,
                        source: allergen,
                        type: "ambiguous",
                        severity: "medium",
                        message: t("results.analysis.findings.medium_ambiguous_desc", {
                            source: allergen,
                            keyword: ingredients[index].display_name,
                        }),
                    });

                    score -= 25;
                    processedIndices.add(index);
                }
            });
        });
    });

    // B) KESİN YASAKLAR (STRICT) KONTROLÜ
    userProfile.allergens.forEach((allergen) => {
        const strictKeywords = ALLERGEN_KEYWORDS[allergen] || [];

        strictKeywords.forEach((key) => {
            techIngredients.forEach((ingTech, index) => {
                if (processedIndices.has(index)) return;

                if (matchesKeyword(ingTech, key)) {
                    const exceptions = STRICT_EXCEPTIONS[key];
                    if (exceptions && exceptions.some((ex) => ingTech.includes(ex))) {
                        return;
                    }

                    if (!findings.some((f) => f.keyword === ingredients[index].display_name && f.severity === "high")) {
                        findings.push({
                            keyword: ingredients[index].display_name,
                            source: allergen,
                            type: "allergen",
                            severity: "high",
                            message: t("results.analysis.findings.high_allergen_desc", {
                                source: allergen,
                                keyword: ingredients[index].display_name,
                            }),
                        });
                        score = 0;
                        processedIndices.add(index);
                    }
                }
            });
        });
    });

    // C) DİYET KONTROLÜ
    if (userProfile.diet && score > 0) {
        const forbidden = DIET_FORBIDDEN_KEYWORDS[userProfile.diet] || [];
        const dietDef = getDietDefinition(userProfile.diet);
        const isStrict = dietDef?.severity === "strict";

        forbidden.forEach((key) => {
            techIngredients.forEach((ingTech, index) => {
                if (processedIndices.has(index)) return;

                if (matchesKeyword(ingTech, key)) {
                    if (!findings.some((f) => f.keyword === ingredients[index].display_name && f.type === "diet")) {
                        const deduction = isStrict ? 100 : 30;
                        if (isStrict) score = 0;
                        else score -= deduction;

                        findings.push({
                            keyword: ingredients[index].display_name,
                            source: userProfile.diet!,
                            type: "diet",
                            severity: isStrict ? "high" : "medium",
                            message: t("results.analysis.findings.diet_violation_desc", {
                                diet: userProfile.diet,
                                keyword: ingredients[index].display_name,
                            }),
                        });
                        processedIndices.add(index);
                    }
                }
            });
        });
    }

    const MACRO_DIETS = ["KETO", "LOW_CARB", "ATKINS", "DUKAN", "SUGAR_FREE"];
    const MEDICAL_DIETS = ["GLUTEN_FREE", "LACTOSE_FREE", "FODMAP", "DAIRY_FREE"];

    if (userProfile.diet) {
        const dietAmbiguous = AMBIGUOUS_KEYWORDS[userProfile.diet] || [];

        dietAmbiguous.forEach((key) => {
            techIngredients.forEach((ingTech, index) => {
                if (processedIndices.has(index)) return;

                if (matchesKeyword(ingTech, key)) {
                    const exceptions = STRICT_EXCEPTIONS[key];
                    if (exceptions && exceptions.some((ex) => ingTech.includes(ex))) return;

                    let messageKey = "medium_ambiguous_desc";
                    let sourceOrDiet = userProfile.diet;

                    if (MACRO_DIETS.includes(userProfile.diet!)) {
                        messageKey = "macro_violation_desc";
                    } else if (MEDICAL_DIETS.includes(userProfile.diet!)) {
                        messageKey = "medical_ambiguous_desc";
                    }

                    findings.push({
                        keyword: ingredients[index].display_name,
                        source: userProfile.diet!,
                        type: "ambiguous",
                        severity: "medium",
                        message: t(`results.analysis.findings.${messageKey}`, {
                            diet: userProfile.diet,
                            source: userProfile.diet,
                            keyword: ingredients[index].display_name,
                        }),
                    });

                    score -= 25;
                    processedIndices.add(index);
                }
            });
        });
    }

    // 4. Sonuç Hesaplama
    if (score < 0) score = 0;

    let status: CompatibilityStatus = "safe";
    if (score <= 30) status = "avoid";
    else if (score < 80) status = "risk";

    // 5. ÖZET METNİ (DÜZELTİLDİ)
    let summary = t("results.analysis.findings.safe_summary");

    const highRisk = findings.filter((f) => f.severity === "high");
    const mediumRisk = findings.filter((f) => f.severity === "medium");

    if (highRisk.length > 0) {
        summary = t("results.analysis.findings.high_risk_summary", { source: highRisk[0].source });
    } else if (mediumRisk.length > 0) {
        const hasGlutenAmbiguity = mediumRisk.some((f) => f.keyword.toLowerCase().includes("maltodextrin") || f.keyword.toLowerCase().includes("maltodekstrin"));

        if (hasGlutenAmbiguity && userProfile.allergens.includes("GLUTEN")) {
            summary = t("results.analysis.findings.gluten_ambiguous");
        } else {
            summary = t("results.analysis.findings.medium_risk_summary");
        }
    }

    return {
        score,
        status,
        title: t(`results.analysis.status.${status}`),
        color: STATUS_COLORS[status],
        findings,
        summary,
    };
}
