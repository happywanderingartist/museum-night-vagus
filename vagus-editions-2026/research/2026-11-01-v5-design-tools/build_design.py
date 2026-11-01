from pathlib import Path
import base64, html, io
from PIL import Image

root=Path(__file__).resolve().parents[2]
out=root/'docs/superpowers/specs'
stem='2026-11-01-vagus-continuous-gallery-v5'
def encode_png(file):
    image=Image.open(file)
    buf=io.BytesIO(); image.save(buf,format='PNG')
    return base64.b64encode(buf.getvalue()).decode()
home=encode_png(root/'site-v4/assets/home.webp')
ai=encode_png(root/'site-v4/assets/ai.webp')
font='Microsoft YaHei, Noto Sans CJK SC, sans-serif'
serif='STZhongsong, SimSun, serif'

def text(x,y,s,size=20,fill='#173a34',family=None,extra=''):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-family="{family or font}" {extra}>{html.escape(s)}</text>'
def lines(x,y,items,size=20,fill='#173a34',step=30,family=None):
    return ''.join(text(x,y+i*step,s,size,fill,family) for i,s in enumerate(items))
def rect(x,y,w,h,fill,extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" {extra}/>'
def path(d,fill,extra=''):
    return f'<path d="{d}" fill="{fill}" {extra}/>'
def artwork(which):
    return f'<image x="0" y="0" width="1440" height="810" preserveAspectRatio="xMidYMid slice" href="data:image/png;base64,{home if which=="home" else ai}"/>'
def defs():
    return '''<defs><linearGradient id="homeShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1d18" stop-opacity="0"/><stop offset="1" stop-color="#0c1d18" stop-opacity=".90"/></linearGradient><linearGradient id="floor" x1="0" y1="1" x2=".5" y2="0"><stop stop-color="#74523a"/><stop offset="1" stop-color="#b48e59"/></linearGradient><linearGradient id="depth" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#355b56"/><stop offset=".65" stop-color="#15382e"/><stop offset="1" stop-color="#09251e"/></linearGradient><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="#b45639"/></marker></defs>'''

def home_ui():
    s=rect(0,445,1440,365,'url(#homeShade)')
    s+=text(72,133,'Vagus',111,'#143c39','Times New Roman, serif',extra='letter-spacing="-7"')
    s+=lines(342,93,['让好奇心成为方法，让想象力成为作品。','Curiosity as a method. Imagination made real.'],14,'#143c39',26)
    s+=rect(1123,275,215,99,'#17372a',extra='opacity=".92" stroke="#d6d4b5" stroke-width=".7"')
    s+=text(1141,299,'蒙娜丽莎',11,'#d7ddca')
    s+=lines(1141,329,['咋的，没看过','名画上班吗？'],19,'#f6f0df',28,serif)
    s+=text(72,627,'Vagus / 邀请函',11,'#e0e4d7')
    s+=text(72,670,'Hello，我是 Vagus。',31,'#fff8e8',serif)
    s+=lines(72,707,['欢迎来到我的网站，这里记录了我在艺术、设计与 AI 之间的游走与探索。','你愿意和我一起开启这场博物馆奇妙夜吗？'],16,'#fff8e8',29)
    for i,(n,label,arrow) in enumerate([('01','速览作品','↗'),('02','接受邀请','→'),('03','看看简历','↗')]):
        y=641+i*47
        s+=text(1100,y,n,10,'#fff8e8')+text(1142,y,label,17,'#fff8e8')+text(1322,y,arrow,17,'#fff8e8')
        s+=path(f'M1098 {y+13}H1354','none',extra='stroke="#fff8e8" stroke-opacity=".45"')
    s+=text(72,790,'A LITTLE ART. A LITTLE AFTER HOURS.',9,'#d2d8ca')
    return s

def ai_ui(full=True):
    s=text(86,116,'01 / AFTER-HOURS THINKING',11,'#f0efdf')
    s+=text(86,207,'AI 行业观察',65,'#f0efdf',serif,extra='letter-spacing="-2.5"')
    s+=lines(86,267,['在技术快速变化的时代，我更关心 AI 如何进入真实生活，','以及它如何改变人们的创作、工作与表达方式。'],15,'#f0efdf',29)
    if full:
        for i,label in enumerate(['SeedRealtime','Vibe Coding','AI产品榜与热门精选']):
            y=379+i*63
            s+=text(86,y,label,24,'#f0efdf',serif)+text(380 if i<2 else 398,y,'↗',15,'#f0efdf')
        s+=text(86,555,'查看全部作品     ↓',13,'#f0efdf')+path('M86 565H218','none',extra='stroke="#f0efdf"')
        s+=rect(677,178,205,100,'#17372a',extra='opacity=".92" stroke="#d6d4b5" stroke-width=".7"')
        s+=text(696,201,'思考者',10,'#d7ddca')+lines(696,231,['人类又训练了','一个新模型？'],18,'#f6f0df',28,serif)
    return s

def corridor():
    s=rect(0,0,1440,810,'#17392f')
    s+=path('M0 0H1440L850 245H580Z','#213e35')
    s+=path('M0 0L580 245V535L0 810Z','url(#depth)')
    s+=path('M1440 0L850 245V535L1440 810Z','#123126')
    s+=path('M0 810L580 535H850L1440 810Z','url(#floor)')
    s+=rect(580,245,270,290,'#334b35')+rect(650,275,110,260,'#b99c69')
    s+=rect(668,291,74,244,'#d3b882')
    s+=path('M490 810L682 535M1060 810L755 535M0 672H1440','none',extra='stroke="#e4c58a" stroke-opacity=".32" stroke-width="2"')
    s+=path('M0 0H130L615 245H580Z','#8aa9a0')+path('M0 810V0H130L615 245V535Z','#63877e',extra='opacity=".75"')
    s+=path('M1440 0H1294L823 245H850Z','#46685b')
    s+=path('M1440 810V0H1294L823 245V535Z','#294b3d')
    return s

def scene(k):
    if k==0: return artwork('home')+home_ui()
    if k==1:
        opening='M285 80C360 30 520 70 610 150C700 230 825 280 840 410C850 510 710 640 610 700C520 755 320 745 250 645C170 540 205 465 195 360C185 240 190 150 285 80Z'
        s=f'<defs><mask id="homeOpening"><rect width="1440" height="810" fill="white"/><path d="{opening}" fill="black"/></mask></defs>'
        s+=corridor()+f'<g mask="url(#homeOpening)">{artwork("home")}</g>'
        s+=path(opening,'none',extra='stroke="#9fb9aa" stroke-width="35"')
        s+=path(opening,'none',extra='stroke="#486e5b" stroke-width="7"')
        return s
    if k==2: return corridor()
    if k==3:
        s=artwork('ai')
        s+=path('M0 0H48L20 810H0Z','#355b4c')+path('M1440 0H1360L1414 810H1440Z','#2a4739')
        return s+ai_ui(False)
    return artwork('ai')+ai_ui(True)

def svg(w,h,content,title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>{html.escape(title)}</title>{defs()}{content}</svg>'

s=rect(0,0,1600,1120,'#f1f1e8')
s+=text(40,52,'Vagus · 沿画中展廊向内走',34,family=serif)
s+=text(40,87,'五帧构图提案｜K0 / K4 沿用原画与原版位；K1—K3 为待制作空间示意，不是动效成品。',17,'#5b6d60')
labels=[('K0  首页停留 · p=0','原首页可读可点；人物、猫杯桌关系完整。'),('K1  画层展开 · p=.22','绘本式开口显露新展廊；原人物由遮罩遮住。'),('K2  途中展开 · p=.50','地面与墙面向深处连续；中央暖光引路。'),('K3  到达 AI · p=.80','墙缘退出周边；原标题、原简介先建立。'),('K4  稳定阅读 · p=1','回到原构图；三条入口完整，镜头停稳。')]
for k,(x,y,w) in enumerate([(40,130,496),(552,130,496),(1064,130,496),(40,532,752),(808,532,752)]):
    h=w*810/1440
    s+=f'<svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="0 0 1440 810" overflow="hidden">{scene(k)}</svg>'
    s+=text(x,y+h+31,labels[k][0],21,family=serif)
    s+=text(x,y+h+60,labels[k][1],15,'#53685b')
    if k in (1,2): s+=text(x,y+h+86,'灰模色块＝新增环境需求，非已完成绘画素材。',14,'#946044')
s+=text(40,1080,'节奏：原首页静止 → 一次连续前行 → 原 AI 静止阅读。停滚即停，反滚可回，点击邀请可直接到达。',19)
(out/f'{stem}-frames.svg').write_text(svg(1600,1120,s,'Vagus 五个关键帧设计'),encoding='utf-8')

s=rect(0,0,1440,950,'#f1f1e8')
s+=text(40,53,'空间与合成剖面：先展开画层，再向内走',34,family=serif)
s+=text(40,91,'横向表示前后关系；两端原画是独立合成层，主相机只在新增展廊内前行。',18,'#5b6d60')
s+=rect(80,180,260,340,'#d3e0d7')+rect(340,180,650,340,'#82998a')+rect(990,180,350,340,'#213d30')
s+=path('M80 520H1340','none',extra='stroke="#74573c" stroke-width="16"')
s+=path('M340 180H990','none',extra='stroke="#3f6756" stroke-width="18"')
for x in [405,700,930]:
    s+=rect(x,180,18,145,'#294d3e')+rect(x+18,180,11,145,'#bda77d')
    s+=rect(x,442,18,78,'#294d3e')+rect(x+18,442,11,78,'#bda77d')
s+=text(97,218,'首页艺术层',24,family=serif)+text(548,218,'新增连续环境',24,'#f2f1df',serif)+text(1035,218,'AI 艺术层',24,'#f2f1df',serif)
s+=path('M365 374H963','none',extra='stroke="#b45639" stroke-width="7" marker-end="url(#arrow)"')
for x,label in [(365,'K0 / K1'),(665,'K2'),(875,'K3'),(945,'K4')]:
    s+=f'<circle cx="{x}" cy="374" r="10" fill="#f1f1e8" stroke="#b45639" stroke-width="4"/>'
    s+=text(x-18,417,label,19,'#fff5dc')
s+=path('M365 374L470 308V440ZM945 374L980 347V401Z','none',extra='stroke="#f5ebc8" stroke-width="2"')
s+=text(95,565,'开场合成：原首页',19)+text(548,565,'K0 / K1 相机同位置；p≈.26 开始前进',18)+text(1100,565,'到达合成：原 AI',19)
s+=lines(40,635,['1  首页采用非物理的绘画轮廓展开；新开口不是原房间里的真实门。','2  新墙缘有可见厚度，地面有连续方向；前进后近景从周边经过。','3  两端人物只用原角度和原接触关系；原画通过遮罩接力，不作为相机穿越的墙。','4  远处先由新环境承接；到达时近景遮住接缝，再按终态取景显露原 AI。','5  这是合成与相对深度示意；墙缘、地面、光线与接缝仍需新制和灰模验证。'],21,'#304f40',49)
s+=text(40,920,'路线提案：浅青漫射光 → 暖木与中绿 → 深绿阅览室。HTML 始终属于屏幕，阅读时不随相机缩放。',18,'#667a68')
(out/f'{stem}-space.svg').write_text(svg(1440,950,s,'Vagus 空间侧视图'),encoding='utf-8')

s=rect(0,0,1440,1030,'#f1f1e8')
s+=f'<svg x="0" y="0" width="1440" height="810" viewBox="0 0 1440 810" overflow="hidden">{scene(4)}</svg>'
s+=text(40,859,'到达之后：标题、简介与入口留在原位，画面停止',29,family=serif)
s+=lines(40,900,['宋体标题与入口 / 无衬线正文与导航；原中文文案、链接顺序及右侧手机—古书—桌面关系保留。','上滚：先回到静止 AI，再反向走回首页。文章后退：恢复来源位置。直达与减少动态：直接完整阅读。','图为按现有 HTML/CSS 近似的 1440×810 版位示意；不是浏览器截图，正式需与同视口原页对照。'],18,'#5b6d60',36)
(out/f'{stem}-reading.svg').write_text(svg(1440,1030,s,'Vagus AI 稳定阅读终态'),encoding='utf-8')
print('Wrote 3 self-contained SVG design files.')
