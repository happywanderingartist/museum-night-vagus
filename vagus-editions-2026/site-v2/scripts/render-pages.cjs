// Isolated local rendering only; never uses the user's Chrome profile or login.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),toolchain=path.resolve(root,'../toolchain');
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
if(!fs.existsSync(chrome))throw Error('Expected installed Google Chrome is absent; no browser fallback is selected.');
fs.mkdirSync(path.join(root,'evidence'),{recursive:true});
const batch=fs.mkdtempSync(path.join(toolchain,'chrome-local-render-'));
const pages=[['home','index.html'],['thinker','index.html#ai'],['start','start.html'],['hug','hug.html']];
const results=[];
for(const [name,page] of pages){
  const shot=path.join(root,'evidence',name+'-1440.png');
  const profile=path.join(batch,name);fs.mkdirSync(profile);
  const args=['--headless','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--disable-sync','--user-data-dir='+profile,'--disk-cache-dir='+path.join(profile,'cache'),'--window-size=1440,900','--virtual-time-budget=3000','--hide-scrollbars','--screenshot='+shot,'--dump-dom','http://127.0.0.1:4179/'+page];
  const r=cp.spawnSync(chrome,args,{windowsHide:true,encoding:'utf8',timeout:45000,maxBuffer:4*1024*1024});
  fs.writeFileSync(path.join(root,'evidence',name+'-render.log'),r.stderr||'');
  fs.writeFileSync(path.join(root,'evidence',name+'-rendered.html'),r.stdout||'');
  const item={name,page,exit:r.status,error:r.error?.code||null,screenshotBytes:fs.existsSync(shot)?fs.statSync(shot).size:0,renderedDocument:(r.stdout||'').includes('<html'),aiSceneClass:(r.stdout||'').match(/class="ai-scene[^\"]*"/)?.[0]||null};
  results.push(item);console.log(JSON.stringify(item));
}
fs.writeFileSync(path.join(root,'evidence','render-results.json'),JSON.stringify({mode:'isolated installed Google Chrome headless; not user-window interaction',width:1440,height:900,results},null,2));
if(results.some(r=>r.exit!==0||!r.screenshotBytes))process.exitCode=1;
