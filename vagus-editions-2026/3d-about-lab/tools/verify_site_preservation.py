"""Recheck the seven guarded site files against the recorded baseline."""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(sys.argv[1])
record = json.loads((ROOT / 'evidence/preservation.json').read_text(encoding='utf-8'))
results = []
for guard in record['guards']:
    path = ROOT.parent / guard['path']
    actual = hashlib.sha256(path.read_bytes()).hexdigest()
    results.append({'path': guard['path'], 'unchanged': actual == guard['sha256']})
assert all(item['unchanged'] for item in results), results
print(json.dumps({'scope': 'seven guarded site files', 'allUnchanged': True, 'files': len(results)}))
