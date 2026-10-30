const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const {createRequire}=require('node:module');
const dep=createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/artifact.cjs');
const sharp=dep('sharp');
const root=path.resolve(__dirname,'..'),base=path.dirname(root);
const sources={home:'trials/two-pages-v5/assets/mona-master.png',ai:'storyboards/batch-01/assets/thinker-master.png',start:'storyboards/batch-01/assets/start-master.png',hug:'storyboards/batch-01/assets/hug-master.png'};
(async()=>{
 await fs.mkdir(path.join(root,'assets'),{recursive:true});
 const manifest=[];
 for(const [name,relative] of Object.entries(sources)){
  const source=path.join(base,relative),input=await fs.readFile(source);
  const output=path.join(root,'assets',name+'.webp');
  await sharp(input).webp({quality:88,effort:5}).toFile(output);
  const meta=await sharp(output).metadata();
  manifest.push({name,source:'../'+relative,sourceSHA256:crypto.createHash('sha256').update(input).digest('hex'),output:'assets/'+name+'.webp',bytes:(await fs.stat(output)).size,width:meta.width,height:meta.height,layers:'flattened painting; no independent character/depth',rights:'Existing user-requested generated trial artwork; not reference-site artwork. Publication rights review pending.'});
 }
 await fs.writeFile(path.join(root,'assets','manifest.json'),JSON.stringify(manifest,null,2));
 console.log(JSON.stringify({assets:manifest.length,bytes:manifest.reduce((a,b)=>a+b.bytes,0),sourcesUnchanged:true}));
})().catch(e=>{console.error(e);process.exitCode=1;});
