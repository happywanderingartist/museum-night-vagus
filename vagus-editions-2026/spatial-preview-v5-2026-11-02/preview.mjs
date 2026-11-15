import {sample} from './motion.mjs';

const root=document.documentElement,stage=document.querySelector('#stage'),home=document.querySelector('#home'),ai=document.querySelector('#ai');
const canvas=document.querySelector('#world');
const header=document.querySelector('.site-header'),toggle=document.querySelector('#motion-toggle'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const homeText=[...home.querySelectorAll('.brand-lockup,.home-bottom,.character-quote,.home-caption')];
const title=ai.querySelector('h2'),label=ai.querySelector('.section-label'),intro=ai.querySelector('.ai-intro'),links=ai.querySelector('.article-links'),all=ai.querySelector('.text-link'),quote=ai.querySelector('.character-quote');
let world=null,enabled=false,userOff=false,pending=false,travel=0,stageHeight=0,run=0;
const originalHeaderToggle=header.querySelector('.motion-toggle');
const reading=document.querySelector('#ai-reading'),keyframe=document.querySelector('#keyframe');
const compact=()=>innerWidth<=760||innerHeight<400;
function hidden(el,opacity){el.style.opacity=opacity;}
function focusStage(){if(home.contains(document.activeElement))stage.focus({preventScroll:true});}
function readProgress(){return Math.max(0,Math.min(1,scrollY/travel));}
function draw(){
 pending=false;if(!enabled)return;
 const s=sample(readProgress());
 root.dataset.progress=s.p.toFixed(4);root.dataset.camera=s.camera.toFixed(4);
 document.querySelector('#progress').value=`${Math.round(s.p*100)}%`;
 home.style.visibility=s.homeVisible?'visible':'hidden';
 home.style.transform=`translate3d(0, ${-100*s.homeLift}%, 0)`;
 homeText.forEach(el=>hidden(el,s.homeText));
 if(s.p>.17)focusStage();home.inert=s.p>.17;ai.inert=s.p<.76;
 ai.style.visibility=s.p>0?'visible':'hidden';
 // Reading text is screen-space DOM; no camera scale is applied to it.
 [title,label].forEach(el=>hidden(el,s.title));hidden(intro,s.intro);[links,all,quote].forEach(el=>hidden(el,s.links));
 canvas.style.visibility=s.p<.76?'visible':'hidden';
 header.classList.toggle('is-visible',s.p>.5);header.querySelectorAll('nav a').forEach(a=>a.toggleAttribute('aria-current',a.getAttribute('href')==='#ai'&&s.p>=.76));
 if(s.p<.76){try{world.render(s.camera);}catch(error){fail(error);}}
}
function requestDraw(){if(enabled&&!pending){pending=true;requestAnimationFrame(draw);}}
function layout(){
 const prior=enabled&&travel>0&&scrollY<=travel?readProgress():null;
 const readingAnchor=enabled&&travel>0&&scrollY>travel?reading.getBoundingClientRect().top:null;
 stageHeight=innerHeight;travel=stageHeight*1.2;
 root.style.setProperty('--stage-height',`${stageHeight}px`);root.style.setProperty('--journey-height',`${stageHeight+travel}px`);
 if(enabled){
  try{world.resize(innerWidth,stageHeight);}catch(error){fail(error);return;}
  if(prior!==null)scrollTo({top:prior*travel,behavior:'instant'});
  else if(readingAnchor!==null)scrollTo({top:scrollY+reading.getBoundingClientRect().top-readingAnchor,behavior:'instant'});
  requestDraw();
 }
}
function jump(p,focus=false){
 if(enabled){scrollTo({top:travel*p,behavior:'instant'});draw();if(focus)(p?ai:home).focus({preventScroll:true});}
 else{(p?ai:home).scrollIntoView({behavior:'instant'});if(focus)(p?ai:home).focus({preventScroll:true});}
}
function disable(reason='static'){
 run++;const hadMotion=enabled,wasAI=enabled&&readProgress()>.5;
 const readingAnchor=enabled&&scrollY>travel?reading.getBoundingClientRect().top:null;
 enabled=false;root.classList.remove('v5-enhanced');document.body.classList.remove('js-enhanced');
 for(const el of [home,ai,...homeText,title,label,intro,links,all,quote,canvas])el.removeAttribute('style');
 home.inert=false;ai.inert=false;header.hidden=true;root.dataset.mode=reason;
 toggle.textContent='启用动态';toggle.setAttribute('aria-pressed','true');
 toggle.disabled=reason==='compact'||reduced.matches;
 for(const option of keyframe.querySelectorAll('option'))option.disabled=!enabled&&![0,1].includes(Number(option.value));
 if(reason==='compact')toggle.textContent='静态阅读';
 document.querySelector('#progress').value='静态';
 if(reason==='compact')document.querySelector('#study-label').textContent='空间试制 · 静态阅读';
 if(readingAnchor!==null)scrollTo({top:scrollY+reading.getBoundingClientRect().top-readingAnchor,behavior:'instant'});
 else if(wasAI)ai.scrollIntoView({behavior:'instant'});
 else if(hadMotion)home.scrollIntoView({behavior:'instant'});
}
function fail(error,reason='fallback'){
 console.warn('Vagus: using static reading fallback.',error.message);disable(reason);
 try{world?.dispose();}catch{}world=null;
 document.querySelector('#study-label').textContent='空间试制 · 静态后备';
}
async function enable(){
 if(compact())return disable('compact');
 if(reduced.matches||userOff)return disable(reduced.matches?'reduced':'static');
 const ticket=++run;
 try{
  if(!world){const {createWorld}=await import('./world.mjs');if(!world)world=createWorld(canvas);}
  const images=[home.querySelector('img'),ai.querySelector('img')];
  await Promise.all(images.map(img=>img.decode()));
  if(ticket!==run)return;
  if(reduced.matches||userOff)return disable('static');
  const readingAnchor=reading.getBoundingClientRect().top<innerHeight*.5?reading.getBoundingClientRect().top:null;
  const resumeAI=ai.getBoundingClientRect().top<innerHeight*.5;
  enabled=true;root.classList.add('v5-enhanced');document.body.classList.add('js-enhanced');header.hidden=false;
  root.dataset.mode='webgl';toggle.disabled=false;toggle.textContent='关闭动态';toggle.setAttribute('aria-pressed','false');
  document.querySelector('#study-label').textContent='连续衔接 · 试制';
  for(const option of keyframe.querySelectorAll('option'))option.disabled=false;
  layout();if(!enabled)return;draw();if(!enabled)return;
  const requested=new URL(location.href).searchParams.get('frame');
  if(requested!==null&&Number.isFinite(Number(requested)))jump(Math.min(1,Math.max(0,Number(requested))));
  else if(location.hash==='#ai')jump(1,true);
  else if(location.hash==='#home')jump(0,true);
  else if(readingAnchor!==null){scrollTo({top:scrollY+reading.getBoundingClientRect().top-readingAnchor,behavior:'instant'});draw();}
  else if(resumeAI)jump(1);
 }catch(error){fail(error);}
}
function toggleMotion(){userOff=!userOff;if(userOff)disable();else enable();}
toggle.addEventListener('click',toggleMotion);
if(originalHeaderToggle){originalHeaderToggle.hidden=false;originalHeaderToggle.addEventListener('click',toggleMotion);}
document.querySelector('#replay').addEventListener('click',()=>{history.replaceState(null,'',location.pathname);jump(0,true);});
document.querySelector('#keyframe').addEventListener('change',e=>jump(Number(e.target.value)));
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href="#ai"],a[href="#home"]');if(!a)return;
 if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;
 e.preventDefault();history.pushState(null,'',a.hash);jump(a.hash==='#ai'?1:0,true);
});
addEventListener('popstate',()=>{if(location.hash==='#home'||location.hash==='#ai')jump(location.hash==='#ai'?1:0,true);});
addEventListener('hashchange',()=>{if(location.hash==='#ai'||location.hash==='#home')jump(location.hash==='#ai'?1:0,true);});
addEventListener('scroll',requestDraw,{passive:true});addEventListener('resize',()=>{
 if(compact())disable('compact');else if(enabled)layout();else if(!userOff&&!reduced.matches)enable();
});
addEventListener('pageshow',requestDraw);
reduced.addEventListener('change',()=>reduced.matches?disable('reduced'):enable());
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fail(Error('WebGL context lost'),'context-lost');});
layout();enable();
