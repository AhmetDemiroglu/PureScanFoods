// Fotoğraf çekim çerçevesinin geometrisi ve kırpma kutusu dönüşümleri.
// Saf fonksiyonlar: React, Reanimated ve native API yok. Bu yüzden node ile tek tek sınanabilir
// (bkz. components/scan/__tests__/captureGeometry.test.mjs).

/** Telefonun fiziksel tutuşu: 0 dik, 90 saat yönünde yan, 270 saatin tersine yan. */
export type Turn = 0 | 90 | 270;

/** Kamera önizlemesinin ölçüsü ve çerçeveye ayrılan dikey bant (ekran koordinatları). */
export type Box = {
  /** önizleme genişliği */
  W: number;
  /** önizleme yüksekliği */
  H: number;
  /** üst başlıkların bittiği y */
  top: number;
  /** alt kontrollerin başladığı y */
  bottom: number;
};

export type Size = { w: number; h: number };
export type Rect = { x: number; y: number; w: number; h: number };
export type Geo = Rect & { maxW: number; maxH: number; titleTop: number };
/** Deklanşör anındaki çerçeve: konum, ölçü ve içinde bulunduğu önizlemenin ölçüsü. */
export type Frame = Rect & { W: number; H: number };
export type Crop = { x: number; y: number; w: number; h: number };

export const MIN_W = 120;
export const MIN_H = 90;
export const GAP = 12;
/** Yan tutuşta döndürülmüş başlığa bırakılan kenar şeridi. */
const BAND = 56;
/** Dik tutuşta çerçevenin altındaki "yan çevir" ipucu payı. */
const PILL = 54;
/** Kırpmada kenarlara bırakılan pay. Yön eşiği ile fotoğraf oranı arasındaki küçük kaymayı yutar. */
export const CROP_PAD = 0.05;
/** Kırpma bu kadar küçük çıkarsa ölçüm bozuk sayılır, fotoğrafın tamamı kullanılır. */
const MIN_CROP = 0.1;
export const FULL_CROP: Crop = { x: 0.02, y: 0.02, w: 0.96, h: 0.96 };

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const isSide = (turn: Turn) => turn === 90 || turn === 270;

/** Arayüz dikey kilitli; yan tutuşta yazı ve simgeler kullanıcıya dönsün diye bu kadar döndürülür. */
export const spinFor = (turn: Turn) => (turn === 90 ? -90 : turn === 270 ? 90 : 0);


/**
 * Çerçeve ekran koordinatlarında, hep ortada, köşelerden simetrik boyutlanır.
 * Dik tutuşta başlık üstte, "yan çevir" ipucu altta durur. Yan tutuşta çerçeve ekranda uzun ve
 * dar olur: kullanıcının gözünde geniş bir dikdörtgendir, uzun içerik listesi oraya sığar.
 *
 * @param size kullanıcının köşeleri sürükleyerek verdiği ölçü; yoksa varsayılan kullanılır
 * @param titleH dik tutuştaki başlık bloğunun ölçülen yüksekliği
 */
export function geometry(box: Box, turn: Turn, size: Size | null, titleH: number): Geo {
  const { W, H, top, bottom } = box;
  if (!isSide(turn)) {
    const regionTop = top + titleH + GAP;
    const regionBottom = bottom - PILL;
    const maxW = Math.max(MIN_W, W - 24);
    const maxH = Math.max(MIN_H, regionBottom - regionTop);
    // Varsayılan çerçeve bilerek geniş: Foods'ta çekimden sonra kırpma ekranı yok, listeyi
    // kesmek fazla arka plan almaktan çok daha kötü. Kullanıcı köşelerden daraltabilir.
    const w = clamp(size?.w ?? W - 32, MIN_W, maxW);
    const h = clamp(size?.h ?? Math.round(maxH * 0.78), MIN_H, maxH);
    return { x: (W - w) / 2, y: (regionTop + regionBottom) / 2 - h / 2, w, h, maxW, maxH, titleTop: top };
  }
  const maxW = Math.max(MIN_W, W - 2 * BAND);
  const maxH = Math.max(MIN_H, bottom - top);
  const w = clamp(size?.w ?? maxW - 16, MIN_W, maxW);
  const h = clamp(size?.h ?? maxH, MIN_H, maxH);
  return { x: (W - w) / 2, y: (top + bottom) / 2 - h / 2, w, h, maxW, maxH, titleTop: top };
}

/** Kırpma kutusunu (0-1 oranları) görüntüyle birlikte saat yönünde çevirir. */
export function rotateCrop(c: Crop, turn: Turn): Crop {
  if (turn === 90) return { x: 1 - c.y - c.h, y: c.x, w: c.h, h: c.w };
  if (turn === 270) return { x: c.y, y: 1 - c.x - c.w, w: c.h, h: c.w };
  return c;
}

