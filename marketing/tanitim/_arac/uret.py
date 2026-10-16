#!/usr/bin/env python3
"""PureScan Foods tanitim slaytlari (1080x1350 SVG) uretici.

Kullanim: python3 uret.py   (cikti: ../01-kapak.svg ... ../07-indir.svg)
Gereken: fonttools (font altkumesi icin), kaynak/ klasorundeki ekran goruntuleri ve logo.
"""
import base64
import io
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "kaynak")
OUT = os.path.dirname(HERE)
FONTS = os.path.join(HERE, "..", "..", "..", "assets", "fonts")
for extra in sys.argv[1:]:
    sys.path.insert(0, extra)

from fontTools import subset  # noqa: E402
from fontTools.ttLib import TTFont  # noqa: E402

W, H = 1080, 1350
M = 72
TOTAL = 7

ORANGE = "#FF6F00"
ORANGE_D = "#E85D00"
NAVY = "#0F172A"
SLATE = "#1E293B"
MUTED = "#64748B"
SURFACE = "#F8FAFC"
BORDER = "#E2E8F0"
GREEN = "#10B981"
RED = "#EF4444"
AMBER = "#F59E0B"

CHARS = (
    "".join(chr(c) for c in range(32, 127))
    + "çÇğĞıİöÖşŞüÜâîû·•≈’'"
)


def font_face(name, weight, filename):
    f = TTFont(os.path.join(FONTS, filename))
    opts = subset.Options()
    opts.layout_features = ["kern", "liga", "locl", "tnum"]
    s = subset.Subsetter(opts)
    s.populate(text=CHARS)
    s.subset(f)
    buf = io.BytesIO()
    f.save(buf)
    b64 = base64.b64encode(buf.getvalue()).decode()
    return (
        "@font-face{font-family:'%s';font-weight:%d;"
        "src:url(data:font/ttf;base64,%s) format('truetype');}" % (name, weight, b64)
    )


STYLE = "".join(
    [
        font_face("PS Inter", 400, "Inter-Regular.ttf"),
        font_face("PS Inter", 500, "Inter-Medium.ttf"),
        font_face("PS Inter", 600, "Inter-SemiBold.ttf"),
        font_face("PS Inter", 700, "Inter-Bold.ttf"),
        font_face("PS Caveat", 700, "Caveat-Bold.ttf"),
        "text{font-family:'PS Inter','Inter','Helvetica Neue',Arial,sans-serif;}",
        ".cv{font-family:'PS Caveat','Caveat',cursive;font-weight:700;}",
    ]
)


def b64(name):
    with open(os.path.join(SRC, name), "rb") as fh:
        return base64.b64encode(fh.read()).decode()


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def t(x, y, s, size, weight=400, fill=NAVY, anchor="start", extra=""):
    return '<text x="%s" y="%s" font-size="%s" font-weight="%s" fill="%s" text-anchor="%s" %s>%s</text>' % (
        x, y, size, weight, fill, anchor, extra, esc(s))


def lines(x, y, rows, size, lh, **kw):
    return "".join(t(x, y + i * lh, r, size, **kw) for i, r in enumerate(rows))


def tw(s, size, k=0.56):
    return len(s) * size * k


def pill(x, y, s, size=22, fg="#fff", bg=ORANGE, weight=600, padx=18, h=None, stroke=None):
    h = h or size * 1.9
    w = tw(s, size) + padx * 2
    st = ' stroke="%s" stroke-width="1.5"' % stroke if stroke else ""
    return (
        '<rect x="%s" y="%s" width="%.0f" height="%.0f" rx="%.0f" fill="%s"%s/>' % (x, y, w, h, h / 2, bg, st)
        + t(x + w / 2, y + h / 2 + size * 0.35, s, size, weight, fg, "middle")
    ), w


def check(x, y, color=GREEN, s=1.0):
    return (
        '<circle cx="%s" cy="%s" r="%s" fill="%s"/>' % (x, y, 15 * s, color)
        + '<path d="M%s %s l%s %s l%s %s" fill="none" stroke="#fff" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round"/>'
        % (x - 6.5 * s, y + 0.5 * s, 4.5 * s, 4.5 * s, 8.5 * s, -9 * s, 3 * s)
    )


