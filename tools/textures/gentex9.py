# V6: hemp cord and nail heads for the footer flag line, and a hand-struck gold cob coin for the customer credit label.
# Coin: the Details 141 metal disc, toned to gold, cut to an uneven cob edge, a worn Jerusalem cross struck in. Run from project root.
from PIL import Image, ImageOps, ImageDraw, ImageFilter, ImageChops, ImageEnhance
import math, random, sys
TL = '/home/hassan/Downloads/Textures'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'img/textures'
random.seed(9)

# rope, 2x: 1200x80 shown at 600x40, stretched to the flag line. A strip of real hemp (Thomas Kinto, Unsplash),
# keyed off its black ground, shrunk to cord thickness, tiled with crossfaded seams and bent into the sag.
W, H, TH = 1200, 80, 18
yc = lambda x: 8 + 128 * (x / W) * (1 - x / W)            # sag: ends at 8, middle at 40
src = Image.open(f'{TL}/thomas-kinto-cEWREu21dmU-unsplash.jpg').convert('RGB').rotate(15, resample=Image.BICUBIC, center=(3000, 1285))
band = src.crop((600, 250, 5400, 2050))
L = round(band.width * TH / band.height)
strip = band.resize((L, TH), Image.LANCZOS).convert('RGBA')
lum = ImageOps.grayscale(band.filter(ImageFilter.GaussianBlur(25))).resize((L, TH), Image.LANCZOS).load()
am = Image.new('L', (L, TH)); ap = am.load()                # solid between the rope's lit edges, so the shaded underside stays
for x in range(L):
    rows = [y for y in range(TH) if lum[x, y] > 22] or [TH // 2]
    for y in range(rows[0], rows[-1] + 1): ap[x, y] = 255
strip.putalpha(am.filter(ImageFilter.GaussianBlur(0.6)))
strip = ImageEnhance.Brightness(strip).enhance(0.8)        # weathered, a step darker than the studio shot
X = 8                                                     # crossfade the seam
tile = strip.crop((0, 0, L - X, TH)); fade = strip.crop((L - X, 0, L, TH))
m = Image.linear_gradient('L').rotate(90).resize((X, TH))
tile.paste(Image.composite(tile.crop((0, 0, X, TH)), fade, m), (0, 0))
long = Image.new('RGBA', (W + tile.width, TH))
for x in range(0, W + tile.width, tile.width): long.paste(tile, (x, 0))
rope = Image.new('RGBA', (W, H))
for x in range(W): rope.paste(long.crop((x, 0, x + 1, TH)), (x, round(yc(x) - TH / 2)))
rope.save(f'{OUT}/rope.webp', quality=85, method=6)

# coin, 2x: 72x72 shown at 36x36
random.seed(5)
S = 72
disc = Image.open(f'{TL}/Texturelabs_Details_141M.png').convert('RGBA').crop((470, 170, 1430, 1130)).resize((S, S), Image.LANCZOS)
lum = ImageOps.autocontrast(ImageOps.grayscale(disc), cutoff=1)
cross = Image.new('L', (S, S)); cd = ImageDraw.Draw(cross); m = S // 2
for a, b in (((m, 18), (m, 54)), ((18, m), (54, m))): cd.line((*a, *b), fill=255, width=7)
for x0, y0, x1, y1 in ((m - 8, 18, m + 8, 18), (m - 8, 54, m + 8, 54), (18, m - 8, 18, m + 8), (54, m - 8, 54, m + 8)): cd.line((x0, y0, x1, y1), fill=255, width=5)
cd.ellipse((10, 10, S - 10, S - 10), outline=255, width=3)                 # struck rim
cross = ImageChops.multiply(cross, ImageOps.autocontrast(lum).point(lambda v: 255 if v > 60 else 140))  # worn where the disc is pitted
cross = cross.filter(ImageFilter.GaussianBlur(1))
hi, sh = ImageChops.offset(cross, -1, -1), ImageChops.offset(cross, 1, 1)
lum = ImageChops.subtract(ImageChops.add(lum, hi.point(lambda v: v * 0.7)), sh.point(lambda v: v * 0.8))
gold = ImageOps.colorize(lum, black=(58, 38, 10), mid=(176, 132, 52), white=(246, 222, 150), midpoint=110)
cob = Image.new('L', (S, S)); pts = []
for k in range(26):
    a = 2 * math.pi * k / 26; r = S / 2 - 2 - random.uniform(0, 4)
    pts.append((S / 2 + r * math.cos(a), S / 2 + r * math.sin(a)))
ImageDraw.Draw(cob).polygon(pts, fill=255)
coin = gold.convert('RGBA'); coin.putalpha(ImageChops.multiply(cob.filter(ImageFilter.GaussianBlur(0.6)), disc.getchannel('A')))
coin.save(f'{OUT}/coin.webp', quality=85, method=6)

# rope end: a rusty nail head (Ian Talmacs, Unsplash), domed with a light from the top left. 2x 48x48, shown 24x24
N = 48
nh = Image.open(f'{TL}/ian-talmacs-U_Ytvt1eTfM-unsplash.jpg').convert('RGB').crop((446, 1544, 886, 1984)).resize((N, N), Image.LANCZOS)
dome = Image.radial_gradient('L').resize((N * 2, N * 2)).crop((N // 2 - 8, N // 2 - 8, N // 2 - 8 + N, N // 2 - 8 + N))
dome = dome.point(lambda v: int(255 - v * 0.75))         # bright toward the top left, dark at the far rim
nh = ImageChops.multiply(nh, Image.merge('RGB', (dome,) * 3)).convert('RGBA')
cm = Image.new('L', (N, N)); ImageDraw.Draw(cm).ellipse((3, 3, N - 4, N - 4), fill=255)
nh.putalpha(cm.filter(ImageFilter.GaussianBlur(0.8)))
out = Image.new('RGBA', (N, N)); sh = Image.new('RGBA', (N, N)); ImageDraw.Draw(sh).ellipse((5, 7, N - 2, N - 1), fill=(0, 0, 0, 150))
out.alpha_composite(sh.filter(ImageFilter.GaussianBlur(2))); out.alpha_composite(nh)
out.save(f'{OUT}/nail.webp', quality=85, method=6)
