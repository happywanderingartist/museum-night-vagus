import {sampleMotion,ActiveClock} from './motion.mjs';
import {renderSafely,acceptStage} from './runtime.mjs';
import {createStage} from './scene.mjs';
export async function start(signal){
const canvas=document.querySelector('#stage'),status=document.querySelector('#status'),toggle=document.querySelector('#toggle'),review=document.querySelector('#review'),hero=document.querySelector('.hero');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clock=new ActiveClock();let visible=true,paused=false,stage=null,frame=0,lastState='',failed=false;
try{clock.introSeen=sessionStorage.getItem('vagus-thinker-intro-v1')==='seen';}catch{}
function consume(){clock.skipIntro();try{sessionStorage.setItem('vagus-thinker-intro-v1','seen');}catch{}}
function running(){return !failed&&!paused&&visible&&!document.hidden&&!reduced.matches&&review.value==='live';}
function update(){clock.setRunning(Boolean(stage)&&running(),performance.now());if(!running())consume();if(stage&&!failed)requestFrame();}
function label(text){if(text!==lastState){lastState=text;status.textContent=text;}}
function requestFrame(){if(!frame)frame=requestAnimationFrame(draw);}
function draw(now){
  frame=0;if(!stage||failed)return;
  const t=review.value==='live'?clock.tick(now):Number(review.value);
  const inspecting=review.value!=='live';
  const pose=sampleMotion(t,{introSeen:inspecting?false:clock.introSeen,reduced:reduced.matches});
  if(!renderSafely(stage,pose,fail))return;
  const readout=(pose.cycleTime<5?'滑动 '+pose.cycleTime.toFixed(1)+' / 5 秒':'停顿 '+(pose.cycleTime-5).toFixed(1)+' / 2 秒')+' · '+(pose.peek>.01?'首次露屏':'屏幕已归位');
  document.querySelector('#clock').textContent=readout;
  if(!inspecting&&t>=2.6&&!clock.introSeen)consume();
  const active=running();
  label(reduced.matches?'系统已减少动态 · 静止':inspecting?'逐帧检查 · '+t+' 秒':active?pose.phase==='think'?'若有所思 · 停两秒':'滑屏中 · 五秒一段':paused?'动作已暂停':visible?'页面后台 · 暂停':'阅读中 · 暂停');
  if(active)requestFrame();
}
toggle.addEventListener('click',()=>{paused=!paused;toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=paused?'继续动作':'暂停动作';update();});
review.addEventListener('change',update);
document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);
new IntersectionObserver(entries=>{visible=entries[0].intersectionRatio>.45;update();},{threshold:[0,.45,.5,1]}).observe(hero);
addEventListener('resize',()=>{if(stage&&!failed)requestFrame();});
addEventListener('pagehide',consume);
function fail(error){failed=true;cancelAnimationFrame(frame);frame=0;clock.setRunning(false,performance.now());consume();document.body.classList.remove('ready');document.body.dataset.boot='failed';canvas.hidden=true;toggle.disabled=true;review.disabled=true;label('三维已停用 · 原画仍可阅读');console.error('Vagus stage unavailable:',error);stage?.dispose();}
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fail(Error('WebGL context lost'));});
signal.addEventListener('abort',()=>fail(Error('Stage initialization timeout')),{once:true});
stage=await acceptStage(()=>createStage(canvas,text=>{if(!signal.aborted&&!failed)label(text);}),{signal,isFailed:()=>failed});
if(!stage)return;
if(!renderSafely(stage,sampleMotion(0,{introSeen:clock.introSeen,reduced:reduced.matches}),fail))return;
document.body.classList.add('ready');document.body.dataset.boot='ready';update();
}
