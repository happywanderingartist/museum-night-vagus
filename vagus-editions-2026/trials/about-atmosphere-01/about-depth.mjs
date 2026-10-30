import * as THREE from './vendor/three.module.js';
import {aboutVertex} from './about-depth-state.mjs';
export function mountAboutDepth(w,{image,layer,scene},engine=THREE){
 let renderer,texture,geometry,material,raf=0,active=false,disposed=false,elapsed=0,last=0,ready=false;let previousSize="";
 const W=1672,H=941;
 const canvas=w.document.createElement('canvas');canvas.className='about-depth-canvas';canvas.setAttribute('aria-hidden','true');
 const restore=()=>{canvas.style.opacity='0';image.style.visibility='';};
 const stop=()=>{if(raf)w.cancelAnimationFrame(raf);raf=0;last=0;};
 const fail=()=>{ready=false;stop();restore();scene.dataset.depthState='static';};
 try{renderer=new engine.WebGLRenderer({canvas,alpha:false,antialias:true,powerPreference:'low-power'});}catch{fail();return {setActive(){},resize(){},destroy(){}};}
 renderer.setPixelRatio(Math.min(w.devicePixelRatio||1,1.5));renderer.outputColorSpace=engine.SRGBColorSpace;
 const world=new engine.Scene(),camera=new engine.OrthographicCamera(-W/2,W/2,H/2,-H/2,.1,4000);camera.position.z=1500;
 geometry=new engine.PlaneGeometry(W,H,100,60);const pos=geometry.attributes.position,base=pos.array.slice();
 material=new engine.MeshBasicMaterial({side:engine.DoubleSide});const mesh=new engine.Mesh(geometry,material);world.add(mesh);layer.append(canvas);
 function resize(){const r={width:image.clientWidth||image.getBoundingClientRect().width,height:image.clientHeight||image.getBoundingClientRect().height};if(!r.width||!r.height)return;const aspect=r.width/r.height;let vw=W,vh=H;if(aspect>W/H)vh=W/aspect;else vw=H*aspect;const p=w.getComputedStyle(image).objectPosition.split(' '),fraction=(v)=>v?.endsWith('%')?parseFloat(v)/100:.5,cx=(W-vw)*(fraction(p[0])-.5),cy=-(H-vh)*(fraction(p[1])-.5);camera.left=-vw/2+cx;camera.right=vw/2+cx;camera.top=vh/2+cy;camera.bottom=-vh/2+cy;camera.updateProjectionMatrix();const key=r.width+'x'+r.height;if(key!==previousSize){renderer.setSize(r.width,r.height,false);previousSize=key;}}
 function frame(t){raf=0;if(!active||!ready||disposed)return;elapsed+=last?Math.min(t-last,50):0;last=t;
 const rect=scene.getBoundingClientRect(),scroll=Math.max(-1,Math.min(1,-rect.top/Math.max(rect.height,1)));
 // Continuous shallow relief preserves the painting; only the arm/card region gestures.
 for(let i=0;i<pos.count;i++){const j=i*3,x=base[j]+W/2,y=H/2-base[j+1];const q=aboutVertex(x,y,elapsed,scroll);pos.array[j]=q[0];pos.array[j+1]=q[1];pos.array[j+2]=q[2];}
 pos.needsUpdate=true;try{renderer.render(world,camera);}catch{fail();return;}canvas.style.opacity='1';image.style.visibility='hidden';scene.dataset.depthState='playing';raf=w.requestAnimationFrame(frame);}
 new engine.TextureLoader().load(image.currentSrc||image.src,t=>{if(disposed){t.dispose();return;}texture=t;texture.colorSpace=engine.SRGBColorSpace;material.map=t;material.needsUpdate=true;ready=true;resize();if(active&&!raf)raf=w.requestAnimationFrame(frame);},undefined,fail);
 const lost=e=>{e.preventDefault();ready=false;fail();};canvas.addEventListener('webglcontextlost',lost);
 return {resize,setActive(value){active=value;if(!value){stop();restore();scene.dataset.depthState='paused';}else if(ready&&!raf){resize();raf=w.requestAnimationFrame(frame);}},destroy(){disposed=true;stop();restore();canvas.removeEventListener('webglcontextlost',lost);geometry.dispose();material.dispose();texture?.dispose();renderer.dispose();canvas.remove();}};
}
