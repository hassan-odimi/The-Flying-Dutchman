# Card-table rail (bartender): Poly Haven Dark Wood (CC0, dark_wood_diff_1k.jpg) aged so it reads vintage and matte,
# apart from the plank floor. Colour pulled toward a dull walnut, highlights flattened (no lacquer sheen), then the
# seamless board-rust specks multiplied in at 80 % as grime. Stays a seamless 512 x 512 tile.
# Run from the project root: python3 tools/textures/gentex14.py <path to dark_wood_diff_1k.jpg>
import sys
from PIL import Image, ImageChops, ImageEnhance

N = 512
wood = Image.open(sys.argv[1]).convert('RGB').resize((N, N), Image.LANCZOS)
wood = ImageEnhance.Color(wood).enhance(0.65)                    # less red, older stain
wood = ImageEnhance.Contrast(wood).enhance(0.8)                  # flatter grain, no gloss
wood = wood.point(lambda v: int(v * 0.8) if v < 150 else int(120 + (v - 150) * 0.35))  # darker, highlights capped: matte
grime = Image.open('img/textures/board-rust.webp').convert('RGB').resize((N, N), Image.LANCZOS)
grime = Image.blend(Image.new('RGB', (N, N), 'white'), grime, 0.8)
ImageChops.multiply(wood, grime).save('img/textures/rail.webp', quality=80)