def brackets(x, y, size, arm, sw, color, op=1.0, r=None):
    """Tarama kosesi: dort L parcasi."""
    r = r if r is not None else arm * 0.45
    a = arm
    d = (
        "M%s %s v%s a%s %s 0 0 1 %s %s h%s " % (x, y + a, -(a - r), r, r, r, -r, a - r)
        + "M%s %s h%s a%s %s 0 0 1 %s %s v%s " % (x + size - a, y, a - r, r, r, r, r, a - r)
        + "M%s %s v%s a%s %s 0 0 1 %s %s h%s " % (x + size, y + size - a, a - r, r, r, -r, r, -(a - r))
        + "M%s %s h%s a%s %s 0 0 1 %s %s v%s" % (x + a, y + size, -(a - r), r, r, -r, -r, -(a - r))
    )
    return '<path d="%s" fill="none" stroke="%s" stroke-width="%s" stroke-linecap="round" opacity="%s"/>' % (
        d, color, sw, op)


def phone(pid, x, y, w, img, rot=0, crop_h=None):
    """Telefon govdesi + ekran goruntusu. w: ekran genisligi."""
    h = w * 1706 / 840
    vis = crop_h or h
    b = max(10, w * 0.032)
    r_out = w * 0.15
    r_in = r_out - b
    tr = ' transform="rotate(%s %s %s)"' % (rot, x + w / 2, y + vis / 2) if rot else ""
    return (
        "<g%s>" % tr
        + '<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s" filter="url(#sh)"/>' % (
            x - b, y - b, w + 2 * b, vis + 2 * b, r_out, NAVY)
        + '<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="none" stroke="#475569" stroke-width="1.5"/>' % (
            x - b + 1, y - b + 1, w + 2 * b - 2, vis + 2 * b - 2, r_out - 1)
        + '<clipPath id="%s"><rect x="%s" y="%s" width="%s" height="%s" rx="%s"/></clipPath>' % (
            pid, x, y, w, vis, r_in)
        + '<g clip-path="url(#%s)"><rect x="%s" y="%s" width="%s" height="%s" fill="#fff"/>' % (pid, x, y, w, vis)
        + '<image x="%s" y="%s" width="%s" height="%s" preserveAspectRatio="xMidYMin slice" href="data:image/jpeg;base64,%s"/></g>'
        % (x, y, w, h, b64(img))
        + "</g>"
    )


def card(x, y, w, h, fill="#fff", stroke=BORDER, r=28, shadow=True, op=1):
    return '<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s" stroke="%s" stroke-width="1.5" fill-opacity="%s"%s/>' % (
        x, y, w, h, r, fill, stroke, op, ' filter="url(#shs)"' if shadow else "")


def defs():
    return (
        "<defs><style>%s</style>" % STYLE
        + '<clipPath id="lc"><rect width="360" height="360" rx="82"/></clipPath><g id="logo"><image width="360" height="360" clip-path="url(#lc)" href="data:image/png;base64,%s"/><rect x="4" y="4" width="352" height="352" rx="78" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="8"/></g>' % b64("logo.png")
        + '<filter id="sh" x="-30%" y="-20%" width="160%" height="150%"><feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#0F172A" flood-opacity="0.28"/></filter>'
        + '<filter id="shs" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#0F172A" flood-opacity="0.08"/></filter>'
        + '<linearGradient id="gOr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF8F1F"/><stop offset="0.5" stop-color="#FF6F00"/><stop offset="1" stop-color="#E65100"/></linearGradient>'
        + '<linearGradient id="gNv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1E293B"/><stop offset="1" stop-color="#0B1220"/></linearGradient>'
        + '<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FF6F00" stop-opacity="0.34"/><stop offset="1" stop-color="#FF6F00" stop-opacity="0"/></radialGradient>'
        + '<radialGradient id="glowW" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff" stop-opacity="0.30"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
        + '<linearGradient id="gBtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8A1F"/><stop offset="1" stop-color="#F26400"/></linearGradient>'
        + "</defs>"
    )


