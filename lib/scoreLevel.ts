// Puan → seviye/renk eşlemesi — TEK KAYNAK.
// Daha önce her ekran kendi eşiğini taşıyordu (product-result 2-band, ScoreRing 5-band,
// compare 2-band, guru kartları 3-band). Hepsi buraya bağlanır → görsel tutarlılık.
// Kanonik ölçek ScoreRing'in 5-band'idir (en zengin + prompt LEVEL THRESHOLDS ile uyumlu).

export type ScoreLevel = "hazardous" | "poor" | "average" | "good" | "excellent";

const clampScore = (s: any): number => {
    const v = typeof s === "number" && isFinite(s) ? s : 0;
    return Math.max(0, Math.min(100, v));
};

// ≥80 excellent · ≥60 good · ≥40 average · ≥20 poor · <20 hazardous
export const getScoreLevel = (score: number): ScoreLevel => {
    const v = clampScore(score);
    if (v >= 80) return "excellent";
    if (v >= 60) return "good";
    if (v >= 40) return "average";
    if (v >= 20) return "poor";
    return "hazardous";
};

const SOLID: Record<ScoreLevel, string> = {
    excellent: "#10B981",
    good: "#65A30D",
    average: "#F59E0B",
    poor: "#EA580C",
    hazardous: "#EF4444",
};

const GRADIENT: Record<ScoreLevel, [string, string]> = {
    excellent: ["#34D399", "#10B981"],
    good: ["#A3E635", "#65A30D"],
    average: ["#FCD34D", "#F59E0B"],
    poor: ["#FB923C", "#EA580C"],
    hazardous: ["#FCA5A5", "#EF4444"],
};

// isDark parametresi yok sayılır — eski (score, isDark) çağrı imzalarıyla uyum için kabul edilir.
export const getScoreColor = (score: number, _isDark?: boolean): string => SOLID[getScoreLevel(score)];

export const getScoreGradient = (score: number): [string, string] => GRADIENT[getScoreLevel(score)];

// Liste/kart arka planı için yumuşak tonlu zemin (tema duyarlı).
export const getScoreBg = (score: number, isDark = false): string => {
    const level = getScoreLevel(score);
    const alpha = isDark ? "0.18" : "0.12";
    const rgb: Record<ScoreLevel, string> = {
        excellent: "16,185,129",
        good: "101,163,13",
        average: "245,158,11",
        poor: "234,88,12",
        hazardous: "239,68,68",
    };
    return `rgba(${rgb[level]},${alpha})`;
};
