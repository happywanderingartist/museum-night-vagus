import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile,stat} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('every local page link and image resolves to a real file and a real anchor',async()=>{
  const documents=new Map();for(const name of ['index.html','start.html','hug.html'])documents.set(name,await readFile(path.join(root,name),'utf8'));
  let checked=0;
  for(const [name,html] of documents){
    const ownIds=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ownIds).size,ownIds.length,'duplicate anchor in '+name);
    for(const match of html.matchAll(/\b(?:href|src)="([^"#]*)(#[^"]*)?"/g)){
      const target=match[1]||name,hash=match[2]?.slice(1);if(/^[a-z]+:/i.test(target))continue;
      const full=path.resolve(root,target);assert.ok(full.startsWith(root+path.sep),'out-of-project link');assert.ok((await stat(full)).isFile(),name+' -> '+target);
      if(hash){const destination=documents.get(target)||await readFile(full,'utf8');assert.ok([...destination.matchAll(/\bid="([^"]+)"/g)].some(m=>m[1]===hash),name+' -> '+target+'#'+hash);}
      checked++;
    }
  }
  assert.ok(checked>65,'navigation graph was not actually traversed');
});
