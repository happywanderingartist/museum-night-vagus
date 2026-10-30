import {ActiveClock,sampleMotion} from './motion.mjs';
import {loadWithDeadline,acceptStage,renderSafely} from './runtime.mjs';
const host=document.querySelector('.ai-scene'),canvas=document.querySelector('#thinker-stage');
if(host&&canvas){
  const clock=new ActiveClock(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false,stage=null,loading=false,failed=false,frame=0;
  const off=()=>reduced.matches||!document.body.classList.contains('motion-on');
  const active=()=>visible&&!document.hidden&&!off()&&!failed;
  function fail(error){failed=true;clock.setRunning(false,performance.now());cancelAnimationFrame(frame);frame=0;host.classList.remove('has-three');stage?.dispose();console.error('Thinker fallback:',error);}
  function draw(now){frame=0;if(!stage||failed)return;
    const pose=sampleMotion(clock.tick(now),{reduced:off()});
    if(!renderSafely(stage,pose,fail))return;
    if(active())frame=requestAnimationFrame(draw);
  }
  function sync(){clock.setRunning(Boolean(stage)&&active(),performance.now());if(stage&&!failed&&!frame)frame=requestAnimationFrame(draw);}
  async function initialize(){
    if(loading||failed||stage)return;loading=true;
    try{await loadWithDeadline(async signal=>{
      signal.addEventListener('abort',()=>fail(Error('Thinker load deadline')),{once:true});
      const {createStage}=await import('./scene.mjs');
      const value=await acceptStage(()=>createStage(canvas),{signal,isFailed:()=>failed});
      if(!value)return;stage=value;
      if(!renderSafely(stage,sampleMotion(0,{reduced:off()}),fail))return;
      host.classList.add('has-three');sync();
    });}catch(error){fail(error);}
  }
  if(typeof IntersectionObserver==='function')new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)initialize();sync();},{threshold:0}).observe(host);
  else{visible=true;initialize();}
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fail(Error('WebGL context lost'));});
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);addEventListener('resize',sync);
}
