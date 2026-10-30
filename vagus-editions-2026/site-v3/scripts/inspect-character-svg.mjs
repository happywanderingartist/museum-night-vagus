// Artwork-only SVG compositing diagnostic; no browser, DOM, web page or network.
import {readFile,writeFile,mkdir} from 'node:fs/promises';import {createRequire} from 'node:module';import {mountCharacterMotion} from '../character-motion.mjs';import {handMesh,handVertex,triangleMatrix} from '../character-state.mjs';
const require=createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/');const sharp=require('sharp');const root=new URL('../',import.meta.url);
await mkdir(new URL('evidence/character-art-check/',root),{recursive:true});
for(const kind of ['home','ai']){
 let svg;const w={document:{createElementNS(){svg={style:{},setAttribute(){},querySelector(){return null;},querySelectorAll(){return [];},remove(){}};return svg;}},Image:class{}};mountCharacterMotion(w,{kind,image:{},layer:{append(){}}});
 for(const progress of kind==='ai'?[0,.5,1]:[1]){
  let inner=svg.innerHTML;handMesh().forEach((triangle,i)=>{const m=triangleMatrix(triangle,triangle.map(p=>handVertex(p,progress)));inner=inner.replace('<g data-triangle="'+i+'">','<g data-triangle="'+i+'" transform="matrix('+[m.a,m.b,m.c,m.d,m.e,m.f].join(' ')+')">');});
  const asset=kind==='home'?'home.webp':'ai.webp',width=kind==='home'?1671:1672;let document='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+width+'" height="941" viewBox="0 0 '+width+' 941"><image href="assets/'+asset+'" width="'+width+'" height="941"/>'+inner+'</svg>';
  for(const match of [...document.matchAll(/href="(assets[^" ]+)"/g)]){const bytes=await sharp(await readFile(new URL(match[1],root))).png().toBuffer();document=document.replaceAll('href="'+match[1]+'"','xlink:href="data:image/png;base64,'+bytes.toString('base64')+'"');}
  document=document.replaceAll('href="#','xlink:href="#');
  const box=kind==='home'?{left:850,top:195,width:170,height:105}:{left:710,top:510,width:330,height:160};
  await writeFile(new URL('evidence/character-art-check/'+kind+'-'+progress+'.png',root),await sharp(Buffer.from(document)).extract(box).resize({width:990}).png().toBuffer());
 }
}
console.log('Artwork-only SVG composition diagnostics created; not website browser validation.');
