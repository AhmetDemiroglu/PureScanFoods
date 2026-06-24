// Deterministik DENETÇİ katmanı — "AI karar verir, kod denetler".
// AI'ın ürettiği analiz objesini alır, NET hatalarını düzeltir ve tutarlılık bandını uygular;
// AI'ın yargısını YENİDEN yazmaz. Saf fonksiyon: mutasyon/I/O/global yok, aynı girdi → aynı çıktı.
//
// Üç değişmez:
//  INV-1  NOVA yalnız YÜKSELİR: novaOut = max(novaAi, novaFloor). Kod asla düşürmez.
//  INV-2  Puan bandı: AI puanı [S_det−tolDown, S_det+tolUp] içindeyse AYNEN korunur; dışındaysa
//         en yakın band kenarına çekilir (anchor'a değil — AI bandın içinde sesini korur).
//  INV-3  Saflık + iz: shallow-clone-with-overrides; her düzeltme `audit` alanında kayıtlı.

import { getAdditiveInfo, getNovaInfo, NovaGroup } from "../constants/additives";
import { enrichAdditives } from "./additiveEnrichment";
import {
    NOVA_SWEETENER_MARKERS,
    NOVA_FLAVORING_MARKERS,
    NOVA_COLORANT_MARKERS,
    NOVA_EMULSIFIER_MARKERS,
    NOVA_ULTRAPROCESSED_MARKERS,
    ARTIFICIAL_SWEETENER_HARM_KEYWORDS,
    PALM_HYDROGENATED_KEYWORDS,
} from "../constants/processingMarkers";

export type Lang = "tr" | "en" | "es";

/* ─────────────── Kalibrasyon (tek yerden ince ayar) ─────────────── */
const NOVA_CEILING: Record<NovaGroup, number> = { 1: 100, 2: 95, 3: 85, 4: 70 };

const PEN = {
    hazardous: 15,            // her tehlikeli katkı
    caution: 8,               // her dikkat katkısı
    artificialSweetener: 10,  // sukraloz/aspartam… (steviol HARİÇ)
    multiSweetener: 5,        // yapay + başka tatlandırıcı bir arada
    palm: 8,                  // palm/hidrojenize yağ
    sugarHigh: 12,            // ≥22.5 g/100g
    sugarMid: 6,              // 10–22.5 g/100g
    sodiumHigh: 8,            // ≥600 mg
    satFatHigh: 6,            // ≥5 g
    transFat: 15,             // >0 g
};
const SUGAR_HIGH = 22.5, SUGAR_MID = 10, SODIUM_HIGH = 600, SATFAT_HIGH = 5;
const TOL_DOWN = 12, TOL_UP = 6;
const SCORE_FLOOR = 5, SCORE_MAX = 100;

// Steviol/stevia → NOVA-4'ü tetikler ama "yapay tatlandırıcı" cezası ALMAZ
// (temiz stevia içeceği ~70'e ulaşabilsin diye). Çoklu-tatlandırıcı cezasında "ikinci" sayılır.
const STEVIA_KEYWORDS = [
    "steviol", "stevia", "e960", "e960a",
    "steviol glycoside", "steviol glycosides", "glucósido de esteviol", "glucosido de esteviol",
];

/* ─────────────── küçük yardımcılar ─────────────── */
// analysisEngine.matchesKeyword ile aynı kelime-sınırı deseni (tutarlılık için birebir kopya).
const matchesKeyword = (text: string, keyword: string): boolean => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "i").test(text);
};
const anyKeyword = (text: string, list: readonly string[]): boolean =>
    list.some((k) => matchesKeyword(text, k));

const num = (v: any): number | null =>
    typeof v === "number" && isFinite(v) ? v : null;

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

// Etiket metni + AI katkı adlarını tek havuzda birleştir (keyword taraması için).
const buildHaystack = (r: any): string => {
    const text = String(r?.details?.ingredients_full_text || "");
    const adds = Array.isArray(r?.details?.additives) ? r.details.additives : [];
    const names = adds.map((a: any) => String(a?.name || "")).join(" ; ");
    return `${text} ; ${names}`;
};

