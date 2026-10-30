# V6: worn, torn cloth flags for the footer flag line, written to img/textures/flag-*.webp. Each 128x80 flag is upscaled, woven (Paper 214 fibre and a
# fine thread grid), hung in soft vertical folds, sun-faded and stained (Wood 131), and torn ragged at the fly
# (bottom and right edge) with loose threads. Run from project root.
from PIL import Image, ImageOps, ImageDraw, ImageFilter, ImageChops, ImageEnhance
import math, random, sys
TL = '/home/hassan/Downloads/Textures'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'img/textures'
W, H = 192, 120                                           # 3x the 64x40 drawn size
fib = ImageOps.autocontrast(ImageOps.grayscale(Image.open(f'{TL}/Texturelabs_Paper_214M.png').convert('RGB').crop((400, 400, 1000, 775))).resize((W, H)), cutoff=2)
stain = ImageOps.grayscale(Image.open(f'{TL}/Texturelabs_Wood_131M.jpg').convert('RGB'))
weave = Image.new('L', (W, H), 255); wd = ImageDraw.Draw(weave)
for x in range(0, W, 3): wd.line((x, 0, x, H), fill=228)
for y in range(0, H, 3): wd.line((0, y, W, y), fill=232)
for n, name in enumerate(('eng', 'sve', 'ita', 'esp', 'pirate')):
    random.seed(20 + n)
    f = Image.open(f'img/{name}.webp').convert('RGB').resize((W, H), Image.LANCZOS)
    f = ImageEnhance.Color(f).enhance(0.7)                # sun-faded dye
    f = Image.blend(f, Image.new('RGB', (W, H), (214, 196, 160)), 0.14)
    ph, k = random.uniform(0, 6), random.uniform(2.2, 3.2)
    fold = Image.new('L', (W, H)); fp = fold.load()       # soft vertical folds, deeper toward the fly
    for x in range(W):
        v = math.sin(ph + x / W * k * math.pi * 2) * 0.5 + 0.5
        for y in range(H): fp[x, y] = int(255 * (0.78 + 0.3 * v * (0.4 + 0.6 * y / H)))
    sx, sy = random.randint(0, 1700), random.randint(0, 1300)
    st = ImageOps.autocontrast(stain.crop((sx, sy, sx + 160, sy + 100)).resize((W, H)).filter(ImageFilter.GaussianBlur(4)))
    st = st.point(lambda v: int(255 - (255 - v) * 0.28))   # light grime only
    tex = ImageChops.multiply(ImageChops.multiply(fib.point(lambda v: int(205 + v * 0.2)), weave), ImageChops.multiply(fold, st))
    f = ImageChops.multiply(f, Image.merge('RGB', (tex,) * 3))
    f = ImageChops.add(f, Image.merge('RGB', (fold.point(lambda v: max(0, v - 255 + 30)),) * 3))  # fold crests catch light
    # torn fly: ragged bottom and right edge, one or two deeper rips, small holes
    a = Image.new('L', (W, H), 0); ad = ImageDraw.Draw(a)
    pts = [(0, 0), (W, 0)]
    y = 0
    while y < H: pts.append((W - 3 - 2.5 * math.sin(y / 7 + ph) - random.uniform(0, 2) - (random.uniform(8, 14) if random.random() < 0.06 else 0), y)); y += random.uniform(2, 4)
    x = W
    while x > 0:
        d = 3 + 2.5 * math.sin(x / 9 + ph) + random.uniform(-1.5, 1.5)   # wavy fray, not spikes
        if random.random() < 0.035: pts += [(x - 2, H - random.uniform(12, 20)), (x - 5, H - random.uniform(3, 5))]; x -= 5
        pts.append((x, H - d)); x -= random.uniform(2, 4)
    pts.append((0, H - random.uniform(1, 5)))
    ad.polygon(pts, fill=255)
    for _ in range(random.randint(1, 3)):
        hx, hy, r = random.uniform(20, W - 20), random.uniform(H * 0.45, H - 14), random.uniform(1.5, 3.5)
        ad.ellipse((hx - r, hy - r * 0.7, hx + r, hy + r * 0.7), fill=0) if random.random() < 0.6 else None
    a = a.filter(ImageFilter.GaussianBlur(0.5))
    out = f.convert('RGBA'); out.putalpha(a); od = ImageDraw.Draw(out)
    for _ in range(8):                                   # loose threads at the fly
        if random.random() < 0.5: x0, y0 = random.uniform(6, W - 10), H - random.uniform(4, 8); x1, y1 = x0 + random.uniform(-3, 3), y0 + random.uniform(4, 9)
        else: x0, y0 = W - random.uniform(5, 9), random.uniform(6, H - 8); x1, y1 = x0 + random.uniform(4, 8), y0 + random.uniform(-2, 3)
        od.line((x0, y0, x1, y1), fill=(*f.getpixel((int(min(x0, W - 1)), int(min(y0, H - 1)))), 200), width=1)
    out.save(f'{OUT}/flag-{name}.webp', quality=82, method=6)
