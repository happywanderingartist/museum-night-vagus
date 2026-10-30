import {mountSceneMotion} from './scene-motion.mjs';
import {routeProgress} from './motion-state.mjs';
const query=matchMedia('(prefers-reduced-motion: reduce)'),body=document.body;
const localButton=document.querySelector('[data-motion-toggle]');
let disabled=false;
try{disabled=sessionStorage.getItem('vagus-motion-off')==='1';}catch{}
function localMode(){
  if(!localButton)return;
  body.classList.toggle('motion-on',!disabled&&!query.matches);
  localButton.hidden=false;localButton.disabled=query.matches;
  localButton.setAttribute('aria-pressed',String(disabled||query.matches));
  localButton.textContent=query.matches?'系统已减少动态':disabled?'开启动效':'关闭动态';
}
localButton?.addEventListener('click',()=>{disabled=!disabled;try{sessionStorage.setItem('vagus-motion-off',disabled?'1':'0');}catch{}localMode();queue();});
const scenes=[...document.querySelectorAll('[data-chapter]')];let queued=0;
function render(){queued=0;const h=innerHeight,off=query.matches||!body.classList.contains('motion-on');
  for(const scene of scenes){const rect=scene.getBoundingClientRect();const visible=rect.bottom>0&&rect.top<h&&!document.hidden&&!off;
    scene.classList.toggle('is-in-view',visible);
    const route=!off&&scene.dataset.chapter==='start'?routeProgress(rect.top,h):0;
    for(const path of scene.querySelectorAll('.ticket-route path,.route-trace path'))path.style.strokeDashoffset=String(1-route);
    for(const trace of scene.querySelectorAll('.route-trace'))trace.style.opacity=off?'0':'.7';
  }
}
function queue(){if(!queued)queued=requestAnimationFrame(render);}
new MutationObserver(queue).observe(body,{attributes:true,attributeFilter:['class']});
addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);addEventListener('pageshow',queue);
document.addEventListener('visibilitychange',()=>{
  // Hidden tabs may suspend rAF; pause CSS now rather than waiting for a frame.
  if(document.hidden)for(const scene of scenes)scene.classList.remove('is-in-view');
  else queue();
});query.addEventListener('change',()=>{localMode();queue();});
localMode();queue();
mountSceneMotion(window);
