# Mockup recipe for the seamless drink-list board. Run from project root. Writes docs/visual-options/bg/*.webp
from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps, ImageStat
O = 'docs/visual-options/bg/'; T = 'img/textures/'

def seamless(im):
    """fix one axis at a time: cross-fade with a half-rolled copy, weight 0 on that axis' tile edges and 1 on the rolled copy's own seam"""
    w, h = im.size
    def ramp(n):
        r = Image.new('L', (n, 1))
        r.putdata([int(255 * (lambda t: t * t * (3 - 2 * t))(1 - abs(2 * (i + .5) / n - 1))) for i in range(n)])
        return r
    mx = ramp(w).resize((w, h)); my = ramp(h).resize((h, w)).transpose(Image.TRANSPOSE).resize((w, h))
    im = Image.composite(im, ImageChops.offset(im, w // 2, 0), mx)
    return Image.composite(im, ImageChops.offset(im, 0, h // 2), my)

def flatten(im, r=40):
    """remove the slow light-to-dark drift (it shows as a band at every tile repeat); keeps the mean and the speckle"""
    w, h = im.size; big = Image.new('RGB', (3 * w, 3 * h))
    for i in range(3):
        for j in range(3): big.paste(im, (i * w, j * h))
    low = big.filter(ImageFilter.GaussianBlur(r)).crop((w, h, 2 * w, 2 * h))
    mean = [round(v) for v in ImageStat.Stat(im).mean]
    return Image.merge('RGB', [ImageChops.subtract(a, b, 1, m) for a, b, m in zip(im.split(), low.split(), mean)])

def seam(im):  # mean abs diff across the wrap edges vs across an interior column/row pair
    w, h = im.size; g = im.convert('L')
    d = lambda a, b: ImageStat.Stat(ImageChops.difference(a, b)).mean[0]
    lr = d(g.crop((0, 0, 1, h)), g.crop((w - 1, 0, w, h))); tb = d(g.crop((0, 0, w, 1)), g.crop((0, h - 1, w, h)))
    il = d(g.crop((w // 2, 0, w // 2 + 1, h)), g.crop((w // 2 + 1, 0, w // 2 + 2, h))); it = d(g.crop((0, h // 2, w, h // 2 + 1)), g.crop((0, h // 2 + 1, w, h // 2 + 2)))
    return round(lr, 1), round(tb, 1), 'interior', round(il, 1), round(it, 1)

for n in ('rust', 'tarnish', 'board-kelp'):
    im = Image.open(T + n + '.webp').convert('RGB'); s = seamless(flatten(im)) if n != 'board-kelp' else seamless(im)
    print(n, 'before', seam(im), 'after', seam(s)); s.save(O + n + '.webp', quality=82)

# B: the bartender's CC0 baize (ambientCG Fabric 034) toned to the kelp board
k = Image.open(T + 'board-kelp.webp').convert('RGB'); mean = ImageStat.Stat(k).mean; print('kelp mean', [round(v) for v in mean])
g = ImageOps.grayscale(Image.open('/home/hassan/Downloads/Textures/ambientCG_Fabric034_1K-JPG_Color.jpg')).resize((512, 512), Image.LANCZOS)
g = ImageEnhance.Contrast(ImageOps.autocontrast(g, cutoff=1)).enhance(0.8)
lo = tuple(int(v * .6) for v in mean); hi = tuple(min(255, int(v * 1.4)) for v in mean)
f = ImageOps.colorize(g, lo, hi); print('felt-teal', seam(f)); f.save(O + 'felt-teal.webp', quality=82)

# A+C mix: tarnish pulled toward white (multiply layer), 25 / 50 % strength
t = Image.open(O + 'tarnish.webp')
for pct in (25, 50):
    Image.blend(Image.new('RGB', t.size, 'white'), t, pct / 100).save(O + 'tarnish%d.webp' % pct, quality=82)
# mean luminance of the board as it renders (rust x tarnish x kelp, multiply)
def board(tn):
    k = Image.open(O + 'board-kelp.webp').convert('RGB').resize((512, 94)); r = Image.open(O + 'rust.webp').convert('RGB')
    out = Image.new('RGB', (1200, 600)); big = lambda im, sz: [im.resize(sz).crop((0, 0, sz[0], sz[1]))]
    def tile(im, sz): 
        im = im.resize(sz); c = Image.new('RGB', (1200, 600))
        for x in range(0, 1200, sz[0]):
            for y in range(0, 600, sz[1]): c.paste(im, (x, y))
        return c
    c = tile(k, (512, 94))
    c = ImageChops.multiply(c, tile(r, (400, 200)))
    if tn: c = ImageChops.multiply(c, tile(tn, (300, 150)))
    return round(ImageStat.Stat(c.convert('L')).mean[0], 1)
print('board mean L (kelp x rust x tarnish): A', board(Image.open(O + 'tarnish.webp').convert('RGB')), 'M50', board(Image.open(O + 'tarnish50.webp').convert('RGB')), 'M25', board(Image.open(O + 'tarnish25.webp').convert('RGB')), 'C', board(None))
