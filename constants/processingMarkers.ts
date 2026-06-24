// İşlenme (NOVA) işaret sözlüğü — tek kaynak.
// İki tüketici var:
//  1) lib/lifestageRules.ts  → yaşam evresi ZARAR kurallarında (yapay/zararlı alt küme) kullanır.
//  2) lib/auditAnalysis.ts   → NOVA-4 floor tespitinde DAHA GENİŞ küme (doğal kozmetik katkılar dahil) kullanır.
// Bu yüzden iki katman var: (a) mevcut "zararlı" listeleri (lifestage davranışı birebir korunur),
// (b) NOVA_* genişletilmiş listeleri (genel etiket kelimeleri + DB'de olmayan kodlar).
//
// NOT: Eşleştirme analysisEngine.matchesKeyword (kelime sınırı, "(^|[^a-z])kw([^a-z]|$)") ile yapılır.
// Bu yüzden "e960" → "e960a" ile EŞLEŞMEZ; her iki biçimi de eklemek gerekir.

/* ───────────────────────── İngilizce ───────────────────────── */
const ARTIFICIAL_SWEETENER_KEYWORDS_EN = [
    "aspartame", "sucralose", "saccharin", "acesulfame", "neotame", "advantame", "cyclamate",
    "e950", "e951", "e952", "e954", "e955", "e961", "e962",
];
const PALM_HYDROGENATED_KEYWORDS_EN = [
    "palm oil", "palm fat", "palm kernel", "palm olein", "palm stearin",
    "hydrogenated", "partially hydrogenated", "fully hydrogenated", "trans fat", "trans fatty",
];
const ARTIFICIAL_FLAVOR_KEYWORDS_EN = [
    "artificial flavor", "artificial flavour", "artificial flavoring", "artificial flavouring",
    "flavoring", "flavouring", "flavour enhancer", "flavor enhancer", "nature-identical",
];
const ARTIFICIAL_COLOR_KEYWORDS_EN = [
    "tartrazine", "sunset yellow", "ponceau", "carmoisine", "azorubine", "quinoline yellow",
    "allura red", "brilliant blue", "patent blue", "indigo carmine",
    "e102", "e104", "e110", "e122", "e124", "e129", "e131", "e132", "e133", "e142", "e151",
];
const HARMFUL_PRESERVATIVE_KEYWORDS_EN = [
    "sodium nitrite", "sodium nitrate", "potassium nitrite", "potassium nitrate",
    "bha", "bht", "tbhq", "propyl gallate",
    "e249", "e250", "e251", "e252", "e320", "e321", "e310",
];
const INDUSTRIAL_EMULSIFIER_KEYWORDS_EN = [
    "polyglycerol polyricinoleate", "carboxymethylcellulose", "polysorbate",
    "e471", "e472", "e433", "e466", "e476", "e477",
];
const ULTRA_PROCESSED_MARKER_KEYWORDS_EN = [
    "maltodextrin", "modified starch", "high fructose corn syrup", "glucose-fructose syrup",
    "glucose syrup", "invert sugar", "isolated soy protein", "hydrolyzed protein",
];

