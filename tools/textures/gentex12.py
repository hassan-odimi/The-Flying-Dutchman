# F5: scrollbar textures. Mast (the track, Texturelabs Wood 131) and a rope coil (the thumb, from img/textures/rope.webp).
# F6: worn iron plate, bolt-head Close, anchor icon mask.
# F8: four torn card papers (card-paper1..4).
# F12: four torn row papers (row-paper1..4).
# F11: BnF 1850 card face, pips and tax stamp, green baize felt, torn tab bottoms. Writes img/textures/{mast,coil,plate-worn,bolt,card-paper1..4,mist,seal-red,seal-green}.webp and img/icons/anchor.webp; F11 adds card-face, pip-heart, pip-spade, tax-stamp, felt-green, tab-bottom1..3; F12 adds row-paper1..4. Run from project root. Later F items add their bakes here.
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps
import random, sys
T = '/home/hassan/Downloads/Textures/'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'img/textures'
S, W = 4, 64  # bake at 4x, shown 16 px wide
MAST_K, ROPE_K = 0.75, 1.7  # thumb against track must reach 3:1 (WCAG 1.4.11): a darker mast, a lighter rope

# mast: a vertical strip of Wood 131 with cylinder shading, light at 38 % from the left
wood = Image.open(T + 'Texturelabs_Wood_131M.jpg').convert('RGB').crop((300, 0, 420, 1440)).resize((W, 1440))
wood = ImageEnhance.Brightness(wood).enhance(MAST_K)
shade = Image.new('L', (W, 1), 0)
for x in range(W):
    t = (x + 0.5) / W
    shade.putpixel((x, 0), int(255 * (0.35 + 0.9 * (1 - abs(t - 0.38) * 2.2))) if abs(t - 0.38) < 0.45 else 70)
shade = shade.resize((W, 1440)).filter(ImageFilter.GaussianBlur(3))
ImageChops.multiply(wood, Image.merge('RGB', [shade] * 3)).resize((16, 360)).save(f'{OUT}/mast.webp', quality=82)

# coil: short straight rope pieces, tilted -14 deg, stacked down the pole with a dark shadow under each turn
rope = Image.open('img/textures/rope.webp').convert('RGBA').crop((560, 30, 640, 49))  # nearly straight middle piece
rope = ImageEnhance.Brightness(rope.convert('RGB')).enhance(ROPE_K).convert('RGBA'); rope.putalpha(Image.open('img/textures/rope.webp').convert('RGBA').crop((560, 30, 640, 49)).getchannel('A'))
piece = rope.resize((int(W * 1.25), int(19 * W * 1.25 / 80))).rotate(-14, expand=True, resample=Image.BICUBIC)
step = int(piece.height * 0.42); H = step * 8
coil = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for i in range(-2, 10):
    x, y = (W - piece.width) // 2, i * step
    sh = Image.new('RGBA', piece.size, (0, 0, 0, 255)); sh.putalpha(piece.getchannel('A').point(lambda a: int(a * 0.6)))
    coil.paste(sh, (x, y + 3), sh); coil.paste(piece, (x, y), piece)
cs = Image.new('L', (W, 1), 0)
for x in range(W):
    t = (x + 0.5) / W; cs.putpixel((x, 0), int(255 * min(1, 0.45 + 1.1 * (1 - abs(t - 0.4) * 2))))