def background(variant):
    if variant == "orange":
        return (
            '<rect width="%s" height="%s" fill="url(#gOr)"/>' % (W, H)
            + '<circle cx="930" cy="250" r="420" fill="url(#glowW)"/>'
            + '<circle cx="80" cy="1180" r="360" fill="#C2410C" opacity="0.28"/>'
            + brackets(600, 560, 620, 150, 26, "#fff", 0.10)
        )
    if variant == "dark":
        return (
            '<rect width="%s" height="%s" fill="url(#gNv)"/>' % (W, H)
            + '<circle cx="540" cy="360" r="520" fill="url(#glow)"/>'
            + brackets(300, 196, 480, 120, 20, "#fff", 0.05)
        )
    return (
        '<rect width="%s" height="%s" fill="%s"/>' % (W, H, SURFACE)
        + '<circle cx="1010" cy="120" r="430" fill="url(#glow)" opacity="0.55"/>'
        + '<circle cx="40" cy="1300" r="330" fill="url(#glow)" opacity="0.35"/>'
        + brackets(742, -70, 420, 110, 20, ORANGE, 0.07)
    )


def header(variant, idx, tag):
    on_color = variant in ("orange", "dark")
    pure = "#fff" if on_color else SLATE
    scan = NAVY if variant == "orange" else ORANGE
    foods = "#fff" if variant == "orange" else ORANGE
    sub = "#fff" if on_color else MUTED
    line = "#fff" if on_color else "#CBD5E1"
    return (
        '<use href="#logo" transform="translate(%s 50) scale(%s)" filter="url(#shs)"/>' % (M, 80 / 360)
        + '<text x="166" y="98" font-size="40" font-weight="700" letter-spacing="-0.8"><tspan fill="%s">Pure</tspan><tspan fill="%s">Scan</tspan></text>' % (pure, scan)
        + '<text x="346" y="128" font-size="38" class="cv" fill="%s" text-anchor="end">foods</text>' % foods
        + t(W - M, 86, tag, 19, 600, sub, "end", 'letter-spacing="3" opacity="%s"' % (0.9 if on_color else 1))
        + t(W - M, 118, "%02d / %02d" % (idx, TOTAL), 19, 600, sub, "end", 'letter-spacing="2" opacity="0.75"')
        + '<rect x="%s" y="158" width="%s" height="2" rx="1" fill="%s" opacity="%s"/>' % (M, W - 2 * M, line, 0.35 if on_color else 1)
    )


def footer(variant, idx):
    on_color = variant in ("orange", "dark")
    fg = "#fff" if on_color else SLATE
    sub = "#fff" if on_color else MUTED
    line = "#fff" if on_color else "#CBD5E1"
    dot_on = "#fff" if variant == "orange" else ORANGE
    dot_off = "#fff" if on_color else "#CBD5E1"
    dots = ""
    x = 540 - (TOTAL * 18 + 18) / 2
    for i in range(1, TOTAL + 1):
        if i == idx:
            dots += '<rect x="%s" y="1294" width="28" height="10" rx="5" fill="%s"/>' % (x, dot_on)
            x += 36
        else:
            dots += '<circle cx="%s" cy="1299" r="5" fill="%s" opacity="%s"/>' % (x + 5, dot_off, 0.45 if on_color else 1)
            x += 18
    return (
        '<rect x="%s" y="1262" width="%s" height="2" rx="1" fill="%s" opacity="%s"/>' % (M, W - 2 * M, line, 0.35 if on_color else 1)
        + t(M, 1307, "purescan-foods.septimuslab.com", 21, 600, fg)
        + dots
        + t(W - M, 1307, "App Store  ·  Google Play", 21, 500, sub, "end", 'opacity="%s"' % (0.9 if on_color else 1))
    )


def title_block(eyebrow, rows, lead=None):
    out = t(M, 226, eyebrow, 21, 700, ORANGE, extra='letter-spacing="3.5"')
    y = 300
    for r in rows:
        if isinstance(r, tuple):
            out += '<text x="%s" y="%s" font-size="62" font-weight="700" letter-spacing="-1.6"><tspan fill="%s">%s</tspan><tspan fill="%s">%s</tspan></text>' % (
                M, y, NAVY, esc(r[0]), ORANGE, esc(r[1]))
        else:
            out += t(M, y, r, 62, 700, NAVY, extra='letter-spacing="-1.6"')
        y += 72
    if lead:
        out += lines(M, y - 14, lead, 27, 38, weight=500, fill=MUTED)
    return out


def svg(variant, idx, tag, body):
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s %s" width="%s" height="%s">' % (W, H, W, H)
        + defs()
        + background(variant)
        + '<clipPath id="content"><rect x="0" y="160" width="%s" height="1102"/></clipPath>' % W
        + '<g clip-path="url(#content)">' + body + "</g>"
        + header(variant, idx, tag)
        + footer(variant, idx)
        + "</svg>"
    )


