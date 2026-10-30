from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
image=Image.open(root/'sources/about/reference.png')
out=root/'evidence/layered-02'
out.mkdir(parents=True,exist_ok=True)
image.crop((650,300,1120,760)).save(out/'source-hand-crop.png')
