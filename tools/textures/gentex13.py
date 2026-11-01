# Drink-list board rust (Version 2.0 fix): one 1024 x 1024 seamless tile of random rust specks, so no repeat shows.
# Round feathered patches of Texturelabs Metal 132 (speckled left part of the scan, big clouds flattened out, no scratches)
# are scattered at random with random flips and quarter turns, wrapping round the tile edges; the darkest pixel wins.
# Run from the project root; rust.webp is not touched.
import random
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps, ImageStat
random.seed(13)
N, P, COUNT, GAIN = 1024, 240, 45, 2.5   # tile size, patch size, patches, speck contrast; tuned so the share of dark pixels matches rust.webp
src = Image.open('/home/hassan/Downloads/Textures/Texturelabs_Metal_132L.jpg').convert('RGB')
w, h = src.size
sr = src.crop((0, int(h * .55), int(w * .55), int(h * .90))).resize((int(w * .55) // 3, int(h * .35) // 3), Image.LANCZOS)  # 1/3 scale, as rust.webp
sr = ImageOps.autocontrast(sr, cutoff=(0, 2))                    # clean paint goes white, so multiply leaves only the specks
low = sr.filter(ImageFilter.GaussianBlur(25))                    # flatten: keep the specks, lose the big dark clouds, clean paint ends near white
sr = Image.merge('RGB', [ImageChops.subtract(a, b, 1, 250) for a, b in zip(sr.split(), low.split())])
sr = sr.point(lambda v: max(0, 255 - int((255 - v) * GAIN)))
m = Image.new('L', (P, P), 0)
ImageDraw.Draw(m).ellipse((P * .2, P * .2, P * .8, P * .8), fill=255)
m = m.filter(ImageFilter.GaussianBlur(P * .1))
tile = Image.new('RGB', (N, N), 'white')
for _ in range(COUNT):
    x, y = random.randrange(sr.width - P), random.randrange(sr.height - P)
    p = sr.crop((x, y, x + P, y + P)).rotate(90 * random.randrange(4))
    if random.random() < .5: p = ImageOps.mirror(p)
    px, py = random.randrange(N), random.randrange(N)
    faded = Image.composite(p, Image.new('RGB', (P, P), 'white'), m)  # fades to white at the rim
    for dx in (-N, 0):
        for dy in (-N, 0):
            box = (px + dx, py + dy, px + dx + P, py + dy + P)
            tile.paste(ImageChops.darker(tile.crop(box), faded), box[:2])
tile.save('img/textures/board-rust.webp', quality=82)
print(ImageStat.Stat(tile.convert('L')).mean)
