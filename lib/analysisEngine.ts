import { DietType, getDietDefinition } from "./diets";
import { AllergenType } from "./allergens";
import { DIET_FORBIDDEN_KEYWORDS, ALLERGEN_KEYWORDS, AMBIGUOUS_KEYWORDS } from "./matchingRules";

export type CompatibilityStatus = "safe" | "risk" | "avoid" | "uncertain";

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

const STATUS_COLORS = {
    safe: "#10B981", // Yeşil
    risk: "#F59E0B", // Turuncu
    avoid: "#EF4444", // Kırmızı
    uncertain: "#64748B", // Gri
};

export function analyzeEngine(ingredients: string[], userProfile: { diet: DietType | null; allergens: AllergenType[] }, safetyScore: number = 50, t: (key: string, options?: any) => string): CompatibilityReport {
    // 1. Profil Yoksa -> Güvenlik Puanını Kullan
    if (!userProfile.diet && userProfile.allergens.length === 0) {
        let derivedStatus: CompatibilityStatus = "safe";
        if (safetyScore < 40) derivedStatus = "avoid";
        else if (safetyScore < 70) derivedStatus = "risk";

        return {
            score: safetyScore,
            status: derivedStatus,
            title: t(`results.analysis.status.${derivedStatus}`), // DİNAMİK
            color: STATUS_COLORS[derivedStatus],
            findings: [],
            summary: t("results.analysis.findings.safe_summary"), // DİNAMİK
        };
    }

    const normalizedIngredients = ingredients.map((i) => i.toLowerCase().trim());
    const findings: Finding[] = [];
    let score = 100;

    // 2. Alerjen Kontrolü
    userProfile.allergens.forEach((allergen) => {
        const strictKeywords = ALLERGEN_KEYWORDS[allergen] || [];
        const ambiguousKeywords = AMBIGUOUS_KEYWORDS[allergen] || [];

        // A) Kesin Yasaklar
        strictKeywords.forEach((key) => {
            const found = normalizedIngredients.find((ing) => ing.includes(key));
            if (found) {
                const isAmbiguous = ambiguousKeywords.some((ambKey) => found.includes(ambKey));
                if (isAmbiguous && key === "malt" && found.includes("maltodextrin")) {
                    return; 
                }

                if (!findings.some((f) => f.keyword === found)) {
                    findings.push({
                        keyword: found,
                        source: allergen,
                        type: "allergen",
                        severity: "high",
                        message: t("results.analysis.findings.high_allergen", { source: allergen, keyword: found }), // DİNAMİK
                    });
                    score = 0;
                }
            }
        });

        // B) Muğlak/Şüpheli Durumlar
        if (score > 0) {
            ambiguousKeywords.forEach((key) => {
                const found = normalizedIngredients.find((ing) => ing === key || ing.includes(` ${key} `) || ing.startsWith(`${key} `));
                if (found) {
                    findings.push({
                        keyword: found,
                        source: allergen,
                        type: "ambiguous",
                        severity: "medium",
                        message: t("results.analysis.findings.medium_ambiguous", { source: allergen, keyword: found }), // DİNAMİK
                    });
                    score -= 25;
                }
            });
        }
    });

    // 3. Diyet Kontrolü
    if (userProfile.diet && score > 0) {
        const forbidden = DIET_FORBIDDEN_KEYWORDS[userProfile.diet] || [];
        const dietDef = getDietDefinition(userProfile.diet);
        const isStrict = dietDef.severity === "strict";

        forbidden.forEach((key) => {
            const found = normalizedIngredients.find((ing) => ing.includes(key));
            if (found) {
                if (!findings.some((f) => f.keyword === found)) {
                    const deduction = isStrict ? 100 : 30;
                    if (isStrict) score = 0;
                    else score -= deduction;

                    findings.push({
                        keyword: found,
                        source: userProfile.diet!,
                        type: "diet",
                        severity: isStrict ? "high" : "medium",
                        message: t("results.analysis.findings.diet_violation", { diet: userProfile.diet, keyword: found }), // DİNAMİK
                    });
                }
            }
        });
    }

    // 4. Sonuç Hesaplama
    if (score < 0) score = 0;

    let status: CompatibilityStatus = "safe";
    if (score <= 30) status = "avoid";
    else if (score < 80) status = "risk";

    // 5. Özet Metni
    let summary = t("results.analysis.findings.safe_summary");

    const highRisk = findings.filter((f) => f.severity === "high");
    const mediumRisk = findings.filter((f) => f.severity === "medium");

    if (highRisk.length > 0) {
        summary = t("results.analysis.findings.high_risk_summary", { source: highRisk[0].source });
    } else if (mediumRisk.length > 0) {
        if (mediumRisk.some((f) => f.keyword.includes("maltodextrin") && f.source === "GLUTEN")) {
            summary = t("results.analysis.findings.gluten_ambiguous");
        } else {
            summary = t("results.analysis.findings.medium_risk_summary", { keyword: mediumRisk[0].keyword });
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