# ───────────────────────── 01 KAPAK ─────────────────────────
def s1():
    b = ""
    b += t(M, 292, "Etiketi okuyorsun.", 88, 700, "#fff", extra='letter-spacing="-2.6"')
    b += t(M, 392, "Peki anlıyor musun?", 88, 700, NAVY, extra='letter-spacing="-2.6"')
    b += lines(M, 462, [
        "PureScan Foods, gıda etiketindeki E-kodlarını, katkı",
        "maddelerini ve alerjenleri saniyeler içinde çözer.",
    ], 31, 44, weight=500, fill="#fff")

    b += phone("p1", 610, 600, 400, "analysis.jpg", rot=4)

    feats = [
        ("Üç yolla tara", "Barkod, fotoğraf ya da metin"),
        ("0-100 güvenlik puanı", "Katkı, NOVA ve Nutri-Score"),
        ("Ailene özel uyum", "19 diyet, 22 alerjen"),
    ]
    y = 590
    for i, (a, d) in enumerate(feats):
        b += '<rect x="%s" y="%s" width="476" height="112" rx="28" fill="#fff" fill-opacity="0.16" stroke="#fff" stroke-opacity="0.45" stroke-width="1.5"/>' % (M, y)
        cx, cy = M + 56, y + 56
        b += '<circle cx="%s" cy="%s" r="32" fill="#fff"/>' % (cx, cy)
        if i == 0:
            b += brackets(cx - 15, cy - 15, 30, 10, 4, ORANGE)
            b += '<rect x="%s" y="%s" width="18" height="4" rx="2" fill="%s"/>' % (cx - 9, cy - 2, ORANGE)
        elif i == 1:
            b += '<circle cx="%s" cy="%s" r="15" fill="none" stroke="#FED7AA" stroke-width="5"/>' % (cx, cy)
            b += '<path d="M%s %s a15 15 0 1 1 -15 15" fill="none" stroke="%s" stroke-width="5" stroke-linecap="round"/>' % (cx, cy - 15, ORANGE)
        else:
            b += '<circle cx="%s" cy="%s" r="7" fill="%s"/><path d="M%s %s a12 11 0 0 1 24 0 z" fill="%s"/>' % (cx - 7, cy - 7, ORANGE, cx - 19, cy + 16, ORANGE)
            b += '<circle cx="%s" cy="%s" r="5.5" fill="#FDBA74"/><path d="M%s %s a9 9 0 0 1 18 0 z" fill="#FDBA74"/>' % (cx + 11, cy - 3, cx + 3, cy + 16)
        b += t(M + 106, y + 50, a, 29, 700, "#fff")
        b += t(M + 106, y + 86, d, 22, 500, "#fff", extra='opacity="0.92"')
        y += 130

    # CTA
    b += '<rect x="%s" y="1010" width="330" height="86" rx="43" fill="#fff" filter="url(#sh)"/>' % M
    b += t(M + 165, 1065, "Ücretsiz indir", 31, 700, ORANGE_D, "middle")
    b += t(M + 4, 1146, "iOS ve Android  ·  Türkçe, English, Español", 22, 500, "#fff", extra='opacity="0.92"')

    # yuzen rozetler
    b += '<g filter="url(#sh)"><rect x="548" y="742" width="250" height="66" rx="33" fill="#fff"/></g>'
    b += '<circle cx="582" cy="775" r="12" fill="%s"/>' % RED
    b += t(606, 783, "Gluten tespit edildi", 21, 700, NAVY)
    b += '<g filter="url(#sh)"><rect x="560" y="1056" width="236" height="66" rx="33" fill="%s"/></g>' % NAVY
    b += check(594, 1089, GREEN, 0.85)
    b += t(618, 1097, "Güvenlik 95/100", 21, 700, "#fff")
    return svg("orange", 1, "GIDA İÇERİK TARAYICISI", b)


