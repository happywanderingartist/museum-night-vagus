const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {createRequire}=require('node:module');
const req=createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/artifact.cjs');
const Zip=req('jszip');
const root=__dirname, name='vagus-editions-art-direction', source=path.join(root,'skills',name);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function files(dir) {
  let out=[];
  for(const e of await fs.readdir(dir,{withFileTypes:true})) {
    const p=path.join(dir,e.name);
    assert(!e.isSymbolicLink(),'Unexpected link');
    if(e.isDirectory())out.push(...await files(p));else out.push(p);
  }
  return out.sort();
}
async function main(){
 const entries=await files(source);assert.equal(entries.length,10);
 const mainText=await fs.readFile(path.join(source,'SKILL.md'),'utf8');
 assert(mainText.startsWith('---\nname: '+name+'\n'));assert(mainText.includes('version: "2.0.0"'));
 const install=new Zip(),manifest={};
 const docs=[];
 for(const f of entries){
  const rel=path.relative(source,f).replaceAll('\\','/'), b=await fs.readFile(f);
  manifest[rel]=hash(b);install.file(name+'/'+rel,b);
  if(rel.endsWith('.md')){
   const txt=b.toString();
   for(const m of txt.matchAll(/\]\(([^)]+)\)/g)){
    if(/^(https?:|#)/.test(m[1]))continue;
    const resolved=path.resolve(path.dirname(f),m[1]);
    assert(resolved.startsWith(source+path.sep));await fs.access(resolved);
   }
   const anchor=path.basename(rel,'.md');
   const clean=txt.replace(/^---\n[\s\S]*?\n---\n/,'')
     .replace(/\]\((?:references\/)?([a-z-]+)\.md\)/g,'](#$1)');
   docs.push({rel,anchor,clean});
  }
 }
 docs.sort((a,b)=>(a.rel==='SKILL.md'?-1:b.rel==='SKILL.md'?1:a.rel.localeCompare(b.rel)));
 const md='# Vagus 艺术指导 Skill 2.0 · 完整 Markdown\n\n本文件整合全部技能规则，供 ChatGPT 聊天／项目作为参考；不自动完成云端技能安装。\n\n'+docs.map(d=>'<a id="'+d.anchor+'"></a>\n\n'+d.clean.trim()).join('\n\n---\n\n')+'\n';
 await fs.writeFile(path.join(root,'Vagus-Art-Direction-v2.0.0.md'),md);
 const zip=await install.generateAsync({type:'nodebuffer',compression:'DEFLATE'});
 const reopened=await Zip.loadAsync(zip,{checkCRC32:true});
 const zipEntries=Object.keys(reopened.files).filter(n=>!reopened.files[n].dir);
 assert.equal(zipEntries.length,10);
 for(const n of zipEntries)assert.equal(hash(await reopened.file(n).async('nodebuffer')),manifest[n.slice(name.length+1)]);
 const zipName=name+'-v2.0.0.zip';await fs.writeFile(path.join(root,zipName),zip);
 const report={version:'2.0.0',generatedAt:new Date().toISOString(),files:manifest,archiveSha256:hash(zip),
 checks:{basicFrontmatter:'pass; not full YAML parser',relativeMarkdownLinks:'pass',fileCount:10,archiveCRCAndContentRoundtrip:'pass'},
 limits:['Official Python validator not run: PyYAML unavailable.','Only basic structure/link/archive checks; not proof of design quality.','No new visual generated; prior two drafts rejected.','Browser recovered usable sessions, intermittent timeout remains.','Independent behavior test reported separately; not user acceptance.']};
 await fs.writeFile(path.join(root,'validation-v2.json'),JSON.stringify(report,null,2)+'\n');
 const full=new Zip();
 for(const p of [zipName,'Vagus-Art-Direction-v2.0.0.md','VISUAL-STUDY-2026-10-23.md','BROWSER-RECOVERY-2026-10-23.md','validation-v2.json']){
  full.file('Vagus-Research-v2/'+p,await fs.readFile(path.join(root,p)));
 }
 for(const f of await files(path.join(root,'evidence','live-2026-10-23'))){
  full.file('Vagus-Research-v2/evidence/live-2026-10-23/'+path.basename(f),await fs.readFile(f));
 }
 for(const optional of ['SKILL-TEST-v2.md','INSTALL-v2.json']){
  try{full.file('Vagus-Research-v2/'+optional,await fs.readFile(path.join(root,optional)))}catch(e){if(e.code!=='ENOENT')throw e;}
 }
 const all=await full.generateAsync({type:'nodebuffer',compression:'DEFLATE'});
 await Zip.loadAsync(all,{checkCRC32:true});
 await fs.writeFile(path.join(root,'Vagus-Research-and-Skill-v2.0.0.zip'),all);
 console.log(JSON.stringify({version:report.version,checks:report.checks,installZipBytes:zip.length,researchZipBytes:all.length,archiveSha256:report.archiveSha256},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
