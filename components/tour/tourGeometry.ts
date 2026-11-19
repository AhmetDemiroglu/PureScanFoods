// Tur kartının ve deliğin yerleşimi. Saf fonksiyonlar: React ve native API yok, node ile sınanır
// (components/tour/__tests__/tourGeometry.test.mjs).
//
// Kurallar:
//  - Kart hedefi ÖRTMEZ. Önce altta, sığmazsa üstte; ikisine de sığmazsa geniş tarafa konur ve
//    delik kartın bittiği yerden kırpılır (kart değil, delik küçülür).
//  - Kart üstte durum çubuğunun / çentiğin altında, altta ana ekran çizgisinin üstünde kalır.
//  - Delik yatayda ekran kenarına kırpılır (tam genişlik hedeflerin köşeleri ekran dışına taşmasın).

export type Rect = { x: number; y: number; w: number; h: number };

export type CardPlacement = {
  /** Kartın üst kenarı (tur katmanına göre). */
  top: number;
  /** Kart hedefin altında mı. Ok yönü buna göre. */
  below: boolean;
  /** Kart sığsın diye gerekirse kırpılmış delik. */
  hole: Rect;
};

/** Kart ölçülmeden önceki tahmini yükseklik. */
export const CARD_ESTIMATE = 230;
const MIN_HOLE = 36;

export function clampHoleX(hole: Rect, W: number, edge = 4): Rect {
  const left = Math.max(edge, hole.x);
  const right = Math.min(W - edge, hole.x + hole.w);
  return { ...hole, x: left, w: Math.max(MIN_HOLE, right - left) };
}

export function placeCard({
  hole,
  cardH,
  H,
  insetTop,
  insetBottom,
  gap = 18,
  margin = 12,
}: {
  hole: Rect;
  cardH: number;
  H: number;
  insetTop: number;
  insetBottom: number;
  gap?: number;
  margin?: number;
}): CardPlacement {
  const h = cardH > 0 ? cardH : CARD_ESTIMATE;
  const minTop = insetTop + margin;
  const maxBottom = H - insetBottom - margin;
  const spaceBelow = maxBottom - (hole.y + hole.h + gap);
  const spaceAbove = hole.y - gap - minTop;

  if (spaceBelow >= h) return { top: hole.y + hole.h + gap, below: true, hole };
  if (spaceAbove >= h) return { top: hole.y - gap - h, below: false, hole };

  // İki tarafa da sığmıyor: geniş taraf seçilir, delik kırpılır.
  if (spaceBelow >= spaceAbove) {
    const top = Math.max(minTop, maxBottom - h);
    const holeBottom = Math.max(hole.y + MIN_HOLE, top - gap);
    return { top, below: true, hole: { ...hole, h: Math.max(MIN_HOLE, holeBottom - hole.y) } };
  }
  const top = minTop;
  const holeTop = Math.min(hole.y + hole.h - MIN_HOLE, top + h + gap);
  return { top, below: false, hole: { ...hole, y: holeTop, h: Math.max(MIN_HOLE, hole.y + hole.h - holeTop) } };
}