/* ───────────────────────── Türkçe ───────────────────────── */
const ARTIFICIAL_SWEETENER_KEYWORDS_TR = [
    "aspartam", "sukraloz", "sakarin", "asesülfam", "neotam", "siklamat",
];
const PALM_HYDROGENATED_KEYWORDS_TR = [
    "palm yağı", "palm yagi", "palm çekirdek", "palm cekirdek",
    "hidrojenize", "kısmen hidrojenize", "kismen hidrojenize", "tam hidrojenize",
    "trans yağ", "trans yag",
];
const ARTIFICIAL_FLAVOR_KEYWORDS_TR = [
    "aroma verici", "aroma vericiler", "yapay aroma", "yapay aromalar",
    "doğaya özdeş aroma", "dogaya ozdes aroma", "tat arttırıcı",
];
const ARTIFICIAL_COLOR_KEYWORDS_TR = [
    "tartrazin", "günbatımı sarısı", "ponso", "karmoisin", "kinolin sarısı", "allura kırmızısı",
    "e102", "e104", "e110", "e122", "e124", "e129",
];
const HARMFUL_PRESERVATIVE_KEYWORDS_TR = [
    "sodyum nitrit", "sodyum nitrat", "potasyum nitrit", "potasyum nitrat",
    "bha", "bht", "e249", "e250", "e251", "e252", "e320", "e321",
];
const INDUSTRIAL_EMULSIFIER_KEYWORDS_TR = [
    "poligliserol polirisinoleat", "polisorbat", "karboksimetil selüloz",
    "e471", "e472", "e433", "e466", "e476", "e477",
];
const ULTRA_PROCESSED_MARKER_KEYWORDS_TR = [
    "maltodekstrin", "modifiye nişasta", "yüksek fruktozlu mısır şurubu", "glukoz-fruktoz şurubu",
    "glukoz şurubu", "invert şeker", "izole soya proteini", "hidrolize protein",
];

/* ───────────────────────── İspanyolca ───────────────────────── */
const ARTIFICIAL_SWEETENER_KEYWORDS_ES = [
    "aspartamo", "sucralosa", "sacarina", "acesulfamo", "neotamo", "ciclamato",
];
const PALM_HYDROGENATED_KEYWORDS_ES = [
    "aceite de palma", "grasa de palma", "palmiste",
    "hidrogenado", "parcialmente hidrogenado", "totalmente hidrogenado",
    "grasa trans", "ácidos grasos trans",
];
const ARTIFICIAL_FLAVOR_KEYWORDS_ES = [
    "aroma artificial", "aromas artificiales", "saborizante artificial", "saborizantes artificiales",
    "aromatizante", "aromatizantes", "potenciador del sabor",
];
const ARTIFICIAL_COLOR_KEYWORDS_ES = [
    "tartrazina", "amarillo ocaso", "ponceau", "carmoisina", "amarillo quinolina", "rojo allura",
    "e102", "e104", "e110", "e122", "e124", "e129",
];
const HARMFUL_PRESERVATIVE_KEYWORDS_ES = [
    "nitrito de sodio", "nitrato de sodio", "nitrito de potasio", "nitrato de potasio",
    "bha", "bht", "e249", "e250", "e251", "e252", "e320", "e321",
];
const INDUSTRIAL_EMULSIFIER_KEYWORDS_ES = [
    "polirricinoleato de poliglicerol", "polisorbato", "carboximetilcelulosa",
    "e471", "e472", "e433", "e466", "e476", "e477",
];
const ULTRA_PROCESSED_MARKER_KEYWORDS_ES = [
    "maltodextrina", "almidón modificado", "jarabe de maíz alto en fructosa", "jarabe de glucosa-fructosa",
    "jarabe de glucosa", "azúcar invertido", "proteína de soja aislada", "proteína hidrolizada",
];

