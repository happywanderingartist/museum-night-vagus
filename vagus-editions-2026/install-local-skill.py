"""Install this reviewed instruction-only skill without overwriting any skill."""
from pathlib import Path
import hashlib
import json
import shutil

source = Path(r'D:\AI-Data\博物馆奇妙夜\vagus-editions-2026\skills\vagus-editions-art-direction').resolve()
library = Path(r'D:\AI-Data\Shared\skills').resolve(strict=True)
target = library / 'vagus-editions-art-direction'
assert target.parent == library
assert source.name == target.name
assert not target.exists(), 'Existing skill must be reviewed rather than overwritten'
manifest = (source / 'SKILL.md').read_text(encoding='utf-8')
assert 'version: "1.1.0"' in manifest
files = sorted(p for p in source.rglob('*') if p.is_file())
assert len(files) == 9
assert all(p.suffix in {'.md', '.yaml'} for p in files), 'Instruction-only bundle expected'
shutil.copytree(source, target)
def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()
for p in files:
    assert digest(p) == digest(target / p.relative_to(source))
print(json.dumps({'installed': str(target), 'version': '1.1.0', 'verifiedFiles': len(files), 'unchangedOtherSkills': True}, ensure_ascii=False))
