import { sample, clampProgress } from './camera.mjs';
import { shouldStopPlayback } from './input.mjs';
const $=id=>document.getElementById(id);
const stage=$('stage'),slider=$('progress'),home=$('home-copy'),ai=$('ai-copy'),play=$('play'),reverse=$('reverse'),mode=$('static-mode');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let engine=null,progress=location.hash==='#ai'?1:0,playing=null,frameId=0,manualStatic=false,failed=false,expectedScroll=0,initializing=false;
let renderCount=0;
function travel(){return Math.max(1,$('journey').offsetHeight-innerHeight);}
function isStatic(){return reduce.matches||manualStatic||innerWidth<680||failed;}
function stop(){playing=null;play.textContent='播放穿梭';}
function setProgress(p,syncScroll=false){progress=clampProgress(p);if(syncScroll){expectedScroll=progress*travel();window.scrollTo({top:expectedScroll,behavior:'instant'});}requestDraw();}
function requestDraw(){if(!frameId&&!document.hidden&&!isStatic()&&engine)frameId=requestAnimationFrame(draw);}
function panel(node,opacity){if(opacity<.98&&node.contains(document.activeElement))play.focus({preventScroll:true});node.hidden=opacity<=.001;node.style.opacity=opacity;node.inert=opacity<.98;}
function draw(now){frameId=0;if(isStatic()||!engine)return;
 if(playing){const t=Math.min(1,(now-playing.start)/4800);progress=playing.from+(playing.to-playing.from)*t;expectedScroll=progress*travel();window.scrollTo({top:expectedScroll,behavior:'instant'});if(t===1)stop();}
 const state=sample(progress,stage.clientWidth/stage.clientHeight);
 engine.camera.position.set(state.x,0,state.z);engine.camera.rotation.set(0,0,0);engine.renderer.render(engine.scene,engine.camera);renderCount++;
 panel(home,state.home);panel(ai,state.ai);slider.value=String(Math.round(progress*1000));$('percent').value=Math.round(progress*100)+'%';
 if($('phase').textContent!==state.phase)$('phase').textContent=state.phase;
 stage.dataset.progress=progress.toFixed(4);stage.dataset.cameraX=state.x.toFixed(4);stage.dataset.cameraZ=state.z.toFixed(4);stage.dataset.renders=String(renderCount);
 if(playing)requestDraw();
}
function start(to){if(isStatic()||!engine)return;if(playing){stop();return;}if(Math.abs(progress-to)<.005)setProgress(to===1?0:1,true);playing={from:progress,to,start:performance.now()};play.textContent='暂停';requestDraw();}
function jump(to){stop();if(isStatic()){const nodes=$('static-view').querySelectorAll('section');nodes[to===1?1:0].scrollIntoView({behavior:'instant'});return;}setProgress(to,true);}
function resize(){if(!engine)return;engine.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));engine.renderer.setSize(stage.clientWidth,stage.clientHeight);engine.camera.aspect=stage.clientWidth/stage.clientHeight;engine.camera.updateProjectionMatrix();requestDraw();}
function syncMode(){stop();document.body.classList.toggle('static',isStatic());document.body.classList.toggle('enhanced',!isStatic()&&!!engine);mode.setAttribute('aria-pressed',String(isStatic()));mode.textContent=reduce.matches?'系统减少动态':manualStatic?'恢复空间预览':'静态阅读';mode.disabled=reduce.matches||failed;
 if(isStatic()){if(frameId)cancelAnimationFrame(frameId);frameId=0;}else if(engine){resize();expectedScroll=progress*travel();window.scrollTo({top:expectedScroll,behavior:'instant'});requestDraw();}
}
async function init(){if(initializing||engine||failed)return;initializing=true;try{
 if(reduce.matches||innerWidth<680){syncMode();return;}
 const T=await import('/site-v4/vendor/three.module.js');
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor('#1b2522',1);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.01,20);
 const ambient=new T.HemisphereLight(0xf0e9d5,0x17241f,2.4);scene.add(ambient);
 const light=new T.DirectionalLight(0xfff3d7,2);light.position.set(-2,3,4);scene.add(light);
 const wall=new T.Mesh(new T.PlaneGeometry(8,5),new T.MeshStandardMaterial({color:'#27342e',roughness:1}));wall.position.set(.56,0,-.028);scene.add(wall);
 const frameMat=new T.MeshStandardMaterial({color:'#8b826d',roughness:.84,metalness:.02});
 const innerMat=new T.MeshStandardMaterial({color:'#4f5548',roughness:1});
 const texLoader=new T.TextureLoader();
 const textures=await Promise.all(['home','ai'].map(n=>texLoader.loadAsync('/site-v4/assets/'+n+'.webp')));
 textures.forEach((texture,i)=>{texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const group=new T.Group();group.position.x=i*1.12;
  const painting=new T.Mesh(new T.PlaneGeometry(1,.5625),new T.MeshBasicMaterial({map:texture,toneMapped:false}));group.add(painting);
  // A solid reveal, not a simulated alpha cutout: the bars occlude artwork naturally.
  const bar=(w,h,d,x,y,z,material)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);group.add(mesh);};
  bar(.025,.6125,.16,-.5125,0,.06,frameMat);bar(.025,.6125,.16,.5125,0,.06,frameMat);
  bar(1,.025,.16,0,.29375,.06,frameMat);bar(1,.025,.16,0,-.29375,.06,frameMat);
  // Narrow inner surfaces make the recessed depth visible while preserving painting proportions.
  bar(.002,.5625,.139,-.499,0,.071,innerMat);bar(.002,.5625,.139,.499,0,.071,innerMat);
  bar(.996,.002,.139,0,.28025,.071,innerMat);bar(.996,.002,.139,0,-.28025,.071,innerMat);
  scene.add(group);
 });
 engine={renderer,scene,camera};$('canvas').replaceChildren(renderer.domElement);renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();failed=true;syncMode();showFailure();});
 play.disabled=false;reverse.disabled=false;slider.disabled=false;syncMode();resize();requestDraw();
}catch(error){failed=true;syncMode();showFailure();console.error('Vagus preview:',error);}finally{initializing=false;}}
function showFailure(){const p=document.createElement('p');p.className='failure';p.textContent='空间效果暂不可用，已切换静态阅读。';$('static-view').prepend(p);}
play.addEventListener('click',()=>start(1));reverse.addEventListener('click',()=>{stop();start(0);});$('enter').addEventListener('click',()=>start(1));$('home-nav').addEventListener('click',()=>jump(0));$('ai-nav').addEventListener('click',()=>jump(1));$('brand').addEventListener('click',event=>{event.preventDefault();jump(0);});
slider.addEventListener('input',()=>{stop();setProgress(Number(slider.value)/1000,true);});
mode.addEventListener('click',()=>{manualStatic=!manualStatic;syncMode();});reduce.addEventListener('change',()=>{syncMode();if(!engine&&!isStatic())init();});
window.addEventListener('scroll',()=>{if(isStatic()||!engine||playing)return;setProgress(scrollY/travel());},{passive:true});
function userInput(event){if(shouldStopPlayback({type:event.type,key:event.key,buttonFocused:!!event.target.closest?.('button'),scrollbar:event.clientX>=document.documentElement.clientWidth}))stop();}
for(const type of ['wheel','touchstart','keydown','pointerdown'])window.addEventListener(type,userInput,{passive:true});
window.addEventListener('resize',()=>{syncMode();if(!engine&&!isStatic())init();});document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();if(frameId)cancelAnimationFrame(frameId);frameId=0;}else requestDraw();});
init();
