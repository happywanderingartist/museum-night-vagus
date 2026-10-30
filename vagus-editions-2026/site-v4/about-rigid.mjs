import {coverViewBox} from './character-state.mjs';
// One rigid cutout from the original raster: no vertices or facial features are deformed.
export const armOutline='M785 381 L934 352 L949 442 L850 464 Q863 475 869 496 L912 510 Q943 503 970 517 Q1001 534 1015 565 Q1024 595 1010 632 Q1000 671 977 694 Q953 710 926 688 Q903 670 889 638 L846 580 Q824 575 808 574 Q783 571 766 562 Q741 555 730 540 Q719 529 723 511 Q708 499 713 482 Q712 469 730 456 Q752 444 790 440 Z';
export function rigidPose(time){const t=Math.max(0,time)%9600;const ease=x=>x*x*(3-2*x);let p=0;if(t>=700&&t<2000)p=ease((t-700)/1300);else if(t<2800&&t>=2000)p=1;else if(t>=2800&&t<4400)p=1-ease((t-2800)/1600);return {x:p?-10*p:0,y:p?-3*p:0,angle:p?-.35*p:0};}
export function mountAboutRigid(w,{image,layer}){
 if(!w.document?.createElementNS||!w.Image)return null;
 const ns='http://www.w3.org/2000/svg',svg=w.document.createElementNS(ns,'svg'),id='about-arm-'+(++serial);
 svg.setAttribute('class','character-motion-layer about-rigid-layer');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.setAttribute('preserveAspectRatio','none');
 const raster=(url)=>'<image href="'+url+'" width="1672" height="941"/>';
 svg.innerHTML='<defs><clipPath id="'+id+'"><path d="'+armOutline+'"/></clipPath></defs><g clip-path="url(#'+id+')">'+raster('assets/about-clean-plate.png')+'</g><g data-arm-rigid><g clip-path="url(#'+id+')">'+raster('assets/about.webp')+'</g></g>';
 svg.style.opacity='0';layer.append(svg);const arm=svg.querySelector('[data-arm-rigid]');let active=false,ready=false,dead=false,requested=false,raf=0,last=null,elapsed=0;
 function resize(){const p=w.getComputedStyle(image).objectPosition.split(/\s+/),n=s=>s?.endsWith('%')?parseFloat(s)/100:.5,v=coverViewBox(1672,941,image.clientWidth,image.clientHeight,n(p[0]),n(p[1]));if(v)svg.setAttribute('viewBox',v.join(' '));}
 function tick(t){raf=0;if(!active||!ready||dead)return;if(last!==null)elapsed+=Math.min(50,Math.max(0,t-last));last=t;const p=rigidPose(elapsed);arm.setAttribute('transform','translate('+p.x+' '+p.y+') rotate('+p.angle+' 975 580)');svg.style.opacity='1';raf=w.requestAnimationFrame(tick);}
 function load(){if(requested)return;requested=true;Promise.all(['assets/about-clean-plate.png','assets/about.webp'].map(src=>new Promise((resolve,reject)=>{const im=new w.Image();im.onload=resolve;im.onerror=reject;im.src=src;}))).then(()=>{if(dead)return;ready=true;resize();if(active&&!raf)raf=w.requestAnimationFrame(tick);},()=>{svg.style.opacity='0';});}
 return {resize,setActive(next){active=Boolean(next);if(active){load();if(ready&&!raf)raf=w.requestAnimationFrame(tick);}else{if(raf)w.cancelAnimationFrame(raf);raf=0;last=null;elapsed=0;svg.style.opacity='0';}},destroy(){dead=true;active=false;if(raf)w.cancelAnimationFrame(raf);svg.remove();}};
}
let serial=0;
