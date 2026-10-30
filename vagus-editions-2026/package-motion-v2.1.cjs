const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createRequire}=require('node:module');
const req=createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/artifact.cjs');
const Zip=req('jszip'),sharp=req('sharp');
const root=__dirname,name='vagus-editions-art-direction',src=path.join(root,'skills',name),version='2.1.0';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function walk(d){let a=[];for(const e of await fs.readdir(d,{withFileTypes:true})){assert(!e.isSymbolicLink());const p=path.join(d,e.name);if(e.isDirectory())a.push(...await walk(p));else a.push(p);}return a.sort();}
async function main(){
 const evidence=path.join(root,'evidence','motion-2026-10-23');
 const montage=['shopify-02-sidekick-anchor.jpg','shopify-03-sidekick-reading.jpg','shopify-04-content.jpg'];
 const layers=[];
 for(let i=0;i<3;i++){
  const b=await sharp(await fs.readFile(path.join(evidence,montage[i]))).resize(480,230,{fit:'contain',background:'#eeece6'}).toBuffer();
  layers.push({input:b,left:i*480,top:32});
 }
 const labels='<svg width="1440" height="32"><rect width="1440" height="32" fill="#eeece6"/><g font-family="Arial" font-size="17" fill="#242421"><text x="12" y="23">A - Chapter</text><text x="492" y="23">B - Image to explanation</text><text x="972" y="23">C - Reading surface</text></g></svg>';
 layers.push({input:Buffer.from(labels),left:0,top:0});
 await sharp({create:{width:1440,height:262,channels:3,background:'#eeece6'}}).composite(layers).jpeg({quality:90}).toFile(path.join(evidence,'shopify-motion-strip.jpg'));
 const all=await walk(src);assert.equal(all.length,12);
 const zip=new Zip(),manifest={},docs=[];
 for(const f of all){
  const rel=path.relative(src,f).replaceAll('\\','/'),b=await fs.readFile(f);manifest[rel]=sha(b);zip.file(name+'/'+rel,b);
  if(!rel.endsWith('.md'))continue;
  const text=b.toString();
  for(const m of text.matchAll(/\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(m[1]))continue;
   const dest=path.resolve(path.dirname(f),m[1]);assert(dest.startsWith(src+path.sep));await fs.access(dest);
  }
  docs.push({rel,anchor:path.basename(rel,'.md'),text:text.replace(/^---\n[\s\S]*?\n---\n/,'').replace(/\]\((?:references\/)?([a-z-]+)\.md\)/g,'](#$1)')});
 }
 const mainText=await fs.readFile(path.join(src,'SKILL.md'),'utf8');
 assert(mainText.includes('version: "2.1.0"'));assert(mainText.startsWith('---\nname: '+name+'\n'));
 docs.sort((a,b)=>a.rel==='SKILL.md'?-1:b.rel==='SKILL.md'?1:a.rel.localeCompare(b.rel));
 const md='# Vagus 艺术指导与网站动效 · Skill 2.1\n\n整合版参考文件；本机安装不会自动同步手机或云端。原站证据与 Vagus 待验证规格分别标记。\n\n'+docs.map(d=>'<a id="'+d.anchor+'"></a>\n\n'+d.text.trim()).join('\n\n---\n\n')+'\n';
 await fs.writeFile(path.join(root,'Vagus-Art-and-Motion-v2.1.0.md'),md);
 const packed=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}),reopened=await Zip.loadAsync(packed,{checkCRC32:true});
 const paths=Object.keys(reopened.files).filter(p=>!reopened.files[p].dir);assert.equal(paths.length,12);
 for(const p of paths)assert.equal(sha(await reopened.file(p).async('nodebuffer')),manifest[p.slice(name.length+1)]);
 const zipname=name+'-v2.1.0.zip';await fs.writeFile(path.join(root,zipname),packed);
 const report={version,files:manifest,archiveSha256:sha(packed),checks:{basicFrontmatter:'pass; not full YAML parser',relativeLinks:'pass',archiveCRCAndRoundtrip:'pass',fileCount:12},limits:['Official Python validator unavailable: PyYAML missing.','One baseline and one forward test; final text clarifications not independently rerun.','No website implementation, continuous video or performance validation.']};
 await fs.writeFile(path.join(root,'validation-v2.1.json'),JSON.stringify(report,null,2)+'\n');
 const full=new Zip();
 for(const p of [zipname,'Vagus-Art-and-Motion-v2.1.0.md','MOTION-ANALYSIS-2026-10-23.md','SKILL-TEST-v2.1.md','validation-v2.1.json']){
  full.file('Vagus-Motion-v2.1/'+p,await fs.readFile(path.join(root,p)));
 }
 try{full.file('Vagus-Motion-v2.1/INSTALL-v2.1.json',await fs.readFile(path.join(root,'INSTALL-v2.1.json')))}catch(e){if(e.code!=='ENOENT')throw e;}
 for(const f of await walk(evidence))full.file('Vagus-Motion-v2.1/evidence/motion-2026-10-23/'+path.basename(f),await fs.readFile(f));
 const fullBuffer=await full.generateAsync({type:'nodebuffer',compression:'DEFLATE'});await Zip.loadAsync(fullBuffer,{checkCRC32:true});
 await fs.writeFile(path.join(root,'Vagus-Motion-Research-v2.1.0.zip'),fullBuffer);
 console.log(JSON.stringify({version,checks:report.checks,skillBytes:packed.length,researchBytes:fullBuffer.length},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
