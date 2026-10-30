/* Vagus revision 02: native scrolling, automatic invitation, separate character lines. */
(function(){
 'use strict';
 const api=window.VagusState;if(!api)return;
 const body=document.body,button=document.querySelector('.motion-toggle'),header=document.querySelector('.site-header');
 const navAccess=document.querySelector('.nav-access');
 const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
 const scenes=[...document.querySelectorAll('[data-motion-scene]')];
 const sections=[...document.querySelectorAll('[data-section]')];
 const nav=[...document.querySelectorAll('.site-header nav a')];
 let userDisabled=false,scheduled=0,keyboardOpen=false;
 try{userDisabled=sessionStorage.getItem('vagus-motion-off')==='1';}catch{}
 function render(){
  scheduled=0;
  const off=userDisabled||reducedQuery.matches,y=window.scrollY,h=window.innerHeight;
  header?.classList.toggle('is-visible',api.navVisible(y));
  header?.classList.toggle('keyboard-open',keyboardOpen);
  navAccess?.setAttribute('aria-expanded',String(api.navVisible(y)||keyboardOpen));
  if(api.navVisible(y))body.classList.toggle('has-scrolled',true);
  for(const scene of scenes){
   const rect=scene.getBoundingClientRect();
   const p=api.progress(y,rect.top+y,rect.height*.75);
   const kind=scene.dataset.motionScene;
   const f=api.sceneFrame(kind,p,off),art=scene.querySelector('.scene-art, .home-art');
   if(art){
    art.style.transform='translate3d(0,'+f.y+'px,0) scale('+f.scale+')';
    const inset=off||kind==='home'?0:api.entryInset(rect.top,h);
    art.style.clipPath=inset?'inset(0 '+inset+'% 0 '+inset+'%)':'none';
   }
   const copy=scene.querySelector('.scene-copy');
   if(copy)copy.style.opacity=String(f.titleOpacity);
   const trace=scene.querySelector('.route-trace, .horizon-trace');
   if(trace)trace.style.opacity=off?'0':String(f.accent);
  }
  let current=sections[0];
  for(const section of sections)if(section.getBoundingClientRect().top<=h*.35)current=section;
  for(const link of nav){if(current&&link.hash==='#'+current.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
 }
 function queue(){if(!scheduled)scheduled=requestAnimationFrame(render);}
 function updateMotion(){
  const off=userDisabled||reducedQuery.matches;
  body.classList.toggle('motion-on',!off);
  button.setAttribute('aria-pressed',String(off));
  button.textContent=reducedQuery.matches?'系统已减少动态':userDisabled?'开启动效':'关闭动态';
  button.disabled=reducedQuery.matches;
  render();
 }
 button.hidden=false;
 button.addEventListener('click',()=>{userDisabled=!userDisabled;try{sessionStorage.setItem('vagus-motion-off',userDisabled?'1':'0');}catch{}updateMotion();});
 reducedQuery.addEventListener('change',updateMotion);
 window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);
 window.addEventListener('pageshow',queue);
 if(header&&navAccess){
  navAccess.addEventListener('click',()=>{keyboardOpen=true;render();nav[0]?.focus({preventScroll:true});});
  header.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();keyboardOpen=false;render();navAccess.focus({preventScroll:true});}});
  header.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(!header.contains(document.activeElement)){keyboardOpen=false;render();}}));
 }
 const ai=document.querySelector('.ai-scene');
 if(ai){
  if(typeof IntersectionObserver==='function'){
   const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){ai.classList.toggle('is-awake',true);observer.unobserve(ai);}},{threshold:.12});
   observer.observe(ai);
  }else ai.classList.toggle('is-awake',true);
 }
 const dialog=document.querySelector('#asset-dialog');let opener=null;
 document.querySelectorAll('[data-missing]').forEach(el=>{el.addEventListener('click',()=>{
  opener=el;document.querySelector('#dialog-title').textContent=el.dataset.missing+' · 待接入';
  document.querySelector('#dialog-description').textContent='当前原型尚未接入'+el.dataset.missing+'。';
  if(typeof dialog.showModal==='function')dialog.showModal();else alert(document.querySelector('#dialog-description').textContent);
 });el.hidden=false;});
 dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});});
 function focusHash(align=false){
  let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  const target=document.getElementById(id);
  if(target){if(align)target.scrollIntoView({block:'start',behavior:'auto'});target.focus({preventScroll:true});queue();}
 }
 window.addEventListener('hashchange',()=>focusHash());
 document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{if(a.hash===location.hash)requestAnimationFrame(()=>{document.getElementById(a.hash.slice(1))?.scrollIntoView();focusHash();});}));
 document.querySelectorAll('img').forEach(img=>img.addEventListener('load',queue,{once:true}));
 if(document.fonts)document.fonts.ready.then(queue);
 body.classList.toggle('js-enhanced',true);
 if(header)header.hidden=false;
 if(navAccess)navAccess.hidden=false;
 updateMotion();requestAnimationFrame(()=>focusHash(true));
})();
