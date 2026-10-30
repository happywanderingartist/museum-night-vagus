import {sampleMotion,ActiveClock} from './motion.mjs';
import {loadWithDeadline,acceptStage,renderSafely} from './runtime.mjs';
const canvas=document.querySelector('#stage'),toggle=document.querySelector('#toggle'),review=document.querySelector('#frame'),view=document.querySelector('#view'),status=document.querySelector('#status'),clockText=document.querySelector('#clock'),host=document.querySelector('.stage-wrap');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),clock=new ActiveClock();let stage=null,visible=true,paused=false,failed=false,frame=0;
const active=()=>!failed&&visible&&!document.hidden&&!paused&&!reduced.matches&&review.value==='live';
function fail(error){failed=true;clock.setRunning(false,performance.now());cancelAnimationFrame(frame);frame=0;stage?.dispose();document.body.classList.remove('ready');document.body.dataset.ready='false';canvas.hidden=true;for(const el of [toggle,review,view])el.disabled=true;status.textContent='三维未载入 · 保留灰模静帧';clockText.textContent='模型下载与原画对照仍可使用';console.error('Gray model fallback:',error);}
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fail(Error('WebGL context lost'));});
function request(){if(stage&&!failed&&!frame)frame=requestAnimationFrame(draw);}
function sync(){clock.setRunning(Boolean(stage)&&active(),performance.now());const unavailable=failed||!stage;toggle.disabled=unavailable||reduced.matches;review.disabled=unavailable||reduced.matches;view.disabled=unavailable;toggle.textContent=reduced.matches?'系统已减少动态':paused?'继续动作':'暂停动作';toggle.setAttribute('aria-pressed',String(paused||reduced.matches));request();}
function draw(now){frame=0;if(!stage||failed)return;const seconds=reduced.matches?0:review.value==='live'?clock.tick(now):Number(review.value),pose=sampleMotion(seconds,{reduced:reduced.matches});
 if(!renderSafely(stage,pose.time,fail))return;
 status.textContent=reduced.matches?'系统已减少动态 · 静止':review.value!=='live'?'逐帧检查 · '+review.value+'秒':!visible?'离开画面 · 暂停':document.hidden?'后台 · 暂停':paused?'动作已暂停':pose.phase==='think'?'若有所思 · 停两秒':'食指上划 · 五秒一段';
 clockText.textContent=pose.time<5?'滑动 '+pose.time.toFixed(1)+' / 5秒':'停顿 '+(pose.time-5).toFixed(1)+' / 2秒';if(active())request();
}
toggle.addEventListener('click',()=>{paused=!paused;sync();});review.addEventListener('change',sync);
view.addEventListener('change',()=>{stage?.setView(view.value);document.querySelector('#view-label').textContent=view.selectedOptions[0].textContent;document.querySelector('#contact-note').hidden=view.value!=='contact';request();});
document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);addEventListener('resize',request);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(host);
try{
 await loadWithDeadline(async signal=>{signal.addEventListener('abort',()=>fail(Error('Gray model load timeout')),{once:true});const {createStage}=await import('./stage.mjs');stage=await acceptStage(()=>createStage(canvas,{signal}),{signal,isFailed:()=>failed});if(!stage)return;if(!renderSafely(stage,0,fail))return;document.body.classList.add('ready');document.body.dataset.ready='true';for(const el of [toggle,review,view])el.disabled=false;sync();});
}catch(error){fail(error);}
