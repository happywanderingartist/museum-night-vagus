const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
(async()=>{
 const html=await fs.readFile(path.join(root,'index.html'),'utf8');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'duplicate anchors');
 const targets=[...html.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]);for(const target of targets)assert.ok(ids.includes(target),'missing anchor: '+target);
 const refs=[...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m=>m[1]);for(const ref of refs)await fs.access(path.join(root,ref));
 for(const name of ['app.js','state.js'])new vm.Script(await fs.readFile(path.join(root,name),'utf8'),{filename:name});
 const manifest=JSON.parse(await fs.readFile(path.join(root,'assets/manifest.json'),'utf8'));
 for(const item of manifest){assert.equal((await fs.stat(path.join(root,item.output))).size,item.bytes);assert.equal(crypto.createHash('sha256').update(await fs.readFile(path.join(root,item.source))).digest('hex'),item.sourceSHA256);}
 console.log(JSON.stringify({uniqueAnchors:ids.length,anchorLinks:targets.length,localFiles:refs.length,artSourcesPreserved:manifest.length,scriptSyntax:'pass'}));
})().catch(e=>{console.error(e);process.exitCode=1;});
