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
(root/'evidence/preservation-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
if not report['allUnchanged']:raise SystemExit(1)
