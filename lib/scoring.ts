import { SCORING_RULES, SAFETY_LEVELS, COMPATIBILITY_LEVELS, getAdditiveInfo, type NovaGroup, type ScoreLevel } from "../constants/scoring-rules";
import { checkAllergenMatch, type AllergenType } from "../constants/allergens";
import { checkDietCompliance, getDietDefinition, type DietType } from "../constants/diets";

export interface NormalizedProductData {
    product: {
        name: string;
        brand: string;
        category: string;
        isFood: boolean;
    };

    ingredients: string[];
    additives: {
        code: string;
        name: string;
    }[];
    novaGroup: NovaGroup;
    detectedAllergens: string[];
    flags: {
        isOrganic: boolean;
        hasNoAdditives: boolean;
    };
}

export interface UserProfile {
    allergens: AllergenType[];
    dietaryPreferences: DietType[];
}

export interface ScoreResult {
    value: number; // 0-100
    level: ScoreLevel;
    breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
    baseScore: number;
    penalties: PenaltyItem[];
    bonuses: BonusItem[];
    finalScore: number;
}

export interface PenaltyItem {
    reason: string;
    reasonTr: string;
    points: number;
    details?: string;
}

export interface BonusItem {
    reason: string;
    reasonTr: string;
    points: number;
}

export interface CompatibilityResult extends ScoreResult {
    verdict: string;
    verdictTr: string;
    noProfileWarning: boolean;
    allergenMatches: AllergenType[];
    dietViolations: {
        diet: DietType;
        violations: string[];
    }[];
}

export interface ScoringOutput {
    safety: ScoreResult;
    compatibility: CompatibilityResult;
    badges: string[];
}

export function calculateSafetyScore(data: NormalizedProductData): ScoreResult {
    const penalties: PenaltyItem[] = [];
    const bonuses: BonusItem[] = [];

    let score = SCORING_RULES.BASE_SCORE;

    let euBannedCount = 0;
    let fdaWarningCount = 0;

    for (const additive of data.additives) {
        const info = getAdditiveInfo(additive.code);

        if (info) {
            if (info.risk === "HAZARDOUS") {
                penalties.push({
                    reason: `Hazardous additive: ${additive.code}`,
                    reasonTr: `Tehlikeli katkı: ${additive.code}`,
                    points: SCORING_RULES.PENALTY_HAZARDOUS_ADDITIVE,
                    details: info.reason,
                });
                score -= SCORING_RULES.PENALTY_HAZARDOUS_ADDITIVE;
            } else if (info.risk === "CAUTION") {
                penalties.push({
                    reason: `Caution additive: ${additive.code}`,
                    reasonTr: `Dikkatli tüketilmeli: ${additive.code}`,
                    points: SCORING_RULES.PENALTY_CAUTION_ADDITIVE,
                    details: info.reason,
                });
                score -= SCORING_RULES.PENALTY_CAUTION_ADDITIVE;
            }

            if (info.euStatus === "BANNED") {
                euBannedCount++;
            }
            if (info.fdaStatus === "WARNING" || info.fdaStatus === "BANNED") {
                fdaWarningCount++;
            }
        } else {
            penalties.push({
                reason: `Unknown additive: ${additive.code}`,
                reasonTr: `Bilinmeyen katkı: ${additive.code}`,
                points: SCORING_RULES.PENALTY_CAUTION_ADDITIVE,
            });
            score -= SCORING_RULES.PENALTY_CAUTION_ADDITIVE;
        }
    }

    if (euBannedCount > 0) {
        penalties.push({
            reason: `Contains EU banned additive(s)`,
            reasonTr: `AB'de yasaklı katkı içeriyor`,
            points: SCORING_RULES.PENALTY_EU_BANNED,
            details: `${euBannedCount} banned additive(s)`,
        });
        score -= SCORING_RULES.PENALTY_EU_BANNED;
    }

    if (fdaWarningCount > 0) {
        penalties.push({
            reason: `Contains FDA warning additive(s)`,
            reasonTr: `FDA uyarılı katkı içeriyor`,
            points: SCORING_RULES.PENALTY_FDA_WARNING,
            details: `${fdaWarningCount} warning additive(s)`,
        });
        score -= SCORING_RULES.PENALTY_FDA_WARNING;
    }

    if (data.novaGroup === 4) {
        penalties.push({
            reason: "Ultra-processed food (NOVA 4)",
            reasonTr: "Aşırı işlenmiş gıda (NOVA 4)",
            points: SCORING_RULES.PENALTY_NOVA_4,
        });
        score -= SCORING_RULES.PENALTY_NOVA_4;
    } else if (data.novaGroup === 3) {
        penalties.push({
            reason: "Processed food (NOVA 3)",
            reasonTr: "İşlenmiş gıda (NOVA 3)",
            points: SCORING_RULES.PENALTY_NOVA_3,
        });
        score -= SCORING_RULES.PENALTY_NOVA_3;
    }

    if (data.flags.hasNoAdditives) {
        bonuses.push({
            reason: "No artificial additives",
            reasonTr: "Yapay katkı yok",
            points: SCORING_RULES.BONUS_NO_ADDITIVES,
        });
        score += SCORING_RULES.BONUS_NO_ADDITIVES;
    }

    if (data.flags.isOrganic) {
        bonuses.push({
            reason: "Organic product",
            reasonTr: "Organik ürün",
            points: SCORING_RULES.BONUS_ORGANIC,
        });
        score += SCORING_RULES.BONUS_ORGANIC;
    }

    const finalScore = Math.max(SCORING_RULES.MIN_SCORE, Math.min(SCORING_RULES.MAX_SCORE, score));

    const level = SAFETY_LEVELS.find((l) => finalScore >= l.min && finalScore <= l.max) || SAFETY_LEVELS[0];

    return {
        value: finalScore,
        level,
        breakdown: {
            baseScore: SCORING_RULES.BASE_SCORE,
            penalties,
            bonuses,
            finalScore,
        },
    };
}

