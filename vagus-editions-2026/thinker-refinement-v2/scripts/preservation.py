from pathlib import Path
import hashlib,json,zipfile
root=Path(__file__).resolve().parents[1];base=root.parent
results=[]
with zipfile.ZipFile(base/'Vagus-site-v2-R3-2026-10-25.zip') as z:
 for name in z.namelist():
  if name.startswith('site-v2/') and not name.endswith('/'):
   current=(base/name).read_bytes()
   results.append({'file':name,'unchanged':current==z.read(name)})
report={'baseline':'Vagus-site-v2-R3-2026-10-25.zip','files':len(results),'allUnchanged':all(x['unchanged'] for x in results),'changed':[x['file'] for x in results if not x['unchanged']]}
report['sourceSHA256']=hashlib.sha256((base/'site-v2/assets/thinker-original.png').read_bytes()).hexdigest()
with zipfile.ZipFile(base/'Vagus-thinker-graymodel-v1-2026-10-26.zip') as z:
 names=['assets/thinker-gray.glb','assets/thinker-gray.blend','app.mjs','stage.mjs','motion.mjs','runtime.mjs']
 report['previousGrayVersionUnchanged']=all((base/'gray-model-lab'/n).read_bytes()==z.read('gray-model-lab/'+n) for n in names)
(root/'evidence/preservation-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
if not report['allUnchanged'] or not report['previousGrayVersionUnchanged']:raise SystemExit(1)
