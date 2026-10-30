const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {createRequire}=require('node:module');
const dep=createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/artifact.cjs');
const Zip=dep('jszip'),root=path.resolve(__dirname,'..');
(async()=>{
 const zip=new Zip();
 async function add(dir,prefix=''){
  for(const item of await fs.readdir(dir,{withFileTypes:true})){
   if(item.name.endsWith('.zip'))continue;
   const key=prefix+item.name,file=path.join(dir,item.name);
   if(item.isDirectory())await add(file,key+'/');else zip.file('Vagus-prototype-v1/'+key,await fs.readFile(file));
  }
 }
 await add(root);const data=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE',compressionOptions:{level:6}});
 const target=path.join(root,'Vagus-prototype-v1.zip');await fs.writeFile(target,data);
 const loaded=await Zip.loadAsync(data,{checkCRC32:true});
 console.log(JSON.stringify({file:target,files:Object.values(loaded.files).filter(x=>!x.dir).length,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex'),CRC:true}));
})().catch(e=>{console.error(e);process.exitCode=1;});