# ───────────────────────── 02 TARAMA ─────────────────────────
def s2():
    b = title_block("NASIL ÇALIŞIR?", ["Üç yolla tara,", ("saniyeler içinde ", "öğren.")])
    b += phone("p2", 84, 452, 376, "scan.jpg")
    rows = [
        ("Kamera (OCR)", ["Etiketin fotoğrafını çek.", "İçindekiler otomatik okunur."]),
        ("Barkod", ["Barkodu okut. Ürün bilgisi", "OpenFoodFacts'ten gelir."]),
        ("Metin", ["İçindekiler listesini yapıştır,", "analiz hemen başlasın."]),
    ]
    x, y = 524, 440
    for i, (h, d) in enumerate(rows):
        b += card(x, y, 484, 222)
        b += '<circle cx="%s" cy="%s" r="30" fill="url(#gBtn)"/>' % (x + 58, y + 62)
        b += t(x + 58, y + 73, str(i + 1), 30, 700, "#fff", "middle")
        b += t(x + 108, y + 74, h, 34, 700, NAVY, extra='letter-spacing="-0.6"')
        b += lines(x + 30, y + 136, d, 26, 38, weight=500, fill=MUTED)
        y += 246
    b += check(x + 16, 1206, ORANGE, 0.8)
    b += t(x + 42, 1214, "Galerindeki fotoğrafı da seçebilirsin.", 23, 600, SLATE)
    return svg("light", 2, "TARAMA", b)


# ───────────────────────── 03 ANALIZ ─────────────────────────
def s3():
    b = title_block("ANALİZ", ["Tek ekranda", ("net ", "cevap.")])
    b += phone("p3", 620, 452, 376, "analysis.jpg")
    x, w, hgt = M, 500, 172
    y = 440

    # 1 guvenlik puani
    b += card(x, y, w, hgt)
    cx, cy = x + 82, y + 86
    b += '<circle cx="%s" cy="%s" r="46" fill="none" stroke="#D1FAE5" stroke-width="10"/>' % (cx, cy)
    b += '<path d="M%s %s a46 46 0 1 1 -14.2 2.2" fill="none" stroke="%s" stroke-width="10" stroke-linecap="round"/>' % (cx, cy - 46, GREEN)
    b += t(cx, cy + 12, "95", 34, 700, "#047857", "middle")
    b += t(x + 156, y + 74, "Güvenlik puanı", 31, 700, NAVY, extra='letter-spacing="-0.5"')
    b += lines(x + 156, y + 110, ["0-100 arası tek bir puan,", "ayrıca sana göre uyum puanı."], 22, 30, weight=500, fill=MUTED)
    y += hgt + 20

    # 2 katki
    b += card(x, y, w, hgt)
    b += t(x + 30, y + 58, "Katkı maddeleri", 31, 700, NAVY, extra='letter-spacing="-0.5"')
    b += t(x + 30, y + 92, "Risk sınıfı, AB ve FDA durumu.", 22, 500, MUTED)
    px = x + 30
    for lab, fg, bg in (("Tehlikeli", "#B91C1C", "#FEE2E2"), ("Dikkatli", "#B45309", "#FEF3C7"), ("Güvenli", "#047857", "#D1FAE5")):
        p, pw = pill(px, y + 112, lab, 20, fg, bg, 700, 18, 40)
        b += p
        px += pw + 12
    y += hgt + 20

    # 3 NOVA
    b += card(x, y, w, hgt)
    b += t(x + 30, y + 58, "NOVA seviyesi", 31, 700, NAVY, extra='letter-spacing="-0.5"')
    b += t(x + 30, y + 92, "Ürün ne kadar işlenmiş?", 22, 500, MUTED)
    px = x + 30
    for n, c in (("1", "#22C55E"), ("2", "#84CC16"), ("3", "#EAB308"), ("4", "#DC2626")):
        b += '<rect x="%s" y="%s" width="64" height="40" rx="12" fill="%s"/>' % (px, y + 112, c)
        b += t(px + 32, y + 140, n, 23, 700, "#fff", "middle")
        px += 74
    y += hgt + 20

    # 4 Nutri-Score
    b += card(x, y, w, hgt)
    b += t(x + 30, y + 58, "Nutri-Score", 31, 700, NAVY, extra='letter-spacing="-0.5"')
    b += t(x + 30, y + 92, "A'dan E'ye beslenme puanı.", 22, 500, MUTED)
    px = x + 30
    for n, c in (("A", "#00813D"), ("B", "#85BB2F"), ("C", "#FECB02"), ("D", "#EE8100"), ("E", "#E63E11")):
        b += '<rect x="%s" y="%s" width="56" height="40" rx="12" fill="%s"/>' % (px, y + 112, c)
        b += t(px + 28, y + 140, n, 23, 700, "#fff", "middle")
        px += 64
    return svg("light", 3, "ANALİZ", b)


