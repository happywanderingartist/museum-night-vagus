import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
test('main entry uses the existing eye and globe scene with independent controller ownership',async()=>{
  const html=await fs.readFile(root+'/index.html','utf8');
  assert.match(html,/id="reflection-window"/);
  assert.match(html,/src="gallery-entry.mjs"/);
  assert.doesNotMatch(html,/src="chapter-motion.mjs/);
  assert.match(await fs.readFile(root+'/exhibition.html','utf8'),/id="ai-reading"/);
});
for(const key of ['start','hug'])test(key+' shows phone-proportioned native controls and a top-level comparison entry',async()=>{
  const html=await fs.readFile(root+'/'+key+'.html','utf8');
  const header=html.match(/<header[\s\S]*?<\/header>/)?.[0];
  assert.match(header,new RegExp(key+'-compare.html'));
  assert.match(html,/class="product-overview"/);
  assert.match(html,new RegExp('data-product-demo="'+key+'"'));
  assert.match(html,/class="phone-tabs"/);
  assert.match(html,/data-demo-action/);
  assert.doesNotMatch(html,/<img[^>]+(?:start-search|hug-returned)/);
  assert.match(html,/合成/);
});
test('directory has explicit comparison routes without nested interactive links',async()=>{
  const html=await fs.readFile(root+'/works.html','utf8');
  assert.match(html,/aria-label="产品竞品分析"/);
  assert.match(html,/start-compare.html/);
  assert.match(html,/hug-compare.html/);
});
