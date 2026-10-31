# Mockup recipe for the F11 card table: green baize felt and torn tab bottoms.
# Run from the project root. Writes to bake/; the real script (tools/textures/gentex12.py) writes img/textures/.
# Felt source: ambientCG Fabric 034 (CC0), saved as ~/Downloads/Textures/ambientCG_Fabric034_1K-JPG_Color.jpg (never commit).
from PIL import Image, ImageChops, ImageEnhance, ImageOps
T = '/home/hassan/Downloads/Textures/'

# felt-green.webp 512x512, seamless: grey felt -> autocontrast -> contrast 0.8 -> colorize #0b2a1c..#2f6a4c
g = ImageOps.grayscale(Image.open(T + 'ambientCG_Fabric034_1K-JPG_Color.jpg')).resize((512, 512), Image.LANCZOS)
felt = ImageOps.colorize(ImageEnhance.Contrast(ImageOps.autocontrast(g, cutoff=1)).enhance(0.8), '#0b2a1c', '#2f6a4c')
# faint wear stains: Atmosphere 133 at 256 px, mirrored 2x2 so the tile stays seamless, multiplied at 25 %
src = ImageOps.grayscale(Image.open(T + 'Texturelabs_Atmosphere_133L.jpg')).resize((256, 256))
st = Image.new('L', (512, 512))
for x, y, im in ((0, 0, src), (256, 0, ImageOps.mirror(src)), (0, 256, ImageOps.flip(src)), (256, 256, ImageOps.flip(ImageOps.mirror(src)))):
    st.paste(im, (x, y))
st = st.point(lambda v: int(255 - (255 - v) * 0.25))
ImageChops.multiply(felt, Image.merge('RGB', [st] * 3)).save('bake/felt-green.webp', quality=82)

# tab-bottom1..3.webp 920x80 alpha masks: each wide note's own torn top, flipped and mirrored, becomes its torn bottom
for i in (1, 2, 3):
    a = Image.open('img/textures/tab-note-wide%d.webp' % i).getchannel('A')
    m = Image.new('RGBA', a.size, (0, 0, 0, 0)); m.putalpha(ImageOps.mirror(ImageOps.flip(a)))
    m.save('bake/tab-bottom%d.webp' % i)
