"""Create an allowlisted portable ZIP and verify its extracted tests. No deletion."""
from pathlib import Path
import hashlib, json, subprocess, tempfile, zipfile

root = Path(__file__).resolve().parents[1]
base = root.parent
target = base / 'Vagus-site-v2-R3-2026-10-25.zip'
if target.exists():
    raise SystemExit('Archive already exists; preserve it and choose a new filename.')
entries = [
    'index.html', 'start.html', 'hug.html', 'style.css', 'chapter-pages.css',
    'app.js', 'state.js', 'chapter-motion.mjs', 'chapter-state.mjs',
    'three-bridge.mjs', 'motion.mjs', 'hand-contact.mjs', 'runtime.mjs', 'scene.mjs',
    'server.cjs', 'start.cmd', 'README.md', 'VALIDATION.md', 'SOURCES.md',
    'asset-integrity.json', 'REVISION-R3.md', 'R3-ASSET-NOTES.md',
]
files = [root / name for name in entries]
for folder in ['assets', 'vendor', 'tests']:
    files.extend(p for p in (root / folder).rglob('*') if p.is_file())
evidence = [
    'home-1440.png', 'thinker-1440.png', 'start-1440.png', 'hug-1440.png',
    'start-reading-1440.png', 'start-390.png', 'hug-390.png',
    'browser-results.json', 'browser-fallback-results.json', 'browser-mobile-fallback-results.json', 'ai-direct-diagnostic.json',
    'phone-r3-0.png', 'phone-r3-1.png', 'phone-r3-2_6.png', 'phone-r3-5_5.png', 'phone-r3-8.png', 'phone-r3-live.webm',
    'browser-cleanup-r3.json',
]
files.extend(root / 'evidence' / name for name in evidence)
files.extend(root / 'scripts' / name for name in ['browser-check.cjs', 'browser-fallback-check.cjs', 'browser-mobile-fallback-check.cjs', 'review-phone-r3.cjs', 'browser-cleanup-r3.cjs'])
for p in files:
    if not p.is_file():
        raise SystemExit('Missing required file: ' + str(p))
with zipfile.ZipFile(target, 'x', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for p in sorted(set(files)):
        z.write(p, 'site-v2/' + p.relative_to(root).as_posix())
    for name in ['SITE-V2-PLAN.md', 'SITE-V2-PROGRESS.md']:
        z.write(base / name, name)
verify = Path(tempfile.mkdtemp(prefix='site-v2-extracted-', dir=base / 'toolchain'))
with zipfile.ZipFile(target) as z:
    if z.testzip() is not None:
        raise SystemExit('ZIP integrity failed')
    z.extractall(verify)
run = subprocess.run(['node', '--test', 'tests/*.test.mjs'], cwd=verify / 'site-v2', capture_output=True, text=True, encoding='utf-8')
(root / 'evidence' / 'package-test.txt').write_text(run.stdout + run.stderr, encoding='utf-8')
report = {
    'archive': str(target), 'bytes': target.stat().st_size,
    'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
    'files': len(files) + 2, 'extractedTo': str(verify),
    'extractedTestsExit': run.returncode,
    'exclusions': ['toolchain/profiles/cache', 'node_modules', 'old ZIPs', 'raw render logs', 'credentials', 'Blender program'],
}
(root / 'evidence' / 'package-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))
if run.returncode:
    raise SystemExit(run.returncode)
