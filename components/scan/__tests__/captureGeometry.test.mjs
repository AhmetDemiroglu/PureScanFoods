// node --experimental-strip-types --test components/scan/__tests__/captureGeometry.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  geometry,
  frameToCrop,
  rotateCrop,
  cropToPixels,
  turnFromGravity,
  spinFor,
  isSide,
  FULL_CROP,
} from "../captureGeometry.ts";

// Gerçek bir telefona yakın ölçüler.
const BOX = { W: 390, H: 844, top: 110, bottom: 640 };
const TITLE_H = 72;
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test("yerçekiminden tutuş: dik, iki yan ve ölü bölge", () => {
  const G = 9.81;
  assert.equal(turnFromGravity(0, -G, 90), 0, "dik tutuş");
  assert.equal(turnFromGravity(G, 0, 0), 90, "saat yönünde yan");
  assert.equal(turnFromGravity(-G, 0, 0), 270, "saatin tersine yan");
  // Masada yatıyor ya da etikete tam tepeden bakıyor: düzlem içi bileşen yok, son tutuş korunur.
  assert.equal(turnFromGravity(0, 0, 90), 90, "ölü bölge son tutuşu korur");
  assert.equal(turnFromGravity(0.1 * G, -0.1 * G, 270), 270, "zayıf düzlem içi bileşen son tutuşu korur");
  assert.equal(turnFromGravity(0, 0.9 * G, 90), 90, "baş aşağı dik son tutuşu korur");
});

test("etikete eğilerek yan tutuşta çerçeve döner", () => {
  const G = 9.81;
  // ASIL HATA BUYDU: telefon yana çevrilip 45 derece eğildiğinde eksen başına sabit 0.75 g
  // eşiği hiç aşılmıyor ve çerçeve dik kalıyordu. Karar düzlem içi bileşene göre verilir.
  assert.equal(turnFromGravity(0.707 * G, 0, 0), 90, "yan + 45 derece eğik");
  assert.equal(turnFromGravity(-0.707 * G, 0, 0), 270, "ters yan + 45 derece eğik");
  assert.equal(turnFromGravity(0.5 * G, 0, 0), 90, "yan + 60 derece eğik");
  assert.equal(turnFromGravity(0.5 * G, -0.2 * G, 0), 90, "hafif yatık ama yan");
});

test("histerezis eşikte titremeyi engeller", () => {
  const G = 9.81;
  // Tam 45 derecede: dikken dik kalır, yanken yan kalır.
  assert.equal(turnFromGravity(0.6 * G, -0.6 * G, 0), 0, "dikten yana geçmek için x baskın olmalı");
  assert.equal(turnFromGravity(0.6 * G, -0.6 * G, 90), 90, "yandan dike dönmek için y baskın olmalı");
  // Yeterince baskın olunca iki yönde de geçiş olur.
  assert.equal(turnFromGravity(0.9 * G, -0.3 * G, 0), 90);
  assert.equal(turnFromGravity(0.3 * G, -0.9 * G, 90), 0);
});

test("arayüz dönüşü tutuşun tersidir", () => {
  assert.equal(spinFor(0), 0);
  assert.equal(spinFor(90), -90);
  assert.equal(spinFor(270), 90);
  assert.equal(isSide(0), false);
  assert.ok(isSide(90) && isSide(270));
});

test("dik tutuşta çerçeve banda sığar ve ortadadır", () => {
  const g = geometry(BOX, 0, null, TITLE_H);
  near(g.x + g.w / 2, BOX.W / 2);
  assert.ok(g.w <= BOX.W - 24, "yanlardan pay kalır");
  assert.ok(g.y >= BOX.top + TITLE_H, "başlığın altında başlar");
  assert.ok(g.y + g.h <= BOX.bottom, "kontrollerin üstünde biter");
});

test("yan tutuşta çerçeve ekranda uzar, kullanıcının gözünde genişler", () => {
  const p = geometry(BOX, 0, null, TITLE_H);
  const s = geometry(BOX, 90, null, TITLE_H);
  assert.ok(s.h > p.h, "ekranda daha uzun");
  assert.ok(s.w < s.h, "ekranda dar ve uzun");
  near(s.x + s.w / 2, BOX.W / 2);
  near(s.y + s.h / 2, (BOX.top + BOX.bottom) / 2);
  assert.deepEqual(geometry(BOX, 90, null, TITLE_H), geometry(BOX, 270, null, TITLE_H), "iki yan aynı");
});

test("sürüklenen ölçü sınırların içinde tutulur", () => {
  const g = geometry(BOX, 0, { w: 9999, h: 9999 }, TITLE_H);
  assert.equal(g.w, g.maxW);
  assert.equal(g.h, g.maxH);
  const small = geometry(BOX, 0, { w: 1, h: 1 }, TITLE_H);
  assert.equal(small.w, 120);
  assert.equal(small.h, 90);
});

