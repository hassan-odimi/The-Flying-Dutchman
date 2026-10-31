from PIL import Image, ImageFilter, ImageEnhance, ImageChops, ImageDraw
import random, sys
T='/home/hassan/Downloads/Textures/'; O='bake/'
random.seed(11)
m=Image.open(T+'Texturelabs_Metal_155M.jpg').convert('RGB')
rust=Image.open(T+'Texturelabs_Metal_132L.jpg').convert('RGB').resize((1060,707))
lum=lambda c: (lambda v: v/12.92 if v<=0.03928 else ((v+0.055)/1.055)**2.4)(c/255)
w,h=360,96
face=m.crop((200,700,1400,1020)).resize((w,h))
face=ImageEnhance.Color(face).enhance(0.45)
face=Image.eval(face,lambda v:int(28+v*0.42))          # tone-map: iron face never brighter than sRGB ~135
r=rust.crop((0,0,w*3,h*3)).resize((w,h))               # rust photo: deep orange-brown band
rim=Image.new('L',(w,h),255); ImageDraw.Draw(rim).rounded_rectangle((14,12,w-14,h-12),10,fill=0); rim=rim.filter(ImageFilter.GaussianBlur(9))
rr_=ImageChops.multiply(r,Image.new('RGB',(w,h),(150,120,110)))
p=Image.composite(rr_,face,rim)
# imperfect outline: slightly wobbly rectangle, a few irregular chips
a=Image.new('L',(w,h),0); d=ImageDraw.Draw(a)
j=lambda s=1.6: random.uniform(-s,s)
pts=[(x+j(),2+abs(j())) for x in range(4,w-3,24)]+[(w-2-abs(j()),y+j()) for y in range(4,h-3,16)]+[(x+j(),h-2-abs(j())) for x in range(w-4,3,-24)]+[(2+abs(j()),y+j()) for y in range(h-4,3,-16)]
d.polygon(pts,fill=255)
for _ in range(7):
    side=random.choice('tblr'); t=random.random()
    x,y={'t':(t*w,0),'b':(t*w,h),'l':(0,t*h),'r':(w,t*h)}[side]
    for k in range(random.randint(2,4)):
        rr=random.uniform(2,6); d.ellipse((x-rr+j(4),y-rr+j(4),x+rr+j(4),y+rr+j(4)),fill=0)
for c in [(0,0),(w,0),(0,h),(w,h)]:
    rr=random.uniform(4,8); d.ellipse((c[0]-rr,c[1]-rr,c[0]+rr,c[1]+rr),fill=0)
a=a.filter(ImageFilter.GaussianBlur(0.7))
hi=Image.new('L',(w,h),0); ImageDraw.Draw(hi).rectangle((0,0,w,4),fill=55); hi=hi.filter(ImageFilter.GaussianBlur(2))
p=Image.composite(Image.new('RGB',(w,h),(170,165,150)),p,hi)
def worst(box):
    L=max(0.2126*lum(r)+0.7152*lum(g)+0.0722*lum(b) for (r,g,b) in p.crop(box).getdata()); return 1.05/(L+0.05)
print('white worst: text band %.2f, whole face %.2f'%(worst((24,22,w-24,h-22)),worst((6,6,w-6,h-6))))
p.putalpha(a); p.save(O+'plate.webp'); p.resize((720,192)).save(O+'_plate_preview.png')
