import {clamp,spherePoints,dimensions,cardDepth,appearance} from './archive-motion.mjs';

const config=JSON.parse(document.querySelector('#archive-data').textContent);
const stage=document.querySelector('#stage'),world=document.querySelector('#world'),orb=document.querySelector('#orb');
const headline=document.querySelector('#headline'),grid=document.querySelector('#grid'),rows=document.querySelector('.rows');
const gridButton=document.querySelector('#gridBtn'),motionButton=document.querySelector('#motionBtn');
const dialog=document.querySelector('#lit'),plate=dialog.querySelector('.plate');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer:coarse)');
const points=spherePoints(config.items.length),cards=[],previews=new Map();
let size=dimensions(innerWidth,innerHeight),yaw=0,dragPitch=0,velocityX=0,velocityY=0,camera=0;
let pointer=null,reading=-1,sourceElement=null,closeRun=0,gridVisible=false,motionOff=reduced.matches;
let animationFrame=0;

function picture(item){
 const image=document.createElement('img');
 image.src=item.image;image.alt=item.title;image.decoding='async';
 return image;
}
async function decodePreview(url){
 const image=new Image();image.crossOrigin='anonymous';image.src=url;
 try{
  await image.decode();
  const width=innerWidth<=380?420:innerWidth<=640?520:innerWidth<=900?640:760;
  if(image.naturalWidth<=width)return;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=Math.round(image.naturalHeight*width/image.naturalWidth);
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  let preview;
  if(config.vagus){
   // The existing site's CSP permits data images. Keep its security policy intact.
   preview=canvas.toDataURL('image/webp',.88);
  }else{
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.88));
   if(!blob)return;
   preview=URL.createObjectURL(blob);
  }
  previews.set(url,preview);
  document.querySelectorAll('.card img,.grid-card img').forEach(element=>{if(element.getAttribute('src')===url)element.src=preview;});
 }catch{
  // Keep the original local image when decode or canvas export is unavailable.
 }
}
for(const [index,item] of config.items.entries()){
 const card=document.createElement('button');
 card.type='button';card.className='card'+(item.tall?' tall':'');card.dataset.idx=String(index);
 card.setAttribute('aria-label',item.title);
 const figure=document.createElement('figure');figure.append(picture(item));card.append(figure);
 const back=document.createElement('span');back.className='card-back';back.textContent='Vagus';back.setAttribute('aria-hidden','true');card.append(back);
 card.addEventListener('click',event=>{if(event.detail===0)openShot(index,card,false);});
 orb.append(card);cards.push(card);
}
const uniqueItems=[...new Map(config.items.map((item,index)=>[item.href||item.id,{...item,index}])).values()];
for(const item of uniqueItems){
 const button=document.createElement('button');button.type='button';button.className='grid-card';
 const figure=document.createElement('figure');figure.append(picture(item));
 const caption=document.createElement('figcaption');caption.textContent=item.title;
 button.append(figure,caption);
 if(item.description){const text=document.createElement('span');text.textContent=item.description;button.append(text);}
 button.addEventListener('click',event=>openShot(item.index,button,event.detail>0));rows.append(button);
}
for(const image of new Set(config.items.map(item=>item.image)))decodePreview(image);