test("dik tutuşta çerçevenin merkezi kırpmanın merkezine düşer", () => {
  const g = geometry(BOX, 0, null, TITLE_H);
  const frame = { ...g, W: BOX.W, H: BOX.H };
  const c = frameToCrop(frame, 3024, 4032, 0, 0);
  near(c.x + c.w / 2, 0.5, 1e-9);
  assert.ok(c.w > 0.5 && c.w < 1, "yatayda taşan önizlemeden dar bir dilim");
});

test("fotoğraf yatık ama tutuş dikse kırpma yapılmaz", () => {
  // İki platformun yön eşiği aynı değil: Android çekimi döndürüp bizim tutuş dik kalabilir.
  // O zaman hangi yöne döndüğü bilinmez, çeyrek tur hatasıyla kesmek yerine tam kare kullanılır.
  const g = geometry(BOX, 0, null, TITLE_H);
  const frame = { ...g, W: BOX.W, H: BOX.H };
  assert.deepEqual(frameToCrop(frame, 4032, 3024, 0), FULL_CROP);
});

test("fotoğraf dik ama tutuş yansa döndürülmeden eşlenir", () => {
  // Tersi hal: iOS son yönü koruyup dik çekmiş olabilir. Fotoğraf dikse kutu döndürülmez.
  const g = geometry(BOX, 90, null, TITLE_H);
  const frame = { ...g, W: BOX.W, H: BOX.H };
  const c = frameToCrop(frame, 3024, 4032, 90, 0);
  const asPortrait = frameToCrop(frame, 3024, 4032, 0, 0);
  assert.deepEqual(c, asPortrait);
  assert.notDeepEqual(c, FULL_CROP);
});

test("yan tutuşta kırpma fotoğrafla birlikte döner", () => {
  const g = geometry(BOX, 90, null, TITLE_H);
  const frame = { ...g, W: BOX.W, H: BOX.H };
  // Yan tutuşta fotoğraf yatık gelir: 4032x3024.
  const c90 = frameToCrop(frame, 4032, 3024, 90, 0);
  const c270 = frameToCrop(frame, 4032, 3024, 270, 0);
  assert.ok(c90.w > c90.h, "dönmüş kutu fotoğrafta geniş");
  near(c90.y + c90.h / 2, 0.5, 1e-9);
  near(c270.y + c270.h / 2, 0.5, 1e-9);
  // İki yan yönün kutuları birbirinin yatay aynasıdır.
  near(c90.x + c90.w / 2, 1 - (c270.x + c270.w / 2), 1e-9);
});

test("çevirme çift yönlüdür ve köşeyi doğru taşır", () => {
  const c = { x: 0.1, y: 0.2, w: 0.3, h: 0.4 };
  // Saat yönünde: sol üst köşe sağ üste gider.
  assert.deepEqual(rotateCrop(c, 90), { x: 1 - 0.2 - 0.4, y: 0.1, w: 0.4, h: 0.3 });
  assert.deepEqual(rotateCrop(c, 270), { x: 0.2, y: 1 - 0.1 - 0.3, w: 0.4, h: 0.3 });
  assert.deepEqual(rotateCrop(c, 0), c);
});

test("bozuk ölçüde fotoğrafın tamamı kullanılır", () => {
  const frame = { x: 0, y: 0, w: 10, h: 10, W: 0, H: 0 };
  assert.deepEqual(frameToCrop(frame, 3024, 4032, 0), FULL_CROP);
  assert.deepEqual(frameToCrop({ x: 0, y: 0, w: 1, h: 1, W: 390, H: 844 }, 0, 0, 0), FULL_CROP);
  // Çok ince bir çerçeve de ölçüm hatası sayılır.
  const sliver = { x: 195, y: 400, w: 1, h: 1, W: 390, H: 844 };
  assert.deepEqual(frameToCrop(sliver, 3024, 4032, 0, 0), FULL_CROP);
});

test("piksel dikdörtgeni fotoğrafın dışına taşmaz", () => {
  const px = cropToPixels({ x: 0.9, y: 0.9, w: 0.5, h: 0.5 }, 1000, 2000);
  assert.equal(px.originX, 900);
  assert.equal(px.originY, 1800);
  assert.equal(px.width, 100);
  assert.equal(px.height, 200);
  const full = cropToPixels({ x: 0, y: 0, w: 1, h: 1 }, 1000, 2000);
  assert.deepEqual(full, { originX: 0, originY: 0, width: 1000, height: 2000 });
});
