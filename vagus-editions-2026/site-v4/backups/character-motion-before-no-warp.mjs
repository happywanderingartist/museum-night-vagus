import {swipeFrame,blinkOpacity,coverViewBox,handMesh,handVertex,triangleMatrix} from './character-state.mjs';
import {characterProfile,patchMesh,patchPose,patchVertex} from './character-profiles.mjs';
let serial=0;
const sourceImage=(href,attrs='',width=1672)=>`<image href="${href}" x="0" y="0" width="${width}" height="941" ${attrs}/>`;

// A raster pose is clipped at its real source coordinates; the phone is drawn last,
// from the unchanged original, and never receives an animation transform.
export function mountCharacterMotion(w,{kind,image,layer}){
 if(kind==='about'&&w.document.createElement&&w.WebGLRenderingContext){let actor=null,active=false,dead=false;import('./about-depth.mjs').then(m=>{if(dead)return;actor=m.mountAboutDepth(w,{kind,image,layer,scene:layer.parentNode});actor.setActive(active);}).catch(()=>{});return {setActive(v){active=v;actor?.setActive(v);},resize(){actor?.resize();},destroy(){dead=true;actor?.destroy();}};}
 const profile=characterProfile(kind);
 if((!['home','ai'].includes(kind)&&!profile)||!w.document.createElementNS||!w.Image)return null;
 const svg=w.document.createElementNS('http://www.w3.org/2000/svg','svg'),id='vagus-actor-'+(++serial);
 svg.setAttribute('class','character-motion-layer');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.setAttribute('preserveAspectRatio','none');
 let assets,patches=[];
 const expanded=triangle=>{const center=triangle.reduce((sum,p)=>[sum[0]+p[0]/3,sum[1]+p[1]/3],[0,0]);return triangle.map(p=>{const dx=p[0]-center[0],dy=p[1]-center[1],length=Math.hypot(dx,dy);return [p[0]+dx/length*.65,p[1]+dy/length*.65];});};
 if(kind==='home'){
  assets=['assets/mona-blink.webp'];
  svg.innerHTML=`<defs><clipPath id="${id}-eyes"><ellipse cx="901" cy="239" rx="18" ry="11"/><ellipse cx="969" cy="228" rx="21" ry="11"/></clipPath></defs>${sourceImage(assets[0],`clip-path="url(#${id}-eyes)" data-eyes=""`,1671)}`;
 }else if(kind==='ai'){
  assets=['assets/thinker-hand.webp'];
  const mesh=handMesh();
  svg.innerHTML=`<defs>
   ${sourceImage(assets[0],`id="${id}-texture"`)}
   <linearGradient id="${id}-fade-x" gradientUnits="userSpaceOnUse" x1="790" y1="0" x2="1020" y2="0"><stop offset="0" stop-color="black"/><stop offset=".04" stop-color="white"/><stop offset=".96" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>
   <linearGradient id="${id}-fade-y" gradientUnits="userSpaceOnUse" x1="0" y1="510" x2="0" y2="650"><stop offset="0" stop-color="black"/><stop offset=".04" stop-color="white"/><stop offset=".96" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>
   <mask id="${id}-mask-x" maskUnits="userSpaceOnUse" x="790" y="510" width="230" height="140"><rect x="790" y="510" width="230" height="140" fill="url(#${id}-fade-x)"/></mask>
   <mask id="${id}-mask-y" maskUnits="userSpaceOnUse" x="790" y="510" width="230" height="140"><rect x="790" y="510" width="230" height="140" fill="url(#${id}-fade-y)"/></mask>
   ${mesh.map((triangle,i)=>'<clipPath id="'+id+'-triangle-'+i+'"><polygon points="'+expanded(triangle).map(p=>p.join(',')).join(' ')+'"/></clipPath>').join('')}
   <clipPath id="${id}-book"><rect x="790" y="636" width="230" height="30"/></clipPath><clipPath id="${id}-phone"><path d="M722 518 Q746 513 780 521 Q790 522 795 537 L830 651 Q832 660 824 661 L769 650 Z"/></clipPath>
  </defs>
  <g mask="url(#${id}-mask-x)"><g mask="url(#${id}-mask-y)">
  ${mesh.map((triangle,i)=>'<g data-triangle="'+i+'"><use href="#'+id+'-texture" clip-path="url(#'+id+'-triangle-'+i+')"/></g>').join('')}
  </g></g>
  ${sourceImage('assets/ai.webp',`clip-path="url(#${id}-phone)" data-phone-fixed=""`)}
  ${sourceImage('assets/ai.webp',`clip-path="url(#${id}-book)" data-book-fixed=""`)}
  `;
 }
 if(profile){
  assets=['assets/'+kind+'.webp'];
  patches=profile.parts.flatMap(part=>patchMesh(part).map(triangle=>({part,triangle})));
  const texture=sourceImage(assets[0],`id="${id}-texture"`).replace('height="941"','height="'+(profile.height||941)+'"');
  svg.innerHTML=`<defs>${texture}${patches.map(({triangle},i)=>'<clipPath id="'+id+'-patch-'+i+'"><polygon points="'+expanded(triangle).map(p=>p.join(',')).join(' ')+'"/></clipPath>').join('')}${profile.locks?'<clipPath id="'+id+'-fixed">'+profile.locks.join('')+'</clipPath>':''}</defs>${patches.map((_,i)=>'<g data-patch-triangle="'+i+'"><use href="#'+id+'-texture" clip-path="url(#'+id+'-patch-'+i+')"/></g>').join('')}${profile.locks?sourceImage(assets[0],`clip-path="url(#${id}-fixed)"`):''}`;
  svg.setAttribute('data-character-action',profile.label);
 }
 svg.style.opacity='0';layer.append(svg);
 const pieces=[...svg.querySelectorAll('[data-triangle]')],patchPieces=[...svg.querySelectorAll('[data-patch-triangle]')],mesh=handMesh(),eyes=svg.querySelector('[data-eyes]');
 let lastPatchFrame=-Infinity,previousPatch='';
 let active=false,ready=false,failed=false,requested=false,destroyed=false,raf=0,elapsed=0,last=null,previousPose='';
 function syncCrop(){
  const iw=kind==='home'?1671:1672,ih=profile?.height||941,position=w.getComputedStyle(image).objectPosition.split(/\s+/);
  const percent=(s,fallback)=>s?.endsWith('%')?Number.parseFloat(s)/100:fallback;
  const view=coverViewBox(iw,ih,image.clientWidth,image.clientHeight,percent(position[0],.5),percent(position[1],.5));
  if(view)svg.setAttribute('viewBox',view.join(' '));
 }
 function request(){
  if(requested)return;requested=true;
  Promise.all(assets.map(src=>new Promise((resolve,reject)=>{const bitmap=new w.Image();bitmap.onload=resolve;bitmap.onerror=reject;bitmap.src=src;}))).then(()=>{
   if(destroyed)return;ready=true;syncCrop();if(active&&!raf)raf=w.requestAnimationFrame(tick);
  },()=>{failed=true;svg.style.opacity='0';});
 }
 function tick(time){
  raf=0;if(!active||!ready||failed||destroyed)return;
  if(last!==null)elapsed+=Math.max(0,time-last);last=time;
  // Wait for the existing artwork's short entrance to settle before overlaying it.
  if(elapsed>=1100){
   const t=elapsed-1100;svg.style.opacity='1';
   if(eyes)eyes.style.opacity=String(blinkOpacity(t));
   if(profile&&t-lastPatchFrame>=1000/30){
    lastPatchFrame=t;const poses=profile.parts.map(part=>patchPose(part,t)),key=poses.map(p=>p.toFixed(4)).join(':');
    if(key!==previousPatch){previousPatch=key;patchPieces.forEach((piece,i)=>{const {part,triangle}=patches[i],progress=poses[profile.parts.indexOf(part)],m=triangleMatrix(triangle,triangle.map(point=>patchVertex(part,point,progress)));piece.setAttribute('transform',`matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`);});}
   }
   if(pieces.length){const pose=swipeFrame(t),key=pose.progress+':'+pose.lift;if(key!==previousPose){previousPose=key;pieces.forEach((piece,i)=>{const triangle=mesh[i],m=triangleMatrix(triangle,triangle.map(point=>handVertex(point,pose.progress,pose.lift)));piece.setAttribute('transform',`matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`);});}}
  }
  raf=w.requestAnimationFrame(tick);
 }
 return {
  resize:syncCrop,
  setActive(next){active=Boolean(next);if(active){request();if(ready&&!failed&&!raf)raf=w.requestAnimationFrame(tick);}else{if(raf)w.cancelAnimationFrame(raf);raf=0;last=null;svg.style.opacity='0';}},
  destroy(){destroyed=true;active=false;if(raf)w.cancelAnimationFrame(raf);svg.remove();}
 };
}
