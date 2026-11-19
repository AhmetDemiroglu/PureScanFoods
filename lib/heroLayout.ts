// Ana ekranın kaymadan sığması için yerleşim hesabı (tek dokunuş düzeni).
// Saf fonksiyon: React ve native API yok, node ile sınanır (lib/__tests__/heroLayout.test.mjs).
//
// Bloklar (yukarıdan aşağı): logo, başlık (+ alt başlık), tarama kartı, üç küçük kart.
// Yer daraldıkça sıra: boşluk daralır, simge küçülür, alt başlık gizlenir, kartlar kompaktlaşır,
// logo yan yana düzene geçer (portakal solda, "PureScan | FOODS" yanında), başlık gizlenir,
// yan yana logo biraz küçülür. Yazılı logo HİÇBİR ekranda gizlenmez (Ahmet, 2026-11-19).

/** Hero bileşeninin sabit ölçüleri. components/ui/Hero.tsx stilleri buradan okur, hesap da. */
export const HERO = {
  /** "PureScan | FOODS" yazı logosunun en/boy oranı (brandSvgs wordmark). */
  wordmarkAspect: 8.8693,
  /** Portakal + "PureScan | FOODS" yan yana logonun en/boy oranı (brandSvgs horizontal). */
  inlineAspect: 4.7865,
  /** Simge ile yazı logosu arası (alt alta düzen). */
  markGap: 10,
  /** Başlık bloğunun üstü. */
  sloganTop: 6,
  /** Serif başlık (tek satır, sığmazsa küçülür). */
  headlineSize: 24,
  headlineLine: 30,
  subSize: 14,
  subLine: 20,
  subTop: 4,
} as const;

export const HOME_CARD = {
  /** Tarama kartı yüksekliği (tam / kompakt). İçindeki yazı büyüdükçe en az yükseklik artar. */
  scanFull: 148,
  scanCompact: 116,
  /** Küçük eylem kartları. */
  tileFull: 88,
  tileCompact: 72,
  /** Tarama kartıyla küçük kartlar arası (blok arası boşluktan bağımsız, sabit). */
  innerGap: 10,
} as const;

/** Son tarama şeridi yüksekliği. */
export const LAST_SCAN_STRIP_SPACE = 52;

export type HomeInput = {
  /** Ekran genişliği. */
  width: number;
  /** İçerik için kalan yükseklik: kaydırma alanı eksi alt bar boşluğu. */
  available: number;
  /** Sistem yazı ölçeği (PixelRatio.getFontScale). */
  fontScale: number;
  /** Gövde ve başlık yazılarının büyüme sınırları (AppText ile aynı). */
  bodyCap: number;
  displayCap: number;
};

export type HomeLayout = {
  /** stacked: portakal üstte, yazı altta. inline: yan yana. */
  lockup: "stacked" | "inline";
  /** Alt alta düzende simge ölçüsü. */
  mark: number;
  /** Alt alta düzende yazı logosu genişliği. */
  word: number;
  /** Yan yana düzende logonun genişliği. */
  inlineWidth: number;
  showHeadline: boolean;
  showSub: boolean;
  scanCardH: number;
  tileH: number;
  /** Bloklar arası boşluk. */
  gap: number;
  /** Her şey yerleştikten sonra kalan boş yükseklik (son tarama şeridi bu paya göre gösterilir). */
  spare: number;
};

const MAX_GAP = 28;
const MIN_GAP = 14;
const MIN_STACK_MARK = 88;
const MIN_INLINE_WIDTH = 220;
/** Kaydırma alanı içindeki üst/alt dolgu payı. */
const CONTENT_PAD = 20;

export function computeHomeLayout({ width, available, fontScale, bodyCap, displayCap }: HomeInput): HomeLayout {
  const bodyScale = Math.min(Math.max(fontScale, 0.8), bodyCap);
  const displayScale = Math.min(Math.max(fontScale, 0.8), displayCap);
  const maxMark = Math.min(width * 0.42, 190);
  const wordFor = (mark: number) => Math.min(width - 64, 400, Math.max(200, mark * 1.9));
  const maxInline = Math.min(width - 64, 340);
  const headline = HERO.headlineLine * displayScale + HERO.sloganTop;
  const sub = HERO.subLine * bodyScale + HERO.subTop;
  // Kart içindeki yazılar büyüdükçe kartın en az yüksekliği de büyür (yazı kesilmesin).
  const scanMin = 40 + 24 * bodyScale + 36 * bodyScale;
  const tileMin = 54 + 17 * bodyScale;

  let lockup: "stacked" | "inline" = "stacked";
  let mark = maxMark;
  let inlineWidth = maxInline;
  let gap = MAX_GAP;
  let showSub = true;
  let showHeadline = true;
  let compact = false;

  const scanH = () => Math.max(compact ? HOME_CARD.scanCompact : HOME_CARD.scanFull, scanMin);
  const tileH = () => Math.max(compact ? HOME_CARD.tileCompact : HOME_CARD.tileFull, tileMin);
  const logoH = () =>
    lockup === "stacked" ? mark + HERO.markGap + wordFor(mark) / HERO.wordmarkAspect : inlineWidth / HERO.inlineAspect;
  const textH = () => (showHeadline ? headline + (showSub ? sub : 0) : 0);
  const need = () => logoH() + textH() + scanH() + HOME_CARD.innerGap + tileH() + gap * (showHeadline ? 2 : 1);
  const room = available - CONTENT_PAD;
  const short = () => need() - room;

  if (available > 0) {
    if (short() > 0) gap = Math.max(MIN_GAP, gap - short() / (showHeadline ? 2 : 1));
    if (short() > 0) mark = Math.max(MIN_STACK_MARK, mark - short());
    if (short() > 0) showSub = false;
    if (short() > 0) compact = true;
    if (short() > 0) lockup = "inline";
    if (short() > 0) showHeadline = false;
    if (short() > 0) inlineWidth = Math.max(MIN_INLINE_WIDTH, inlineWidth - short() * HERO.inlineAspect);
  }

  return {
    lockup,
    mark,
    word: wordFor(mark),
    inlineWidth,
    showHeadline,
    showSub,
    scanCardH: Math.round(scanH()),
    tileH: Math.round(tileH()),
    gap,
    spare: available > 0 ? -short() : 0,
  };
}
