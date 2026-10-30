# V4 round 9: Hassan's rivet scans (Texturelabs Details 141 grey dome, 144 rusted head with smear). Run from project root.
from PIL import Image, ImageDraw, ImageFilter, ImageChops
TL, OUT = '/home/hassan/Downloads/Textures', 'img/textures'
grey = Image.open(f'{TL}/Texturelabs_Details_141M.png').convert('RGBA').crop((512, 190, 1401, 1075))
src = Image.open(f'{TL}/Texturelabs_Details_144M.png').convert('RGBA')
cx, cy, r = 894, 672, 405
m = Image.new('L', src.size, 0); ImageDraw.Draw(m).ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
rust = src.copy(); rust.putalpha(ImageChops.multiply(src.split()[3], m.filter(ImageFilter.GaussianBlur(6)))); rust = rust.crop((cx - r, cy - r, cx + r, cy + r))
for name, im in [('rivet-grey', grey), ('rivet-rust', rust)]:
    im.resize((64, 64), Image.LANCZOS).save(f'{OUT}/{name}.webp', quality=86, method=6)

def shadowed(head, size, off=(2, 3), blur=2.5, alpha=170):
    h = head.resize((size, size), Image.LANCZOS); pad = 10
    c = Image.new('RGBA', (size + 2 * pad, size + 2 * pad), (0, 0, 0, 0))
    sh = Image.new('RGBA', h.size, (15, 8, 3, 255)); sa = h.split()[3].point(lambda v: v * alpha // 255)
    c.paste(sh, (pad + off[0], pad + off[1]), sa); c = c.filter(ImageFilter.GaussianBlur(blur)); c.alpha_composite(h, (pad, pad)); return c

import random
def bleed(out, cx, cy, seed, R=13):
    """rust halo and a short run down the paper, multiplied in (same recipe as the forged nail)"""
    rnd = random.Random(seed); box = R * 6
    m = Image.new('L', (box, box * 2), 0); d = ImageDraw.Draw(m)
    for _ in range(14):
        a, b = rnd.uniform(-1.2, 1.2) * R, rnd.uniform(-1, 1.3) * R; rr = rnd.uniform(0.4, 0.9) * R
        d.ellipse((box / 2 + a - rr, box / 2 + b - rr, box / 2 + a + rr, box / 2 + b + rr), fill=rnd.randint(90, 170))
    d.polygon([(box / 2 - R * 0.3, box / 2), (box / 2 + R * 0.3, box / 2), (box / 2 + R * 0.1, box / 2 + R * 3.4), (box / 2 - R * 0.12, box / 2 + R * 3.6)], fill=110)
    m = m.filter(ImageFilter.GaussianBlur(R * 0.35))
    ox, oy = cx - m.width // 2, cy - m.width // 2
    reg = out.crop((ox, oy, ox + m.width, oy + m.height))
    tinted = ImageChops.multiply(reg.convert('RGB'), Image.new('RGB', m.size, (168, 106, 68)))
    mixed = Image.composite(tinted, reg.convert('RGB'), m).convert('RGBA'); mixed.putalpha(reg.split()[3]); out.paste(mixed, (ox, oy))

# smear version for the slips: smear turned to run down the paper like a rust stain, softened
smear = src.crop((cx - r - 40, cy - r - 120, 1740, cy + r + 120)).rotate(-90, expand=True)
sa = smear.split()[3]; smear.putalpha(sa.point(lambda v: v * 150 // 255))
for k in range(1, 3):
    for tag, make in [('g', lambda: shadowed(grey, 26)), ('r', None)]:
        slip = Image.open(f'{OUT}/slip-n{k}.webp').convert('RGBA')
        if tag == 'g':
            n = make(); slip.alpha_composite(n, (60 - n.width // 2, 21 - n.height // 2))
        else:
            bleed(slip, 60, 21, 40 + k)
            n = shadowed(rust, 30); slip.alpha_composite(n, (60 - n.width // 2, 21 - n.height // 2))
        slip.save(f'{OUT}/slip-{tag}{k}.webp', quality=84, method=6)