export function calculateCompatibilityScore(data: NormalizedProductData, safetyScore: ScoreResult, userProfile: UserProfile | null): CompatibilityResult {
    if (!userProfile || (userProfile.allergens.length === 0 && userProfile.dietaryPreferences.length === 0)) {
        const level = COMPATIBILITY_LEVELS.find((l) => safetyScore.value >= l.min && safetyScore.value <= l.max) || COMPATIBILITY_LEVELS[0];

        return {
            value: safetyScore.value,
            level,
            breakdown: {
                baseScore: safetyScore.value,
                penalties: [],
                bonuses: [],
                finalScore: safetyScore.value,
            },
            verdict: "No profile set - showing safety score",
            verdictTr: "Profil belirlenmedi - güvenlik puanı gösteriliyor",
            noProfileWarning: true,
            allergenMatches: [],
            dietViolations: [],
        };
    }

    const penalties: PenaltyItem[] = [];
    let instantFail = false;
    let failReason = "";
    let failReasonTr = "";

    const allergenMatches: AllergenType[] = [];
    const dietViolations: { diet: DietType; violations: string[] }[] = [];

    if (userProfile.allergens.length > 0) {
        const allergenCheck = checkAllergenMatch(data.ingredients, userProfile.allergens);

        if (allergenCheck.hasMatch) {
            instantFail = true;
            allergenMatches.push(...allergenCheck.matchedAllergens);
            failReason = `Contains allergens: ${allergenCheck.matchedAllergens.join(", ")}`;
            failReasonTr = `Alerjen içeriyor: ${allergenCheck.matchedAllergens.join(", ")}`;

            penalties.push({
                reason: failReason,
                reasonTr: failReasonTr,
                points: 100,
            });
        }
    }

    if (!instantFail && userProfile.dietaryPreferences.length > 0) {
        for (const diet of userProfile.dietaryPreferences) {
            const dietCheck = checkDietCompliance(data.ingredients, diet);

            if (!dietCheck.isCompliant) {
                dietViolations.push({
                    diet,
                    violations: dietCheck.violations,
                });

                const dietDef = getDietDefinition(diet);

                if (dietDef.severity === "strict") {
                    instantFail = true;
                    failReason = `Violates ${diet} diet: ${dietCheck.violations.slice(0, 3).join(", ")}`;
                    failReasonTr = `${diet} diyetini ihlal ediyor: ${dietCheck.violations.slice(0, 3).join(", ")}`;

                    penalties.push({
                        reason: failReason,
                        reasonTr: failReasonTr,
                        points: 100,
                    });
                    break;
                } else {
                    const penaltyPoints = Math.min(30, dietCheck.violations.length * 10);
                    penalties.push({
                        reason: `${diet} diet concerns: ${dietCheck.violations.slice(0, 2).join(", ")}`,
                        reasonTr: `${diet} diyeti endişeleri: ${dietCheck.violations.slice(0, 2).join(", ")}`,
                        points: penaltyPoints,
                    });
                }
            }
        }
    }

    let finalScore: number;
    let verdict: string;
    let verdictTr: string;

    if (instantFail) {
        finalScore = SCORING_RULES.COMPATIBILITY_ALLERGEN_MATCH; // 0
        verdict = failReason;
        verdictTr = failReasonTr;
    } else {
        const totalPenalty = penalties.reduce((sum, p) => sum + p.points, 0);
        finalScore = Math.max(0, safetyScore.value - totalPenalty);

        if (dietViolations.length > 0) {
            verdict = `Some diet concerns detected`;
            verdictTr = `Bazı diyet endişeleri tespit edildi`;
        } else {
            verdict = "Compatible with your profile";
            verdictTr = "Profilinizle uyumlu";
        }
    }

    const level = COMPATIBILITY_LEVELS.find((l) => finalScore >= l.min && finalScore <= l.max) || COMPATIBILITY_LEVELS[0];

    return {
        value: finalScore,
        level,
        breakdown: {
            baseScore: safetyScore.value,
            penalties,
            bonuses: [],
            finalScore,
        },
        verdict,
        verdictTr,
        noProfileWarning: false,
        allergenMatches,
        dietViolations,
    };
}

