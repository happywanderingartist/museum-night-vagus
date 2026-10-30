from PIL import Image
from pathlib import Path
import json, hashlib
root=Path(__file__).resolve().parents[1]
source=root/'sources'/'character-motion-02'
files={'xiaohongshu-v3':'xiaohongshu.webp','about':'about.webp','monaBlink':'mona-blink.webp','thinkerLow':'thinker-hand.webp','thinkerHigh':'thinker-upper-reference.webp','thinkerClean':'thinker-clean.webp'}
report=[]
for key,name in files.items():
    img=Image.open(source/(key+'.png')).convert('RGB')
    target=root/'assets'/name
    img.save(target,'WEBP',quality=94,method=6)
    report.append({'id':key,'source':'sources/character-motion-02/'+key+'.png','asset':'assets/'+name,'size':list(img.size),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'bytes':target.stat().st_size})
(root/'evidence'/'character-art-02.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
