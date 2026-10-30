const {test}=require('node:test'),assert=require('node:assert/strict');
const {createServer}=require('../server.cjs');
test('review server is read-only, serves the model, and rejects source/traversal/control paths',async()=>{
 const s=createServer();await new Promise(resolve=>s.listen(0,'127.0.0.1',resolve));const address='http://127.0.0.1:'+s.address().port;
 try{
  for(const file of ['index.html','motion.mjs','assets/thinker-gray.glb','vendor/three/three.module.js'])assert.equal((await fetch(address+'/'+file)).status,200,file);
  for(const file of ['scripts/build-gray.py','progress.md','../progress.md','assets/%00model.glb'])assert.ok((await fetch(address+'/'+file)).status>=400,file);
  assert.equal((await fetch(address+'/',{method:'POST',body:'x'})).status,405);
 }finally{await new Promise(resolve=>s.close(resolve));}
});
