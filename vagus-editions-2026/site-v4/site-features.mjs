import {filterEntries} from './catalog-state.mjs';
import {resolveContentURL,personalWorkItems} from './content-state.mjs';

const cards=[...document.querySelectorAll('[data-catalog-item]')];
if(cards.length){
 const buttons=[...document.querySelectorAll('[data-category-filter]')],input=document.querySelector('[data-catalog-search]');
 const params=new URLSearchParams(location.search);let category=params.get('category')||'全部';
 if(!buttons.some(b=>b.dataset.categoryFilter===category))category='全部';
 input.value=params.get('q')||'';
 const rows=cards.map(el=>({el,title:el.dataset.title,category:el.dataset.category,description:el.dataset.description}));
 function update(){
  const matches=new Set(filterEntries(rows,category,input.value));
  rows.forEach(row=>{row.el.hidden=!matches.has(row);});
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.categoryFilter===category)));
  document.querySelector('[data-catalog-count]').textContent=matches.size+' 个展示方向';
  document.querySelector('[data-catalog-empty]').hidden=matches.size!==0;
  const url=new URL(location.href);if(category==='全部')url.searchParams.delete('category');else url.searchParams.set('category',category);
  if(input.value.trim())url.searchParams.set('q',input.value.trim());else url.searchParams.delete('q');
  history.replaceState(null,'',url);
 }
 buttons.forEach(b=>b.addEventListener('click',()=>{category=b.dataset.categoryFilter;update();}));
 input.addEventListener('input',update);
 document.querySelector('[data-catalog-reset]').addEventListener('click',()=>{category='全部';input.value='';update();input.focus();});
 document.querySelector('[data-filter-tools]').hidden=false;update();
}

const dialog=document.querySelector('[data-image-dialog]');
if(dialog&&typeof dialog.showModal==='function'){
 let index=0,opener=null,items=[];const full=dialog.querySelector('[data-image-full]');
 function show(next){index=(next+items.length)%items.length;const item=items[index];full.src=item.href;full.alt=item.querySelector('img').alt;dialog.querySelector('[data-image-caption]').textContent=item.dataset.caption;dialog.querySelector('[data-gallery-position]').textContent=(index+1)+' / '+items.length;}
 document.addEventListener('click',event=>{
  const item=event.target.closest?.('[data-gallery]');if(!item)return;
  event.preventDefault();opener=item;const group=item.dataset.galleryGroup||'art';
  items=[...document.querySelectorAll('[data-gallery]')].filter(el=>(el.dataset.galleryGroup||'art')===group);
  show(items.indexOf(item));dialog.showModal();document.body.classList.add('has-image-viewer');dialog.querySelector('[data-gallery-close]').focus();
 });
 const close=()=>dialog.close();dialog.querySelector('[data-gallery-close]').addEventListener('click',close);
 dialog.querySelector('[data-gallery-previous]').addEventListener('click',()=>show(index-1));dialog.querySelector('[data-gallery-next]').addEventListener('click',()=>show(index+1));
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();show(index-1);}if(event.key==='ArrowRight'){event.preventDefault();show(index+1);}});
 dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
 dialog.addEventListener('close',()=>{document.body.classList.remove('has-image-viewer');full.removeAttribute('src');opener?.focus({preventScroll:true});});
 full.addEventListener('error',()=>{if(dialog.open)dialog.querySelector('[data-gallery-position]').textContent='图片暂时无法读取 · '+(index+1)+' / '+items.length;});
}

const safeLink=value=>resolveContentURL(value,location.href);
// Optional real materials progressively enhance otherwise complete static reading.
fetch('./assets/site-content.json').then(r=>{if(!r.ok)throw Error('Content not connected');return r.json();}).then(content=>{
 const resume=safeLink(content.resume?.url);
 if(resume){document.querySelectorAll('[data-resume-link],[data-resume-download]').forEach(a=>{a.href=resume;a.hidden=false;});document.querySelectorAll('[data-resume-pending]').forEach(el=>{el.hidden=true;});const description=document.querySelector('[data-resume-description]');if(description)description.textContent='按求职方向准备了两份两页简历：AI 产品运营与 AI 内容策略。';}
 const email=content.contact?.email;
 if(typeof email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){document.querySelectorAll('[data-contact-link]').forEach(a=>{a.href='mailto:'+email;a.textContent=email;a.hidden=false;});const description=document.querySelector('[data-contact-description]');if(description)description.textContent='欢迎通过下面的邮箱联系，交流作品、创意与合作。';}
 for(const article of Array.isArray(content.articles)?content.articles:[]){
  if(!article||typeof article!=='object'||typeof article.id!=='string')continue;
  const url=safeLink(article.url);if(!url)continue;
  document.querySelectorAll('[data-article-link]').forEach(a=>{if(a.dataset.articleLink===article.id){a.href=url;a.hidden=false;}});
  document.querySelectorAll('[data-source-pending]').forEach(el=>{if(el.dataset.sourcePending===article.id)el.hidden=true;});
 }
 const audio=document.querySelector('[data-audio-player]'),src=safeLink(content.audio?.src);
 if(audio&&src){
  const message=document.querySelector('[data-audio-message]');audio.src=src;audio.hidden=false;
  const title=typeof content.audio.title==='string'&&content.audio.title.trim()?content.audio.title.trim():'已提供的音频';
  document.querySelector('[data-audio-empty]').hidden=true;message.textContent=title;
  document.querySelectorAll('[data-audio-pending]').forEach(el=>{el.hidden=true;});
  const description=document.querySelector('[data-audio-description]');
  if(description)description.textContent=title+'。可以通过上方播放器收听；封面、文字稿及本人制作说明按真实材料另行补充。';
  audio.addEventListener('error',()=>{audio.hidden=true;document.querySelector('[data-audio-empty]').hidden=false;message.textContent='音频暂时无法读取，页面内容仍可继续阅读。';if(description)description.textContent=title+'的文件暂时无法读取。可以继续阅读节目与制作说明。';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause();});
 }
 const personal=document.querySelector('[data-personal-gallery]'),works=personalWorkItems(content.personalWorks,location.href);
 if(personal&&works.length){
  document.querySelectorAll('[data-personal-pending]').forEach(el=>{el.hidden=true;});
  const heading=document.querySelector('[data-personal-heading]');if(heading)heading.textContent='作品，与它的细节。';
  const description=document.querySelector('[data-personal-description]');if(description)description.textContent='按原始比例查看作品。点击放大后，可用方向键切换，用 Esc 关闭。';
  for(const work of works){
   const figure=document.createElement('figure'),link=document.createElement('a'),img=document.createElement('img'),caption=document.createElement('figcaption');
   link.href=work.src;link.dataset.gallery='';link.dataset.galleryGroup='personal';link.dataset.caption=work.caption;link.setAttribute('aria-label','放大查看：'+work.title);
   img.src=work.src;img.alt=work.alt;img.loading='lazy';caption.textContent=work.title;link.append(img);figure.append(link,caption);personal.append(figure);
  }
 }
}).catch(()=>{/* Static content and honest missing-material states remain visible. */});

function focusHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(target&&target.hasAttribute('tabindex'))target.focus({preventScroll:true});}
if(!document.querySelector('.home')){addEventListener('hashchange',focusHash);focusHash();}
