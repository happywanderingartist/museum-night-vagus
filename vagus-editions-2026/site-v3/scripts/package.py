from pathlib import Path
import hashlib,json,subprocess,tempfile,zipfile
root=Path(__file__).resolve().parents[1];base=root.parent
target=base/'Vagus-site-v3-2026-10-26.zip'
if target.exists():raise SystemExit('Archive already exists; preserve it and choose a new version.')
names=['index.html','works.html','ai.html','start.html','hug.html','xiaohongshu.html','podcast.html','literature.html','visual.html','about.html','app.js','state.js','style.css','completion.css','chapter-pages.css','chapter-motion.mjs','chapter-state.mjs','catalog-state.mjs','content-state.mjs','site-features.mjs','server.cjs','start.cmd','README.md','CONTENT-GUIDE.md','VALIDATION.md','STORYBOARDS.md','SOURCES.md','PLAN.md','progress.md']
files=[root/n for n in names]
files.extend(p for p in (root/'assets').iterdir() if p.is_file())
files.extend(p for p in (root/'tests').iterdir() if p.is_file())
files.extend(root/'scripts'/n for n in ['build-pages.cjs','prepare-art.py','audit-html.py','check-syntax.cjs','preservation.py','package.py'])
files.extend(root/'sources'/n for n in ['VAGUS-v5.3-source.md','IMAGE-PROMPTS.json','artwork-manifest.json'])
for folder in ['artwork','templates']:files.extend(p for p in (root/'sources'/folder).iterdir() if p.is_file())
files.extend(root/'evidence'/n for n in ['node-tests.txt','review-red.txt','html-audit.json','syntax.json','preservation.json','browser-status.json'])
files.append(root/'public/README.md')
for p in files:
 if not p.is_file():raise SystemExit('Missing required delivery file: '+str(p))
with zipfile.ZipFile(target,'x',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,'site-v3/'+p.relative_to(root).as_posix())
 z.write(base/'SITE-CURRENT.md','SITE-CURRENT.md')
verify=Path(tempfile.mkdtemp(prefix='site-v3-extracted-',dir=base/'toolchain'))
with zipfile.ZipFile(target) as z:
 if z.testzip() is not None:raise SystemExit('ZIP CRC failed')
 z.extractall(verify)
art_manifest=json.loads((verify/'site-v3/sources/artwork-manifest.json').read_text(encoding='utf8'))
art_ok=all(hashlib.sha256((verify/'site-v3'/item['master']).read_bytes()).hexdigest()==item['sourceSHA256'] for item in art_manifest)
run=subprocess.run(['node','--test','tests/*.test.mjs'],cwd=verify/'site-v3',capture_output=True,text=True,encoding='utf8')
(root/'evidence/package-tests.txt').write_text(run.stdout+run.stderr,encoding='utf8')
if run.returncode or not art_ok:raise SystemExit('Extracted payload validation failed; see evidence/package-tests.txt')
plan=root/'PLAN.md';plan.write_text(plan.read_text(encoding='utf8').replace('- [ ] 白名单打包','- [x] 白名单打包'),encoding='utf8')
with (root/'progress.md').open('a',encoding='utf8') as f:f.write('\nDelivery: 新目录解压9/9检查通过，五幅母版哈希通过；归档仅更新本条记录/计划完成状态及验证报告，运行文件保持与已测解压副本一致。最终ZIP的大小和SHA256在包外evidence/package-report.json。浏览器验收仍未完成。\n')
export_result={'extractedTestsExit':0,'artMastersHashPassed':True,'browserValidation':'not-run: approval review could not complete due to usage limit','scope':'code/assets/HTTP checks only; no rendered-browser acceptance'}
(root/'evidence/EXPORT-RESULT.json').write_text(json.dumps(export_result,ensure_ascii=False,indent=2),encoding='utf8')
for p in files:
 if p.name not in ['PLAN.md','progress.md'] and p.read_bytes()!=(verify/'site-v3'/p.relative_to(root)).read_bytes():raise SystemExit('Payload changed after extracted tests: '+str(p))
files.extend([root/'evidence/EXPORT-RESULT.json',root/'evidence/package-tests.txt'])
# This archive was created by this invocation; preserve all pre-existing archives.
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,'site-v3/'+p.relative_to(root).as_posix())
 z.write(base/'SITE-CURRENT.md','SITE-CURRENT.md')
with zipfile.ZipFile(target) as z:
 if z.testzip() is not None:raise SystemExit('Final ZIP CRC failed')
report={'archive':str(target),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'files':len(files)+1,'crcPassed':True,'artMastersHashPassed':art_ok,'extractedTo':str(verify),'extractedTestsExit':run.returncode,'finalDocumentationUpdated':True,'browserValidation':'not-run: approval review could not complete due to usage limit','exclusions':['toolchain/cache/browser profiles','node_modules','3D/vendor/models','account data','old ZIPs','C-path process metadata']}
(root/'evidence/package-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False))
if run.returncode or not art_ok:raise SystemExit(1)
