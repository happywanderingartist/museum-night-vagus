import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('the current gray source, renders and audit are bound to the exact build inputs',async()=>{
 const manifest=await readFile(new URL('../evidence/gray/build-manifest.json',import.meta.url),'utf8').then(JSON.parse).catch(()=>null);
 assert.ok(manifest,'successful-build manifest is required');
 for(const entry of manifest.files){
  const bytes=await readFile(new URL('../'+entry.path,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,entry.path+' changed since the verified build');
 }
});
