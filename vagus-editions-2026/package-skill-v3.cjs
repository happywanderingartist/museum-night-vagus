const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process'),{createRequire}=require('node:module');
const req=createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/artifact.cjs');
const Zip=req('jszip'),sharp=req('sharp'),root=__dirname,name='vagus-editions-art-direction',source=path.join(root,'skills',name);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function walk(d){let out=[];for(const e of await fs.readdir(d,{withFileTypes:true})){assert(!e.isSymbolicLink());const p=path.join(d,e.name);if(e.isDirectory())out.push(...await walk(p));else out.push(p);}return out.sort();}
async function main(){
 const files=await walk(source);assert.equal(files.length,19);
 const testOutput=execFileSync(process.execPath,['--test',path.join(source,'scripts','test-runtime.mjs')],{encoding:'utf8'});
 for(const f of files.filter(f=>/\.(mjs|cjs)$/.test(f)))execFileSync(process.execPath,['--check',f]);
 const main=await fs.readFile(path.join(source,'SKILL.md'),'utf8'),fm=main.match(/^---\n([\s\S]*?)\n---/);assert(fm);assert(fm[1].length<1024);
 let yamlCheck='basic field checks (not full parser)';
 try{const yaml=req('yaml');const data=yaml.parse(fm[1]);assert.equal(data.name,name);assert.equal(data.metadata.version,'3.0.0');yamlCheck='YAML parser + name/version assertions';}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;assert(main.includes('version: "3.0.0"'));}
 const manifest={},zip=new Zip(),docs=[];
 for(const f of files){
  const rel=path.relative(source,f).replaceAll('\\','/'),b=await fs.readFile(f);manifest[rel]=hash(b);zip.file(name+'/'+rel,b);
  if(!rel.endsWith('.md'))continue;
  const text=b.toString();
  for(const m of text.matchAll(/\]\(([^)]+)\)/g)){
   if(/^(https?:|#)/.test(m[1]))continue;
   const dest=path.resolve(path.dirname(f),m[1]);assert(dest.startsWith(source+path.sep));await fs.access(dest);
  }
  docs.push({rel,id:path.basename(rel,'.md'),text:text.replace(/^---\n[\s\S]*?\n---\n/,'').replace(/\]\((?:references\/)?([a-z-]+)\.md\)/g,'](#$1)')
  .replace(/\]\(\.\.\/(assets|scripts)\/([^)]*)\)/g,'](https://example.invalid/bundled-$1/$2)')});
 }
 docs.sort((a,b)=>a.rel==='SKILL.md'?-1:b.rel==='SKILL.md'?1:a.rel.localeCompare(b.rel));
 // Preserve source-file labels in the consolidated text; runnable files live in the ZIP.
 const consolidated='# Vagus Skill 3.0 · 效果重建完整规则\n\n实际运行时代码在同版本ZIP；本Markdown只承载规则，不能单独运行。文中“包内文件”标签指ZIP内容。\n\n'+docs.map(d=>'<a id="'+d.id+'"></a>\n\n'+d.text.replace(/\[([^\]]+)\]\(https:\/\/example\.invalid\/bundled-[^)]+\)/g,'$1（包内文件）').trim()).join('\n\n---\n\n')+'\n';
 await fs.writeFile(path.join(root,'Vagus-Effect-Reconstruction-v3.0.0.md'),consolidated);
 const packed=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}),round=await Zip.loadAsync(packed,{checkCRC32:true});
 const entries=Object.keys(round.files).filter(f=>!round.files[f].dir);assert.equal(entries.length,19);
 for(const f of entries)assert.equal(hash(await round.file(f).async('nodebuffer')),manifest[f.slice(name.length+1)]);
 const zipName=name+'-v3.0.0.zip';await fs.writeFile(path.join(root,zipName),packed);
 const evidence=path.join(root,'evidence','skill-v3');
 const tiles=[];for(const [i,p]of [0,50,100].entries()){tiles.push({input:await sharp(await fs.readFile(path.join(evidence,'final-'+p+'.png'))).resize(480,300,{fit:'contain',background:'#f4f2ec'}).toBuffer(),left:i*480,top:0});}
 await sharp({create:{width:1440,height:300,channels:3,background:'#f4f2ec'}}).composite(tiles).jpeg({quality:88}).toFile(path.join(evidence,'fixture-stages.jpg'));
 const report={version:'3.0.0',files:manifest,archiveSha256:hash(packed),checks:{metadata:yamlCheck,relativeLinks:'pass',syntax:'all bundled JS files pass',runtimeTests:8,archiveCRCAndContents:'pass',fileCount:19},testOutput,browserChecks:['Chrome 1440x900 deterministic start/mid/end/reverse sample','Native PageDown changes scene state','Hash links focus reading target','390x844 static mode: title/description visible, no horizontal overflow'],limits:['Not official Python validator.','No formal art assets: fixture is neutral geometry only.','No exact source-site timing or FPS claim.','Reduced-motion media preference, browser-back, unload leak checks and sustained performance not fully tested.','One baseline and one independent forward test; final refinements locally retested, not a broad trigger benchmark.']};
 await fs.writeFile(path.join(root,'validation-v3.json'),JSON.stringify(report,null,2)+'\n');
 const full=new Zip();
 for(const f of [zipName,'Vagus-Effect-Reconstruction-v3.0.0.md','SKILL-V3-DELIVERY.md','validation-v3.json'])full.file('Vagus-Skill-v3/'+f,await fs.readFile(path.join(root,f)));
 try{full.file('Vagus-Skill-v3/INSTALL-v3.json',await fs.readFile(path.join(root,'INSTALL-v3.json')));}catch(e){if(e.code!=='ENOENT')throw e;}
 for(const f of await walk(evidence))full.file('Vagus-Skill-v3/evidence/skill-v3/'+path.basename(f),await fs.readFile(f));
 const fullPacked=await full.generateAsync({type:'nodebuffer',compression:'DEFLATE'});await Zip.loadAsync(fullPacked,{checkCRC32:true});
 await fs.writeFile(path.join(root,'Vagus-Skill-and-Validation-v3.0.0.zip'),fullPacked);
 console.log(JSON.stringify({version:report.version,checks:report.checks,skillBytes:packed.length,deliveryBytes:fullPacked.length},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
