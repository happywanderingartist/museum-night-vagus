// Exact-content SVG UI composition, never modifies source artwork. Not browser screenshots.
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{createRequire}=require('node:module');
process.env.FONTCONFIG_FILE=path.join(__dirname,'fonts.conf');
const req=createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/artifact.cjs'),sharp=req('sharp'),Zip=req('jszip'),root=__dirname;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const svg=b=>`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1600" height="900" viewBox="0 0 1600 900">${b}</svg>`;
const t=(x,y,size,c,extra='')=>{extra=extra.replace('font-weight="700" letter-spacing="-4"','font-family="STXihei,DengXian,sans-serif" font-weight="400" letter-spacing="4"');return `<text x="${x}" y="${y}" ${extra.includes('font-family=')?'':'font-family="DengXian,sans-serif"'} font-size="${size}" ${extra}>${c}</text>`;};
const brand=(color)=>`<g fill="${color}" font-family="Microsoft YaHei,sans-serif">${t(80,86,56,'Vagus','font-family="Times New Roman,serif" letter-spacing="-3"')}${t(270,64,15,'让好奇心成为方法，让想象力成为作品。')}${t(270,88,12,'Curiosity as a method. Imagination made real.','opacity=".76"')}</g>`;
async function main(){
 async function rasterType(ui){
  for(const match of [...ui.matchAll(/<text ([^>]+)>([^<]*)<\/text>/g)]){
   const attrs=match[1],copy=match[2],x=Number(attrs.match(/\bx="([^"]+)"/)[1]),y=Number(attrs.match(/\by="([^"]+)"/)[1]),size=Number(attrs.match(/font-size="([^"]+)"/)[1]);
   const brandWord=copy==='Vagus'&&size===56,display=copy==='AI行业观察',file=brandWord?'times.ttf':display?'STXIHEI.TTF':'Dengl.ttf';
   const font=brandWord?'Times New Roman':display?'STXihei':'DengXian Light';
   const headerText=brandWord||copy.startsWith('让好奇心')||copy.startsWith('Curiosity');
   const color=ui.includes('#1c3029')&&headerText?'#1c3029':'#f1f0e8';
   const {data,info}=await sharp({text:{text:`<span foreground="${color}">${copy.replaceAll('&','&amp;')}</span>`,font:font+' '+size,fontfile:'C:/Windows/Fonts/'+file,rgba:true,dpi:72}}).png().toBuffer({resolveWithObject:true});
   // Pango fontfile explicitly loads the installed glyphs; UI SVG remains editable text.
   ui=ui.replace(match[0],`<image x="${x}" y="${y-info.height}" width="${info.width}" height="${info.height}" xlink:href="data:image/png;base64,${data.toString('base64')}"/>`);
  }return ui;
 }
 const fade='<defs><linearGradient id="fade" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#07130f" stop-opacity=".95"/><stop offset=".5" stop-color="#07130f" stop-opacity=".65"/><stop offset="1" stop-color="#07130f" stop-opacity="0"/></linearGradient><linearGradient id="choice"><stop stop-color="#c6d8c2" stop-opacity=".12"/><stop offset="1" stop-color="#c6d8c2" stop-opacity="0"/></linearGradient></defs><rect y="590" width="1600" height="310" fill="url(#fade)"/>';
 const choices=`<g fill="#f1f0e8" font-family="Microsoft YaHei,sans-serif">${t(1252,738,20,'速览作品')}<rect x="1222" y="756" width="250" height="48" fill="url(#choice)"/>${t(1228,788,18,'▸')}${t(1252,788,20,'接受邀请')}${t(1252,838,20,'看看简历')}</g>`;
 const homeUI=fade+brand('#1c3029')+`<g fill="#f1f0e8" font-family="Microsoft YaHei,sans-serif">${t(80,716,16,'Vagus','fill="#d8e2d3"')}${t(80,762,26,'Hello，我是 Vagus。')}${t(80,802,20,'欢迎来到我的网站，这里记录了我在艺术、设计与 AI 之间的游走与探索。')}${t(80,838,20,'你愿意和我一起开启这场博物馆奇妙夜吗？')}</g>`+choices;
 const openingUI=fade+brand('#1c3029')+`<g fill="#f1f0e8" font-family="Microsoft YaHei,sans-serif">${t(80,760,16,'蒙娜丽莎','fill="#d8e2d3"')}${t(80,805,24,'咋的，没看过名画上班吗？')}${t(80,846,13,'继续　▸')}</g>`+choices;
 const aiUI=brand('#f1f0e8')+`<g fill="#f1f0e8" font-family="Microsoft YaHei,sans-serif">${t(1200,72,14,'回到首页')}${t(1310,72,14,'速览作品')}${t(1420,72,14,'看看简历')}${t(80,302,96,'AI行业观察','font-weight="700" letter-spacing="-4"')}${t(80,369,17,'在技术快速变化的时代，我更关心 AI 如何进入真实生活，','fill="#d0dadb"')}${t(80,401,17,'以及它如何改变人们的创作、工作与表达方式。','fill="#d0dadb"')}${t(80,511,28,'SeedRealtime')}${t(80,578,28,'Vibe Coding')}${t(80,645,28,'AI产品榜与热门精选')}${t(80,729,14,'查看全部作品　→','fill="#c9d5d5"')}</g>`;
 const files={};
 for(const[name,img,ui]of[['home','mona-master.png',homeUI],['home-opening','mona-master.png',openingUI],['ai','thinker-master.png',aiUI]]){
  const p=path.join(root,'assets',img),bytes=await fs.readFile(p),before=hash(bytes),meta=await sharp(bytes).metadata();
  const typed=await rasterType(ui);
  const composite=svg(`<image width="1600" height="900" preserveAspectRatio="xMidYMid slice" xlink:href="data:image/png;base64,${bytes.toString('base64')}"/>${typed}`);
  await fs.writeFile(path.join(root,name+'-ui.svg'),svg(ui));await fs.writeFile(path.join(root,name+'-layout.svg'),composite);await sharp(Buffer.from(composite)).png().toFile(path.join(root,name+'-preview.png'));
  assert.equal(hash(await fs.readFile(p)),before);files[img]={width:meta.width,height:meta.height,sha256:before};
 }
 // V3 deliberately reinterprets colour; v1/v2 raw art remains archived, not overwritten.
 for(const file of ['index.html','ai-observations.html']){
  const html=await fs.readFile(path.join(root,file),'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  for(const m of html.matchAll(/(?:src|href)="([^"#]+)(?:#[^"]*)?"/g)){assert(!/^https?:/.test(m[1]));await fs.access(path.join(root,m[1]));}
 }
 const validation={version:4,render:'SVG UI composition, not browser screenshots; homepage preview shows second dialogue frame',files,checks:{homepageColourReinterpreted:true,rawArtUnchangedByUIExport:true,localReferences:true,uniqueHtmlIds:true,dialogueStateTests:'3 passed separately',browser:'not tested',responsive:'not browser tested',live3D:'not implemented'},limitations:['Thinker depth is pictorial. No separated subject/clean background/parallax assets.','Article URLs and resume file not supplied. Pending disclosure, not fake content.','V3 created locally; not uploaded to Canva or Open Design.','Open Design enabled but no callable MCP tools exposed in this session.']};
 await fs.writeFile(path.join(root,'validation.json'),JSON.stringify(validation,null,2)+'\n');
 const include=['index.html','ai-observations.html','trial.css','trial.js','dialogue-state.js','test-dialogue.cjs','export-review.cjs','home-ui.svg','home-layout.svg','home-preview.png','home-opening-ui.svg','home-opening-layout.svg','home-opening-preview.png','ai-ui.svg','ai-layout.svg','ai-preview.png','DESIGN.md','REVIEW.md','PROMPTS.json','VAGUS-v5.3-source.md','validation.json','assets/mona-master.png','assets/thinker-master.png'];
 const zip=new Zip();for(const f of include)zip.file('Vagus-two-pages-v4/'+f,await fs.readFile(path.join(root,f)));const bytes=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'});await Zip.loadAsync(bytes,{checkCRC32:true});await fs.writeFile(path.join(root,'Vagus-two-pages-v4.zip'),bytes);console.log(JSON.stringify({files:include.length,bytes:bytes.length,checks:validation.checks},null,2));
}main().catch(e=>{console.error(e);process.exitCode=1;});