# ───────────────────────── 04 AILE ─────────────────────────
def s4():
    b = title_block("AİLE VE BESLENME", ["Bir kez tara,", ("tüm aile için ", "sonuç al.")])
    b += phone("p4a", 84, 446, 316, "profiles.jpg")
    b += phone("p4b", 372, 530, 316, "compatibility.jpg")
    x, w, hgt = 742, 266, 228
    y = 446
    for num, lab, d in (
        ("19", "diyet profili", ["Vegan, keto, glutensiz,", "helal ve fazlası"]),
        ("22", "alerjen", ["Gluten, süt, yumurta,", "fıstık ve fazlası"]),
        ("9", "yaş grubu", ["Bebek, çocuk, 65 üstü,", "hamilelik ve emzirme"]),
    ):
        b += card(x, y, w, hgt)
        b += '<text x="%s" y="%s"><tspan font-size="74" font-weight="700" fill="%s" letter-spacing="-2.5">%s</tspan><tspan dx="10" font-size="25" font-weight="700" fill="%s">%s</tspan></text>' % (
            x + 24, y + 92, ORANGE, num, NAVY, lab)
        b += lines(x + 24, y + 142, d, 20, 30, weight=500, fill=MUTED)
        y += hgt + 20
    return svg("light", 4, "AİLE PROFİLLERİ", b)


# ───────────────────────── 05 GURU + SOZLUK ─────────────────────────
def s5():
    b = title_block("YAPAY ZEKA VE BİLGİ", ["Guru'ya sor,", ("Sözlük'te ", "öğren.")])
    for i, (img, h, d) in enumerate((
        ("guru.jpg", "PureScan Guru", ["Profilini ve taramalarını bilen", "yapay zeka beslenme asistanı."]),
        ("library.jpg", "Gıda Sözlüğü", ["E-kodları, NOVA ve Nutri-Score", "rehberi. Ara, filtrele, öğren."]),
    )):
        cx = 294 if i == 0 else 786
        b += phone("p5%s" % i, cx - 162, 426, 324, img, crop_h=578)
        b += t(cx, 1100, h, 33, 700, NAVY, "middle", 'letter-spacing="-0.6"')
        b += lines(cx, 1142, d, 23, 34, weight=500, fill=MUTED, anchor="middle")
    return svg("light", 5, "GURU VE SÖZLÜK", b)


# ───────────────────────── 06 KAVANOZ + KARSILASTIR ─────────────────────────
def spoon(x, y, c):
    return (
        '<ellipse cx="%s" cy="%s" rx="13" ry="17" fill="%s"/>' % (x, y, c)
        + '<rect x="%s" y="%s" width="6" height="30" rx="3" fill="%s"/>' % (x - 3, y + 14, c)
    )


