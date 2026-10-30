from pathlib import Path
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parents[1]
report=[]
for name in ['xiaohongshu','podcast','literature','visual','about']:
 overrides={'xiaohongshu':'sources/character-motion-02/xiaohongshu-v3.png','about':'sources/character-motion-02/about.png'}
 src=root/overrides[name] if name in overrides else root/'sources/artwork'/(name+'.png');out=root/'assets'/(name+'.webp')
 with Image.open(src) as im:
  size=im.size;im.convert('RGB').save(out,'WEBP',quality=94 if name in overrides else 90,method=6)
 report.append({'id':name,'master':src.relative_to(root).as_posix(),'web':'assets/'+name+'.webp','size':size,'bytes':out.stat().st_size,'sourceSHA256':hashlib.sha256(src.read_bytes()).hexdigest(),'generatedWith':'built-in image_gen','role':'original AI-assisted art for this website, not portfolio evidence'})
(root/'sources/artwork-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False))
