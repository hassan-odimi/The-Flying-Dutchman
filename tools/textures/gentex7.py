# T8: bartender docket. Paper 320 sheet, iron tack (Details 141), stamp wear mask (InkPaint 128), torn edge for paid slips. Run from project root.
from PIL import Image, ImageOps
import sys
src = open('tools/textures/gentex6.py').read().split('TL = ')[0]
g = {}; exec(src, g); floor_lum = g['floor_lum']
TL = '/home/hassan/Downloads/Textures'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'img/textures'

im = Image.open(f'{TL}/Texturelabs_Paper_320L.jpg').convert('RGB'); w, h = im.size
c = im.crop((int(w * 0.08), 0, int(w * 0.08) + 1500, h)).resize((480, round(480 * h / 1500)), Image.LANCZOS)  # portrait slip, burnt foot kept
floor_lum(c, 0.36)  # sepia 5.5:1 or better before lossy encoding
c.save(f'{OUT}/docket.webp', quality=78, method=6)

t = Image.open(f'{TL}/Texturelabs_Details_141M.png').convert('RGBA'); t = t.crop(t.getbbox())
t.resize((48, 48), Image.LANCZOS).save(f'{OUT}/tack.webp', quality=85)

ink = ImageOps.grayscale(Image.open(f'{TL}/Texturelabs_InkPaint_128L.jpg')); w, h = ink.size
ink = ImageOps.autocontrast(ink.crop((0, 0, 1600, 800)).resize((240, 120), Image.LANCZOS))
a = ink.point(lambda v: 255 - round(v * 0.1))  # light ink wear: 90 % to 100 % opaque, so the stamp keeps 5:1
m = Image.new('RGBA', a.size, (0, 0, 0, 0)); m.putalpha(a); m.save(f'{OUT}/stamp-wear.webp', quality=70)

# Torn right edge for paid slips: a jagged alpha strip, tiled down the edge
import random
from PIL import ImageDraw, ImageFilter
random.seed(7)
e = Image.new('L', (24, 240), 0); d = ImageDraw.Draw(e); pts = [(0, 0)]
for y in range(0, 241, 6): pts.append((random.randint(8, 22), y))
pts += [(0, 240)]; d.polygon(pts, fill=255)
m = Image.new('RGBA', e.size, (0, 0, 0, 0)); m.putalpha(e.filter(ImageFilter.GaussianBlur(0.6))); m.save(f'{OUT}/torn-edge.webp', quality=85)

