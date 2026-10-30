const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),base=path.dirname(root),out=path.join(root,'evidence');
(async()=>{
 const context=await chromium.launchPersistentContext(fs.mkdtempSync(path.join(base,'toolchain/chrome-gray-review-')),{channel:'chrome',headless:true,viewport:{width:1440,height:1000},args:['--disable-background-networking','--disable-component-update','--disable-sync']});
 await context.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname==='127.0.0.1'||['blob:','data:'].includes(u.protocol)?r.continue():r.abort();});
 const page=await context.newPage(),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4180',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.body.dataset.ready==='true',undefined,{timeout:20000});
  await page.selectOption('#frame','0');await page.waitForFunction(()=>document.querySelector('#status').textContent==='逐帧检查 · 0秒');
  const hideCaption=await page.addStyleTag({content:'.stage-caption{visibility:hidden}'});await page.locator('#stage').screenshot({path:path.join(root,'assets/gray-poster.png')});await hideCaption.evaluate(el=>el.remove());await page.selectOption('#frame','live');
  assert.equal(await page.locator('#stage').isVisible(),true);await page.screenshot({path:path.join(out,'browser-overview.png')});checks.push('actual GLB loads in default back view');
  await page.selectOption('#view','close');
  for(const t of ['0','1','2.6','5.5','8']){await page.selectOption('#frame',t);await page.waitForFunction(v=>document.querySelector('#status').textContent.includes('逐帧检查 · '+v+'秒'),t);await page.locator('.stage-wrap').screenshot({path:path.join(out,'frame-'+t.replace('.','_')+'.png')});}checks.push('five explicit keyframe screenshots');
  await page.selectOption('#view','contact');assert.equal(await page.locator('#contact-note').isVisible(),true);await page.locator('.stage-wrap').screenshot({path:path.join(out,'contact-audit-view.png')});checks.push('contact side explicitly labelled audit only');
  await page.selectOption('#view','composition');assert.equal(await page.locator('#contact-note').isVisible(),false);await page.selectOption('#frame','live');
  await page.locator('#toggle').click();await page.waitForFunction(()=>document.querySelector('#status').textContent==='动作已暂停');const before=await page.locator('#clock').textContent();await page.waitForTimeout(600);assert.equal(await page.locator('#clock').textContent(),before);await page.locator('#toggle').click();checks.push('pause freezes actual visible clock');
  const video=await page.evaluate(async()=>{
   const source=document.querySelector('#stage'),capture=document.createElement('canvas');capture.width=1280;capture.height=800;const ctx=capture.getContext('2d'),stream=capture.captureStream(30),recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9'}),chunks=[],phases=new Set();
   recorder.ondataavailable=e=>chunks.push(e.data);const done=new Promise(resolve=>recorder.onstop=resolve);let id;
   function draw(){ctx.drawImage(source,0,0,1280,800);phases.add(document.querySelector('#status').textContent);id=requestAnimationFrame(draw);}draw();recorder.start();await new Promise(resolve=>setTimeout(resolve,7800));recorder.stop();await done;cancelAnimationFrame(id);stream.getTracks().forEach(t=>t.stop());return {bytes:Array.from(new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer())),phases:[...phases]};
  });
  fs.writeFileSync(path.join(out,'gray-live-cycle.webm'),Buffer.from(video.bytes));assert.ok(video.phases.some(p=>p.includes('停两秒'))&&video.phases.some(p=>p.includes('五秒一段')));checks.push('7.8-second real recording includes swipe and hold');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#toggle').disabled&&document.querySelector('#frame').disabled&&document.querySelector('#status').textContent.includes('系统已减少动态'));checks.push('system reduced motion overrides controls');
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'browser-390.png')});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);checks.push('narrow layout has no horizontal overflow');
  const failPage=await context.newPage();await failPage.route('**/assets/thinker-gray.glb',r=>r.abort());await failPage.goto('http://127.0.0.1:4180',{waitUntil:'networkidle'});await failPage.waitForFunction(()=>document.querySelector('#status').textContent.includes('保留灰模静帧'));
  assert.equal(await failPage.locator('#poster').isVisible(),true);assert.equal(await failPage.locator('#toggle').isDisabled(),true);await failPage.emulateMedia({reducedMotion:'reduce'});await failPage.waitForFunction(()=>document.querySelector('#toggle').textContent==='系统已减少动态');await failPage.emulateMedia({reducedMotion:'no-preference'});await failPage.waitForFunction(()=>document.querySelector('#toggle').textContent==='暂停动作');assert.equal(await failPage.locator('#toggle').isDisabled(),true);checks.push('failed model preserves poster and disabled controls after preference changes');
  const lossPage=await context.newPage();await lossPage.goto('http://127.0.0.1:4180',{waitUntil:'networkidle'});await lossPage.waitForFunction(()=>document.body.dataset.ready==='true');
  assert.equal(await lossPage.locator('#stage').evaluate(el=>{const ext=el.getContext('webgl2')?.getExtension('WEBGL_lose_context');if(!ext)return false;ext.loseContext();return true;}),true);
  await lossPage.waitForFunction(()=>document.querySelector('#stage').hidden,undefined,{timeout:5000});assert.equal(await lossPage.locator('#poster').isVisible(),true);assert.equal(await lossPage.locator('#toggle').isDisabled(),true);checks.push('actual WebGL context loss restores static poster');
  assert.deepEqual(errors,[]);checks.push('no unexpected page errors');
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({mode:'isolated installed Google Chrome, no personal profile',passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks}));
 }catch(e){await page.screenshot({path:path.join(out,'failure-state.png')});fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({passed:false,checks,errors,failure:e.message},null,2));throw e;}
 finally{await context.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
