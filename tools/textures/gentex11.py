# V9: the landing logo aged a little (Paper 328 fill, sparse fine wear from InkPaint 128 and 315 showing a faded primer)
# and the ghost-ship painting for the easter egg (Louis M. Eilshemius, The Flying Dutchman, 1908, public domain).
# Writes img/logo/aged.webp and img/logo/ghost-ship.webp. Run from project root.
from PIL import Image, ImageOps, ImageFilter, ImageChops
import sys
TL = '/home/hassan/Downloads/Textures'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'img/logo'
logo = Image.open('tools/textures/src/white3.png'); W, H = logo.size; a = logo.split()[3]

def tex(f):                                               # 6 % crop drops the scan's border
    im = Image.open(f'{TL}/{f}').convert('RGB'); w, h = im.size; c = int(min(w, h) * .06)
    return ImageOps.fit(im.crop((c, c, w - c, h - c)), (W, H))

def wear(f, p, blur=0, soft=10):                          # 255 on the brightest p of the scan, soft edge
    g = ImageOps.grayscale(tex(f)).filter(ImageFilter.GaussianBlur(blur))
    hist, s = g.histogram(), 0
    for t, k in enumerate(hist):
        s += k
        if s >= sum(hist) * (1 - p): break
    return g.point(lambda v: 0 if v < t - soft else 255 if v > t else (v - t + soft) * 255 // soft)

m = ImageChops.lighter(wear('Texturelabs_InkPaint_128L.jpg', .025, 3), wear('Texturelabs_InkPaint_315L.jpg', .015)).point(lambda v: v * 4 // 5)
out = Image.composite(Image.new('RGB', (W, H), '#a89880'), tex('Texturelabs_Paper_328L.jpg'), m).convert('RGBA')
out.putalpha(a)
out.save(f'{OUT}/aged.webp', quality=80)                 # 1000 px: 2x its 512 px size at 1280
Image.open(f'{TL}/Louis_Michel_Eilshemius_The_Flying_Dutchman.gif').convert('RGB').save(f'{OUT}/ghost-ship.webp', quality=85)
