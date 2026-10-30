# T1: rust specks for the small buttons (Texturelabs Metal 132 in colour).
# T2: paper sheet for the phone category menu (Texturelabs Paper 328).
# T4: iron corner brackets for the login box border-image (Texturelabs Metal 155, rivets from rivet.webp). Run from project root.
from PIL import Image, ImageOps, ImageDraw

def lum(c):
    c = [v / 255 for v in c]; c = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

def floor_lum(img, floor):
    """same idea as gentex4.floor_lum (which loads Paper 215 on import): lighten only pixels too dark for sepia"""
    px = img.load()
    for x in range(img.width):
        for y in range(img.height):
            c = px[x, y]
            if lum(c) >= floor: continue
            lo, hi = 0.0, 1.0
            for _ in range(10):
                t = (lo + hi) / 2
                lo, hi = (t, hi) if lum([v + (255 - v) * t for v in c]) < floor else (lo, t)
            px[x, y] = tuple(round(v + (255 - v) * hi) for v in c)
TL = '/home/hassan/Downloads/Textures'
im = Image.open(f'{TL}/Texturelabs_Metal_132L.jpg').convert('RGB'); w, h = im.size
c = im.crop((int(w * 0.25), int(h * 0.62), int(w * 0.25) + 1200, int(h * 0.62) + 600)).resize((400, 200), Image.LANCZOS)
c = ImageOps.autocontrast(c, cutoff=(0, 2))  # clean paint goes white, so multiply leaves only the rust specks
Image.blend(Image.new('RGB', c.size, 'white'), c, 0.7).save('img/textures/rust.webp', quality=82)  # 70 % strength

im = Image.open(f'{TL}/Texturelabs_Paper_328L.jpg').convert('RGB'); w, h = im.size
c = im.crop((int(w * 0.1), int(h * 0.15), int(w * 0.1) + 1100, int(h * 0.15) + 1800)).resize((440, 720), Image.LANCZOS)
floor_lum(c, 0.33)  # the whole sheet is label zone; margin over 0.31 for lossy encoding
c.save('img/textures/paper-list.webp', quality=78, method=6)

# T4 iron corners: 200 px at 2x, sliced 80 / 40px, so each bracket is 40 px long and 11 px thick on screen
N, A, t = 200, 80, 22   # 2x: corner arm 40 px, bracket 11 px
iron = Image.open(f'{TL}/Texturelabs_Metal_155M.jpg').convert('RGB').resize((N, N))
iron = ImageOps.colorize(ImageOps.autocontrast(ImageOps.grayscale(iron), cutoff=1), (28, 32, 31), (150, 160, 156))  # grey iron toned like the Close plate
m = Image.new('L', (N, N), 0); d = ImageDraw.Draw(m)
for x0, x1 in ((0, A), (N - A, N)):
    for y0, y1 in ((0, t), (N - t, N)): d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=255)
for x0, x1 in ((0, t), (N - t, N)):
    for y0, y1 in ((0, A), (N - A, N)): d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=255)
out = Image.new('RGBA', (N, N), (0, 0, 0, 0)); out.paste(iron, (0, 0), m)
edge = Image.new('L', (N, N), 0); de = ImageDraw.Draw(edge)   # dark inner edge so the bracket reads as a raised plate
for x0, x1 in ((0, A), (N - A, N)):
    de.line((x0, t - 1, x1 - 1, t - 1), fill=200, width=2); de.line((x0, N - t, x1 - 1, N - t), fill=200, width=2)
for y0, y1 in ((0, A), (N - A, N)):
    de.line((t - 1, y0, t - 1, y1 - 1), fill=200, width=2); de.line((N - t, y0, N - t, y1 - 1), fill=200, width=2)
out.alpha_composite(Image.merge('RGBA', [Image.new('L', (N, N), 12)] * 3 + [Image.composite(edge, Image.new('L', (N, N), 0), m)]))
r = 16; riv = Image.open('img/textures/rivet.webp').convert('RGBA').resize((r, r)); o = (t - r) // 2
for x in (o, A - r - 4, N - A + 4, N - r - o):
    for y in (o, N - r - o): out.alpha_composite(riv, (x, y))
for y in (A - r - 4, N - A + 4):
    for x in (o, N - r - o): out.alpha_composite(riv, (x, y))
out.save('img/textures/iron-frame.webp', quality=86, method=6)
