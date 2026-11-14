// Deterministik DENETÇİ katmanı. AI içerikleri okur ve açıklar; güvenlik PUANINI kod hesaplar.
// Saf fonksiyon: mutasyon/I/O/global yok, aynı girdi → aynı çıktı.
//
// Değişmezler:
//  INV-1  NOVA yalnız YÜKSELİR: novaOut = max(novaBase, novaFloor). Kod asla düşürmez.
//  INV-2  Puan = NOVA tavanı − cezalar (sDet). AI'ın puanı yalnız `audit.aiScore` izinde durur.
//         (2026-11-15: eski ±band yüzünden aynı ürün taramadan taramaya 12-14 puan oynuyordu.)
//  INV-3  Ceza girdileri sabit kaynaktan: katkı riski yerel DB'den; barkodda besin değerleri,
//         katkı kodları ve NOVA OpenFoodFacts'ten (`AuditFacts`). AI değeri yalnız yedek.
//  INV-4  Saflık + iz: shallow-clone-with-overrides; her hesap `audit` alanında kayıtlı.

import { getAdditiveInfo, getNovaInfo, NovaGroup } from "../constants/additives";
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
const SCORE_FLOOR = 5, SCORE_MAX = 100;

// Steviol/stevia → NOVA-4'ü tetikler ama "yapay tatlandırıcı" cezası ALMAZ
// (temiz stevia içeceği ~70'e ulaşabilsin diye). Çoklu-tatlandırıcı cezasında "ikinci" sayılır.
const STEVIA_KEYWORDS = [
    "steviol", "stevia", "e960", "e960a",
    "steviol glycoside", "steviol glycosides", "glucósido de esteviol", "glucosido de esteviol",
];

/** Barkodda OpenFoodFacts'ten gelen kesin değerler. Varsa AI değerinin yerine kullanılır. */
export interface AuditFacts {
    /** OFF additives_tags (ör. "en:e322i") */
    additiveTags?: string[] | null;
    /** OFF nutriments (100 g başına) */
    nutriments?: any;
    /** OFF nova_group */
    novaGroup?: number | null;
}

const LEVELS: { max: number; level: string; color: string }[] = [
    { max: 20, level: "Hazardous", color: "red" },
    { max: 40, level: "Poor", color: "orange" },
    { max: 60, level: "Average", color: "yellow" },
    { max: 80, level: "Good", color: "lightgreen" },
    { max: 100, level: "Excellent", color: "green" },
];
const levelFor = (score: number) => LEVELS.find((l) => score <= l.max) || LEVELS[LEVELS.length - 1];

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

/** "en:e322i" / "E 341 iii" / "e450" → DB'de karşılığı olan kod ("E322", "E341", "E450"); yoksa null. */
export const resolveAdditiveCode = (raw: any): string | null => {
    const c = String(raw ?? "").replace(/^[a-z]{2}:/i, "").toUpperCase().replace(/[\s-]/g, "");
    if (!c) return null;
    if (getAdditiveInfo(c)) return c;
    const base = c.match(/^E\d{3,4}/)?.[0];
    return base && getAdditiveInfo(base) ? base : null;
};

/**
 * Puanda sayılan katkı kodları (yalnız DB'de olanlar, riski DB'den).
 * Barkodda OFF etiketleri, yoksa AI kodları; her iki durumda da içindekiler metnindeki E-kodları eklenir.
 */
const scoringAdditiveCodes = (r: any, facts?: AuditFacts): string[] => {
    const codes = new Set<string>();
    const offTags = Array.isArray(facts?.additiveTags) ? facts!.additiveTags! : [];
    const source = offTags.length
        ? offTags
        : (Array.isArray(r?.details?.additives) ? r.details.additives.map((a: any) => a?.code) : []);
    for (const raw of source) {
        const code = resolveAdditiveCode(raw);
        if (code) codes.add(code);
    }
    const re = /\bE\s?-?\s?(\d{3,4}[a-z]{0,3})\b/gi;
    const text = String(r?.details?.ingredients_full_text || "");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        const code = resolveAdditiveCode("E" + m[1]);
        if (code) codes.add(code);
    }
    return Array.from(codes).sort();
};