def s6():
    b = title_block("GÖRSEL VE KIYAS", ["Gerçekte ne", ("tüketiyorsun", "?")])
    # sol kart: kavanoz
    x, y, w, h = M, 440, 470, 778
    b += card(x, y, w, h)
    b += t(x + 30, y + 54, "Kakaolu fındık kreması", 28, 700, NAVY, extra='letter-spacing="-0.4"')
    b += t(x + 30, y + 88, "Örnek ürün  ·  100 g için tahmini oran", 19, 500, MUTED)
    jx, jy, jw, jh = x + 36, y + 136, 150, 430
    layers = [
        ("Şeker", 50, "#F3F4F6"),
        ("Bitkisel yağ", 22, "#F2C14E"),
        ("Fındık", 13, "#9C6B3F"),
        ("Kakao", 7, "#5B3A29"),
        ("Süt tozu", 6, "#FBF6EC"),
        ("Katkı maddeleri", 2, "#DC2626"),
    ]
    b += '<rect x="%s" y="%s" width="%s" height="10" rx="5" fill="#94A3B8"/>' % (jx + jw * 0.14, jy - 9, jw * 0.72)
    b += '<clipPath id="jar"><rect x="%s" y="%s" width="%s" height="%s" rx="24"/></clipPath><g clip-path="url(#jar)">' % (jx, jy, jw, jh)
    acc = 0
    rows = len(layers)
    lab = ""
    for i, (name, pct, col) in enumerate(layers):
        top = jy + acc / 100 * jh
        hh = pct / 100 * jh
        b += '<rect x="%s" y="%.1f" width="%s" height="%.1f" fill="%s"/>' % (jx, top, jw, hh + 0.6, col)
        if i:
            b += '<line x1="%s" y1="%.1f" x2="%s" y2="%.1f" stroke="#000" stroke-opacity="0.10"/>' % (jx, top, jx + jw, top)
        cyl = top + hh / 2
        ry = jy + (i + 0.5) * jh / rows
        lab += '<path d="M%s %.1f L%s %.1f L%s %.1f" fill="none" stroke="#94A3B8" stroke-width="1.5"/>' % (
            jx + jw + 4, cyl, jx + jw + 34, ry, jx + jw + 48, ry)
        lab += '<circle cx="%s" cy="%.1f" r="8" fill="%s" stroke="#94A3B8" stroke-width="1.2"/>' % (jx + jw + 58, ry, col)
        lab += t(jx + jw + 76, ry + 2, name, 21, 700, NAVY)
        lab += t(jx + jw + 76, ry + 27, "%%%d" % pct, 19, 600, MUTED)
        acc += pct
    b += '<rect x="%s" y="%s" width="26" height="%s" fill="#fff" opacity="0.30"/>' % (jx + 12, jy, jh)
    b += "</g>"
    b += '<rect x="%s" y="%s" width="%s" height="%s" rx="24" fill="none" stroke="#94A3B8" stroke-width="2.5"/>' % (jx, jy, jw, jh)
    b += lab
    # kasiklar
    sy = y + 598
    b += '<rect x="%s" y="%s" width="%s" height="92" rx="22" fill="#FFF7ED" stroke="#FED7AA" stroke-width="1.5"/>' % (x + 26, sy, w - 52)
    for i in range(4):
        b += spoon(x + 60 + i * 34, sy + 32, ORANGE)
    b += t(x + 196, sy + 42, "4 yemek kaşığı şeker", 22, 700, NAVY)
    b += t(x + 196, sy + 70, "100 g üründe (tahmini)", 18, 500, MUTED)
    b += check(x + 44, y + 734, ORANGE, 0.78)
    b += t(x + 68, y + 742, "Premium: fotogerçekçi AI görseli", 20, 600, SLATE)

    # sag: karsilastirma
    x2, w2 = 566, 442
    b += card(x2, 440, w2, 452)
    b += t(x2 + 30, 494, "Karşılaştırma", 28, 700, NAVY, extra='letter-spacing="-0.4"')
    b += t(x2 + 30, 526, "İki ürünü yan yana gör.", 19, 500, MUTED)
    ca, cb, cm = x2 + 86, x2 + w2 - 86, x2 + w2 / 2
    b += '<rect x="%s" y="552" width="124" height="52" rx="16" fill="#ECFDF5"/><rect x="%s" y="552" width="124" height="52" rx="16" fill="#FEF2F2"/>' % (ca - 62, cb - 62)
    b += t(ca, 586, "Ürün A", 22, 700, "#047857", "middle") + t(cb, 586, "Ürün B", 22, 700, "#B91C1C", "middle")
    b += '<circle cx="%s" cy="578" r="25" fill="%s"/>' % (cm, NAVY) + t(cm, 586, "VS", 19, 700, "#fff", "middle")
    ry = 648
    for lab_, a, bb in (("Güvenlik", "82", "41"), ("Katkı sayısı", "1", "7"), ("Riskli katkı", "0", "3"), ("Şeker", "6 g", "50 g")):
        b += '<rect x="%s" y="%s" width="%s" height="1.5" fill="%s"/>' % (x2 + 30, ry - 36, w2 - 60, BORDER)
        b += t(ca, ry + 6, a, 29, 700, "#047857", "middle")
        b += t(cb, ry + 6, bb, 29, 700, "#B91C1C", "middle")
        b += t(cm, ry + 3, lab_, 18, 600, MUTED, "middle")
        ry += 64
    # gecmis + paylas
    for i, (hh, dd) in enumerate((
        ("Tarama geçmişi", ["Her tarama kayıtlı.", "Tek dokunuşla geri dön."]),
        ("Paylaş", ["Sonucu ve görseli", "tek dokunuşla paylaş."]),
    )):
        yy = 912 + i * 158
        b += card(x2, yy, w2, 142)
        b += '<circle cx="%s" cy="%s" r="30" fill="#FFF7ED"/>' % (x2 + 60, yy + 71)
        if i == 0:
            b += '<circle cx="%s" cy="%s" r="14" fill="none" stroke="%s" stroke-width="4"/><path d="M%s %s v-9 M%s %s h7" stroke="%s" stroke-width="4" stroke-linecap="round"/>' % (
                x2 + 60, yy + 71, ORANGE, x2 + 60, yy + 71, x2 + 60, yy + 71, ORANGE)
        else:
            b += '<path d="M%s %s v-22 m-9 9 l9 -9 l9 9" fill="none" stroke="%s" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M%s %s v8 h28 v-8" fill="none" stroke="%s" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' % (
                x2 + 60, yy + 76, ORANGE, x2 + 46, yy + 76, ORANGE)
        b += t(x2 + 110, yy + 50, hh, 26, 700, NAVY, extra='letter-spacing="-0.3"')
        b += lines(x2 + 110, yy + 82, dd, 20, 28, weight=500, fill=MUTED)
    return svg("light", 6, "TÜKETİM GÖRSELİ", b)