function layout(){
 size=dimensions(innerWidth,innerHeight);
 document.documentElement.style.setProperty('--persp',size.perspective+'px');
 orb.style.setProperty('--cw',size.cardWidth+'px');
 points.forEach((point,index)=>{
  cards[index].style.transform=`translate3d(${point.x*size.radius}px,${-point.y*size.radius}px,${point.z*size.radius}px) rotateY(${point.longitude}deg) rotateX(${point.latitude}deg)`;
 });
}
function render(){
 animationFrame=0;
 const progress=clamp(scrollY/(innerHeight*.16),0,1);
 if(!pointer&&reading<0&&!gridVisible&&!motionOff){
  yaw+=velocityX;dragPitch+=velocityY;velocityX*=.94;velocityY*=.94;
  if(Math.abs(velocityX)<.002)velocityX=0;
  if(Math.abs(velocityY)<.002)velocityY=0;
 }
 dragPitch=clamp(dragPitch,-28,36);
 if(reading<0&&!gridVisible)camera+=(progress*Math.min(64,size.radius*.12)-camera)*.075;
 const pitch=-4+dragPitch;
 world.style.transform=`translateZ(${camera}px) rotateY(${yaw}deg) rotateX(${pitch}deg)`;
 headline.style.transform=`rotateX(${-pitch}deg) rotateY(${-yaw}deg) translateZ(${size.radius*.62}px)`;
 headline.style.opacity=String(Math.max(0,1-progress*.55));
 document.body.classList.toggle('deep',progress>.45);
 document.documentElement.dataset.progress=progress.toFixed(4);
 document.documentElement.dataset.camera=camera.toFixed(3);
 points.forEach((point,index)=>{
  const depth=cardDepth(point,pitch,yaw);
  const tone=appearance(depth,size.radius,camera,size.perspective,progress,index===reading,reading>=0);
  const card=cards[index],dim=tone.dim.toFixed(3),opacity=tone.opacity.toFixed(3);
  if(card.style.opacity!==opacity)card.style.opacity=opacity;
  if(card.dataset.dim!==dim){card.style.setProperty('--d',dim);card.dataset.dim=dim;}
  card.tabIndex=config.vagus&&depth<0?-1:0;
 });
 if(!document.hidden&&!motionOff)animationFrame=requestAnimationFrame(render);
}
function restart(){if(!animationFrame)render();}
function showGrid(show){
 gridVisible=show;grid.hidden=!show;
 document.body.classList.toggle('gridview',show);
 stage.inert=show;
 gridButton.setAttribute('aria-pressed',String(show));gridButton.textContent=show?'空间浏览':'平面目录';
 if(!show)restart();
}
function setMotion(off){
 motionOff=off;pointer=null;velocityX=0;velocityY=0;
 motionButton.textContent=off?'启用动态':'静态目录';motionButton.setAttribute('aria-pressed',String(off));
 if(off&&animationFrame){cancelAnimationFrame(animationFrame);animationFrame=0;}
 showGrid(off);motionButton.disabled=reduced.matches;gridButton.disabled=off;
}
function openShot(index,element,animate=true){
 const item=config.items[index];
 const ticket=++closeRun;reading=index;sourceElement=element;
 const detailImage=dialog.querySelector('img');detailImage.src=previews.get(item.image)||item.image;detailImage.alt=item.title;
 if(previews.has(item.image)){
  const full=new Image();full.src=item.image;
  full.decode().then(()=>{if(ticket===closeRun&&reading===index)detailImage.src=item.image;}).catch(()=>{});
 }
 dialog.querySelector('h2').textContent=item.title;
 dialog.querySelector('.detail-description').textContent=item.description||'Nature Portfolio · 公开规范运动研究';
 const entrance=dialog.querySelector('.detail-link');entrance.hidden=!item.href;
 if(item.href)entrance.href=item.href;
 document.body.classList.add('lit');dialog.showModal();restart();
 if(animate&&!reduced.matches){
  const source=element.getBoundingClientRect(),target=plate.getBoundingClientRect();
  plate.animate([{transform:`translate(${source.x+source.width/2-target.x-target.width/2}px,${source.y+source.height/2-target.y-target.height/2}px) scale(${Math.max(.04,source.width/target.width)})`,opacity:0},{transform:'none',opacity:1}],{duration:620,easing:'ease'});
 }
}
function closeShot(){
 closeRun++;plate.getAnimations().forEach(animation=>animation.cancel());
 dialog.close();reading=-1;document.body.classList.remove('lit');sourceElement?.focus({preventScroll:true});restart();
}
dialog.querySelector('.close-shot').addEventListener('click',closeShot);
dialog.addEventListener('cancel',event=>{event.preventDefault();closeShot();});
dialog.addEventListener('click',event=>{if(event.target===dialog)closeShot();});
gridButton.addEventListener('click',()=>showGrid(!gridVisible));
motionButton.addEventListener('click',()=>setMotion(!motionOff));
reduced.addEventListener('change',()=>setMotion(reduced.matches));
stage.addEventListener('pointerdown',event=>{
 if(reading>=0||motionOff)return;
 const card=event.target.closest('.card');
 pointer={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,index:card?Number(card.dataset.idx):-1,element:card,captured:!coarse.matches};
 velocityX=0;velocityY=0;
 if(pointer.captured)stage.setPointerCapture(event.pointerId);
});
stage.addEventListener('pointermove',event=>{
 if(!pointer||pointer.id!==event.pointerId)return;
 const horizontal=Math.abs(event.clientX-pointer.x),vertical=Math.abs(event.clientY-pointer.y);
 if(!pointer.captured){
  if(Math.max(horizontal,vertical)<10)return;
  if(vertical>horizontal*1.15){pointer=null;return;}
  stage.setPointerCapture(event.pointerId);pointer.captured=true;
 }
 velocityX=(event.clientX-pointer.lastX)*.13;velocityY=-(event.clientY-pointer.lastY)*.13;
 yaw+=velocityX;dragPitch+=velocityY;pointer.lastX=event.clientX;pointer.lastY=event.clientY;
});
stage.addEventListener('pointerup',event=>{
 if(!pointer||pointer.id!==event.pointerId)return;
 const ended=pointer;pointer=null;
 if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
 const moved=Math.hypot(event.clientX-ended.x,event.clientY-ended.y);
 if(moved<(coarse.matches?14:6)&&ended.index>=0)openShot(ended.index,ended.element);
});
stage.addEventListener('pointercancel',()=>{pointer=null;velocityX=0;velocityY=0;});
addEventListener('resize',()=>{layout();restart();});
addEventListener('scroll',()=>{if(motionOff)return;const max=innerHeight*.16;if(scrollY>max+1)scrollTo(0,max);restart();},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(animationFrame);animationFrame=0;}else restart();});
addEventListener('keydown',event=>{if(event.key==='Escape'&&!dialog.open&&gridVisible&&!motionOff){showGrid(false);gridButton.focus();}});

const intro=document.querySelector('#intro'),film=document.querySelector('#film');
if(film){
 let backstop;
 const finish=()=>{clearTimeout(backstop);film.pause();intro.hidden=true;document.body.classList.remove('locked');layout();};
 document.querySelector('#skip').addEventListener('click',finish);
 film.muted=true;film.defaultMuted=true;film.playsInline=true;film.playbackRate=2;
 film.addEventListener('play',()=>{film.playbackRate=2;});
 film.addEventListener('ended',finish,{once:true});film.addEventListener('error',finish,{once:true});
 backstop=setTimeout(finish,14000);
 if(reduced.matches)finish();else film.play().catch(()=>{clearTimeout(backstop);backstop=setTimeout(finish,2600);});
}
layout();setMotion(reduced.matches);restart();
