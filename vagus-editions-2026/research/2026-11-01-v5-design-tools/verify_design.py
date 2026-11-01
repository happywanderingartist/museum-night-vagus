from pathlib import Path
import xml.etree.ElementTree as ET
import re, io, json, base64, hashlib
from PIL import Image, ImageChops

root=Path(__file__).resolve().parents[2]
folder=root/'docs/superpowers/specs'
stem='2026-11-01-vagus-continuous-gallery-v5'
sources=[Image.open(root/'site-v4/assets'/name).convert('RGB') for name in ['home.webp','ai.webp']]
report={'svgs':[],'broken_local_links':[],'sources':[]}
for suffix in ['frames','space','reading']:
    file=folder/f'{stem}-{suffix}.svg'
    tree=ET.parse(file)
    ids=[e.attrib['id'] for e in tree.iter() if 'id' in e.attrib]
    assert len(ids)==len(set(ids)),f'duplicate ids: {file}'
    refs=re.findall(r'url\(#([^)]*)\)',file.read_text(encoding='utf-8'))
    assert all(ref in ids for ref in refs)
    matched=0
    for e in tree.iter():
        href=e.attrib.get('href','')
        if href.startswith('data:image/png;base64,'):
            im=Image.open(io.BytesIO(base64.b64decode(href.split(',',1)[1]))).convert('RGB')
            assert any(im.size==src.size and ImageChops.difference(im,src).getbbox() is None for src in sources)
            matched+=1
    png=Image.open(file.with_suffix('.png')); png.verify()
    report['svgs'].append({'file':file.name,'bytes':file.stat().st_size,'embedded_original_images_rgb_verified':matched,'png_preview_verified':True})
for name in [f'{stem}.md',f'{stem}-assets.md']:
    file=folder/name
    for link in re.findall(r'\]\(([^)]+)\)',file.read_text(encoding='utf-8')):
        if not re.match(r'[a-z]+://',link) and not (file.parent/link.split('#')[0]).exists():
            report['broken_local_links'].append({'file':name,'link':link})
assert not report['broken_local_links']
for name in ['home.webp','ai.webp']:
    p=root/'site-v4/assets'/name
    report['sources'].append({'file':name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'size':Image.open(p).size})
(Path(__file__).parent/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
