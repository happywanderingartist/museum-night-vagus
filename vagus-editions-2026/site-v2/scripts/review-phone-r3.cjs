// Actual local Chrome screenshots and a live canvas recording; not generated frames.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=path.resolve(__dirname,'../..'),out=path.join(base,'site-v2/evidence');
(async()=>{
 const context=await chromium.launchPersistentContext(fs.mkdtempSync(path.join(base,'toolchain/chrome-phone-r3-')),{channel:'chrome',headless:true,viewport:{width:1440,height:900},deviceScaleFactor:2,args:['--disable-background-networking','--disable-component-update','--disable-sync']});
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4178',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.body.dataset.boot==='ready');
  const clip=await page.locator('#stage').evaluate(el=>{const r=el.getBoundingClientRect(),scale=Math.min(16.72/r.width,9.41/r.height);return {x:r.x+r.width/2+(690-836)/100/scale,y:r.y+r.height/2+(480-470.5)/100/scale,width:410/100/scale,height:220/100/scale};});
  for(const value of ['0','1','2.6','5.5','8']){
   await page.selectOption('#review',value);await page.waitForFunction(v=>document.querySelector('#status').textContent.includes('逐帧检查 · '+v+' 秒'),value);
   await page.screenshot({path:path.join(out,'phone-r3-'+value.replace('.','_')+'.png'),clip});
  }
  await page.selectOption('#review','live');
  const video=await page.evaluate(async()=>{
   const source=document.querySelector('#stage'),r=source.getBoundingClientRect(),scale=Math.min(16.72/r.width,9.41/r.height),sx=source.width/r.width,sy=source.height/r.height;
   const x=r.width/2+(690-836)/100/scale,y=r.height/2+(480-470.5)/100/scale,w=410/100/scale,h=220/100/scale;
   const capture=document.createElement('canvas');capture.width=820;capture.height=440;const ctx=capture.getContext('2d');
   const stream=capture.captureStream(30),recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9'}),chunks=[];
   recorder.ondataavailable=e=>chunks.push(e.data);
   const done=new Promise(resolve=>recorder.onstop=resolve);let id;
   function frame(){ctx.drawImage(source,x*sx,y*sy,w*sx,h*sy,0,0,820,440);id=requestAnimationFrame(frame);}
   frame();recorder.start();await new Promise(resolve=>setTimeout(resolve,7600));recorder.stop();await done;cancelAnimationFrame(id);stream.getTracks().forEach(t=>t.stop());
   return Array.from(new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer()));
  });
  fs.writeFileSync(path.join(out,'phone-r3-live.webm'),Buffer.from(video));assert.deepEqual(errors,[]);
  console.log(JSON.stringify({frames:[0,1,2.6,5.5,8],recording:'7.6 seconds of live local Chrome canvas playback',bytes:video.length,errors}));
 }finally{await context.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
