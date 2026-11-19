// node --experimental-strip-types --test components/tour/__tests__/tourGeometry.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { placeCard, clampHoleX, CARD_ESTIMATE } from "../tourGeometry.ts";

const PHONE = { H: 874, insetTop: 62, insetBottom: 34 };
const overlaps = (top, h, hole) => top < hole.y + hole.h && top + h > hole.y;

test("hedef üstteyse kart altına konur ve hedefi örtmez", () => {
  const hole = { x: 20, y: 120, w: 360, h: 80 };
  const p = placeCard({ hole, cardH: 220, ...PHONE });
  assert.equal(p.below, true);
  assert.ok(!overlaps(p.top, 220, p.hole));
});

test("hedef alttaysa (alt bar, eylem çubuğu) kart üstüne konur", () => {
  const hole = { x: 28, y: 780, w: 346, h: 64 };
  const p = placeCard({ hole, cardH: 260, ...PHONE });
  assert.equal(p.below, false);
  assert.ok(p.top + 260 <= hole.y);
  assert.ok(p.top >= PHONE.insetTop);
});

test("uzun hedefte kart sığmazsa delik kırpılır, kart ekranda ve çentiğin altında kalır", () => {
  const hole = { x: 0, y: 200, w: 402, h: 560 };
  const p = placeCard({ hole, cardH: 240, ...PHONE });
  assert.ok(p.top >= PHONE.insetTop);
  assert.ok(p.top + 240 <= PHONE.H - PHONE.insetBottom);
  assert.ok(!overlaps(p.top, 240, p.hole), JSON.stringify(p));
  assert.ok(p.hole.h >= 36);
});

test("küçük ekranda (568) büyük yazılı kart yine çakışmaz", () => {
  const hole = { x: 20, y: 250, w: 280, h: 120 };
  const p = placeCard({ hole, cardH: 260, H: 568, insetTop: 24, insetBottom: 16 });
  assert.ok(p.top >= 24 && p.top + 260 <= 568 - 16);
  assert.ok(!overlaps(p.top, 260, p.hole), JSON.stringify(p));
});

test("ölçülmemiş kart için tahmini yükseklik kullanılır", () => {
  const hole = { x: 20, y: 120, w: 360, h: 80 };
  const p = placeCard({ hole, cardH: 0, ...PHONE });
  assert.ok(!overlaps(p.top, CARD_ESTIMATE, p.hole));
});

test("tam genişlik delik ekran kenarına kırpılır", () => {
  const c = clampHoleX({ x: -6, y: 100, w: 414, h: 80 }, 402);
  assert.equal(c.x, 4);
  assert.equal(c.x + c.w, 398);
});
