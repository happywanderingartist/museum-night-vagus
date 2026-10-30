from pathlib import Path
import hashlib,json,subprocess,tempfile,zipfile
root=Path(__file__).resolve().parents[1];base=root.parent
target=base/'Vagus-thinker-refinement-v2-2026-10-26.zip'
if target.exists():raise SystemExit('Archive exists; preserve it and choose a new version.')
names=['index.html','style.css','app.mjs','stage.mjs','motion.mjs','runtime.mjs','registration.mjs','server.cjs','start.cmd','README.md','VALIDATION.md','SOURCES.md','progress.md']
files=[root/n for n in names]
for folder in ['vendor','tests']:
 files.extend(p for p in (root/folder).rglob('*') if p.is_file())
files.extend(root/'assets'/n for n in ['thinker-gray.blend','thinker-gray.glb','model-audit.json','gray-poster.png','reference.webp','registration.json','thinker-original.png','thinker-clean-plate-r3.png'])
files.extend(root/'scripts'/n for n in ['build-gray.py','fit-camera.py','browser-review.cjs','browser-source-failure.cjs','browser-abort-check.cjs','topology-report.mjs','palm-report.mjs','preservation.py'])
files.extend(root/'evidence'/n for n in ['gray-overview.png','browser-overview.png','frame-0.png','frame-1.png','frame-2_6.png','frame-5_5.png','frame-8.png','contact-audit-view.png','browser-390.png','gray-live-cycle.webm','browser-results.json','browser-abort-results.json','browser-source-failure.json','node-tests.txt','palm-regression-red.txt','source-registration.png','connected-chrome-full.png','preservation-check.json'])
for p in files:
 if not p.is_file():raise SystemExit('Missing required file: '+str(p))
with zipfile.ZipFile(target,'x',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,'thinker-refinement-v2/'+p.relative_to(root).as_posix())
 for n in ['2026-10-25-vagus-3d-design-proposal.md','2026-10-26-thinker-refinement-plan.md']:z.write(base/'designs'/n,'designs/'+n)
verify=Path(tempfile.mkdtemp(prefix='thinker-refine-extracted-',dir=base/'toolchain'))
with zipfile.ZipFile(target) as z:
 if z.testzip() is not None:raise SystemExit('ZIP CRC failed')
 z.extractall(verify)
run=subprocess.run(['node','--test','tests/*.test.mjs','tests/*.test.cjs'],cwd=verify/'thinker-refinement-v2',capture_output=True,text=True,encoding='utf-8')
(root/'evidence/package-test.txt').write_text(run.stdout+run.stderr,encoding='utf-8')
report={'archive':str(target),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'files':len(files)+2,'extractedTo':str(verify),'extractedTestsExit':run.returncode,'exclusions':['toolchain/browser profiles/cache','node_modules','Blender executable','blend backups','old ZIPs','logs','accounts']}
(root/'evidence/package-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=False))
if run.returncode:raise SystemExit(run.returncode)
