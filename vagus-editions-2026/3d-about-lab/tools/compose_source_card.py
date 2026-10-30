"""Composite a 3D card only within source-art white pixels.

The original fingers, forearm, face, frame and wall remain untouched. This
proves front occlusion only; it cannot prove animation or arbitrary camera view.
"""
import hashlib
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(sys.argv[1])
OUT = ROOT / 'evidence' / 'card-layer-01'
source_path = ROOT / 'sources/about/reference.png'
source = Image.open(source_path).convert('RGBA')
render = Image.open(OUT / 'card-front-rgba.png').convert('RGBA')
assert render.size == source.size

quad = Image.new('L', source.size)
ImageDraw.Draw(quad).polygon([(788,381),(929,352),(949,437),(810,467)], fill=255)
src = source.load()
card = render.load()
within = quad.load()
result = source.copy()
dst = result.load()
masked = 0
for y in range(349, 470):
    for x in range(785, 952):
        if not within[x, y] or not card[x, y][3]:
            continue
        r,g,b,_ = src[x, y]
        # Restrict the replacement to visibly light, near-neutral paper.
        # Painted skin and its nails must win the foreground occlusion.
        if min(r,g,b) < 175 or max(r,g,b)-min(r,g,b) > 48:
            continue
        alpha = card[x, y][3] / 255
        dst[x, y] = tuple(round(src[x,y][i]*(1-alpha) + card[x,y][i]*alpha) for i in range(3)) + (255,)
        masked += 1

result.save(OUT / 'front-source-preserved.png')
record = {
    'status': 'static source-preserving card layer test; not a completed 3D hand or motion',
    'sourceSha256': hashlib.sha256(source_path.read_bytes()).hexdigest(),
    'whitePaperPixelsEligible': masked,
    'pixelsOutsideCardQuadChanged': 0,
    'frontLimit': 'Original painting remains behind the card, so card movement cannot be used until a clean underlay and hand matte exist.',
    'sideLimit': 'The card is 3D; the source person is not.',
}
(OUT / 'audit.json').write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(record, ensure_ascii=False))
