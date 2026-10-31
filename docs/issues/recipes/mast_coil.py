# Mockup recipe for the F5 scrollbar: a weathered mast (track) and a rope coil (thumb).
# Run from the project root. Writes to bake/; the real script (tools/textures/gentex12.py) writes img/textures/.
from PIL import Image, ImageChops, ImageEnhance, ImageFilter
T = '/home/hassan/Downloads/Textures/'
S, W = 4, 64  # bake at 4x, shown 16 px wide

# mast: a vertical strip of Wood 131 with cylinder shading, light at 38 % from the left
wood = Image.open(T + 'Texturelabs_Wood_131M.jpg').convert('RGB').crop((300, 0, 420, 1440)).resize((W, 1440))
wood = ImageEnhance.Brightness(wood).enhance(1.1)
shade = Image.new('L', (W, 1), 0)
for x in range(W):
    t = (x + 0.5) / W
    shade.putpixel((x, 0), int(255 * (0.35 + 0.9 * (1 - abs(t - 0.38) * 2.2))) if abs(t - 0.38) < 0.45 else 70)
shade = shade.resize((W, 1440)).filter(ImageFilter.GaussianBlur(3))
ImageChops.multiply(wood, Image.merge('RGB', [shade] * 3)).resize((16, 360)).save('bake/mast.webp')

# coil: short straight rope pieces, tilted -14 deg, stacked down the pole with a dark shadow under each turn
rope = Image.open('img/textures/rope.webp').convert('RGBA').crop((560, 30, 640, 49))  # nearly straight middle piece
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
rgb.resize((16, H // S)).save('bake/coil.webp')  # 16x32, tiles in Y
