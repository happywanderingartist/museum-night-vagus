// Deterministic UI-layout rendering; never edits or overwrites the generated artwork.
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const req=createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/artifact.cjs');
const sharp=req('sharp'),Zip=req('jszip'),root=__dirname;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const svg=(body)=>`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1600" height="900" viewBox="0 0 1600 900">${body}</svg>`;
const text=(x,y,size,content,more='')=>`<text x="${x}" y="${y}" font-size="${size}" ${more}>${content}</text>`;
async function main(){
 const homeUI=`<defs><radialGradient id="brand-wash" gradientUnits="userSpaceOnUse" cx="160" cy="180" r="380"><stop offset="0" stop-color="#e8ece5" stop-opacity=".58"/><stop offset=".4" stop-color="#e8ece5" stop-opacity=".5"/><stop offset=".7" stop-color="#e8ece5" stop-opacity=".2"/><stop offset="1" stop-color="#e8ece5" stop-opacity="0"/></radialGradient></defs>
 <rect x="0" y="0" width="600" height="600" fill="url(#brand-wash)"/>
 <g fill="#17231b" font-family="Microsoft YaHei, sans-serif">
 ${text(80,124,88,'Vagus','font-family="Georgia, serif" letter-spacing="-5"')}
 ${text(80,178,20,'让好奇心成为方法，')}${text(80,213,20,'让想象力成为作品。')}
 ${text(80,252,16,'Curiosity as a method.','font-family="Georgia, serif"')}${text(80,276,16,'Imagination made real.','font-family="Georgia, serif"')}
 <path d="M1180 207h270q17 0 17 17v28q0 17-17 17h-270l-14 12v-57q0-17 14-17z" fill="#edf0ed" stroke="#58635b"/>
 ${text(1187,245,16,'咋的，没看过名画上班吗？')}
 <rect x="272" y="704" width="1056" height="164" fill="#e8ece5" stroke="#647267"/>
 ${text(304,738,24,'Hello，我是 Vagus。','font-family="Georgia, Microsoft YaHei, sans-serif"')}
 ${text(304,768,16,'欢迎来到我的网站，这里记录了我在艺术、设计与 AI 之间的游走与探索。')}
 ${text(304,795,16,'你愿意和我一起开启这场博物馆奇妙夜吗？')}
 ${text(304,842,16,'速览作品')}
 <rect x="702" y="812" width="196" height="43" fill="#344b3d"/>
 ${text(736,840,16,'接受邀请　↗','fill="#f0f3ed"')}
 ${text(1228,842,16,'看看简历','text-anchor="end"')}
 </g>`;
 const aiUI=`<g fill="#243548" font-family="Microsoft YaHei, sans-serif">
 ${text(80,81,48,'Vagus','font-family="Georgia, serif" letter-spacing="-3"')}
 ${text(270,72,14,'回到首页')}
 <g fill="#f1f3ed">${text(1280,72,14,'速览作品')}${text(1394,72,14,'看看简历')}</g>
 ${text(80,265,96,'AI行业观察','font-family="SimSun, serif" letter-spacing="-4"')}
 ${text(80,328,17,'在技术快速变化的时代，我更关心 AI 如何进入真实生活，')}
 ${text(80,361,17,'以及它如何改变人们的创作、工作与表达方式。')}
 ${text(80,455,30,'SeedRealtime','font-family="Georgia, serif"')}${text(300,455,20,'↗')}
 ${text(80,525,30,'Vibe Coding','font-family="Georgia, serif"')}${text(282,525,20,'↗')}
 ${text(80,595,28,'AI产品榜与热门精选')}${text(360,595,20,'↗')}
 ${text(80,684,15,'查看全部作品　→')}
 </g>`;
 const entries=[['home','mona-master.png',homeUI],['ai','thinker-master.png',aiUI]],files={};
 for(const[name,imageName,ui]of entries){
  const imagePath=path.join(root,'assets',imageName),bytes=await fs.readFile(imagePath),meta=await sharp(bytes).metadata();
  assert(meta.width>=1500&&meta.height>=800,'Unexpectedly small artwork');
  const before=hash(bytes),layer=svg(ui),composite=svg(`<image width="1600" height="900" preserveAspectRatio="xMidYMid slice" xlink:href="data:image/png;base64,${bytes.toString('base64')}"/>${ui}`);
  await fs.writeFile(path.join(root,name+'-ui.svg'),layer);
  await fs.writeFile(path.join(root,name+'-layout.svg'),composite);
  await sharp(Buffer.from(composite)).png().toFile(path.join(root,name+'-preview.png'));
  assert.equal(hash(await fs.readFile(imagePath)),before,'Raw artwork was modified by UI export');
  files[imageName]={width:meta.width,height:meta.height,sha256:before};
 }
 // Local integrity checks, not browser behavior or visual acceptance.
 for(const file of ['index.html','ai-observations.html']){
  const html=await fs.readFile(path.join(root,file),'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,'Duplicate HTML ids');
  for(const m of html.matchAll(/(?:src|href)="([^"#]+)(?:#[^"]*)?"/g)){
   const dest=m[1];assert(!/^https?:/.test(dest),'Unexpected external dependency');
   await fs.access(path.join(root,dest));
  }
 }
 const manifest={type:'visual-trial',render:'SVG UI layout exports, not browser screenshots',files,checks:{rawArtUnchangedByComposition:true,localReferences:true,uniqueHtmlIds:true,previewDimensions:'1600x900',browser:'not tested',nativeMotion:'not implemented',rights:'AI-generated reinterpretations, not source artwork reproductions; no third-party site assets reused'},limitations:['Not a reconstruction of the previously approved Mona Lisa image, which was not supplied.','No independent eye/face/subject layers or clean background for parallax.','No verified article URLs, resume file or real project screenshots included.','HTML dialogs and responsive behavior require browser testing.']};
 await fs.writeFile(path.join(root,'validation.json'),JSON.stringify(manifest,null,2)+'\n');
 const zip=new Zip();
 const include=['index.html','ai-observations.html','trial.css','trial.js','home-ui.svg','ai-ui.svg','home-layout.svg','ai-layout.svg','home-preview.png','ai-preview.png','DESIGN.md','REVIEW.md','PROMPTS.json','VAGUS-v5.3-source.md','validation.json','assets/mona-master.png','assets/thinker-master.png'];
 for(const file of include)zip.file('Vagus-two-pages-v1/'+file,await fs.readFile(path.join(root,file)));
 const packed=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}),loaded=await Zip.loadAsync(packed,{checkCRC32:true});
 assert.equal(Object.keys(loaded.files).filter(k=>!loaded.files[k].dir).length,include.length);
 await fs.writeFile(path.join(root,'Vagus-two-pages-v1.zip'),packed);
 console.log(JSON.stringify({checks:manifest.checks,files:include.length,zipBytes:packed.length},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1});
