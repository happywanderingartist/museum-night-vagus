// Integration tests use only an isolated Chrome profile and this local site.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const profile=fs.mkdtempSync(path.resolve(root,'../toolchain/chrome-integration-'));
 const context=await chromium.launchPersistentContext(profile,{channel:'chrome',headless:true,viewport:{width:1440,height:900},args:['--disable-background-networking','--disable-component-update','--disable-sync']});
 const page=await context.newPage(),errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/*',route=>{const u=new URL(route.request().url());return ['127.0.0.1','localhost'].includes(u.hostname)||['data:','blob:'].includes(u.protocol)?route.continue():route.abort();});
 async function shot(name){await page.screenshot({path:path.join(out,name),fullPage:false});}
 try{
  await page.goto('http://127.0.0.1:4179/index.html#ai',{waitUntil:'networkidle'});
  const diagnostic=await page.evaluate(()=>({y:scrollY,height:innerHeight,doc:document.documentElement.scrollHeight,ai:(()=>{const r=document.querySelector('#ai').getBoundingClientRect();return {top:r.top,height:r.height};})(),title:(()=>{const r=document.querySelector('#ai-title').getBoundingClientRect();return {top:r.top,height:r.height};})(),stage:document.querySelector('.ai-scene').className}));
  fs.writeFileSync(path.join(out,'ai-direct-diagnostic.json'),JSON.stringify(diagnostic,null,2));
  assert.ok(diagnostic.title.top>=0&&diagnostic.title.top<900,'direct AI link is outside viewport');
  await page.locator('.ai-scene.has-three').waitFor({timeout:18000});await shot('thinker-1440.png');results.push('AI direct hash, 3D scene ready');
  const lines=await page.locator('#ai-title').evaluate(el=>{const r=document.createRange();r.selectNodeContents(el);return Array.from(r.getClientRects()).length;});assert.equal(lines,1);results.push('AI title one line');
  await page.getByRole('link',{name:'查看全部作品',exact:true}).click();await page.locator('#ai-reading-title').waitFor({state:'visible'});assert.ok(page.url().endsWith('#ai-reading'));results.push('all AI works link');
  await page.locator('.project-detail-link[href="start.html"]').click();assert.ok(page.url().endsWith('/start.html'));await page.locator('#project-title').waitFor();await shot('start-1440.png');results.push('START project link');
  await page.locator('.case-read').click();assert.ok(page.url().endsWith('#project-intro'));await shot('start-reading-1440.png');results.push('START reading link');
  await page.locator('.project-switch a[href="hug.html"]').click();assert.ok(page.url().endsWith('/hug.html'));await page.locator('#project-title').waitFor();await shot('hug-1440.png');results.push('Hug next-project link');
  await page.getByRole('button',{name:'关闭动态',exact:true}).click();assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('motion-on')),false);results.push('motion switch');
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.water-motion').evaluate(el=>getComputedStyle(el).animationName),'none');results.push('actual reduced-motion CSS');
  await page.setViewportSize({width:390,height:844});await shot('hug-390.png');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);results.push('Hug narrow layout no overflow');
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('http://127.0.0.1:4179/start.html',{waitUntil:'networkidle'});await shot('start-390.png');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);results.push('START narrow layout no overflow');
  await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:4179/index.html',{waitUntil:'networkidle'});await shot('home-1440.png');results.push('homepage retained');
  assert.deepEqual(errors,[]);results.push('no page errors');
 }catch(e){await shot('failure-state.png');fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({mode:'isolated Google Chrome; not user profile',results,errors,failure:e.message},null,2));throw e;}
 finally{await context.close();}
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({mode:'isolated Google Chrome; not user profile',results,errors,passed:true},null,2));console.log(JSON.stringify({passed:true,checks:results}));
})().catch(e=>{console.error(e);process.exitCode=1;});
