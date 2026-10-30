from pathlib import Path
import hashlib,json,zipfile
root=Path(__file__).resolve().parents[1];base=root.parent
report={'oldSiteUnchanged':True,'oldSiteFiles':0,'changedOldSite':[],'preserved3D':{},'firstFourArtUnchanged':True}
with zipfile.ZipFile(base/'Vagus-site-v2-R3-2026-10-25.zip') as z:
 for name in z.namelist():
  if name.startswith('site-v2/') and not name.endswith('/'):
   report['oldSiteFiles']+=1
   if (base/name).read_bytes()!=z.read(name):report['changedOldSite'].append(name)
 report['oldSiteUnchanged']=not report['changedOldSite']
for archive,folder in [('Vagus-thinker-graymodel-v1-2026-10-26.zip','gray-model-lab'),('Vagus-thinker-refinement-v2-2026-10-26.zip','thinker-refinement-v2')]:
 with zipfile.ZipFile(base/archive) as z:
  names=['assets/thinker-gray.glb','assets/thinker-gray.blend','app.mjs','stage.mjs','motion.mjs','scripts/build-gray.py']
  report['preserved3D'][folder]=all((base/folder/n).read_bytes()==z.read(folder+'/'+n) for n in names)
for name in ['home','ai','start','hug']:
 if (root/'assets'/(name+'.webp')).read_bytes()!=(base/'site-v2/assets'/(name+'.webp')).read_bytes():report['firstFourArtUnchanged']=False
report['thinkerOriginalSHA256']=hashlib.sha256((base/'site-v2/assets/thinker-original.png').read_bytes()).hexdigest()
report['passed']=report['oldSiteUnchanged'] and all(report['preserved3D'].values()) and report['firstFourArtUnchanged']
(root/'evidence/preservation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False))
if not report['passed']:raise SystemExit(1)
