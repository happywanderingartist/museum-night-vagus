// Source-art SVG diagnostic only; not a browser screenshot or performance test.
import {readFile,writeFile,mkdir} from 'node:fs/promises';import {createRequire} from 'node:module';
import {mountCharacterMotion} from '../character-motion.mjs';
import {profileKinds,characterProfile,patchMesh,patchVertex} from '../character-profiles.mjs';
import {triangleMatrix} from '../character-state.mjs';
const require=createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'),sharp=require('sharp'),root=new URL('../',import.meta.url);
await mkdir(new URL('evidence/character-art-03/',root),{recursive:true});
for(const kind of (process.argv[2]?[process.argv[2]]:profileKinds())){
 let svg;mountCharacterMotion({document:{createElementNS(){return svg={style:{},setAttribute(){},querySelector(){return null;},querySelectorAll(){return [];}};}},Image:class{}},{kind,image:{},layer:{append(){}}});
 const profile=characterProfile(kind),height=profile.height||941,texture=await sharp(await readFile(new URL('assets/'+kind+'.webp',root))).png().toBuffer();
 const patches=profile.parts.flatMap(part=>patchMesh(part).map(triangle=>({part,triangle})));
 for(const progress of [0,.5,1]){
  let inner=svg.innerHTML;patches.forEach(({part,triangle},i)=>{const m=triangleMatrix(triangle,triangle.map(p=>patchVertex(part,p,progress)));inner=inner.replace('<g data-patch-triangle="'+i+'">','<g data-patch-triangle="'+i+'" transform="matrix('+[m.a,m.b,m.c,m.d,m.e,m.f].join(' ')+')">');});
  let doc='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1672" height="'+height+'"><image href="assets/'+kind+'.webp" width="1672" height="'+height+'"/>'+inner+'</svg>';
  doc=doc.replaceAll('href="assets/'+kind+'.webp"','xlink:href="data:image/png;base64,'+texture.toString('base64')+'"').replaceAll('href="#','xlink:href="#');
  await writeFile(new URL('evidence/character-art-03/'+kind+'-'+progress+'.png',root),await sharp(Buffer.from(doc)).png().toBuffer());
 }console.log(kind+': source-art poses rendered');
}
