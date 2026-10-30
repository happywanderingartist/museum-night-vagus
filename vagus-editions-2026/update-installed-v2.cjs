const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createRequire}=require('node:module');
const Zip=createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/artifact.cjs')('jszip');
const root=__dirname, target='D:/AI-Data/Shared/skills/vagus-editions-art-direction', source=path.join(root,'skills','vagus-editions-art-direction');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function walk(dir){let out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){assert(!e.isSymbolicLink());const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else out.push(p);}return out.sort();}
async function main(){
 assert.equal(path.resolve(target).toLowerCase(),'d:\\ai-data\\shared\\skills\\vagus-editions-art-direction');
 const manifest=JSON.parse(await fs.readFile(path.join(root,'validation-v2.json'),'utf8')).files;
 const old=await fs.readFile(path.join(target,'SKILL.md'),'utf8');
 const already=old.includes('version: "2.0.0"');
 assert(already||old.includes('version: "1.1.0"'),'Unexpected installed version; stop');
 const originals=await walk(target);assert.equal(originals.length,already?10:9);
 let backup=path.join(root,'installed-v1.1.0-backup-before-v2.zip');
 if(already)await fs.access(backup);
 if(!already){
  const z=new Zip();for(const f of originals)z.file('vagus-editions-art-direction/'+path.relative(target,f).replaceAll('\\','/'),await fs.readFile(f));
  const b=await z.generateAsync({type:'nodebuffer',compression:'DEFLATE'});await Zip.loadAsync(b,{checkCRC32:true});
  backup=path.join(root,'installed-v1.1.0-backup-before-v2.zip');
  await fs.writeFile(backup,b,{flag:'wx'});
 }
 for(const [rel,h]of Object.entries(manifest)){
  assert(!rel.includes('..')&&!path.isAbsolute(rel));
  const b=await fs.readFile(path.join(source,rel));assert.equal(sha(b),h);
  const dest=path.join(target,rel);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.copyFile(path.join(source,rel),dest);
 }
 const installed=await walk(target);assert.equal(installed.length,10);
 for(const [rel,h]of Object.entries(manifest))assert.equal(sha(await fs.readFile(path.join(target,rel))),h);
 const result={version:'2.0.0',target,backup,verifiedFileCount:10,sha256Comparison:'all equal',sessionRefresh:'not verified',removedFiles:0};
 await fs.writeFile(path.join(root,'INSTALL-v2.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
