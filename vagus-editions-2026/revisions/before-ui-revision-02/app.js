/* Progressive enhancement: readable HTML remains the fallback. No scroll hijacking. */
(function(){
 'use strict';
 const api=window.VagusState;if(!api)return;
 const body=document.body,button=document.querySelector('.motion-toggle');
 const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
 const desktopQuery=matchMedia('(min-width:1100px) and (min-height:700px)');
 const tracks=[...document.querySelectorAll('[data-scene]')];
 const sections=[...document.querySelectorAll('[data-section]')];
 const nav=[...document.querySelectorAll('.site-header nav a')];
 let userDisabled=false,scheduled=0;
 try{userDisabled=sessionStorage.getItem('vagus-motion-off')==='1';}catch{}
 function render(){
  scheduled=0;
  const activeMotion=!userDisabled&&!reducedQuery.matches&&desktopQuery.matches;
  const y=window.scrollY,h=window.innerHeight;
  for(const track of tracks){
   const rect=track.getBoundingClientRect();
   const p=api.progress(y,rect.top+y,Math.max(0,rect.height-h));
   const f=api.sceneFrame(track.dataset.scene,p,!activeMotion);
   const stage=track.firstElementChild;
   stage.style.setProperty('--art-scale',f.scale);
   stage.style.setProperty('--art-y',f.y+'px');
   stage.style.setProperty('--title-opacity',f.titleOpacity);
   stage.style.setProperty('--boundary',f.boundary+'%');
   stage.style.setProperty('--accent',f.accent);
   stage.classList.toggle('surface-active',activeMotion&&f.boundary<9);
  }
  const editorial=document.querySelector('[data-editorial]');
  if(editorial){const p=api.progress(y,editorial.getBoundingClientRect().top+y,editorial.offsetHeight);editorial.style.setProperty('--art-scale',activeMotion?1.025-.025*p:1);}
  let current=sections[0];
  for(const section of sections)if(section.getBoundingClientRect().top<=h*.35)current=section;
  for(const link of nav){if(link.hash==='#'+current.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
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
 reducedQuery.addEventListener('change',updateMotion);desktopQuery.addEventListener('change',updateMotion);
 window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);
 window.addEventListener('pageshow',queue);
 const dialogue=api.createDialogue();const next=document.querySelector('.continue');
 next.hidden=false;
 next.addEventListener('click',()=>{
  const state=dialogue.advance();document.querySelector('#speaker').textContent=state.speaker;
  const title=document.querySelector('#dialogue-title');title.textContent=state.title;title.hidden=!state.title;
  document.querySelector('#dialogue-text').textContent=state.text;next.hidden=!state.canAdvance;
  if(!state.canAdvance)document.querySelector('.choices .primary').focus({preventScroll:true});
 });
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
 updateMotion();requestAnimationFrame(()=>focusHash(true));
})();
