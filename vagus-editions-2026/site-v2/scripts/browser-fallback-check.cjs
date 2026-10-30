// Local integration checks: isolated Chrome only, no account/profile access.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'evidence');
(async()=>{
 const profile=fs.mkdtempSync(path.resolve(root,'../toolchain/chrome-fallback-'));
 const context=await chromium.launchPersistentContext(profile,{channel:'chrome',headless:true,viewport:{width:1440,height:900},args:['--disable-background-networking','--disable-component-update','--disable-sync']});
 await context.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname==='127.0.0.1'||['data:','blob:'].includes(u.protocol)?r.continue():r.abort();});
 const page=await context.newPage(),results=[];
 try{
  await page.goto('http://127.0.0.1:4179/start.html',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('.ticket-route path').style.strokeDashoffset==='1');
  await page.evaluate(()=>scrollTo({top:450,behavior:'instant'}));
  await page.waitForFunction(()=>Number(document.querySelector('.ticket-route path').style.strokeDashoffset)<.5);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.waitForFunction(()=>document.querySelector('.ticket-route path').style.strokeDashoffset==='1');results.push('START route draws with real scroll and resets on reverse');
  await page.goto('http://127.0.0.1:4179/hug.html',{waitUntil:'networkidle'});
  const water=await page.locator('.water-motion').evaluate(el=>({duration:getComputedStyle(el).animationDuration,iterations:getComputedStyle(el).animationIterationCount,clip:getComputedStyle(el).clipPath}));
  assert.equal(water.duration,'1.6s');assert.equal(water.iterations,'1');assert.ok(water.clip.startsWith('polygon'));results.push('Hug water has localized clip and one 1.6-second pass');
  await page.evaluate(()=>scrollTo({top:1400,behavior:'instant'}));
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.water-motion')).animationPlayState==='paused');results.push('Hug water pauses offscreen');
  await page.route('**/scene.mjs',r=>r.abort());
  await page.goto('http://127.0.0.1:4179/index.html#ai',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.ai-scene').evaluate(el=>el.classList.contains('has-three')),false);
  assert.equal(await page.locator('.ai-scene>.scene-art').evaluate(el=>getComputedStyle(el).visibility),'visible');
  await page.getByRole('link',{name:'查看全部作品',exact:true}).click();assert.ok(page.url().endsWith('#ai-reading'));results.push('failed 3D module keeps poster and working HTML link');
  const staticContext=await context.browser().newContext({javaScriptEnabled:false,viewport:{width:1440,height:900}});
  try{
   const staticPage=await staticContext.newPage();
   for(const file of ['index.html','start.html','hug.html']){
    await staticPage.goto('http://127.0.0.1:4179/'+file,{waitUntil:'networkidle'});
    assert.equal(await staticPage.locator('h1').isVisible(),true);
    assert.ok(await staticPage.locator('a[href]').count()>3);results.push(file+' readable with JavaScript disabled');
   }
  }finally{await staticContext.close();}
  fs.writeFileSync(path.join(out,'browser-fallback-results.json'),JSON.stringify({mode:'isolated Google Chrome',passed:true,results},null,2));console.log(JSON.stringify({passed:true,results}));
 }finally{await context.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
