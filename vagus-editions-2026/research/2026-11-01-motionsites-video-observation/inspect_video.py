import pathlib, subprocess, re, json, hashlib
from PIL import Image, ImageDraw

root=pathlib.Path(__file__).parent
ffmpeg=r'D:\AI-Data\Cache\Migrated\bilibili\ffmpeg\ffmpeg.exe'
records=[]
for src in sorted((root/'source').glob('*.mp4')):
    info=subprocess.run([ffmpeg,'-hide_banner','-i',str(src)],capture_output=True).stderr.decode('utf-8',errors='replace')
    match=re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)',info)
    if not match:
        print(src.name,info); continue
    duration=int(match[1])*3600+int(match[2])*60+float(match[3])
    out=root/'frames'/src.stem
    out.mkdir(parents=True,exist_ok=True)
    fps=float(re.search(r'(\d+(?:\.\d+)?) fps',info)[1])
    step=round(fps/2)
    result=subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-i',str(src),'-vf',f'select=not(mod(n\\,{step})),scale=730:-1','-vsync','0','-q:v','3','-y',str(out/'sample-%03d.jpg')],capture_output=True)
    if result.returncode: print(result.stderr.decode(errors='replace')); continue
    frames=sorted(out.glob('sample-*.jpg'))
    for page in range(0,len(frames),24):
        group=frames[page:page+24]
        w,h=360,290
        sheet=Image.new('RGB',(w*4,h*((len(group)+3)//4)), '#e5e5e5')
        draw=ImageDraw.Draw(sheet)
        for j,p in enumerate(group):
            im=Image.open(p); im.thumbnail((350,260))
            x=(j%4)*w; y=(j//4)*h
            sheet.paste(im,(x+(w-im.width)//2,y+24))
            draw.text((x+8,y+5),f'{src.stem} | {(page+j)*step/fps:.2f}s',fill='black')
        sheet.save(root/f'{src.stem}-sheet-{page//24+1}.jpg',quality=90)
    records.append({'file':src.name,'bytes':src.stat().st_size,'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'duration_seconds':duration,'frame_count_sampled':len(frames),'metadata':info})
(root/'video-metadata.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps(records,indent=2))
for p in (root/'source').glob('*.html'):
    html=p.read_text(encoding='utf-8')
    print(p.name,len(html),html[:1200].encode('ascii',errors='backslashreplace').decode())
    for term in ['golden-portal','cosmic-mapping','.mp4','script src']:
        hits=list(re.finditer(re.escape(term),html))
        print(term,len(hits))
        for m in hits[:5]: print(html[max(0,m.start()-100):m.end()+180].encode('ascii',errors='backslashreplace').decode())