/* ─────────────── NOVA grubu okuma (sayı önce, string fallback) ─────────────── */
export function readNovaGroup(d: any): NovaGroup | null {
    const ng = d?.details?.processing?.nova_group;
    if (typeof ng === "number" && ng >= 1 && ng <= 4) return Math.round(ng) as NovaGroup;
    const cls = String(d?.details?.processing?.classification || "");
    const m = cls.match(/nova\s*([1-4])/i);
    if (m) return Number(m[1]) as NovaGroup;
    return null;
}

/* ─────────────── 1) marker tespiti (çok sinyalli birleşim) ─────────────── */
interface MarkerReport {
    sweetener: boolean;
    flavoring: boolean;
    colorant: boolean;
    emulsifier: boolean;
    ultraProcessed: boolean;
    hits: string[];
}

function detectMarkers(aiResult: any): MarkerReport {
    const hits: string[] = [];
    let sweetener = false, flavoring = false, colorant = false, emulsifier = false, ultraProcessed = false;

    // Sinyal 1 — additive DB kategorisi (zararsız kategoriler tetiklemez).
    const adds = Array.isArray(aiResult?.details?.additives) ? aiResult.details.additives : [];
    for (const a of adds) {
        const code = a?.code;
        const info = code ? getAdditiveInfo(String(code)) : null;
        if (!info) continue;
        if (info.category === "sweetener") { sweetener = true; hits.push(`sweetener:${info.code}`); }
        else if (info.category === "colorant") { colorant = true; hits.push(`colorant:${info.code}`); }
        else if (info.category === "emulsifier") { emulsifier = true; hits.push(`emulsifier:${info.code}`); }
        else if (info.category === "flavor_enhancer") { flavoring = true; hits.push(`flavor:${info.code}`); }
    }

    // Sinyal 2+3 — etiket metni + AI katkı adları üzerinde keyword taraması.
    // (DB'de olmayan E960a steviol / E140 klorofil bu sinyalle yakalanır.)
    const hay = buildHaystack(aiResult);
    if (!sweetener && anyKeyword(hay, NOVA_SWEETENER_MARKERS)) { sweetener = true; hits.push("sweetener:kw"); }
    if (!flavoring && anyKeyword(hay, NOVA_FLAVORING_MARKERS)) { flavoring = true; hits.push("flavor:kw"); }
    if (!colorant && anyKeyword(hay, NOVA_COLORANT_MARKERS)) { colorant = true; hits.push("colorant:kw"); }
    if (!emulsifier && anyKeyword(hay, NOVA_EMULSIFIER_MARKERS)) { emulsifier = true; hits.push("emulsifier:kw"); }
    if (anyKeyword(hay, NOVA_ULTRAPROCESSED_MARKERS)) { ultraProcessed = true; hits.push("ultraprocessed:kw"); }

    return { sweetener, flavoring, colorant, emulsifier, ultraProcessed, hits };
}

