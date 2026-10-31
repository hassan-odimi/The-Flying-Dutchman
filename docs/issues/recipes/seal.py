# Cut a wax seal out of a photo by colour (redness), recolour copies to green. Mockup bake; the real one goes in tools/textures.
from PIL import Image, ImageChops, ImageFilter, ImageOps, ImageEnhance, ImageDraw
import sys
T='/home/hassan/Downloads/Textures/'
def cut(src, name, mode, box):
    im=Image.open(T+src).convert('RGB'); im.thumbnail((1200,1200)); im=im.crop(box)
    r,g,b=im.split()
    if mode=='red': m=ImageChops.multiply(ImageChops.subtract(r,g).point(lambda v:255 if v>70 else 0), g.point(lambda v:255 if v<90 else 0))
    else: m=ImageChops.multiply(ImageChops.subtract(r,b).point(lambda v:255 if v>80 else 0), b.point(lambda v:255 if v<120 else 0))
    m=m.filter(ImageFilter.MedianFilter(9)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    m=m.filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.MinFilter(15))  # close the highlight gaps
    f=m.copy(); ImageDraw.floodfill(f,(0,0),128)                                # outside = 128
    m=f.point(lambda v: 0 if v==128 else 255)                                    # holes inside become wax
    m=m.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MaxFilter(9))        # drop string and specks
    bb=m.getbbox(); print(src, bb)
    # keep the largest blob roughly: crop to bbox
    c=im.crop(bb); a=m.crop(bb).filter(ImageFilter.GaussianBlur(1.2))
    s=max(c.size); sq=Image.new('RGBA',(s,s),(0,0,0,0)); c=c.convert('RGBA'); c.putalpha(a); sq.paste(c,((s-c.width)//2,(s-c.height)//2)); sq=sq.resize((160,160),Image.LANCZOS)
    sq.save(f'bake/{name}-red.png')
    hsv=sq.convert('RGB').convert('HSV'); h,s_,v=hsv.split(); h=h.point(lambda x:(x+100)%256)
    gr=Image.merge('HSV',(h,s_.point(lambda x:int(x*0.7)),v.point(lambda x:int(x*0.85)))).convert('RGB'); gr.putalpha(sq.getchannel('A')); gr.save(f'bake/{name}-green.png')
    prev=Image.new('RGB',(340,170),(220,200,170)); prev.paste(sq,(0,0),sq); g2=Image.open(f'bake/{name}-green.png'); prev.paste(g2,(170,0),g2); prev.save(f'bake/_{name}.png')
cut('paolo-chiabrando-21VlmPMZEtw-unsplash.jpg','sealP','red',(380,130,870,660))
cut('raspopova-marina-W3UadStmexM-unsplash.jpg','sealR','gold',(200,500,600,840))
