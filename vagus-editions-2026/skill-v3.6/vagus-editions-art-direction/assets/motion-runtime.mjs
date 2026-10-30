// Original reference implementation. This is 2.5D DOM choreography, not the source sites' code.
export const clamp = (v) => Math.min(1, Math.max(0, v));
const segment = (p,a,b) => clamp((p-a)/(b-a));
const lerp = (a,b,p) => a+(b-a)*p;
export function sceneProgress(scrollTop, top, height, viewportHeight, profile='immersive') {
 if (![scrollTop,top,height,viewportHeight].every(Number.isFinite)) return 0;
 if(height<=0||viewportHeight<=0)return 0;
 // Ordinary editorial sections advance from top/top to bottom/top. A short
 // hero needs no artificial spacer and must not use the sticky denominator.
 if(profile==='editorial')return clamp((scrollTop-top)/height);
 const span=height-viewportHeight;
 return span>0 ? clamp((scrollTop-top)/span) : 0;
}
export function sampleScene(profile,p,options={}) {
 if (!['immersive','editorial'].includes(profile)) throw new Error('Unknown scene profile');
 if (!Number.isFinite(p)) throw new TypeError('Progress must be finite');
 p=clamp(p);
 if(options.static) return {
  background:{scale:1,y:0},subject:{scale:1,y:0},
  title:{opacity:1,y:0},description:{opacity:1,y:0},reading:{reveal:0},navTone:'light'
 };
 if(profile==='editorial') return {
  background:{scale:1,y:lerp(0,-8,p)},subject:{scale:lerp(1.04,1,p),y:lerp(0,-20,p)},
  title:{opacity:1,y:0},description:{opacity:1,y:0},reading:{reveal:0},navTone:'light'
 };
 const pull=segment(p,0,.55), handoff=segment(p,.48,1);
 return {
  background:{scale:lerp(1.1,1,pull),y:lerp(0,-12,pull)},
  subject:{scale:lerp(1.24,1,pull),y:lerp(16,-8,pull)},
  title:{opacity:1-segment(p,.1,.3),y:lerp(0,-64,segment(p,.1,.35))},
  description:{opacity:segment(p,.24,.4)*(1-segment(p,.62,.74)),y:lerp(20,0,segment(p,.24,.4))},
  reading:{reveal:handoff},navTone:handoff>=.1?'light':'dark'
 };
}
export function applyScene(root,frame) {
 for(const key of ['background','subject','title','description','reading']) {
  const el=root.querySelector('[data-layer="'+key+'"]');
  if(!el)continue;
  const v=frame[key];
  if(key==='reading')el.style.transform='translateY('+(100-106*v.reveal)+'%)';
  else {
   el.style.transform='translateY('+v.y+'px)'+('scale'in v?' scale('+v.scale+')':'');
   if('opacity'in v)el.style.opacity=String(v.opacity);
  }
 }
 root.dataset.navTone=frame.navTone;
}
export function mountScene(root,options={}) {
 if(!root)throw new Error('Scene element required');
 const profile=options.profile||root.dataset.profile||'editorial';
 const breakpoint=1024; // Keep in sync with the two CSS media queries.
 const doc=root.ownerDocument,win=doc.defaultView;
 const reduce=win.matchMedia('(prefers-reduced-motion: reduce)');
 const layers=[...root.querySelectorAll('[data-layer]')];
 const saved=layers.map(el=>[el,el.getAttribute('style')]);
 const oldEnhanced=root.getAttribute('data-enhanced'),oldTone=root.getAttribute('data-nav-tone');
 let raf=0,disposed=false,preview=null;
 const staticMode=()=>reduce.matches||win.innerWidth<breakpoint;
 const render=()=>{
  raf=0;if(disposed)return;
  const stat=staticMode();
  root.dataset.enhanced=String(!stat);
  if(stat) {
   // Static CSS supplies normal flow; do not leave an invisible title from a prior frame.
   for(const el of layers){el.style.removeProperty('transform');el.style.removeProperty('opacity');}
   root.dataset.navTone='light';return;
  }
  const rect=root.getBoundingClientRect(),top=rect.top+win.scrollY;
   const p=preview??sceneProgress(win.scrollY,top,rect.height,win.innerHeight,profile);
  applyScene(root,sampleScene(profile,p));
 };
 const schedule=()=>{if(!raf&&!disposed)raf=win.requestAnimationFrame(render);};
 const scroll=()=>{preview=null;schedule();};
 win.addEventListener('scroll',scroll,{passive:true});
 win.addEventListener('resize',schedule);
 win.addEventListener('hashchange',scroll);
 win.addEventListener('popstate',scroll);
 doc.addEventListener('visibilitychange',schedule);
 reduce.addEventListener('change',schedule);
 const observer=typeof win.ResizeObserver==='function'?new win.ResizeObserver(schedule):null;
 observer?.observe(root);
 doc.fonts?.ready.then(()=>{if(!disposed)schedule();});
 root.querySelectorAll('img').forEach(el=>el.addEventListener('load',schedule));
 render();
 return {
  refresh:schedule,
  // Fixture-only deterministic sampling; wheel scrolling always resumes native progress.
  preview(p){if(!Number.isFinite(p))throw new TypeError('Progress must be finite');preview=clamp(p);render();},
  destroy(){
   if(disposed)return;disposed=true;if(raf)win.cancelAnimationFrame(raf);
   win.removeEventListener('scroll',scroll);win.removeEventListener('resize',schedule);
   win.removeEventListener('hashchange',scroll);win.removeEventListener('popstate',scroll);
   doc.removeEventListener('visibilitychange',schedule);reduce.removeEventListener('change',schedule);
   observer?.disconnect();root.querySelectorAll('img').forEach(el=>el.removeEventListener('load',schedule));
   for(const [el,style]of saved)style===null?el.removeAttribute('style'):el.setAttribute('style',style);
   for(const [key,value]of [['data-enhanced',oldEnhanced],['data-nav-tone',oldTone]])
    value===null?root.removeAttribute(key):root.setAttribute(key,value);
  }
 };
}