/* ──────────── Birleşik "zararlı" listeleri (lifestageRules bunları kullanır) ──────────── */
export const ARTIFICIAL_SWEETENER_KEYWORDS = [...ARTIFICIAL_SWEETENER_KEYWORDS_EN, ...ARTIFICIAL_SWEETENER_KEYWORDS_TR, ...ARTIFICIAL_SWEETENER_KEYWORDS_ES];
export const PALM_HYDROGENATED_KEYWORDS = [...PALM_HYDROGENATED_KEYWORDS_EN, ...PALM_HYDROGENATED_KEYWORDS_TR, ...PALM_HYDROGENATED_KEYWORDS_ES];
export const ARTIFICIAL_FLAVOR_KEYWORDS = [...ARTIFICIAL_FLAVOR_KEYWORDS_EN, ...ARTIFICIAL_FLAVOR_KEYWORDS_TR, ...ARTIFICIAL_FLAVOR_KEYWORDS_ES];
export const ARTIFICIAL_COLOR_KEYWORDS = [...ARTIFICIAL_COLOR_KEYWORDS_EN, ...ARTIFICIAL_COLOR_KEYWORDS_TR, ...ARTIFICIAL_COLOR_KEYWORDS_ES];
export const HARMFUL_PRESERVATIVE_KEYWORDS = [...HARMFUL_PRESERVATIVE_KEYWORDS_EN, ...HARMFUL_PRESERVATIVE_KEYWORDS_TR, ...HARMFUL_PRESERVATIVE_KEYWORDS_ES];
export const INDUSTRIAL_EMULSIFIER_KEYWORDS = [...INDUSTRIAL_EMULSIFIER_KEYWORDS_EN, ...INDUSTRIAL_EMULSIFIER_KEYWORDS_TR, ...INDUSTRIAL_EMULSIFIER_KEYWORDS_ES];
export const ULTRA_PROCESSED_MARKER_KEYWORDS = [...ULTRA_PROCESSED_MARKER_KEYWORDS_EN, ...ULTRA_PROCESSED_MARKER_KEYWORDS_TR, ...ULTRA_PROCESSED_MARKER_KEYWORDS_ES];

/* ──────────── NOVA-4 floor tespiti için GENİŞ listeler ────────────
 * Zarar listelerinden farkı: doğal kozmetik katkılar da işaret sayılır (NOVA doktrini).
 * Genel etiket kelimeleri (renklendirici/tatlandırıcı/aroma verici) en güvenilir sinyaldir.
 * DB'de OLMAYAN kodlar (E140 klorofil, E960a steviol) burada keyword olarak yakalanır. */
export const NOVA_SWEETENER_MARKERS = [
    ...ARTIFICIAL_SWEETENER_KEYWORDS,
    "steviol", "stevia", "e960", "e960a", "steviol glycoside", "steviol glycosides",
    "glucósido de esteviol", "glucosido de esteviol",
    "tatlandırıcı", "tatlandirici", "sweetener", "edulcorante",
];
export const NOVA_FLAVORING_MARKERS = [
    ...ARTIFICIAL_FLAVOR_KEYWORDS,
    "aroma", "flavor", "flavour",
];
export const NOVA_COLORANT_MARKERS = [
    ...ARTIFICIAL_COLOR_KEYWORDS,
    "renklendirici", "renk verici", "colorant", "colour", "coloring", "colouring", "colorante",
    "e140", "klorofil", "chlorophyll", "clorofila",
    "e100", "e101", "e120", "e150", "e160", "e161", "e162", "e163",
];
export const NOVA_EMULSIFIER_MARKERS = [
    ...INDUSTRIAL_EMULSIFIER_KEYWORDS,
    "emülgatör", "emulgator", "emulsifier", "emulsionante",
    "lesitin", "lecithin", "lecitina", "e322",
];
export const NOVA_ULTRAPROCESSED_MARKERS = [...ULTRA_PROCESSED_MARKER_KEYWORDS];

// Yapay (steviol HARİÇ) tatlandırıcı zarar cezası için — steviol bilerek dışarıda
// (NOVA-4'ü tetikler ama puan cezası almaz → temiz stevia içeceği ~70'e ulaşabilir).
export { ARTIFICIAL_SWEETENER_KEYWORDS as ARTIFICIAL_SWEETENER_HARM_KEYWORDS };

// getAdditiveInfo(code).category değerlerinden "kozmetik/endüstriyel" sayılanlar → NOVA-4 işareti.
// Zararsız yardımcılar (acidity_regulator, antioxidant, preservative, thickener, raising_agent,
// glazing_agent, other) TEK BAŞINA tetiklemez.
export const COSMETIC_MARKER_CATEGORIES = ["sweetener", "colorant", "emulsifier", "flavor_enhancer"] as const;
