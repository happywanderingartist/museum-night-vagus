const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createRequire}=require('node:module'),{execFileSync}=require('node:child_process');
const Zip=createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/artifact.cjs')('jszip');
const root=__dirname,name='vagus-editions-art-direction',src=path.join(root,'skills',name),version='3.1.1';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function walk(d){let out=[];for(const e of await fs.readdir(d,{withFileTypes:true})){assert(!e.isSymbolicLink());const p=path.join(d,e.name);if(e.isDirectory())out.push(...await walk(p));else out.push(p);}return out.sort();}
async function main(){
 const files=await walk(src),manifest={},zip=new Zip(),docs=[];
 assert.equal(files.length,20);
 const text=await fs.readFile(path.join(src,'SKILL.md'),'utf8');
 assert(text.includes('version: "3.1.1"'));assert(text.startsWith('---\nname: '+name+'\n'));
 for(const f of files){
  const rel=path.relative(src,f).replaceAll('\\','/'),b=await fs.readFile(f);manifest[rel]=hash(b);zip.file(name+'/'+rel,b);
  if(/\.(mjs|cjs)$/.test(rel))execFileSync(process.execPath,['--check',f]);
  if(!rel.endsWith('.md'))continue;
  const content=b.toString();
  for(const m of content.matchAll(/\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(m[1]))continue;
   const dest=path.resolve(path.dirname(f),m[1]);assert(dest.startsWith(src+path.sep));await fs.access(dest);
  }
  docs.push({rel,anchor:path.basename(rel,'.md'),content:content.replace(/^---\n[\s\S]*?\n---\n/,'').replace(/\]\((?:references\/)?([a-z-]+)\.md\)/g,'](#$1)').replace(/\[([^\]]+)\]\(\.\.\/(?:assets|scripts)\/[^)]+\)/g,'$1（技能ZIP内文件）')});
 }
 const html=await fs.readFile(path.join(src,'assets','scene-fixture.html'),'utf8');
 // Parse the actual inline fixture module, not only the standalone runtime.
 for(const m of html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g))
  execFileSync(process.execPath,['--input-type=module','--check'],{input:m[1]});
 const testOutput=execFileSync(process.execPath,['--test',path.join(src,'scripts','test-runtime.mjs')],{encoding:'utf8'});
 docs.sort((a,b)=>a.rel==='SKILL.md'?-1:b.rel==='SKILL.md'?1:a.rel.localeCompare(b.rel));
 const md='# Vagus Skill 3.1.1\n\n已修正滚动进度、共享画布和覆盖余量；浏览器实测待恢复连接。运行资源见同版本ZIP。\n\n'+docs.map(d=>'<a id="'+d.anchor+'"></a>\n\n'+d.content.trim()).join('\n\n---\n\n')+'\n';
 await fs.writeFile(path.join(root,'Vagus-Skill-v3.1.1.md'),md);
 const b=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}),check=await Zip.loadAsync(b,{checkCRC32:true});
 for(const [rel,h]of Object.entries(manifest))assert.equal(hash(await check.file(name+'/'+rel).async('nodebuffer')),h);
 await fs.writeFile(path.join(root,name+'-v3.1.1.zip'),b);
 const report={version,files:manifest,archiveSha256:hash(b),checks:{fileCount:files.length,internalLinks:'pass',moduleSyntax:'pass',runtimeTests:11,archiveCRCAndContents:'pass',browserRegression:'not run: Chrome debugger unattached',visualAcceptance:'not performed'},testOutput,baseline:{tests:11,passed:8,failed:3,failures:['short editorial progress','editorial reverse/tall progress','background coverage at p=.31 H=320, bottom=319.52']},limits:['Numeric CSS geometry checks are not browser layout acceptance.','Full-width art mapping changed and browser test added, but not executed in browser.','No homepage or project content invented; complete original plan is unavailable from bounded thread API.']};
 await fs.writeFile(path.join(root,'validation-v3.1.1.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({version,checks:report.checks,archiveSha256:report.archiveSha256},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
