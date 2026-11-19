// Ana ekranın kaymadan sığması için hero (logo + başlık) ölçüleri.
// Saf fonksiyon: React ve native API yok, node ile sınanır (lib/__tests__/heroLayout.test.mjs).
// Sıra: boşluk daralır, simge küçülür, alt başlık gizlenir; küçük ekranda sonra kart sıkışır,
// yazı logosu gizlenir, başlık gizlenir, simge en küçüğe iner. Hedef: hiçbir telefonda kayma yok.

/** Hero bileşeninin sabit ölçüleri. components/ui/Hero.tsx stilleri buradan okur, hesap da. */
export const HERO = {
  /** "PureScan | FOODS" yazı logosunun en/boy oranı (brandSvgs wordmark). */
  wordmarkAspect: 8.8693,
  /** Simge ile yazı logosu arası. */
  markGap: 10,
  /** Logo bloğunun altı. */
  logoBottom: 18,
  /** Başlık bloğunun üstü. */
  sloganTop: 8,
  /** Serif başlık (tek satır, sığmazsa küçülür). */
  headlineSize: 26,
  headlineLine: 32,
  subSize: 14,
  subLine: 20,
  subTop: 6,
} as const;

/** Son tarama şeridinin kapladığı yükseklik (şerit + üst boşluk). */
export const LAST_SCAN_STRIP_SPACE = 64;

/** Kompakt kartın kazandırdığı yükseklik (ana düğme ve kart dolgusu küçülür, index.tsx stilleriyle aynı). */
export const COMPACT_CARD_SAVING = 70;

export type HeroInput = {
  /** Ekran genişliği. */
  width: number;
  /** İçerik için kalan yükseklik: kaydırma alanı eksi alt bar boşluğu. */
  available: number;
  /** Tarama kartının TAM düzendeki ölçülen yüksekliği (0: henüz ölçülmedi). Kompakt düzende ölçülmez. */
  cardH: number;
  /** Sistem yazı ölçeği (PixelRatio.getFontScale). */
  fontScale: number;
  /** Gövde ve başlık yazılarının büyüme sınırları (AppText ile aynı). */
  bodyCap: number;
  displayCap: number;
};

export type HeroLayout = {
  mark: number;
  word: number;
  gap: number;
  showSub: boolean;
  /** Yazı logosu ("PureScan | FOODS") görünür mü. */
  showWord: boolean;
  /** Serif başlık görünür mü. */
  showHeadline: boolean;
  /** Tarama kartı kompakt mı (küçük ekran). */
  compactCard: boolean;
  /** Her şey yerleştikten sonra kalan boş yükseklik. */
  spare: number;
};

const MIN_MARK = 72;
const TINY_MARK = 56;
const MAX_GAP = 40;
const MIN_GAP = 18;
/** Kaydırma alanı içindeki üst/alt dolgu payı. */
const CONTENT_PAD = 24;

export function computeHeroLayout({ width, available, cardH, fontScale, bodyCap, displayCap }: HeroInput): HeroLayout {
  const bodyScale = Math.min(Math.max(fontScale, 0.8), bodyCap);
  const displayScale = Math.min(Math.max(fontScale, 0.8), displayCap);
  const maxMark = Math.min(width * 0.46, 210);
  const wordFor = (mark: number) => Math.min(width - 64, 400, Math.max(200, mark * 1.9));
  const headline = HERO.headlineLine * displayScale + HERO.sloganTop;
  const sub = HERO.subLine * bodyScale + HERO.subTop;

  if (!available || !cardH) {
    const mark = Math.min(maxMark, 150);
    return { mark, word: wordFor(mark), gap: 32, showSub: true, showWord: true, showHeadline: true, compactCard: false, spare: 0 };
  }

  let gap = MAX_GAP;
  let mark = maxMark;
  let showSub = true;
  let showWord = true;
  let showHeadline = true;
  let compactCard = false;

  const room = () => available - (compactCard ? cardH - COMPACT_CARD_SAVING : cardH) - CONTENT_PAD;
  const need = () =>
    mark +
    (showWord ? HERO.markGap + wordFor(mark) / HERO.wordmarkAspect : 0) +
    HERO.logoBottom +
    (showHeadline ? headline : 0) +
    (showHeadline && showSub ? sub : 0) +
    gap;
  const short = () => need() - room();

  if (short() > 0) gap = Math.max(MIN_GAP, gap - short());
  if (short() > 0) mark = Math.max(MIN_MARK, mark - short());
  if (short() > 0) showSub = false;
  if (short() > 0) compactCard = true;
  if (short() > 0) showWord = false;
  if (short() > 0) showHeadline = false;
  if (short() > 0) mark = Math.max(TINY_MARK, mark - short());

  return { mark, word: wordFor(mark), gap, showSub, showWord, showHeadline, compactCard, spare: -short() };
}
