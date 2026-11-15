const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {createServer}=require('../server.cjs');
require('../assemble.cjs');
test('HTTP serves original assets and refuses workspace escape',async()=>{
 const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${s.address().port}`;
 try{
  const page=await fetch(base);assert.equal(page.status,200);const html=await page.text();
  assert.ok(html.indexOf('id="home"')<html.indexOf('id="ai"'),'static order is home then AI');
  assert.ok(!/scene-motion\.mjs|character-motion\.mjs|chapter-motion\.mjs/.test(html),'old controllers absent');
  for(const route of ['/preview.mjs','/world.mjs','/motion.mjs','/site-v4/assets/home.webp','/site-v4/assets/ai.webp','/site-v4/vendor/three.module.js','/site-v4/ai.html']) assert.equal((await fetch(base+route)).status,200,route);
  assert.equal((await fetch(base+'/site-v4/assets/ai.webp',{method:'HEAD'})).status,200);
  assert.equal((await fetch(base+'/.git/config')).status,404);
  assert.equal((await fetch(base+'/site-v4/%2e%2e%2fAGENTS.md')).status,404);
  assert.equal((await fetch(base+'/README.md')).status,404);
  assert.equal((await fetch(base,{method:'POST'})).status,405);
 }finally{await new Promise(r=>s.close(r));}
});
