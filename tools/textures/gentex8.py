# T9: toast note. Paper 329 burnt sheet for a 9-slice border-image, low sea mist (Atmosphere 142) as white alpha. Run from project root.
from PIL import Image, ImageOps, ImageDraw, ImageFilter, ImageChops
import sys
src = open('tools/textures/gentex6.py').read().split('TL = ')[0]
g = {}; exec(src, g); floor_lum = g['floor_lum']
TL = '/home/hassan/Downloads/Textures'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'img/textures'

im = Image.open(f'{TL}/Texturelabs_Paper_329L.jpg').convert('RGB').resize((640, 464), Image.LANCZOS)
c = im.crop((48, 48, 592, 416)); floor_lum(c, 0.36); im.paste(c, (48, 48))  # text zone only; the burnt rim stays dark
im.save(f'{OUT}/note.webp', quality=78, method=6)


W, H = 560, 240
a = ImageOps.grayscale(Image.open(f'{TL}/Texturelabs_Atmosphere_142L.jpg').crop((0, 1000, 4240, 3121))).resize((W, H), Image.LANCZOS)
a = ImageOps.autocontrast(a, cutoff=1).point(lambda v: round(255 * (v / 255) ** 1.2))  # thin the haze, keep the wisps
fade = Image.new('L', (W, H), 0); ImageDraw.Draw(fade).ellipse((-80, 60, W + 80, H + 140), fill=255)
a = ImageChops.multiply(a, fade.filter(ImageFilter.GaussianBlur(36)))  # bank fades out at the top and sides, no hard box
m = Image.new('RGBA', a.size, (255, 255, 255, 0)); m.putalpha(a); m.save(f'{OUT}/mist.webp', quality=60, method=6)
