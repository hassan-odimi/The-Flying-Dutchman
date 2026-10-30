# V4 round 7: real torn edge from kraft 215 (fibre fringe kept), applied at the tab's own scale. Run from project root.
import random, sys, math
from PIL import Image, ImageOps, ImageChops, ImageFilter, ImageDraw
TL, OUT = '/home/hassan/Downloads/Textures', 'img/textures'
K = Image.open(f'{TL}/Texturelabs_Paper_215L.png').convert('RGBA')
KA, KL = K.split()[3].load(), ImageOps.grayscale(K.convert('RGB')).load()

# Bottom tear of the kraft strip, x 200..1700: per-column edge y, detrended, plus the light fibre fringe above it
X0, X1 = 200, 1700
prof = []
for x in range(X0, X1):
    y = 900
    while y > 700 and KA[x, y] < 128: y -= 1
    prof.append(y)
n = len(prof); mx = sum(range(n)) / n; my = sum(prof) / n
slope = sum((i - mx) * (p - my) for i, p in enumerate(prof)) / sum((i - mx) ** 2 for i in range(n))
prof = [p - slope * (i - mx) for i, p in enumerate(prof)]

def smooth(v, r):
    out = []
    for i in range(len(v)):
        w = v[max(0, i - r):i + r + 1]; out.append(sum(w) / len(w))
    return out

def lum(c):
    return sum(w * ((v / 255) / 12.92 if v <= 10 else ((v / 255 + 0.055) / 1.055) ** 2.4) for v, w in zip(c, (0.2126, 0.7152, 0.0722)))

def floor_lum(img, box, floor=0.27):
    """lighten only the pixels under the label that are too dark for sepia text (0.27 keeps #2a1709 above 5:1)"""
    px = img.load(); x0, y0, x1, y1 = box
    for x in range(x0, x1):
        for y in range(y0, y1):
            c = px[x, y][:3]
            if lum(c) >= floor: continue
            lo, hi = 0.0, 1.0
            for _ in range(10):
                t = (lo + hi) / 2
                if lum([v + (255 - v) * t for v in c]) < floor: lo = t
                else: hi = t
            px[x, y] = tuple(round(v + (255 - v) * hi) for v in c) + px[x, y][3:]

