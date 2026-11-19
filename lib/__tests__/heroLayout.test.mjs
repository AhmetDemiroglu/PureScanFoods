// node --experimental-strip-types --test lib/__tests__/heroLayout.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { computeHeroLayout, HERO } from "../heroLayout.ts";

const CAPS = { bodyCap: 1.3, displayCap: 1.2 };
// Kamera sekmesindeki tarama kartının yaklaşık yüksekliği (mod seçici + ana düğme + galeri).
const CARD = 300;

// Gerçek cihazlara yakın ölçüler: genişlik, kaydırma alanı yüksekliği (başlık ve üst güvenli alan düşülmüş),
// alt bar boşluğu (kapsül + güvenli alan + 16).
const DEVICES = [
  { name: "küçük Android 320x568", width: 320, viewport: 568 - 24 - 60, bar: 12 + 8 + 64 + 16 },
  { name: "Android 360x640", width: 360, viewport: 640 - 24 - 60, bar: 12 + 8 + 64 + 16 },
  { name: "Android 393x851", width: 393, viewport: 851 - 32 - 60, bar: 24 + 8 + 64 + 16 },
  { name: "iPhone 402x874", width: 402, viewport: 874 - 62 - 60, bar: 34 + 8 + 64 + 16 },
  { name: "Android 480x1040", width: 480, viewport: 1040 - 32 - 60, bar: 24 + 8 + 64 + 16 },
];

for (const d of DEVICES) {
  for (const fontScale of [0.85, 1, 1.3, 2]) {
    test(`${d.name}, yazı ${fontScale}: içerik sığar ya da en küçük düzene iner`, () => {
      const l = computeHeroLayout({ width: d.width, available: d.viewport - d.bar, cardH: CARD, fontScale, ...CAPS });
      assert.ok(l.mark >= 56, "simge 56'dan küçülmez");
      assert.ok(l.gap >= 18, "boşluk 18'den daralmaz");
      assert.ok(l.word <= d.width - 64, "yazı logosu kenarlara taşmaz");
      // Hedef cihazların hepsinde sınır içindeki yazıda kayma yok.
      assert.ok(l.spare >= 0, `sığmadı: ${JSON.stringify(l)}`);
    });
  }
}

test("orta boy telefonda varsayılan yazıda tam düzen: alt başlık, yazı logosu, tam kart", () => {
  const l = computeHeroLayout({ width: 393, available: 851 - 32 - 60 - 112, cardH: CARD, fontScale: 1, ...CAPS });
  assert.ok(l.spare >= 0);
  assert.equal(l.showSub, true);
  assert.equal(l.showWord, true);
  assert.equal(l.compactCard, false);
});

test("küçük ekranda önce kart sıkışır, başlık en son gider", () => {
  const l = computeHeroLayout({ width: 360, available: 640 - 24 - 60 - 100, cardH: CARD, fontScale: 1, ...CAPS });
  assert.equal(l.compactCard, true);
  assert.ok(l.spare >= 0);
});

test("yazı ölçeği sınırın üstünde olsa da hesap sınırla yapılır", () => {
  const base = { width: 360, available: 456, cardH: CARD, ...CAPS };
  const atCap = computeHeroLayout({ ...base, fontScale: 1.3 });
  const huge = computeHeroLayout({ ...base, fontScale: 3.1 });
  assert.deepEqual(huge, atCap);
});

test("ölçü gelmeden önce makul bir başlangıç düzeni döner", () => {
  const l = computeHeroLayout({ width: 393, available: 0, cardH: 0, fontScale: 1, ...CAPS });
  assert.equal(l.showSub, true);
  assert.ok(l.mark > 72);
});

test("sabitler Hero bileşeniyle ortak", () => {
  assert.equal(HERO.wordmarkAspect, 8.8693);
  assert.equal(HERO.markGap, 10);
});
