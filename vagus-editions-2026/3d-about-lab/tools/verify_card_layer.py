"""Independent artifact checks for the static source-preserving card layer."""
import hashlib
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(sys.argv[1])
OUT = ROOT / 'evidence/card-layer-01'
reference = json.loads((ROOT / 'sources/about/reference.json').read_text(encoding='utf-8'))
source_path = ROOT / 'sources/about/reference.png'
assert hashlib.sha256(source_path.read_bytes()).hexdigest() == reference['sourceSha256']
source = np.asarray(Image.open(source_path).convert('RGB'))
result = np.asarray(Image.open(OUT / 'front-source-preserved.png').convert('RGB'))
assert source.shape == result.shape
quad = Image.new('L', (source.shape[1], source.shape[0]))
ImageDraw.Draw(quad).polygon([(788,381),(929,352),(949,437),(810,467)], fill=255)
inside = np.asarray(quad) > 0
diff = np.abs(source.astype('int16') - result.astype('int16'))
assert np.count_nonzero(diff[~inside]) == 0, 'Source painting changed outside card'
changed = int(np.count_nonzero(np.any(diff != 0, axis=2)))
assert changed > 5000, '3D card was not composited into the review image'
mean_delta = float(diff[inside].mean())
assert mean_delta < 25, f'Card differs too much from the original: {mean_delta:.1f}'

side = np.asarray(Image.open(OUT / 'card-side-rgba.png').convert('RGBA'))
opaque = side[:,:,3] > 245
assert opaque.sum() > 10000, 'Card is not visible from side'
side_rgb = side[:,:,:3][opaque]
dark = int((side_rgb.min(axis=1) < 150).sum())
assert dark == 0, f'Dark non-card pixels on card texture: {dark}'

report = {'sourceSha256Matched': True, 'outsideQuadChangedRgbValues': 0,
          'changedPixelsInsideQuad': changed, 'meanAbsoluteCardRgbDelta': round(mean_delta,2),
          'opaqueSidePixels': int(opaque.sum()), 'darkOpaqueSidePixels': dark,
          'visualAcceptance': 'not asserted; original hand and body are still flat art'}
print(json.dumps(report, ensure_ascii=False))
