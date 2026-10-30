"""Build a card-only texture from the source painting's unobstructed paper.

The original source image is never altered. A low-order color fit replaces
painted fingers only in this derived 3D card texture, so a side view cannot
show skin pixels printed onto the card.
"""
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(sys.argv[1])
OUT = ROOT / 'evidence/card-layer-01'
OUT.mkdir(parents=True, exist_ok=True)
source = np.asarray(Image.open(ROOT / 'sources/about/reference.png').convert('RGB')).copy()
quad = Image.new('L', (source.shape[1], source.shape[0]))
ImageDraw.Draw(quad).polygon([(788,381),(929,352),(949,437),(810,467)], fill=255)
inside = np.asarray(quad) > 0
min_rgb = source.min(axis=2)
spread = source.max(axis=2) - min_rgb
valid = inside & (min_rgb > 190) & (spread < 42)
yy, xx = np.where(valid)
assert len(xx) > 9000, f'Insufficient clean paper: {len(xx)}'
fit = np.stack([np.ones_like(xx), (xx-865)/100, (yy-410)/100], axis=1)
coeff = np.linalg.lstsq(fit, source[valid].astype(float), rcond=None)[0]

y0,y1,x0,x1 = 340,480,780,960
grid_y,grid_x = np.mgrid[y0:y1,x0:x1]
grid = np.stack([np.ones(grid_x.size), ((grid_x-865)/100).ravel(), ((grid_y-410)/100).ravel()], axis=1)
paper = np.clip(grid @ coeff, 0, 255).reshape(y1-y0,x1-x0,3).astype(np.uint8)
source[y0:y1,x0:x1] = paper
Image.fromarray(source).save(OUT / 'card-texture-clean.png')
record = {'source': 'original card paper pixels only', 'samplePixels': int(len(xx)),
          'model': 'affine RGB gradient in image X/Y', 'originalSourceEdited': False,
          'use': 'card material only, never as a replacement for the painting'}
(OUT / 'texture-audit.json').write_text(json.dumps(record,indent=2),encoding='utf-8')
print(json.dumps(record))