/* ─────────────── ana giriş ─────────────── */
export function auditAnalysis(aiResult: any, lang: Lang): any {
    // Defansif: obje değilse, yiyecek değilse ya da zaten denetlenmişse dokunma.
    if (!aiResult || typeof aiResult !== "object") return aiResult;
    if (aiResult.audit) return aiResult;
    if (aiResult?.product?.isFood === false) return aiResult;

    const markers = detectMarkers(aiResult);
    const anyMarker = markers.sweetener || markers.flavoring || markers.colorant || markers.emulsifier || markers.ultraProcessed;

    // 2) NOVA floor (yalnız yükseltir)
    const novaAi = readNovaGroup(aiResult);
    const novaFloor: NovaGroup = anyMarker ? 4 : (novaAi ?? 1);
    const novaOut = Math.max(novaAi ?? novaFloor, novaFloor) as NovaGroup;

    // 3) Deterministik zarar anchor'ı + band + clamp
    const enriched = enrichAdditives(aiResult?.details?.additives || [], aiResult?.details?.ingredients_full_text || "", lang);
    const hazardous = enriched.filter((e) => e.risk === "Hazardous").length;
    const caution = enriched.filter((e) => e.risk === "Caution").length;

    const hay = buildHaystack(aiResult);
    const hasArtificialSweet = anyKeyword(hay, ARTIFICIAL_SWEETENER_HARM_KEYWORDS);
    const hasStevia = anyKeyword(hay, STEVIA_KEYWORDS);
    const hasPalm = anyKeyword(hay, PALM_HYDROGENATED_KEYWORDS);

    const sugar = num(aiResult?.sugar_per_100g) ?? num(aiResult?.nutrition_facts?.sugar);
    const sodium = num(aiResult?.nutrition_facts?.sodium);
    const satFat = num(aiResult?.nutrition_facts?.saturated_fat);
    const transFat = num(aiResult?.nutrition_facts?.trans_fat);

    const pen = {
        hazardous: hazardous * PEN.hazardous,
        caution: caution * PEN.caution,
        artificialSweetener: hasArtificialSweet ? PEN.artificialSweetener : 0,
        multiSweetener: hasArtificialSweet && hasStevia ? PEN.multiSweetener : 0,
        palm: hasPalm ? PEN.palm : 0,
        sugar: sugar == null ? 0 : (sugar >= SUGAR_HIGH ? PEN.sugarHigh : sugar >= SUGAR_MID ? PEN.sugarMid : 0),
        sodium: sodium != null && sodium >= SODIUM_HIGH ? PEN.sodiumHigh : 0,
        satFat: satFat != null && satFat >= SATFAT_HIGH ? PEN.satFatHigh : 0,
        transFat: transFat != null && transFat > 0 ? PEN.transFat : 0,
    };
    const penaltyTotal = Object.values(pen).reduce((s, n) => s + n, 0);

    const ceiling = NOVA_CEILING[novaOut];
    const sDet = clamp(ceiling - penaltyTotal, SCORE_FLOOR, SCORE_MAX);
    const lo = Math.max(SCORE_FLOOR, sDet - TOL_DOWN);
    const hi = Math.max(lo, Math.min(ceiling, sDet + TOL_UP));

    const aiScore = num(aiResult?.scores?.safety?.value);
    let sFinal: number;
    if (aiScore == null) sFinal = sDet;
    else if (aiScore < lo) sFinal = lo;
    else if (aiScore > hi) sFinal = hi;
    else sFinal = aiScore;
    sFinal = Math.round(sFinal);

    // 4) NOVA etiketi/açıklamayı yeniden üret (sayı ile string daima tutarlı)
    const info = getNovaInfo(novaOut);
    const label = lang === "tr" ? info.labelTr : lang === "es" ? info.labelEs : info.label;
    const classification = `${label} (NOVA ${novaOut})`;
    const novaChanged = novaAi !== novaOut;
    const scoreChanged = aiScore == null || sFinal !== aiScore;

    const breakdown =
        `NOVA ${novaAi ?? "?"}→${novaOut}${markers.hits.length ? ` [${markers.hits.join(", ")}]` : ""}; ` +
        `tavan ${ceiling} − ceza ${penaltyTotal} = anchor ${sDet}; band [${lo},${hi}]; ` +
        `AI ${aiScore ?? "?"} → ${sFinal}`;

    const audit = {
        novaAi, novaFloor, novaOut,
        markers: markers.hits,
        ceiling, penalties: { ...pen, total: penaltyTotal },
        sDet, band: [lo, hi] as [number, number],
        aiScore, sFinal,
        adjusted: { nova: novaChanged, score: scoreChanged },
    };

    return {
        ...aiResult,
        scores: {
            ...aiResult.scores,
            safety: {
                ...(aiResult.scores?.safety || {}),
                value: sFinal,
                breakdown,
            },
        },
        details: {
            ...aiResult.details,
            processing: {
                ...(aiResult.details?.processing || {}),
                classification,
                nova_group: novaOut,
                // NOVA'yı değiştirdiysek açıklamayı da kanonik NOVA açıklamasıyla uyumla
                ...(novaChanged
                    ? { description: lang === "tr" ? info.descriptionTr : lang === "es" ? info.descriptionEs : info.description }
                    : {}),
            },
        },
        audit,
    };
}
