const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),results=[];
(async()=>{
 const profile=fs.mkdtempSync(path.resolve(root,'../toolchain/chrome-mobile-failure-'));
 const context=await chromium.launchPersistentContext(profile,{channel:'chrome',headless:true,viewport:{width:390,height:844},args:['--disable-background-networking','--disable-component-update','--disable-sync']});
 await context.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname==='127.0.0.1'||['data:','blob:'].includes(u.protocol)?r.continue():r.abort();});
 async function assertFallback(page){
  assert.equal(await page.locator('#thinker-stage').evaluate(el=>getComputedStyle(el).opacity),'0','failed mobile canvas must be invisible');
  assert.equal(await page.locator('.ai-scene>.scene-art').evaluate(el=>getComputedStyle(el).visibility),'visible');
  await page.getByRole('link',{name:'查看全部作品',exact:true}).click();assert.ok(page.url().endsWith('#ai-reading'));
 }
 try{
  const initial=await context.newPage();
  await initial.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).startsWith('webgl')?null:original.call(this,type,...args);};});
  await initial.goto('http://127.0.0.1:4179/index.html#ai',{waitUntil:'networkidle'});await assertFallback(initial);results.push('mobile initial WebGL creation failure hides canvas and retains link');await initial.close();
  const loss=await context.newPage();await loss.goto('http://127.0.0.1:4179/index.html#ai',{waitUntil:'networkidle'});
  await loss.locator('.ai-scene.has-three').waitFor({timeout:18000});
  assert.equal(await loss.locator('#thinker-stage').evaluate(el=>{const gl=el.getContext('webgl2'),ext=gl?.getExtension('WEBGL_lose_context');if(!ext)return false;ext.loseContext();return true;}),true);
  await loss.waitForFunction(()=>!document.querySelector('.ai-scene').classList.contains('has-three'));await assertFallback(loss);results.push('mobile context loss after successful render hides canvas and retains link');
  await loss.goto('http://127.0.0.1:4179/index.html#hug',{waitUntil:'networkidle'});
  const crops=await loss.locator('#hug .stage').evaluate(el=>[getComputedStyle(el.querySelector('.scene-art')).objectPosition,getComputedStyle(el.querySelector('.water-motion')).objectPosition]);
  assert.equal(crops[0],crops[1]);results.push('mobile Hug water and painting crops match');
  fs.writeFileSync(path.join(root,'evidence/browser-mobile-fallback-results.json'),JSON.stringify({mode:'isolated Google Chrome; simulated failures',passed:true,results},null,2));console.log(JSON.stringify({passed:true,results}));
 }finally{await context.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
