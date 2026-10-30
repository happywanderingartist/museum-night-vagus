const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const Zip=createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/artifact.cjs')('jszip');
const root=__dirname,target='D:/AI-Data/Shared/skills/vagus-editions-art-direction',source=path.join(root,'skills','vagus-editions-art-direction'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function walk(d){let a=[];for(const e of await fs.readdir(d,{withFileTypes:true})){assert(!e.isSymbolicLink());const p=path.join(d,e.name);if(e.isDirectory())a.push(...await walk(p));else a.push(p);}return a.sort();}
async function main(){
 assert.equal(path.resolve(target).toLowerCase(),'d:\\ai-data\\shared\\skills\\vagus-editions-art-direction');
 const manifest=JSON.parse(await fs.readFile(path.join(root,'validation-v3.json'),'utf8')).files;
 const main=await fs.readFile(path.join(target,'SKILL.md'),'utf8'),already=main.includes('version: "3.0.0"');assert(already||main.includes('version: "2.1.0"'));
 const old=await walk(target);assert.equal(old.length,already?19:12);
 const backup=path.join(root,'installed-v2.1.0-backup-before-v3.zip');
 if(!already){const z=new Zip();for(const f of old)z.file('vagus-editions-art-direction/'+path.relative(target,f).replaceAll('\\','/'),await fs.readFile(f));const b=await z.generateAsync({type:'nodebuffer',compression:'DEFLATE'});await Zip.loadAsync(b,{checkCRC32:true});await fs.writeFile(backup,b,{flag:'wx'});}else await fs.access(backup);
 for(const [rel,h]of Object.entries(manifest)){assert(!rel.includes('..')&&!path.isAbsolute(rel));const f=path.join(source,rel);assert.equal(hash(await fs.readFile(f)),h);await fs.mkdir(path.dirname(path.join(target,rel)),{recursive:true});await fs.copyFile(f,path.join(target,rel));}
 assert.equal((await walk(target)).length,19);for(const [rel,h]of Object.entries(manifest))assert.equal(hash(await fs.readFile(path.join(target,rel))),h);
 const result={version:'3.0.0',target,backup,verifiedFiles:19,hashComparison:'all equal',removedFiles:0,autoDiscoveryRefresh:'not independently verified'};
 await fs.writeFile(path.join(root,'INSTALL-v3.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