/**
 * Ekrandaki çerçeveyi, çekilen fotoğrafın kırpma kutusuna çevirir.
 *
 * İki gerçeğe dayanır: (1) önizleme ekranı doldurur, kenarlar taşar (iOS resizeAspectFill,
 * Android FILL_CENTER), (2) expo-camera çekimi telefonun FİZİKSEL yönüne göre düzeltir
 * (iOS videoOrientation, Android targetRotation). Yani yan tutuşta fotoğraf yatık gelir,
 * yazı düz durur; ekran ise dikey kilitlidir.
 *
 * ÖNEMLİ: fotoğrafın çeyrek tur döndürülüp döndürülmediğine FOTOĞRAFIN ŞEKLİ karar verir,
 * tutuş değişkeni değil. İki platformun yön eşiği aynı değil (iOS 0.75 g, Android açı
 * kovaları) ve ikisi de arada kalan açıda son yönü koruyabiliyor. Şekil ile tutuş çelişirse
 * (fotoğraf yatık ama tutuş dik) hangi yöne döndüğü bilinmez: kırpma yapılmaz, tam kare
 * kullanılır. Çeyrek tur hatası yüzünden yanlış yerden kesmek, kırpmamaktan çok daha kötü.
 *
 * @param photoW/@param photoH çekilen fotoğrafın bildirdiği piksel ölçüsü (düzeltme uygulanmış)
 */
export function frameToCrop(frame: Frame, photoW: number, photoH: number, turn: Turn, pad = CROP_PAD): Crop {
  if (!(photoW > 0) || !(photoH > 0) || !(frame.W > 0) || !(frame.H > 0)) return FULL_CROP;
  const quarter = photoW > photoH;
  if (quarter && !isSide(turn)) return FULL_CROP;
  const spin: Turn = quarter ? turn : 0;
  const pw = quarter ? photoH : photoW;
  const ph = quarter ? photoW : photoH;
  const scale = Math.max(frame.W / pw, frame.H / ph);
  const dw = pw * scale;
  const dh = ph * scale;
  const x0 = clamp((frame.x - (frame.W - dw) / 2) / dw - pad, 0, 1);
  const y0 = clamp((frame.y - (frame.H - dh) / 2) / dh - pad, 0, 1);
  const x1 = clamp((frame.x + frame.w - (frame.W - dw) / 2) / dw + pad, 0, 1);
  const y1 = clamp((frame.y + frame.h - (frame.H - dh) / 2) / dh + pad, 0, 1);
  if (x1 - x0 < MIN_CROP || y1 - y0 < MIN_CROP) return FULL_CROP;
  return rotateCrop({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, spin);
}

/** Oranlı kırpma kutusunu expo-image-manipulator'ın beklediği piksel dikdörtgenine çevirir. */
export function cropToPixels(c: Crop, photoW: number, photoH: number) {
  const originX = Math.round(clamp(c.x, 0, 1) * photoW);
  const originY = Math.round(clamp(c.y, 0, 1) * photoH);
  const width = Math.round(clamp(c.w, 0, 1) * photoW);
  const height = Math.round(clamp(c.h, 0, 1) * photoH);
  return {
    originX,
    originY,
    width: Math.max(1, Math.min(width, photoW - originX)),
    height: Math.max(1, Math.min(height, photoH - originY)),
  };
}

/**
 * Yerçekimi vektöründen tutuşu çıkarır. Reanimated reaksiyonu içinden (UI iş parçacığında)
 * çağrıldığı için worklet.
 *
 * Karar ekran DÜZLEMİNDEKİ yerçekimine göre verilir. Telefon masada yatarken ya da etikete
 * tepeden bakarken bu bileşen küçülür; o zaman son tutuş korunur, çerçeve boşuna zıplamaz.
 * Düzlem içi bileşen yeterliyse |x| ile |y| karşılaştırılır. Histerezis oranı 45 derecenin
 * iki yanında küçük bir bant bırakır: tam eşikte gezinirken çerçeve titremez.
 *
 * Eksen başına sabit eşik (expo-camera'nın iOS kuralı: 0.75 g) KULLANILMAZ: telefon yana
 * çevrilip etikete 45 derece eğildiğinde |x| 0.71 g'de kalıyor ve tutuş hiç değişmiyordu.
 *
 * @param x/@param y yerçekimi bileşenleri, m/s^2 (Reanimated GRAVITY), cihaz eksenlerinde
 */
export function turnFromGravity(x: number, y: number, last: Turn, floor = 0.35, ratio = 1.3): Turn {
  "worklet";
  const g = 9.81;
  const ax = x / g;
  const ay = y / g;
  // Ekran düzlemindeki yerçekimi: masada yatan ya da tepeden bakan telefonda küçüktür.
  if (Math.sqrt(ax * ax + ay * ay) < floor) return last;
  const mx = Math.abs(ax);
  const my = Math.abs(ay);
  // Histerezis: dikten yana geçmek için x belirgin baskın olmalı, yandan dike dönmek için y.
  const need = last === 0 ? ratio : 1 / ratio;
  if (mx > my * need) return ax > 0 ? 90 : 270;
  if (ay < 0) return 0;
  // Baş aşağı dik tutuş çerçeve için anlamlı değil, son tutuş korunur.
  return last;
}
