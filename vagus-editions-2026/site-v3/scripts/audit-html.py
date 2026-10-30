from pathlib import Path
from html.parser import HTMLParser
import json
root=Path(__file__).resolve().parents[1]
void={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class Audit(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.stack=[];self.errors=[];self.ids=set();self.refs=[];self.h1=0;self.images=0;self.links=0;self.scripts=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='h1':self.h1+=1
  if tag=='img':
   self.images+=1
   if 'alt' not in a:self.errors.append('image without alt')
  if tag=='a' and a.get('href'):self.links+=1
  if a.get('id'):
   if a['id'] in self.ids:self.errors.append('duplicate id '+a['id'])
   self.ids.add(a['id'])
  for key in ['aria-labelledby','aria-describedby','aria-controls','for']:
   if a.get(key):self.refs.extend(a[key].split())
  if tag=='script' and a.get('src'):self.scripts.append(a['src'])
  if tag not in void:self.stack.append(tag)
 def handle_startendtag(self,tag,attrs):
  self.handle_starttag(tag,attrs)
  if tag not in void:self.handle_endtag(tag)
 def handle_endtag(self,tag):
  if tag in void:return
  if not self.stack or self.stack[-1]!=tag:self.errors.append('unbalanced close '+tag+' after '+str(self.stack[-3:]))
  if tag in self.stack:
   while self.stack:
    if self.stack.pop()==tag:break
reports=[]
for page in sorted(root.glob('*.html')):
 a=Audit();a.feed(page.read_text(encoding='utf8'));a.close()
 if a.stack:a.errors.append('unclosed '+str(a.stack))
 if a.h1!=1:a.errors.append('h1 count '+str(a.h1))
 a.errors.extend('missing aria/label target '+ref for ref in a.refs if ref not in a.ids)
 reports.append({'page':page.name,'h1':a.h1,'images':a.images,'links':a.links,'scripts':a.scripts,'errors':a.errors})
result={'kind':'offline HTML structure audit, not rendered-browser validation','pages':len(reports),'passed':all(not p['errors'] for p in reports),'reports':reports}
(root/'evidence/html-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(result,ensure_ascii=False))
if not result['passed']:raise SystemExit(1)
