import { getAdditiveInfo, AdditiveRisk } from "../constants/additives";

type Lang = "tr" | "en" | "es";

const RISK_MAP: Record<AdditiveRisk, "Hazardous" | "Caution" | "Safe"> = {
  HAZARDOUS: "Hazardous",
  CAUTION: "Caution",
  SAFE: "Safe",
};
const SEVERITY: Record<string, number> = { Hazardous: 0, Caution: 1, Safe: 2 };

export interface EnrichedAdditive {
  code: string;
  name: string;
  risk: "Hazardous" | "Caution" | "Safe";
  description: string;
  source: "ai" | "db";
}

const normCode = (c: any): string =>
  typeof c === "string" ? c.toUpperCase().replace(/[\s-]/g, "") : "";

const dbName = (info: any, lang: Lang): string =>
  lang === "tr" ? info.nameTr : lang === "es" ? info.nameEs : info.name;

const dbReason = (info: any, lang: Lang): string =>
  lang === "tr" ? info.reasonTr : lang === "es" ? info.reasonEs : info.reason;

const capRisk = (r: string): "Hazardous" | "Caution" | "Safe" | "" => {
  const c = r ? r[0].toUpperCase() + r.slice(1).toLowerCase() : "";
  return c === "Hazardous" || c === "Caution" || c === "Safe" ? c : "";
};

/**
 * AI'ın döndürdüğü katkıları yerel veritabanıyla cross-reference eder:
 *  - Her AI katkısını DB ile güçlendirir (risk DB'de daha ağırsa onu kullan, açıklamayı doldur).
 *  - Ham içindekiler metnini E-kod regex'i ile tarar; AI'ın kaçırdığı, DB'de olan kodları ekler (E223 garantisi).
 *  - Koda göre dedupe + risk şiddetine göre sıralar.
 * Saf fonksiyon (React yok) → render-time memoize edilebilir; eski history kayıtları da faydalanır.
 */
export function enrichAdditives(
  aiAdditives: any[],
  ingredientsFullText: string,
  lang: Lang
): EnrichedAdditive[] {
  const byCode = new Map<string, EnrichedAdditive>();
  const noCode: EnrichedAdditive[] = [];

  // 1) AI katkıları, DB ile güçlendir
  for (const a of aiAdditives || []) {
    const code = normCode(a?.code);
    const info = code ? getAdditiveInfo(code) : null;
    const aiRiskCap = capRisk(typeof a?.risk === "string" ? a.risk : "");
    let risk: "Hazardous" | "Caution" | "Safe" = aiRiskCap || "Safe";
    let name = a?.name || "";
    let description = a?.description || "";
    let source: "ai" | "db" = "ai";

    if (info) {
      const dbRisk = RISK_MAP[info.risk];
      // AI riski yoksa ya da DB daha ağırsa DB riskini tercih et
      if (!aiRiskCap || SEVERITY[dbRisk] < SEVERITY[risk]) risk = dbRisk;
      if (!name) name = dbName(info, lang);
      if (!description) {
        description = dbReason(info, lang);
        source = "db";
      }
    }

    if (code) {
      if (!byCode.has(code)) byCode.set(code, { code, name, risk, description, source });
    } else if (name) {
      noCode.push({ code: "", name, risk, description, source });
    }
  }

  // 2) Ham metinde AI'ın kaçırdığı E-kodlarını yakala
  const re = /\bE\s?-?\s?(\d{3,4}[a-z]?)\b/gi;
  const text = ingredientsFullText || "";
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const code = ("E" + m[1]).toUpperCase().replace(/\s/g, "");
    if (byCode.has(code)) continue;
    const info = getAdditiveInfo(code);
    if (!info) continue;
    byCode.set(code, {
      code,
      name: dbName(info, lang),
      risk: RISK_MAP[info.risk],
      description: dbReason(info, lang),
      source: "db",
    });
  }

  const all = [...Array.from(byCode.values()), ...noCode];
  all.sort((a, b) => (SEVERITY[a.risk] ?? 3) - (SEVERITY[b.risk] ?? 3));
  return all;
}
