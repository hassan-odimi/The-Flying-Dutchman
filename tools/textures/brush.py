# V5: hand-drawn red ink marks for the order list. A pressure brush (heavy landing, thin flick, ragged edges)
# drawn as filled SVG paths: the remove cross (symbol "cross-brush" in img/icons.svg) and the row strike mask.
# Run from project root: python3 tools/textures/brush.py
import math, random, re

def bez(p, t):
    a, b, c, d = p; u = 1 - t
    return tuple(u**3*a[i] + 3*u*u*t*b[i] + 3*u*t*t*c[i] + t**3*d[i] for i in (0, 1))

def stroke(p, wmax, seed, n=40, rag=0.18, press=lambda t: min(1, t / 0.12) ** 0.5 * (1 - t) ** 0.55 + 0.04):
    random.seed(seed); L, R = [], []
    for k in range(n + 1):
        t = k / n; x, y = bez(p, t); xa, ya = bez(p, max(0, t - .01)); xb, yb = bez(p, min(1, t + .01))
        m = math.hypot(xb - xa, yb - ya) or 1; nx, ny = -(yb - ya) / m, (xb - xa) / m
        w = wmax * press(t)
        for side, pts in ((1, L), (-1, R)):
            o = side * (w / 2 + random.uniform(-rag, rag) * w)
            pts.append((x + nx * o, y + ny * o))
    return 'M' + ' '.join(f'{x:.2f} {y:.2f}' for x, y in L + R[::-1]) + 'Z'

cross = ''.join(f'<path fill="currentColor" stroke="none" d="{stroke(p, w, s)}"/>' for p, w, s in
                [(((4.0, 4.4), (8.6, 8.2), (13.6, 14.6), (20.6, 20.0)), 4.4, 3), (((19.8, 3.6), (15.4, 8.4), (9.2, 15.4), (3.4, 20.8)), 4.0, 5)])
sym = f'<symbol id="cross-brush" viewBox="0 0 24 24">{cross}</symbol>'
svg = open('img/icons.svg').read()
svg = re.sub(r'<symbol id="cross-brush".*?</symbol>\n?', '', svg).replace('</svg>', sym + '\n</svg>')
open('img/icons.svg', 'w').write(svg)

strike = stroke(((2, 9), (60, 6.2), (130, 11.4), (198, 7.6)), 5, 11, n=80, rag=.12,
                press=lambda t: min(1, t / 0.05) ** 0.5 * (1 - t * 0.75) ** 0.6 + 0.05)
open('img/textures/strike.svg', 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 16" preserveAspectRatio="none"><path d="{strike}"/></svg>\n')
