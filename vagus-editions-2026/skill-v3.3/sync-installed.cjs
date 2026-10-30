const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const base=__dirname,src=path.join(base,'vagus-editions-art-direction'),dst='D:/AI-Data/Shared/skills/vagus-editions-art-direction',backup=path.join(base,'installed-backup');
const allow=['SKILL.md','references/chapter-personality.md'];
async function main(){
 await fs.access(path.join(dst,'SKILL.md'));await fs.mkdir(backup,{recursive:false});
 const report=[];
 for(const rel of allow){const from=path.join(src,rel),to=path.join(dst,rel);const bytes=await fs.readFile(from);let prior=null;
 try{prior=await fs.readFile(to);await fs.mkdir(path.dirname(path.join(backup,rel)),{recursive:true});await fs.copyFile(to,path.join(backup,rel));}catch(e){if(e.code!=='ENOENT')throw e;}
 await fs.copyFile(from,to);const current=await fs.readFile(to);if(!current.equals(bytes))throw Error('Copy verification failed: '+rel);
 report.push({file:rel,priorExisted:!!prior,sha256:crypto.createHash('sha256').update(current).digest('hex')});
 }console.log(JSON.stringify({installed:dst,backup,report},null,2));
}main().catch(e=>{console.error(e);process.exitCode=1});
