// node --experimental-strip-types --test lib/__tests__/heroLayout.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { computeHomeLayout, HERO } from "../heroLayout.ts";

const CAPS = { bodyCap: 1.3, displayCap: 1.2 };

// Gerçek cihazlara yakın ölçüler: genişlik, kaydırma alanı yüksekliği (üst bar ve güvenli alan düşülmüş),
// alt bar boşluğu (kapsül + güvenli alan + 16).
const DEVICES = [
  { name: "küçük Android 320x568", width: 320, viewport: 568 - 24 - 60, bar: 12 + 8 + 64 + 16 },
  { name: "Android 360x640", width: 360, viewport: 640 - 24 - 60, bar: 12 + 8 + 64 + 16 },
  { name: "Android 393x851", width: 393, viewport: 851 - 32 - 60, bar: 24 + 8 + 64 + 16 },
  { name: "iPhone 402x874", width: 402, viewport: 874 - 62 - 60, bar: 34 + 8 + 64 + 16 },
  { name: "Android 480x1040", width: 480, viewport: 1040 - 32 - 60, bar: 24 + 8 + 64 + 16 },
];

for (const d of DEVICES) {
  for (const fontScale of [0.85, 1, 1.3]) {
    test(`${d.name}, yazı ${fontScale}: kaymadan sığar, yazılı logo hep görünür`, () => {
      const l = computeHomeLayout({ width: d.width, available: d.viewport - d.bar, fontScale, ...CAPS });
      assert.ok(l.spare >= 0, `sığmadı: ${JSON.stringify(l)}`);
      assert.ok(l.gap >= 14);
      if (l.lockup === "stacked") {
        assert.ok(l.mark >= 88);
        assert.ok(l.word <= d.width - 64, "yazı logosu kenarlara taşmaz");
      } else {
        assert.ok(l.inlineWidth >= 220 && l.inlineWidth <= d.width - 64);
      }
    });
  }
}

test("büyük telefonda tam düzen: alt alta logo, başlık, alt başlık, tam kartlar", () => {
  const l = computeHomeLayout({ width: 402, available: 874 - 62 - 60 - 122, fontScale: 1, ...CAPS });
  assert.equal(l.lockup, "stacked");
  assert.equal(l.showHeadline, true);
  assert.ok(l.spare >= 0);
});

test("küçük ekranda logo yan yana düzene geçer, gizlenmez", () => {
  const l = computeHomeLayout({ width: 320, available: 568 - 24 - 60 - 100, fontScale: 1, ...CAPS });
  assert.equal(l.lockup, "inline");
  assert.ok(l.inlineWidth >= 220);
});

test("yazı ölçeği sınırın üstünde olsa da hesap sınırla yapılır", () => {
  const base = { width: 360, available: 456, ...CAPS };
  assert.deepEqual(computeHomeLayout({ ...base, fontScale: 3.1 }), computeHomeLayout({ ...base, fontScale: 1.3 }));
});

test("büyük yazıda kart yazıları kesilmesin diye kartlar uzar", () => {
  const big = computeHomeLayout({ width: 480, available: 900, fontScale: 1.3, ...CAPS });
  const normal = computeHomeLayout({ width: 480, available: 900, fontScale: 1, ...CAPS });
  assert.ok(big.tileH >= normal.tileH);
});

test("ölçü gelmeden önce makul bir başlangıç düzeni döner", () => {
  const l = computeHomeLayout({ width: 393, available: 0, fontScale: 1, ...CAPS });
  assert.equal(l.lockup, "stacked");
  assert.equal(l.showHeadline, true);
});

test("sabitler logo oranlarıyla aynı", () => {
  assert.equal(HERO.wordmarkAspect, 8.8693);
  assert.equal(HERO.inlineAspect, 4.7865);
});
