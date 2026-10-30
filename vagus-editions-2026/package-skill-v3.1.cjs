const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createRequire}=require('node:module'),{execFileSync}=require('node:child_process');
const Zip=createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/artifact.cjs')('jszip');
const root=__dirname,name='vagus-editions-art-direction',src=path.join(root,'skills',name),version='3.1.0';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function walk(d){let out=[];for(const e of await fs.readdir(d,{withFileTypes:true})){assert(!e.isSymbolicLink());const p=path.join(d,e.name);if(e.isDirectory())out.push(...await walk(p));else out.push(p);}return out.sort();}
async function main(){
 const files=await walk(src);assert.equal(files.length,20);
 const text=await fs.readFile(path.join(src,'SKILL.md'),'utf8'),fm=text.match(/^---\n([\s\S]*?)\n---/);assert(fm);assert(fm[1].length<1024);assert(text.includes('version: "3.1.0"'));assert(text.startsWith('---\nname: '+name+'\n'));
 const old=JSON.parse(await fs.readFile(path.join(root,'validation-v3.json'),'utf8')).files;
 const manifest={},zip=new Zip(),docs=[];
 for(const f of files){
  const rel=path.relative(src,f).replaceAll('\\','/'),b=await fs.readFile(f);manifest[rel]=hash(b);zip.file(name+'/'+rel,b);
  if(/\.(mjs|cjs)$/.test(rel)){assert.equal(manifest[rel],old[rel],'Runtime code should remain unchanged');execFileSync(process.execPath,['--check',f]);}
  if(!rel.endsWith('.md'))continue;
  const content=b.toString();
  for(const m of content.matchAll(/\]\(([^)]+)\)/g)){if(/^(https?:|#)/.test(m[1]))continue;const dest=path.resolve(path.dirname(f),m[1]);assert(dest.startsWith(src+path.sep));await fs.access(dest);}
  const clean=content.replace(/^---\n[\s\S]*?\n---\n/,'')
   .replace(/\]\((?:references\/)?([a-z-]+)\.md\)/g,'](#$1)')
   .replace(/\[([^\]]+)\]\(\.\.\/(?:assets|scripts)\/[^)]+\)/g,'$1（包内文件）');
  docs.push({rel,anchor:path.basename(rel,'.md'),content:clean});
 }
 docs.sort((a,b)=>a.rel==='SKILL.md'?-1:b.rel==='SKILL.md'?1:a.rel.localeCompare(b.rel));
 const md='# Vagus Skill 3.1 · 背景美术与网页效果重建\n\n完整规则整合；可运行资源在同版本技能ZIP。仅上传本Markdown不等于安装运行时或同步手机端。\n\n'+docs.map(d=>'<a id="'+d.anchor+'"></a>\n\n'+d.content.trim()).join('\n\n---\n\n')+'\n';
 await fs.writeFile(path.join(root,'Vagus-Background-and-Motion-v3.1.0.md'),md);
 const testOutput=execFileSync(process.execPath,['--test',path.join(src,'scripts','test-runtime.mjs')],{encoding:'utf8'});
 const b=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}),check=await Zip.loadAsync(b,{checkCRC32:true}),entries=Object.keys(check.files).filter(p=>!check.files[p].dir);assert.equal(entries.length,20);
 for(const p of entries)assert.equal(hash(await check.file(p).async('nodebuffer')),manifest[p.slice(name.length+1)]);
 const zipName=name+'-v3.1.0.zip';await fs.writeFile(path.join(root,zipName),b);
 const report={version,files:manifest,archiveSha256:hash(b),checks:{basicFrontmatter:'pass; not full YAML parser',internalLinks:'pass',runtimeCodeUnchanged:'all bundled JS hashes match v3',runtimeTests:8,archiveCRCAndContents:'pass',fileCount:20},testOutput,limits:['Background brief and recipe updated; no new image generated or visual acceptance.','Prior browser observations concern v3 mechanism fixture only; no new browser/performance claims.','Official Python validator not run; basic frontmatter/link checks used.','One baseline and one forward-use background test; not a broad statistical evaluation.']};
 await fs.writeFile(path.join(root,'validation-v3.1.json'),JSON.stringify(report,null,2)+'\n');
 const full=new Zip();for(const f of [zipName,'Vagus-Background-and-Motion-v3.1.0.md','validation-v3.1.json'])full.file('Vagus-Background-v3.1/'+f,await fs.readFile(path.join(root,f)));
 for(const f of ['SKILL-V3.1-DELIVERY.md','INSTALL-v3.1.json']){try{full.file('Vagus-Background-v3.1/'+f,await fs.readFile(path.join(root,f)));}catch(e){if(e.code!=='ENOENT')throw e;}}
 const all=await full.generateAsync({type:'nodebuffer',compression:'DEFLATE'});await Zip.loadAsync(all,{checkCRC32:true});await fs.writeFile(path.join(root,'Vagus-Background-Skill-v3.1.0.zip'),all);
 console.log(JSON.stringify({version,checks:report.checks,skillBytes:b.length,deliveryBytes:all.length},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
