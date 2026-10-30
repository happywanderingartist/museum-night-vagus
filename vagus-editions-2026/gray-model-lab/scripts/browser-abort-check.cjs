const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const context=await chromium.launchPersistentContext(fs.mkdtempSync(path.resolve(root,'../toolchain/chrome-gray-abort-')),{channel:'chrome',headless:true,args:['--disable-background-networking','--disable-component-update','--disable-sync']});
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 let held;
 try{
  const page=await context.newPage();await page.goto('http://127.0.0.1:4180',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.body.dataset.ready==='true');
  await page.route('**/thinker-gray.glb?pending=gray',r=>{held=r;});
  const result=await page.evaluate(async()=>{
   const {GLTFLoader}=await import('./vendor/three/addons/loaders/GLTFLoader.js'),{createStage}=await import('./stage.mjs'),load=GLTFLoader.prototype.loadAsync;
   GLTFLoader.prototype.loadAsync=function(url){return load.call(this,url+'?pending=gray');};
   const canvas=document.createElement('canvas'),remove=canvas.removeEventListener,removed=[];
   canvas.removeEventListener=function(type,...args){removed.push(type);return remove.call(this,type,...args);};
   const controller=new AbortController();createStage(canvas,{signal:controller.signal}).catch(()=>{});
   await new Promise(resolve=>setTimeout(resolve,120));controller.abort();GLTFLoader.prototype.loadAsync=load;
   return {rendererListenersRemoved:removed.includes('webglcontextlost'),signalAborted:controller.signal.aborted};
  });
  if(held)await held.abort();assert.equal(result.signalAborted,true);assert.equal(result.rendererListenersRemoved,true,'pending stage renderer survives cancellation');
  fs.writeFileSync(path.join(root,'evidence/browser-abort-results.json'),JSON.stringify({passed:true,result},null,2));console.log(JSON.stringify({passed:true,result}));
 }finally{if(held)try{await held.abort();}catch{}await context.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