# ───────────────────────── 07 INDIR ─────────────────────────
def s7():
    b = '<use href="#logo" transform="translate(%s 196) scale(%s)" filter="url(#sh)"/>' % (540 - 115, 230 / 360)
    b += t(540, 536, "Ne yediğini bil.", 92, 700, "#fff", "middle", 'letter-spacing="-2.8"')
    b += t(540, 596, "Ücretsiz indir, ilk etiketini bugün tara.", 30, 500, "#CBD5E1", "middle")
    cols = (
        ("Ücretsiz", False, ["Haftada 5 ürün taraması", "Haftada 5 Guru mesajı", "1 aile üyesi profili", "Sözlük ve geçmiş açık", "Reklam izle, ek hak kazan"]),
        ("Premium", True, ["Sınırsız tarama", "Sınırsız Guru", "Sınırsız aile profili", "Reklamsız kullanım", "Haftada 10 AI görseli"]),
    )
    for i, (h, prem, items) in enumerate(cols):
        x = M + i * 480
        w = 456
        if prem:
            b += '<rect x="%s" y="650" width="%s" height="372" rx="30" fill="url(#gOr)"/>' % (x, w)
        else:
            b += '<rect x="%s" y="650" width="%s" height="372" rx="30" fill="#fff" fill-opacity="0.06" stroke="#fff" stroke-opacity="0.22" stroke-width="1.5"/>' % (x, w)
        b += t(x + 34, 712, h, 34, 700, "#fff", extra='letter-spacing="-0.6"')
        yy = 770
        for it in items:
            b += check(x + 48, yy - 8, "#fff" if prem else ORANGE, 0.8).replace('stroke="#fff"', 'stroke="%s"' % (ORANGE_D if prem else "#fff"))
            b += t(x + 78, yy, it, 24, 600 if prem else 500, "#fff")
            yy += 50
    for i, s in enumerate(("App Store", "Google Play")):
        x = 540 - 300 + i * 310
        b += '<rect x="%s" y="1062" width="290" height="80" rx="40" fill="#fff"/>' % x
        b += t(x + 145, 1112, s, 28, 700, NAVY, "middle")
    b += t(540, 1192, "Türkçe  ·  English  ·  Español", 22, 600, "#CBD5E1", "middle", 'letter-spacing="1"')
    b += t(540, 1232, "PureScan Foods tıbbi tavsiye vermez. Tüketim kararı sana aittir.", 18, 500, "#94A3B8", "middle")
    return svg("dark", 7, "HEMEN DENE", b)


SLIDES = (
    ("01-kapak", s1), ("02-tarama", s2), ("03-analiz", s3), ("04-aile", s4),
    ("05-guru-sozluk", s5), ("06-tuketim-gorseli", s6), ("07-indir", s7),
)

if __name__ == "__main__":
    for name, fn in SLIDES:
        data = fn()
        assert "—" not in data and "–" not in data, name
        path = os.path.join(OUT, name + ".svg")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(data)
        print("%s  %.0f KB" % (path, len(data) / 1024))
