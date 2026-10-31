# F11 mockup bake: card stock and engraved pips from the BnF 1850 French deck (public domain).
from PIL import Image, ImageChops, ImageFilter, ImageOps, ImageDraw
T = '/home/hassan/Downloads/Textures/French_Portrait_card_deck_-_1850_-_'
def card(n): return Image.open(T + n + '.jpg').convert('RGB')
# card stock: the lower part of the Ace of Hearts (below the pip), with its faint watermark; 600x900
h = card('Ace_of_Hearts'); W, H = h.size
stock = h.crop((int(W*.06), int(H*.58), int(W*.94), int(H*.97))).resize((600, 450), Image.LANCZOS)
face = Image.new('RGB', (600, 900)); face.paste(stock, (0, 0)); face.paste(ImageOps.flip(stock), (0, 450))
face.save('bake/card-face.webp', quality=82)
# yellow back stock (Back.jpg) for the backs of stacked cards
b = card('Back'); bw, bh = b.size; b.crop((int(bw*.05), int(bh*.04), int(bw*.95), int(bh*.96))).resize((600, 900), Image.LANCZOS).save('bake/card-back.webp', quality=82)
# pips: threshold the ink, crop to the central pip, keep the scan's own ink colour
def pip(name, box, red):
    c = card(name); w, hh = c.size; c = c.crop((int(w*box[0]), int(hh*box[1]), int(w*box[2]), int(hh*box[3])))
    r, g, bb = c.split()
    m = ImageChops.subtract(r, g).point(lambda v: 255 if v > 60 else 0) if red else ImageOps.invert(ImageOps.grayscale(c)).point(lambda v: 255 if v > 120 else 0)
    m = m.filter(ImageFilter.MedianFilter(5)); bbx = m.getbbox(); c = c.crop(bbx); m = m.crop(bbx).filter(ImageFilter.GaussianBlur(1))
    out = c.convert('RGBA'); out.putalpha(m); s = max(out.size); sq = Image.new('RGBA', (s, s)); sq.paste(out, ((s-out.width)//2, (s-out.height)//2)); sq.resize((128, 128), Image.LANCZOS).save(f'bake/pip-{name.split("_")[-1].lower()}.png')
pip('Ace_of_Hearts', (.3, .35, .7, .65), True)
pip('Ace_of_Diamonds', (.3, .35, .7, .65), True)
pip('Ace_of_Spades', (.3, .35, .7, .65), False)
pip('Ace_of_Clubs', (.38, .37, .62, .55), False)
# blue tax stamp from the Ace of Clubs, as the PAID stamp idea
c = card('Ace_of_Clubs'); w, hh = c.size; st = c.crop((int(w*.32), int(hh*.68), int(w*.68), int(hh*.93)))
r, g, bb = st.split(); m = ImageChops.subtract(bb, r).point(lambda v: min(255, v*6)).filter(ImageFilter.GaussianBlur(.6))
out = st.convert('RGBA'); out.putalpha(m); out.resize((220, int(220*out.height/out.width)), Image.LANCZOS).save('bake/tax-stamp.png')
prev = Image.new('RGB', (900, 300), (230, 225, 210))
prev.paste(face.resize((200, 300)), (0, 0)); prev.paste(Image.open('bake/card-back.webp').resize((200, 300)), (210, 0))
for i, n in enumerate(['hearts', 'diamonds', 'spades', 'clubs']):
    p = Image.open(f'bake/pip-{n}.png'); prev.paste(p.resize((64, 64)), (420 + (i % 2) * 70, 10 + (i // 2) * 70), p.resize((64, 64)))
t = Image.open('bake/tax-stamp.png'); prev.paste(t, (600, 20), t); prev.save('bake/_cards.png')
