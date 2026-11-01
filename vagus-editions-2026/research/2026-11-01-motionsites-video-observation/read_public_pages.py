from html.parser import HTMLParser
from pathlib import Path

class VisibleText(HTMLParser):
    def __init__(self): super().__init__(); self.hidden=0; self.parts=[]
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'): self.hidden+=1
    def handle_endtag(self,tag):
        if tag in ('script','style'): self.hidden=max(0,self.hidden-1)
    def handle_data(self,data):
        if not self.hidden and data.strip(): self.parts.append(data.strip())

root=Path(__file__).parent
for src in (root/'source').glob('*detail.html'):
    p=VisibleText(); p.feed(src.read_text(encoding='utf-8'))
    text='\n'.join(p.parts)
    (root/'source'/f'{src.stem}-public.txt').write_text(text,encoding='utf-8')
    print(src.stem,text[:9500].encode('ascii',errors='backslashreplace').decode())