def note(name, src, box, W, H, seed, depth=20, nb=1, zone=True):
    rnd = random.Random(seed)
    paper = Image.open(f'{TL}/{src}').convert('RGB').crop(box).resize((W, H), Image.LANCZOS)
    scale = 1.6 if W < 500 else 1.2
    off = rnd.randint(0, max(0, n - int(W * scale) - 1))
    seg = [prof[off + int(x * scale)] for x in range(W)]
    # high-pass the real tear so a long tab keeps its jaggedness, then add fibre jitter and one or two bites
    hp = [a - b for a, b in zip(seg, smooth(seg, W // 4))]
    lo, hi = min(hp), max(hp)
    top = [(h - lo) / max(1, hi - lo) * depth * 0.75 + 3 for h in hp]
    for _ in range(nb):
        cx, w, d = rnd.randint(W // 6, W - W // 6), rnd.randint(14, 34), rnd.randint(8, 14)
        for x in range(max(0, cx - w), min(W, cx + w)):
            k = 1 - abs(x - cx) / w; top[x] += d * k ** 0.6 + rnd.uniform(-1.5, 1.5)
    top = [t + rnd.uniform(-0.8, 0.8) for t in top]
    fw = smooth([rnd.uniform(1, 7) for _ in range(W)], 6)  # fringe width varies along the tear
    al = Image.new('L', (W, H), 0); fr = Image.new('L', (W, H), 0); ap, fp = al.load(), fr.load()
    for x in range(W):
        t = top[x]
        for y in range(H):
            if y >= t: ap[x, y] = 255
            elif y >= t - 1.5 and rnd.random() < 0.45: ap[x, y] = 150  # loose fibres
            if t - 1.5 <= y < t + fw[x]: fp[x, y] = int(200 * (1 - max(0, y - t) / (fw[x] + 1)) ** 0.5)
    al = al.filter(ImageFilter.GaussianBlur(0.45)); fr = fr.filter(ImageFilter.GaussianBlur(0.6))
    # soiling: grime gathers a few px under the tear and toward the sides, fading before the label
    soil = Image.new('L', (W, H), 0); sp = soil.load()
    for x in range(W):
        for y in range(H):
            dy = y - top[x]
            sp[x, y] = int(max(0, 1 - max(0, dy - fw[x]) / (H * 0.3)) * 95 + max(0, 1 - min(x, W - x) / (W * 0.1)) * 70)
    soil = soil.filter(ImageFilter.GaussianBlur(3))
    paper = Image.composite(Image.new('RGB', (W, H), (92, 56, 24)), paper, soil)
    paper = Image.composite(Image.new('RGB', (W, H), (236, 226, 204)), paper, fr)
    img = paper.convert('RGBA'); img.putalpha(al)
    if zone: floor_lum(img, (int(W * 0.05), int(H * 0.2), int(W * 0.95), H))
    if name: img.save(f'{OUT}/{name}.webp', quality=84, method=6)
    return img

def forged_nail(out, cx, cy, seed, r=9):
    """hand-forged nail head cut from the iron scan: rust bleed into the paper, cast shadow, domed shading, hammer facets"""
    rnd = random.Random(seed); SS = 4; R = r * SS; box = R * 7
    W, H = out.size
    # rust bleed: irregular blotch plus one short run downwards, multiplied into the paper
    bleed = Image.new('L', (box, box * 2), 0); d = ImageDraw.Draw(bleed)
    for _ in range(14):
        a, b = rnd.uniform(-1.3, 1.3) * R, rnd.uniform(-1.1, 1.4) * R; rr = rnd.uniform(0.4, 0.9) * R
        d.ellipse((box / 2 + a - rr, box / 2 + b - rr, box / 2 + a + rr, box / 2 + b + rr), fill=rnd.randint(90, 170))
    d.polygon([(box / 2 - R * 0.35, box / 2), (box / 2 + R * 0.3, box / 2), (box / 2 + R * 0.1, box / 2 + R * 3.2), (box / 2 - R * 0.15, box / 2 + R * 3.4)], fill=70)
    bleed = bleed.filter(ImageFilter.GaussianBlur(R * 0.35)).resize((box // SS, box * 2 // SS), Image.LANCZOS)
    rust = Image.new('RGB', bleed.size, (128, 66, 28))
    ox, oy = cx - bleed.width // 2, cy - bleed.width // 2
    region = out.crop((ox, oy, ox + bleed.width, oy + bleed.height))
    mixed = Image.composite(ImageChops.multiply(region.convert('RGB'), rust.point(lambda v: min(255, v + 40))), region.convert('RGB'), bleed)
    mixed = mixed.convert('RGBA'); mixed.putalpha(region.split()[3]); out.paste(mixed, (ox, oy))
    # head: iron scan, irregular hammered outline, dome light from top-left
    S2 = R * 2 + 8; iron = Image.open(f'{TL}/Texturelabs_Metal_155M.jpg').convert('L').crop((300, 300, 300 + S2, 300 + S2))
    iron = ImageOps.autocontrast(iron).point(lambda v: 70 + v * 110 // 255)
    shade = Image.new('L', (S2, S2), 0); sp = shade.load()
    for x in range(S2):
        for y in range(S2):
            dx, dy = (x - S2 / 2) / R, (y - S2 / 2) / R
            sp[x, y] = int(max(0, min(255, 128 + (-dx - dy) * 85 - (dx * dx + dy * dy) * 30)))
    head = ImageChops.add(ImageChops.multiply(iron, shade.point(lambda v: v * 2 if v < 128 else 255)), shade.point(lambda v: max(0, v - 150) * 2))
    m = Image.new('L', (S2, S2), 0); md = ImageDraw.Draw(m)
    pts = []
    for k in range(9):  # hammered: nine flat facets, slightly uneven radius
        t = k / 9 * 2 * math.pi + rnd.uniform(-0.15, 0.15); rr = R * rnd.uniform(0.9, 1.05)
        pts.append((S2 / 2 + rr * math.cos(t), S2 / 2 + rr * math.sin(t)))
    md.polygon(pts, fill=255); m = m.filter(ImageFilter.GaussianBlur(1.2))
    rim = ImageChops.subtract(m, m.filter(ImageFilter.MinFilter(5)))
    headc = Image.merge('RGB', [head.point(lambda v: min(255, v + 8)), head, head.point(lambda v: max(0, v - 8))])
    headc = Image.composite(Image.new('RGB', (S2, S2), (18, 14, 12)), headc, rim)
    shadow = Image.new('RGBA', (S2 + 16, S2 + 16), (0, 0, 0, 0)); sh = m.point(lambda v: v * 150 // 255)
    shadow.paste(Image.new('RGBA', (S2, S2), (20, 10, 5, 255)), (6, 10), sh)
    shadow = shadow.filter(ImageFilter.GaussianBlur(5)).resize(((S2 + 16) // SS, (S2 + 16) // SS), Image.LANCZOS)
    out.alpha_composite(shadow, (cx - S2 // (2 * SS), cy - S2 // (2 * SS)))
    hd = headc.convert('RGBA'); hd.putalpha(m); hd = hd.resize((S2 // SS, S2 // SS), Image.LANCZOS)
    out.alpha_composite(hd, (cx - hd.width // 2, cy - hd.height // 2))

def slip(name, src, xy, seed, nail=True):
    """bookmark 60x170 at 2x: torn bottom (flipped tear), lightly torn sides, an iron tack at the top"""
    W, H = 120, 340; x, y = xy
    img = note(None, src, (x, y, x + 360, y + 1020), W, H, seed, depth=26, zone=False).transpose(Image.FLIP_TOP_BOTTOM)
    side = note(None, src, (x, y, x + 1020, y + 360), H, W, seed + 3, depth=8, nb=0, zone=False).rotate(90, expand=True)
    side2 = note(None, src, (x, y, x + 1020, y + 360), H, W, seed + 4, depth=8, nb=0, zone=False).rotate(-90, expand=True)
    a = ImageChops.multiply(ImageChops.multiply(img.split()[3], side.split()[3]), side2.split()[3])
    rgb = Image.composite(side.convert('RGB'), img.convert('RGB'), ImageChops.invert(side.split()[3]).point(lambda v: 0))
    out = rgb.convert('RGBA'); out.putalpha(a)
    floor_lum(out, (int(W * 0.06), 44, int(W * 0.94), H - 20))
    if nail: forged_nail(out, W // 2, 20, seed)
    out.save(f'{OUT}/{name}.webp', quality=84, method=6)

if __name__ == '__main__' and sys.argv[1:] == ['slips']:
    for i, xy in enumerate([(600, 400), (2600, 1200)]):
        slip(f'slip-a{i+1}', 'Texturelabs_Paper_328L.jpg', xy, 1020 + i)
        slip(f'slip-n{i+1}', 'Texturelabs_Paper_328L.jpg', xy, 1020 + i, nail=False)
elif __name__ == '__main__':
    papers = {'a': ('Texturelabs_Paper_328L.jpg', [(300, 600), (1500, 1700), (200, 2300)]),
              'c': ('Texturelabs_Paper_121L.jpg', [(300, 500), (1500, 1500), (400, 2400)]),
              'd': ('Texturelabs_Paper_320L.jpg', [(400, 900), (1600, 1500), (2400, 400)]),
              'e': ('Texturelabs_Paper_327L.jpg', [(300, 700), (1500, 1600), (2300, 2200)])}
    for tag, (f, origins) in papers.items():
        for i, (x, y) in enumerate(origins):
            note(f't-{tag}{i+1}', f, (x, y, x + 1020, y + 240), 340, 80, ord(tag) * 10 + i)          # customer tab, 2x of 170x40
            note(f'tw-{tag}{i+1}', f, (x, y, x + 2760, y + 240), 920, 80, ord(tag) * 10 + i + 5, nb=2)  # bartender wide tab
