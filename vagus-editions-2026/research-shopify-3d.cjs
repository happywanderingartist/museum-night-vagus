// Read-only reference study in an isolated installed Google Chrome.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=__dirname,out=path.join(base,'designs/shopify-3d-reference-2026-10-25');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const context=await chromium.launchPersistentContext(fs.mkdtempSync(path.join(base,'toolchain/chrome-shopify-study-')),{channel:'chrome',headless:true,viewport:{width:1440,height:900},args:['--disable-background-networking','--disable-component-update','--disable-sync']});
 // No account/profile access; only the public reference is navigated.
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('https://www.shopify.com/editions/winter2026',{waitUntil:'domcontentloaded',timeout:45000});await page.waitForTimeout(8000);
  await page.screenshot({path:path.join(out,'shopify-entry.png')});
  await page.goto('https://www.shopify.com/editions/winter2026#sidekick',{waitUntil:'domcontentloaded',timeout:45000});await page.waitForTimeout(15000);
  await page.screenshot({path:path.join(out,'shopify-sidekick.png')});
  await page.mouse.move(1250,700);await page.mouse.wheel(0,450);await page.waitForTimeout(1500);
  await page.screenshot({path:path.join(out,'shopify-sidekick-scroll.png')});
  fs.writeFileSync(path.join(out,'observation.json'),JSON.stringify({url:page.url(),mode:'isolated Chrome, discrete states; not timing/FPS measurements',title:await page.title(),errors},null,2));console.log('Reference screenshots saved; '+errors.length+' page errors. '+JSON.stringify(errors));
 }finally{await context.close();}
})().catch(e=>{fs.writeFileSync(path.join(out,'study-error.txt'),String(e));console.error(e);process.exitCode=1;});