rgb = ImageChops.multiply(coil.convert('RGB'), Image.merge('RGB', [cs.resize((W, H))] * 3)); rgb.putalpha(coil.getchannel('A'))
rgb.resize((16, H // S)).save(f'{OUT}/coil.webp', quality=90)  # 16x32, tiles in Y

# ---- F6 ----
lum = lambda c: (lambda v: v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4)(c / 255)
rust = Image.open(T + 'Texturelabs_Metal_132L.jpg').convert('RGB').resize((1060, 707))

# plate-worn 360x96: Metal 155 iron face, rust rim, chipped outline, light top bevel
random.seed(11)
w, h = 360, 96
face = Image.open(T + 'Texturelabs_Metal_155M.jpg').convert('RGB').crop((200, 700, 1400, 1020)).resize((w, h))
face = ImageEnhance.Color(face).enhance(0.45)
face = Image.eval(face, lambda v: int(28 + v * 0.42))  # iron face never brighter than sRGB ~135
r = rust.crop((0, 0, w * 3, h * 3)).resize((w, h))
rim = Image.new('L', (w, h), 255); ImageDraw.Draw(rim).rounded_rectangle((14, 12, w - 14, h - 12), 10, fill=0); rim = rim.filter(ImageFilter.GaussianBlur(9))
p = Image.composite(ImageChops.multiply(r, Image.new('RGB', (w, h), (150, 120, 110))), face, rim)
a = Image.new('L', (w, h), 0); d = ImageDraw.Draw(a)
j = lambda s=1.6: random.uniform(-s, s)
pts = [(x + j(), 2 + abs(j())) for x in range(4, w - 3, 24)] + [(w - 2 - abs(j()), y + j()) for y in range(4, h - 3, 16)] \
    + [(x + j(), h - 2 - abs(j())) for x in range(w - 4, 3, -24)] + [(2 + abs(j()), y + j()) for y in range(h - 4, 3, -16)]
d.polygon(pts, fill=255)
for _ in range(7):  # chip clusters
    side = random.choice('tblr'); t = random.random()
    x, y = {'t': (t * w, 0), 'b': (t * w, h), 'l': (0, t * h), 'r': (w, t * h)}[side]
    for k in range(random.randint(2, 4)):
        rr = random.uniform(2, 6); d.ellipse((x - rr + j(4), y - rr + j(4), x + rr + j(4), y + rr + j(4)), fill=0)
for c in [(0, 0), (w, 0), (0, h), (w, h)]:  # bitten corners
    rr = random.uniform(4, 8); d.ellipse((c[0] - rr, c[1] - rr, c[0] + rr, c[1] + rr), fill=0)
a = a.filter(ImageFilter.GaussianBlur(0.7))
hi = Image.new('L', (w, h), 0); ImageDraw.Draw(hi).rectangle((0, 0, w, 4), fill=55); hi = hi.filter(ImageFilter.GaussianBlur(2))
p = Image.composite(Image.new('RGB', (w, h), (170, 165, 150)), p, hi)
p = ImageEnhance.Brightness(p).enhance(0.92)  # hover is brightness(1.12): white must stay 4.5:1 then (4.62:1)
worst = lambda box: 1.05 / (max(0.2126 * lum(r_) + 0.7152 * lum(g_) + 0.0722 * lum(b_) for (r_, g_, b_) in p.crop(box).getdata()) + 0.05)
print('plate: white worst, text band %.2f, whole face %.2f (hover x1.12 is lower: see tests)' % (worst((24, 22, w - 24, h - 22)), worst((6, 6, w - 6, h - 6))))
p.putalpha(a); p.save(f'{OUT}/plate-worn.webp', quality=88)

# bolt 128x128: Details 141 crop, brightness 0.6, multiplied by the Metal 132 rust, round
b = Image.open(T + 'Texturelabs_Details_141M.png').convert('RGB').crop((512, 121, 1432, 1041)).resize((128, 128))
b = ImageChops.multiply(ImageEnhance.Brightness(b).enhance(0.6), rust.crop((0, 0, 707, 707)).resize((128, 128)))
m = Image.new('L', (512, 512), 0); ImageDraw.Draw(m).ellipse((8, 8, 504, 504), fill=255)
b.putalpha(m.resize((128, 128), Image.LANCZOS)); b.save(f'{OUT}/bolt.webp', quality=88)

# anchor 128x128: alpha mask of the rounded-stock anchor, used with CSS mask
Image.open(T + 'anchor.png').convert('RGBA').resize((128, 128), Image.LANCZOS).save('img/icons/anchor.webp', quality=95)

# ---- F8 ----
# card-paper1..4 400x600: Paper 328 label cards with a different torn edge each, alpha edges (use filter: drop-shadow). Sepia text needs lum >= 0.33 everywhere;
# the bottom band, where the LOW STOCK stamp sits, is brightened to 0.49 so a red stamp reads 4.5:1 (gradient lift keeps the grain, the floor only catches stragglers).
LIM = lambda v: v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
def lum3(c): return 0.2126 * LIM(c[0] / 255) + 0.7152 * LIM(c[1] / 255) + 0.0722 * LIM(c[2] / 255)
def floor_card(img, f0, f1):
    px = img.load(); w, h = img.size
    for y in range(h):
        f = f0 + (f1 - f0) * min(1, max(0, (y / h - 0.68) / 0.12))  # f0 down to 68 % of the height, f1 from 80 %
        for x in range(w):
            c = px[x, y][:3]
            if lum3(c) >= f: continue
            lo, hi = 0.0, 1.0
            for _ in range(9):
                t = (lo + hi) / 2
                if lum3([v + (255 - v) * t for v in c]) < f: lo = t
                else: hi = t
            px[x, y] = tuple(round(v + (255 - v) * hi) for v in c) + px[x, y][3:]
CW, CH, SS, M = 400, 600, 2, 7
p328 = Image.open(T + 'Texturelabs_Paper_328L.jpg').convert('RGB')
def card(n, seed, crop, tears):
    r = random.Random(seed)
    def smooth_(v, k): return [sum(v[max(0, i - k):i + k + 1]) / len(v[max(0, i - k):i + k + 1]) for i in range(len(v))]
    wob = lambda n_, amp, k: smooth_([r.uniform(-amp, amp) for _ in range(n_)], k)
    top, bot, lef, rig = wob(CW, 4, 5), wob(CW, 4, 5), wob(CH, 4, 5), wob(CH, 4, 5)  # hand-cut wobble, px inward (+)
    top = [t + 4 for t in top]; bot = [t + 4 for t in bot]; lef = [t + 4 for t in lef]; rig = [t + 4 for t in rig]
    ragged = lambda n_, amp: smooth_([r.uniform(0, amp) for _ in range(n_)], 1)
    for kind, a in tears:
        if kind == 'top':  # a long tear along the whole top: deep, ragged
            top = [t + 6 + g + 9 * (1 + __import__('math').sin(i / 41.0 + 1)) / 2 for i, (t, g) in enumerate(zip(top, ragged(CW, 12)))]
        if kind == 'side':  # a V-shaped tear into the right edge, ragged both flanks
            cy, w, dp = a
            for y in range(max(0, cy - w), min(CH, cy + w)): rig[y] += dp * (1 - abs(y - cy) / w) + r.uniform(-2.5, 2.5)
    pts = [(x * SS, (M + top[x]) * SS) for x in range(M, CW - M)] + [((CW - M - rig[y]) * SS, y * SS) for y in range(M, CH - M)] \
        + [(x * SS, (CH - M - bot[x]) * SS) for x in reversed(range(M, CW - M))] + [((M + lef[y]) * SS, y * SS) for y in reversed(range(M, CH - M))]
    m = Image.new('L', (CW * SS, CH * SS), 0); d = ImageDraw.Draw(m); d.polygon(pts, fill=255)
    for kind, a in tears:
        if kind == 'corner':  # bottom-right corner torn off along a slant, ragged
            poly = [(CW + 20, CH - 100)] + [(CW - 100 * i / 10 + r.uniform(-5, 5) + 12, CH - 100 + 100 * i / 10 + r.uniform(-5, 5) - 12) for i in range(11)] + [(CW + 20, CH + 20)]
            d.polygon([(x * SS, y * SS) for x, y in poly], fill=0)
        if kind == 'corner':  # a second, small chip out of the top-left
            d.polygon([(x * SS, y * SS) for x, y in [(0, 0), (30, 0), (22, 8), (12, 12), (7, 24), (0, 34)]], fill=0)
    m = m.filter(ImageFilter.GaussianBlur(1.1)).resize((CW, CH), Image.LANCZOS)
    paper = p328.crop(crop).resize((CW, CH), Image.LANCZOS)
    # bottom band: gradient lift so the stamp zone is lighter, grain kept
    lift = Image.linear_gradient('L').resize((CW, CH)).point(lambda v: 0 if v < 150 else min(255, (v - 150) * 255 // 70))
    paper = Image.composite(Image.new('RGB', (CW, CH), (255, 250, 238)), paper, lift.point(lambda v: v * 2 // 5))
    # fibre fringe: the pixels just inside the edge go pale, uneven
    inner = m.filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(1.5))
    fringe = ImageChops.subtract(m, inner).point(lambda v: min(255, v * 2))
    paper = Image.composite(Image.new('RGB', (CW, CH), (236, 226, 204)), paper, fringe.point(lambda v: v * 3 // 5))
    # light stains: soft brown blotches, multiplied
    st = Image.new('L', (CW, CH), 0); sd = ImageDraw.Draw(st)
    for _ in range(4):
        x, y, rr = r.randint(0, CW), r.randint(0, int(CH * 0.65)), r.randint(40, 90); sd.ellipse((x - rr, y - rr, x + rr, y + rr), fill=r.randint(25, 50))
    paper = Image.composite(ImageChops.multiply(paper, Image.new('RGB', (CW, CH), (188, 150, 104))), paper, st.filter(ImageFilter.GaussianBlur(26)))
    if any(k == 'fold' for k, _ in tears):  # worn fold: pale rubbed band, a dark crease, a bright lip, slanting across the lower third
        band = Image.new('L', (CW, CH), 0); ImageDraw.Draw(band).line((0, 392, CW, 360), fill=120, width=26)
        paper = Image.composite(Image.new('RGB', (CW, CH), (240, 230, 208)), paper, band.filter(ImageFilter.GaussianBlur(8)))
        fo = Image.new('L', (CW, CH), 0); ImageDraw.Draw(fo).line((0, 396, CW, 364), fill=150, width=3)
        fl = Image.new('L', (CW, CH), 0); ImageDraw.Draw(fl).line((0, 391, CW, 359), fill=210, width=3)
        paper = Image.composite(Image.new('RGB', (CW, CH), (70, 46, 24)), paper, fo.filter(ImageFilter.GaussianBlur(1.3)))
        paper = Image.composite(Image.new('RGB', (CW, CH), (250, 244, 228)), paper, fl.filter(ImageFilter.GaussianBlur(1.5)))
    img = paper.convert('RGBA'); img.putalpha(m)
    floor_card(img, 0.33, 0.49)
    img.save(f'{OUT}/card-paper{n}.webp', quality=82, method=6)
w, h = p328.size
card(1, 801, (int(w * .10), int(h * .12), int(w * .10) + 1100, int(h * .12) + 1650), [('top', 0)])
card(2, 802, (int(w * .40), int(h * .30), int(w * .40) + 1100, int(h * .30) + 1650), [('corner', 0)])
card(3, 803, (int(w * .15), int(h * .45), int(w * .15) + 1100, int(h * .45) + 1650), [('side', (230, 40, 26))])
card(4, 804, (int(w * .50), int(h * .10), int(w * .50) + 1100, int(h * .10) + 1650), [('fold', None)])

# ---- F9 ----
# mist.webp 1400x300: Atmosphere 142 crop as white with luminance alpha, the last 200 px crossfaded over the first 200 so it tiles in X (feathering is a CSS mask)
MW, MH = 1400, 300
g = ImageOps.grayscale(Image.open(T + 'Texturelabs_Atmosphere_142L.jpg').crop((0, 1300, 4240, 3121))).resize((MW + 200, MH), Image.LANCZOS)
a = g.crop((0, 0, MW, MH)); tail = g.crop((MW, 0, MW + 200, MH))
a.paste(Image.composite(tail, a.crop((0, 0, 200, MH)), ImageOps.mirror(Image.linear_gradient('L').rotate(90, expand=True)).resize((200, MH))), (0, 0))
a = a.point(lambda v: min(255, int(1.5 * 255 * (v / 255) ** 0.9)))
mist = Image.new('RGBA', (MW, MH), (255, 255, 255, 0)); mist.putalpha(a); mist.save(f'{OUT}/mist.webp', quality=70)

# seal-red / seal-green 160x160: Hassan's wax-seal photo cut out by colour (redness), holes filled, imprint sharpened; green is a hue shift
sp = Image.open(T + 'paolo-chiabrando-21VlmPMZEtw-unsplash.jpg').convert('RGB'); sp.thumbnail((1200, 1200)); sp = sp.crop((380, 130, 870, 660))
sr, sg, _ = sp.split()
sm = ImageChops.multiply(ImageChops.subtract(sr, sg).point(lambda v: 255 if v > 70 else 0), sg.point(lambda v: 255 if v < 90 else 0))
sm = sm.filter(ImageFilter.MedianFilter(9)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
sm = sm.filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.MinFilter(15))
fl = sm.copy(); ImageDraw.floodfill(fl, (0, 0), 128); sm = fl.point(lambda v: 0 if v == 128 else 255)
sm = sm.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MaxFilter(9))
bb = sm.getbbox(); sc = sp.crop(bb).convert('RGBA'); sc.putalpha(sm.crop(bb).filter(ImageFilter.GaussianBlur(1.2)))
side = max(sc.size); seal = Image.new('RGBA', (side, side), (0, 0, 0, 0)); seal.paste(sc, ((side - sc.width) // 2, (side - sc.height) // 2))
seal = seal.resize((160, 160), Image.LANCZOS)
rgb = seal.convert('RGB').filter(ImageFilter.UnsharpMask(radius=2, percent=140, threshold=2)); rgb.putalpha(seal.getchannel('A')); rgb.save(f'{OUT}/seal-red.webp', quality=88)
h_, s_, v_ = rgb.convert('HSV').split()
gr = Image.merge('HSV', (h_.point(lambda x: (x + 100) % 256), s_.point(lambda x: int(x * 0.7)), v_.point(lambda x: int(x * 0.85)))).convert('RGB'); gr.putalpha(seal.getchannel('A')); gr.save(f'{OUT}/seal-green.webp', quality=88)

# ---- F10 ----
# icons/about-{anchor,wheel,skull}.webp 96x96: the silhouette filled with dark Metal 155 iron-brass and a 1 px bevel (light top-left edge, dark bottom-right), line detail kept dark.
# Sources: anchor.png, rudder.png (ship's wheel), the skull and crossed swords of img/textures/flag-pirate.webp.
iron_src = ImageOps.autocontrast(ImageOps.grayscale(Image.open(T + 'Texturelabs_Metal_155M.jpg')), cutoff=1)
def about_icon(name, alpha, detail=None, N=384, hi=(132, 98, 44)):
    bb = alpha.getbbox(); alpha = alpha.crop(bb); side = max(alpha.size) + 24
    sq = Image.new('L', (side, side), 0); sq.paste(alpha, ((side - alpha.width) // 2, (side - alpha.height) // 2)); alpha = sq.resize((N, N), Image.LANCZOS)
    face = ImageOps.colorize(iron_src.crop((300, 300, 300 + N, 300 + N)), (26, 17, 7), hi)
    if detail is not None:  # strokes that must stay dark inside the filled shape
        d = Image.new('L', (side, side), 0); d.paste(detail.crop(bb), ((side - (bb[2] - bb[0])) // 2, (side - (bb[3] - bb[1])) // 2)); d = d.resize((N, N), Image.LANCZOS)
        face = Image.composite(Image.new('RGB', (N, N), (22, 14, 6)), face, d.point(lambda v: v * 4 // 5))
    ox = ImageChops.offset(alpha, 4, 4); lit = ImageChops.subtract(alpha, ox)       # edges facing the light (top-left)
    dk = ImageChops.subtract(alpha, ImageChops.offset(alpha, -4, -4))                  # edges facing away (bottom-right)
    face = Image.composite(Image.new('RGB', (N, N), (196, 160, 92)), face, lit.point(lambda v: v * 3 // 4))
    face = Image.composite(Image.new('RGB', (N, N), (10, 6, 2)), face, dk.point(lambda v: v // 2))
    out = face.resize((96, 96), Image.LANCZOS).convert('RGBA'); out.putalpha(alpha.resize((96, 96), Image.LANCZOS)); out.save(f'img/icons/{name}.webp', quality=90)
about_icon('about-anchor', Image.open(T + 'anchor.png').convert('RGBA').getchannel('A'))
ru = Image.open(T + 'rudder.png').convert('RGBA').getchannel('A').point(lambda v: 255 if v > 24 else 0)
ru = ImageOps.expand(ru, 16)  # the handles touch the edge and would wall in the corners
fl = ru.copy(); ImageDraw.floodfill(fl, (0, 0), 128); sil = fl.point(lambda v: 0 if v == 128 else 255)  # outside = 128, everything else is the wheel
about_icon('about-wheel', sil.filter(ImageFilter.MaxFilter(3)), detail=ru, hi=(190, 146, 74))  # lighter face so the spokes read at 24 px
fg = Image.open('img/textures/flag-pirate.webp').convert('RGB').crop((32, 8, 158, 100)).resize((504, 368), Image.LANCZOS)
sk = ImageOps.grayscale(fg).point(lambda v: 255 if v > 120 else 0).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.MaxFilter(3))
about_icon('about-skull', sk)

# ---- F11 ----
# card-face.webp 600x900: the clean lower part of the BnF 1850 Ace of Hearts (public domain, with its faint watermark), mirrored to fill
FT = T + 'French_Portrait_card_deck_-_1850_-_'
def deck(n): return Image.open(FT + n + '.jpg').convert('RGB')
h = deck('Ace_of_Hearts'); dw, dh = h.size
stock = h.crop((int(dw * .06), int(dh * .58), int(dw * .94), int(dh * .97))).resize((600, 450), Image.LANCZOS)
face = Image.new('RGB', (600, 900)); face.paste(stock, (0, 0)); face.paste(ImageOps.flip(stock), (0, 450))
face = ImageChops.lighter(face, Image.new('RGB', face.size, (176, 176, 176)))  # luminance floor 0.43: no speck or crack under the ink goes below it
face.save(f'{OUT}/card-face.webp', quality=82)
# pip-heart / pip-spade 128x128: the engraved pip cut by ink threshold, in the scan's own ink colour
def pip(name, red):
    c = deck(name); w, hh = c.size; c = c.crop((int(w * .3), int(hh * .35), int(w * .7), int(hh * .65)))
    r, g, _ = c.split()
    m = ImageChops.subtract(r, g).point(lambda v: 255 if v > 60 else 0) if red else ImageOps.invert(ImageOps.grayscale(c)).point(lambda v: 255 if v > 120 else 0)
    m = m.filter(ImageFilter.MedianFilter(5)); bb = m.getbbox(); c = c.crop(bb); m = m.crop(bb).filter(ImageFilter.GaussianBlur(1))
    o = c.convert('RGBA'); o.putalpha(m); s = max(o.size); sq = Image.new('RGBA', (s, s), (0, 0, 0, 0)); sq.paste(o, ((s - o.width) // 2, (s - o.height) // 2))
    return sq.resize((128, 128), Image.LANCZOS)
pip('Ace_of_Hearts', True).save(f'{OUT}/pip-heart.webp', quality=90)
pip('Ace_of_Spades', False).save(f'{OUT}/pip-spade.webp', quality=90)
# tax-stamp.webp: the blue "Republique Francaise" stamp of the Ace of Clubs, alpha from blue minus red
c = deck('Ace_of_Clubs'); w, hh = c.size; st = c.crop((int(w * .32), int(hh * .68), int(w * .68), int(hh * .93)))
sr_, _, sb_ = st.split(); sm = ImageChops.subtract(sb_, sr_).point(lambda v: min(255, v * 6)).filter(ImageFilter.GaussianBlur(.6))
o = ImageEnhance.Brightness(st).enhance(.7).convert('RGBA'); o.putalpha(sm.point(lambda v: min(255, v * 3 // 2)))  # darker ink, stronger alpha: the stamp has to show at 35 %
o.resize((220, int(220 * o.height / o.width)), Image.LANCZOS).save(f'{OUT}/tax-stamp.webp', quality=88)

# felt-green.webp 512x512, seamless: Fabric 034 (ambientCG, CC0) grey -> autocontrast -> contrast .8 -> colorize #0b2a1c..#2f6a4c, 25 % Atmosphere 133 wear stains mirrored 2x2
g = ImageOps.grayscale(Image.open(T + 'ambientCG_Fabric034_1K-JPG_Color.jpg')).resize((512, 512), Image.LANCZOS)
felt = ImageOps.colorize(ImageEnhance.Contrast(ImageOps.autocontrast(g, cutoff=1)).enhance(0.8), '#0b2a1c', '#2f6a4c')
src = ImageOps.grayscale(Image.open(T + 'Texturelabs_Atmosphere_133L.jpg')).resize((256, 256))
st = Image.new('L', (512, 512))
for x, y, im in ((0, 0, src), (256, 0, ImageOps.mirror(src)), (0, 256, ImageOps.flip(src)), (256, 256, ImageOps.flip(ImageOps.mirror(src)))):
    st.paste(im, (x, y))
st = st.point(lambda v: int(255 - (255 - v) * 0.25))
ImageChops.multiply(felt, Image.merge('RGB', [st] * 3)).save(f'{OUT}/felt-green.webp', quality=82)
# tab-bottom1..3.webp 920x80 alpha masks: each wide note's own torn top, flipped and mirrored, is its torn bottom
for i in (1, 2, 3):
    a = Image.open('img/textures/tab-note-wide%d.webp' % i).getchannel('A')
    m = Image.new('RGBA', a.size, (0, 0, 0, 0)); m.putalpha(ImageOps.mirror(ImageOps.flip(a)))
    m.save(f'{OUT}/tab-bottom{i}.webp', quality=90)

# ---- F12 ----
# row-paper1..4 1200x200: Paper 328 management rows, a different torn edge each (long top tear, nicked corners, V-tear in the bottom edge, worn fold),
# alpha edges (use filter: drop-shadow). Same floor idea as the cards: sepia text and the red stock number need the paper at lum >= 0.40 everywhere.
import math
RW, RH = 1200, 200
PW, PH = p328.size
def row(n, seed, crop, kind):
    r = random.Random(seed)
    sm = lambda v, k: [sum(v[max(0, i - k):i + k + 1]) / len(v[max(0, i - k):i + k + 1]) for i in range(len(v))]
    wob = lambda n_, amp, k: [4 + t for t in sm([r.uniform(-amp, amp) for _ in range(n_)], k)]
    top, bot, lef, rig = wob(RW, 3, 8), wob(RW, 3, 8), wob(RH, 3, 5), wob(RH, 3, 5)
    if kind == 'top':  # a long tear along the whole top edge: ragged, slowly waving
        top = [t + 3 + g + 6 * (1 + math.sin(i / 53.0 + 1)) / 2 for i, (t, g) in enumerate(zip(top, sm([r.uniform(0, 8) for _ in range(RW)], 1)))]
    if kind == 'notch':  # a V-shaped tear into the bottom edge
        for x in range(680, 840): bot[x] += 18 * (1 - abs(x - 760) / 80) + r.uniform(-2, 2)
    pts = [(x * SS, (M + top[x]) * SS) for x in range(M, RW - M)] + [((RW - M - rig[y]) * SS, y * SS) for y in range(M, RH - M)] \
        + [(x * SS, (RH - M - bot[x]) * SS) for x in reversed(range(M, RW - M))] + [((M + lef[y]) * SS, y * SS) for y in reversed(range(M, RH - M))]
    m = Image.new('L', (RW * SS, RH * SS), 0); d = ImageDraw.Draw(m); d.polygon(pts, fill=255)
    if kind == 'corner':  # bottom-right corner torn off along a slant, a chip out of the top-left
        poly = [(RW + 20, RH - 84)] + [(RW - 84 * i / 10 + r.uniform(-4, 4) + 8, RH - 84 + 84 * i / 10 + r.uniform(-4, 4) - 8) for i in range(11)] + [(RW + 20, RH + 20)]
        d.polygon([(x * SS, y * SS) for x, y in poly], fill=0)
        d.polygon([(x * SS, y * SS) for x, y in [(0, 0), (50, 0), (36, 10), (20, 16), (10, 34), (0, 52)]], fill=0)
    m = m.filter(ImageFilter.GaussianBlur(1.1)).resize((RW, RH), Image.LANCZOS)
    paper = p328.crop(crop).resize((RW, RH), Image.LANCZOS)
    inner = m.filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(1.5))  # fibre fringe: pale, uneven
    paper = Image.composite(Image.new('RGB', (RW, RH), (236, 226, 204)), paper, ImageChops.subtract(m, inner).point(lambda v: min(255, v * 2)).point(lambda v: v * 3 // 5))
    st = Image.new('L', (RW, RH), 0); sd = ImageDraw.Draw(st)
    for _ in range(4): x, y, rr = r.randint(0, RW), r.randint(0, RH), r.randint(40, 90); sd.ellipse((x - rr * 2, y - rr, x + rr * 2, y + rr), fill=r.randint(25, 50))
    paper = Image.composite(ImageChops.multiply(paper, Image.new('RGB', (RW, RH), (188, 150, 104))), paper, st.filter(ImageFilter.GaussianBlur(26)))
    if kind == 'fold':  # worn fold: pale rubbed band, a dark crease, a bright lip, slanting down the middle
        for (x0, x1, fill, wd, bl, col) in ((640, 612, 120, 26, 8, (240, 230, 208)), (644, 616, 150, 3, 1.3, (70, 46, 24)), (639, 611, 210, 3, 1.5, (250, 244, 228))):
            l = Image.new('L', (RW, RH), 0); ImageDraw.Draw(l).line((x0, 0, x1, RH), fill=fill, width=wd)
            paper = Image.composite(Image.new('RGB', (RW, RH), col), paper, l.filter(ImageFilter.GaussianBlur(bl)))
    img = paper.convert('RGBA'); img.putalpha(m)
    floor_card(img, 0.40, 0.40)
    img.save(f'{OUT}/row-paper{n}.webp', quality=82, method=6)
row(1, 901, (int(PW * .08), int(PH * .15), int(PW * .08) + 1800, int(PH * .15) + 300), 'top')
row(2, 902, (int(PW * .20), int(PH * .40), int(PW * .20) + 1800, int(PH * .40) + 300), 'corner')
row(3, 903, (int(PW * .05), int(PH * .65), int(PW * .05) + 1800, int(PH * .65) + 300), 'notch')
row(4, 904, (int(PW * .25), int(PH * .80), int(PW * .25) + 1800, int(PH * .80) + 300), 'fold')
