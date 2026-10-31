# Mist strips that tile in X (ends crossfaded), white with luminance alpha. Feathering is done in CSS with a mask.
from PIL import Image, ImageOps, ImageChops, ImageDraw, ImageFilter
T='/home/hassan/Downloads/Textures/'
def strip(src, box, name, gamma, gain, W=1200, H=300):
    g=ImageOps.grayscale(Image.open(T+src).crop(box)).resize((W+200,H),Image.LANCZOS)
    a=g.crop((0,0,W,H)); tail=g.crop((W,0,W+200,H))  # crossfade the extra 200 px over the start: seamless wrap
    ramp=Image.linear_gradient('L').rotate(90,expand=True).resize((200,H))  # 255 -> 0 left to right
    a.paste(Image.composite(tail,a.crop((0,0,200,H)),ramp),(0,0))
    a=a.point(lambda v: min(255,int(gain*255*(v/255)**gamma)))
    m=Image.new('RGBA',(W,H),(255,255,255,0)); m.putalpha(a); m.save('bake/'+name, quality=70)
    prev=Image.new('RGB',(W,H),(60,40,25)); prev.paste(m,(0,0),m); prev.resize((600,150)).save('bake/_'+name+'.png')
strip('Texturelabs_Atmosphere_142L.jpg',(0,1300,4240,3121),'mistA.webp',0.9,1.5)
strip('Texturelabs_Atmosphere_139L.jpg',(0,600,4240,2400),'mistB.webp',0.8,2.2)
