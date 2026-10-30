import {test} from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';
const api=await import('../server.cjs').catch(()=>({}));
test('both project pages, shared modules, and fixed-phone assets are publicly served',async()=>{
  assert.equal(typeof api.createServer,'function');const s=api.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const port=s.address().port;
  const read=p=>new Promise((resolve,reject)=>http.get({hostname:'127.0.0.1',port,path:p},r=>{r.resume();r.on('end',()=>resolve(r.statusCode));}).on('error',reject));
  try{for(const p of ['/','/start.html','/hug.html','/three-bridge.mjs','/hand-contact.mjs','/assets/gesture.glb'])assert.equal(await read(p),200,p);
    for(const p of ['/../README.md','/.git/config','/assets/%00','/node_modules/three/package.json'])assert.notEqual(await read(p),200,p);
  }finally{await new Promise(r=>s.close(r));}
});
