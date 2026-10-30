import {cameraFrame,inEntryBand} from './motion-state.mjs';

// The same controller runs in the site and in the non-rendering lifecycle tests.
export function mountSceneMotion(w){
 const doc=w.document,body=doc.body,query=w.matchMedia('(prefers-reduced-motion: reduce)');
 const curve='cubic-bezier(.23,1,.32,1)',records=[],listeners=[];
 let queued=0,destroyed=false,keyboard=false,skipUntil=0,lastY=w.scrollY||0;
 const now=()=>w.performance.now();
 const enabled=()=>body.classList.contains('motion-on')&&!query.matches&&!doc.hidden;
 const on=(target,event,handler,options)=>{target.addEventListener(event,handler,options);listeners.push(()=>target.removeEventListener(event,handler,options));};
 const cleanAnimations=record=>{for(const animation of record.animations)animation.cancel();record.animations.clear();};
 const play=(record,element,frames,options)=>{
  if(typeof element?.animate!=='function')return;
  try{
   const animation=element.animate(frames,{easing:curve,fill:'none',...options});
   record.animations.add(animation);
   animation.finished.then(()=>record.animations.delete(animation),()=>record.animations.delete(animation));
  }catch{/* Static content stays visible if this browser cannot animate it. */}
 };
 for(const scene of doc.querySelectorAll('.home,.ai-scene,.scene-track,.collection-art,.case-hero,.ai-directory-hero')){
  const image=scene.querySelector('.home-art,.scene-art,.collection-image,.case-art:not(.water-motion),.ai-directory-hero > img');
  if(!image)continue;
  const layer=doc.createElement('div');layer.className='motion-art-layer';
  image.parentNode.insertBefore(layer,image);layer.append(image);
  const kind=scene.dataset.motionScene||scene.dataset.chapter||'ai';
  const record={scene,image,layer,kind,seen:false,animations:new Set(),visible:false,light:null};
  records.push(record);
  if(kind==='hug'){
   const water=doc.createElement('div');water.className='motion-water';water.setAttribute('aria-hidden','true');
   (scene.querySelector('.stage')||scene).append(water);
  }
  if(kind==='literature'){
   const light=doc.createElement('div');light.className='motion-stage-light';light.setAttribute('aria-hidden','true');scene.append(light);record.light=light;
  }
  on(image,'load',queue);on(image,'error',()=>{record.seen=true;queue();});
 }
 const settleAll=()=>{for(const record of records)cleanAnimations(record);};
 function enter(record,rect){
  record.seen=true;
  if(!enabled()||keyboard||now()<skipUntil||rect.top< -40||record.scene.contains(doc.activeElement))return;
  const horizontal=record.kind==='start'?-48:record.kind==='ai'?36:0;
  play(record,record.image,[
   {transform:`translate3d(${horizontal}px,${horizontal?0:24}px,0) scale(1.08)`},
   {transform:'translate3d(0,0,0) scale(1)'}
  ],{duration:record.kind==='home'?1100:650});
  if(record.light)play(record,record.light,[{opacity:0,transform:'rotate(-9deg)'},{opacity:.35,transform:'rotate(0)'}],{duration:650});
  // Text is never CSS-hidden. A failed/cancelled animation exposes the base state.
  const text=record.scene.querySelectorAll('.brand-lockup h1,.philosophy,.dialogue,.character-quote,.ai-content > h2,.ai-content > p,.scene-copy > *,.art-copy > h1,.art-copy > h2,.art-copy > p,.case-title-group > h1,.case-title-group > p,.ai-directory-hero > div > h1,.ai-directory-hero > div > p,.art-quip');
  let index=0;
  for(const element of text){
   const delay=Math.min(index++*60,240);
   play(record,element,[{opacity:.25,transform:'translate3d(0,22px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:450,delay});
  }
 }
 function render(){
  queued=0;if(destroyed)return;
  const off=!enabled(),viewport=w.innerHeight;
  for(const record of records){
   const rect=record.scene.getBoundingClientRect();
   record.visible=rect.bottom>0&&rect.top<viewport;
   record.scene.classList.toggle('motion-visible',record.visible&&!off);
   if(off||!record.visible)cleanAnimations(record);
   if(!record.seen&&inEntryBand(rect,viewport)){
    if(off)record.seen=true;
    else if(record.image.complete&&record.image.naturalWidth>0)enter(record,rect);
   }
   if(!record.visible&&!off)continue;
   const frame=cameraFrame(record.kind,{top:rect.top,height:rect.height,viewport,width:w.innerWidth,disabled:off});
   record.layer.style.transform=frame.scale===1?'none':`translate3d(${frame.x}px,${frame.y}px,0) scale(${frame.scale})`;
  }
 }
 function queue(){if(!queued&&!destroyed)queued=w.requestAnimationFrame(render);}
 on(w,'scroll',()=>{
  const y=w.scrollY||0;
  if(Math.abs(y-lastY)>w.innerHeight*.65){skipUntil=now()+240;settleAll();}
  lastY=y;queue();
 },{passive:true});
 on(w,'resize',queue);
 on(w,'hashchange',()=>{skipUntil=now()+240;settleAll();queue();});
 on(w,'pageshow',event=>{if(event.persisted){skipUntil=now()+240;settleAll();}queue();});
 on(doc,'keydown',event=>{if(event.key==='Tab'){keyboard=true;settleAll();queue();}});
 on(doc,'pointerdown',()=>{keyboard=false;});
 on(doc,'focusin',event=>{for(const record of records)if(record.scene.contains(event.target))cleanAnimations(record);});
 on(doc,'visibilitychange',()=>{
  if(doc.hidden){settleAll();for(const record of records)record.scene.classList.remove('motion-visible');}
  else queue();
 });
 on(query,'change',()=>{settleAll();queue();});
 const observer=new w.MutationObserver(()=>{if(!enabled())settleAll();queue();});
 observer.observe(body,{attributes:true,attributeFilter:['class']});
 body.classList.add('motion-ready');
 if(w.location.hash||w.scrollY>64)skipUntil=now()+300;
 queue();
 return {refresh:queue,destroy(){destroyed=true;if(queued)w.cancelAnimationFrame(queued);settleAll();observer.disconnect();listeners.forEach(remove=>remove());for(const record of records){record.layer.style.transform='none';record.scene.classList.remove('motion-visible');}body.classList.remove('motion-ready');}};
}
