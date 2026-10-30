// Real Chrome resource lifecycle when the new clean-plate request fails.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const profile=fs.mkdtempSync(path.resolve(root,'../toolchain/chrome-cleanup-r3-'));
 const context=await chromium.launchPersistentContext(profile,{channel:'chrome',headless:true,args:['--disable-background-networking','--disable-component-update','--disable-sync']});
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 try{
  const page=await context.newPage();await page.goto('http://127.0.0.1:4179/index.html#ai',{waitUntil:'networkidle'});await page.locator('.ai-scene.has-three').waitFor();
  await page.route('**/assets/thinker-clean-plate-r3.png*',r=>r.abort());
  const result=await page.evaluate(async()=>{
   const THREE=await import('./vendor/three/three.module.js'),{createStage}=await import('./scene.mjs');
   THREE.Cache.clear();
   const original=THREE.TextureLoader.prototype.loadAsync,loaded=[],removed=[];
   THREE.TextureLoader.prototype.loadAsync=async function(...args){if(String(args[0]).endsWith('thinker-clean-plate-r3.png'))args[0]+='?failure=r3';const texture=await original.apply(this,args),entry={disposed:false};texture.addEventListener('dispose',()=>entry.disposed=true);loaded.push(entry);return texture;};
   const canvas=document.createElement('canvas'),nativeRemove=canvas.removeEventListener;
   canvas.removeEventListener=function(type,...args){removed.push(type);return nativeRemove.call(this,type,...args);};
   let rejected=false;try{await createStage(canvas);}catch{rejected=true;}finally{THREE.TextureLoader.prototype.loadAsync=original;}
   return {rejected,loaded:loaded.length,disposed:loaded.filter(x=>x.disposed).length,rendererListenerReleased:removed.includes('webglcontextlost')};
  });
  console.log(JSON.stringify(result));assert.equal(result.rejected,true);assert.equal(result.loaded,1);assert.equal(result.disposed,1,'loaded source texture leaked on clean-plate failure');assert.equal(result.rendererListenerReleased,true,'renderer lifecycle was not disposed');
  fs.writeFileSync(path.join(root,'evidence/browser-cleanup-r3.json'),JSON.stringify({passed:true,result},null,2));console.log(JSON.stringify({passed:true,result}));
 }finally{await context.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