export function generateBadges(data: NormalizedProductData): string[] {
    const badges: string[] = [];

    badges.push(data.product.isFood ? "FOOD" : "NOT_FOOD");

    let hasEuBanned = false;
    let hasFdaWarning = false;

    for (const additive of data.additives) {
        const info = getAdditiveInfo(additive.code);
        if (info) {
            if (info.euStatus === "BANNED") hasEuBanned = true;
            if (info.fdaStatus === "WARNING" || info.fdaStatus === "BANNED") hasFdaWarning = true;
        }
    }

    if (hasEuBanned) badges.push("EU_BANNED");
    if (hasFdaWarning) badges.push("FDA_WARN");
    if (data.flags.hasNoAdditives) badges.push("NO_ADDITIVES");

    return badges;
}

export function calculateScores(data: NormalizedProductData, userProfile: UserProfile | null): ScoringOutput {
    const safety = calculateSafetyScore(data);
    const compatibility = calculateCompatibilityScore(data, safety, userProfile);
    const badges = generateBadges(data);

    return {
        safety,
        compatibility,
        badges,
    };
}

export function calculateCompatibilityScoreSync(data: NormalizedProductData, safetyScore: ScoreResult, userProfile: UserProfile | null, dietDefinitions: Record<DietType, { severity: "strict" | "moderate" }>): CompatibilityResult {
    if (!userProfile || (userProfile.allergens.length === 0 && userProfile.dietaryPreferences.length === 0)) {
        const level = COMPATIBILITY_LEVELS.find((l) => safetyScore.value >= l.min && safetyScore.value <= l.max) || COMPATIBILITY_LEVELS[0];

        return {
            value: safetyScore.value,
            level,
            breakdown: {
                baseScore: safetyScore.value,
                penalties: [],
                bonuses: [],
                finalScore: safetyScore.value,
            },
            verdict: "No profile set - showing safety score",
            verdictTr: "Profil belirlenmedi - güvenlik puanı gösteriliyor",
            noProfileWarning: true,
            allergenMatches: [],
            dietViolations: [],
        };
    }

    const penalties: PenaltyItem[] = [];
    let instantFail = false;
    let failReason = "";
    let failReasonTr = "";

    const allergenMatches: AllergenType[] = [];
    const dietViolations: { diet: DietType; violations: string[] }[] = [];

    // Alerjen kontrolü
    if (userProfile.allergens.length > 0) {
        const allergenCheck = checkAllergenMatch(data.ingredients, userProfile.allergens);

        if (allergenCheck.hasMatch) {
            instantFail = true;
            allergenMatches.push(...allergenCheck.matchedAllergens);
            failReason = `Contains allergens: ${allergenCheck.matchedAllergens.join(", ")}`;
            failReasonTr = `Alerjen içeriyor: ${allergenCheck.matchedAllergens.join(", ")}`;

            penalties.push({
                reason: failReason,
                reasonTr: failReasonTr,
                points: 100,
            });
        }
    }

    // Diyet kontrolü
    if (!instantFail && userProfile.dietaryPreferences.length > 0) {
        for (const diet of userProfile.dietaryPreferences) {
            const dietCheck = checkDietCompliance(data.ingredients, diet);

            if (!dietCheck.isCompliant) {
                dietViolations.push({
                    diet,
                    violations: dietCheck.violations,
                });

                const severity = dietDefinitions[diet]?.severity || "moderate";

                if (severity === "strict") {
                    instantFail = true;
                    failReason = `Violates ${diet} diet: ${dietCheck.violations.slice(0, 3).join(", ")}`;
                    failReasonTr = `${diet} diyetini ihlal ediyor: ${dietCheck.violations.slice(0, 3).join(", ")}`;

                    penalties.push({
                        reason: failReason,
                        reasonTr: failReasonTr,
                        points: 100,
                    });
                    break;
                } else {
                    const penaltyPoints = Math.min(30, dietCheck.violations.length * 10);
                    penalties.push({
                        reason: `${diet} diet concerns: ${dietCheck.violations.slice(0, 2).join(", ")}`,
                        reasonTr: `${diet} diyeti endişeleri: ${dietCheck.violations.slice(0, 2).join(", ")}`,
                        points: penaltyPoints,
                    });
                }
            }
        }
    }

    let finalScore: number;
    let verdict: string;
    let verdictTr: string;

    if (instantFail) {
        finalScore = 0;
        verdict = failReason;
        verdictTr = failReasonTr;
    } else {
        const totalPenalty = penalties.reduce((sum, p) => sum + p.points, 0);
        finalScore = Math.max(0, safetyScore.value - totalPenalty);

        if (dietViolations.length > 0) {
            verdict = `Some diet concerns detected`;
            verdictTr = `Bazı diyet endişeleri tespit edildi`;
        } else {
            verdict = "Compatible with your profile";
            verdictTr = "Profilinizle uyumlu";
        }
    }

    const level = COMPATIBILITY_LEVELS.find((l) => finalScore >= l.min && finalScore <= l.max) || COMPATIBILITY_LEVELS[0];

    return {
        value: finalScore,
        level,
        breakdown: {
            baseScore: safetyScore.value,
            penalties,
            bonuses: [],
            finalScore,
        },
        verdict,
        verdictTr,
        noProfileWarning: false,
        allergenMatches,
        dietViolations,
    };
}