// Etiket metni + puanlanan katkıların DB adları (keyword taraması için). AI'ın serbest katkı adları
// kullanılmaz: taramadan taramaya değiştikleri için palm/tatlandırıcı tespiti de değişiyordu.
const buildHaystack = (r: any, codes: string[]): string => {
    const text = String(r?.details?.ingredients_full_text || "");
    const names = codes
        .map((c) => getAdditiveInfo(c))
        .filter(Boolean)
        .map((i: any) => `${i.name} ${i.nameTr}`)
        .join(" ; ");
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

function detectMarkers(aiResult: any, codes: string[]): MarkerReport {
    const hits: string[] = [];
    let sweetener = false, flavoring = false, colorant = false, emulsifier = false, ultraProcessed = false;

    // Sinyal 1 — additive DB kategorisi (zararsız kategoriler tetiklemez).
    for (const code of codes) {
        const info = getAdditiveInfo(code);
        if (!info) continue;
        if (info.category === "sweetener") { sweetener = true; hits.push(`sweetener:${info.code}`); }
        else if (info.category === "colorant") { colorant = true; hits.push(`colorant:${info.code}`); }
        else if (info.category === "emulsifier") { emulsifier = true; hits.push(`emulsifier:${info.code}`); }
        else if (info.category === "flavor_enhancer") { flavoring = true; hits.push(`flavor:${info.code}`); }
    }

    // Sinyal 2+3 — etiket metni + AI katkı adları üzerinde keyword taraması.
    // (DB'de olmayan E960a steviol / E140 klorofil bu sinyalle yakalanır.)
    const hay = buildHaystack(aiResult, codes);
    if (!sweetener && anyKeyword(hay, NOVA_SWEETENER_MARKERS)) { sweetener = true; hits.push("sweetener:kw"); }
    if (!flavoring && anyKeyword(hay, NOVA_FLAVORING_MARKERS)) { flavoring = true; hits.push("flavor:kw"); }
    if (!colorant && anyKeyword(hay, NOVA_COLORANT_MARKERS)) { colorant = true; hits.push("colorant:kw"); }
    if (!emulsifier && anyKeyword(hay, NOVA_EMULSIFIER_MARKERS)) { emulsifier = true; hits.push("emulsifier:kw"); }
    if (anyKeyword(hay, NOVA_ULTRAPROCESSED_MARKERS)) { ultraProcessed = true; hits.push("ultraprocessed:kw"); }

    return { sweetener, flavoring, colorant, emulsifier, ultraProcessed, hits };
}

/* ─────────────── ana giriş ─────────────── */
export function auditAnalysis(aiResult: any, lang: Lang, facts?: AuditFacts): any {
    // Defansif: obje değilse, yiyecek değilse ya da zaten denetlenmişse dokunma.
    if (!aiResult || typeof aiResult !== "object") return aiResult;
    if (aiResult.audit) return aiResult;
    if (aiResult?.product?.isFood === false) return aiResult;

    const codes = scoringAdditiveCodes(aiResult, facts);
    const markers = detectMarkers(aiResult, codes);
    const anyMarker = markers.sweetener || markers.flavoring || markers.colorant || markers.emulsifier || markers.ultraProcessed;

    // 2) NOVA floor (yalnız yükseltir). Barkodda OFF NOVA'sı taban, yoksa AI.
    const novaAi = readNovaGroup(aiResult);
    const offNova = num(facts?.novaGroup);
    const novaBase = (offNova != null && offNova >= 1 && offNova <= 4 ? Math.round(offNova) : novaAi) as NovaGroup | null;
    const novaFloor: NovaGroup = anyMarker ? 4 : (novaBase ?? 1);
    const novaOut = Math.max(novaBase ?? novaFloor, novaFloor) as NovaGroup;

    // 3) Deterministik puan: katkı riski DB'den, besin değerleri önce OFF'tan.
    let hazardous = 0, caution = 0;
    for (const code of codes) {
        const risk = getAdditiveInfo(code)?.risk;
        if (risk === "HAZARDOUS") hazardous++;
        else if (risk === "CAUTION") caution++;
    }

    const hay = buildHaystack(aiResult, codes);
    const hasArtificialSweet = anyKeyword(hay, ARTIFICIAL_SWEETENER_HARM_KEYWORDS);
    const hasStevia = anyKeyword(hay, STEVIA_KEYWORDS);
    const hasPalm = anyKeyword(hay, PALM_HYDROGENATED_KEYWORDS);

    const n = facts?.nutriments || {};
    const offSodiumG = num(n.sodium_100g);
    const sugar = num(n.sugars_100g) ?? num(aiResult?.sugar_per_100g) ?? num(aiResult?.nutrition_facts?.sugar);
    const sodium = (offSodiumG != null ? offSodiumG * 1000 : null) ?? num(aiResult?.nutrition_facts?.sodium);
    const satFat = num(n["saturated-fat_100g"]) ?? num(aiResult?.nutrition_facts?.saturated_fat);
    const transFat = num(n["trans-fat_100g"]) ?? num(aiResult?.nutrition_facts?.trans_fat);

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
    const sDet = Math.round(clamp(ceiling - penaltyTotal, SCORE_FLOOR, SCORE_MAX));
    const aiScore = num(aiResult?.scores?.safety?.value);
    const sFinal = sDet;
    const lvl = levelFor(sFinal);

    // Puanda sayılan ama AI listesinde olmayan katkılar listeye eklenir: kullanıcı cezanın nedenini görsün.
    const aiAdditives = Array.isArray(aiResult?.details?.additives) ? aiResult.details.additives : [];
    const listed = new Set(aiAdditives.map((a: any) => resolveAdditiveCode(a?.code)).filter(Boolean));
    const missing = codes
        .filter((c) => !listed.has(c))
        .map((c) => {
            const info: any = getAdditiveInfo(c);
            return {
                code: c,
                name: lang === "tr" ? info.nameTr : lang === "es" ? info.nameEs : info.name,
                risk: info.risk === "HAZARDOUS" ? "Hazardous" : info.risk === "CAUTION" ? "Caution" : "Safe",
                description: lang === "tr" ? info.reasonTr : lang === "es" ? info.reasonEs : info.reason,
            };
        });

    // 4) NOVA etiketi/açıklamayı yeniden üret (sayı ile string daima tutarlı)
    const info = getNovaInfo(novaOut);
    const label = lang === "tr" ? info.labelTr : lang === "es" ? info.labelEs : info.label;
    const classification = `${label} (NOVA ${novaOut})`;
    const novaChanged = novaAi !== novaOut;
    const scoreChanged = aiScore == null || sFinal !== aiScore;

    const breakdown =
        `NOVA ${novaBase ?? "?"}→${novaOut}${markers.hits.length ? ` [${markers.hits.join(", ")}]` : ""}; ` +
        `tavan ${ceiling} - ceza ${penaltyTotal} = ${sFinal}`;

    const audit = {
        novaAi, offNova, novaFloor, novaOut,
        markers: markers.hits,
        additiveCodes: codes,
        inputs: { sugar, sodium, satFat, transFat, fromOff: !!facts },
        ceiling, penalties: { ...pen, total: penaltyTotal },
        sDet,
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
                level: lvl.level,
                color: lvl.color,
                breakdown,
            },
        },
        details: {
            ...aiResult.details,
            additives: [...aiAdditives, ...missing],
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
