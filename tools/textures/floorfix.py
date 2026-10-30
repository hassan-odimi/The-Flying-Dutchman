# Re-apply the label-zone luminance floor to the final WebPs with margin for lossy encoding
import sys; sys.path.insert(0, sys.argv[1])
from gentex4 import floor_lum
from PIL import Image
Z = {'tab-note': (0.05, 0.2, 0.95, 1), 'slip': (0.06, 0.13, 0.94, 0.94)}
for f in ['tab-note1', 'tab-note2', 'tab-note3', 'tab-note-wide1', 'tab-note-wide2', 'tab-note-wide3', 'slip1', 'slip2']:
    p = f'img/textures/{f}.webp'; im = Image.open(p).convert('RGBA'); W, H = im.size
    x0, y0, x1, y1 = Z['slip' if f.startswith('slip') else 'tab-note']
    floor_lum(im, (int(x0 * W), int(y0 * H), round(x1 * W), round(y1 * H)), floor=0.31)
    im.save(p, quality=86, method=6)
