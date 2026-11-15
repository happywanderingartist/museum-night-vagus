import fs from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as motion from '../motion.mjs';

// Boundary doubles execute the actual controller. They do not simulate visual rendering.
const source=(await fs.readFile(new URL('../preview.mjs',import.meta.url),'utf8'))
 .replace(/^import[^\n]+\n/,'').replace("await import('./world.mjs')",'await loadWorld()');
const settle=()=>new Promise(r=>setImmediate(r));
function harness({height=810,hash=''}={}){
 const calls=[],frames=[],events={};let context,document,resolveDecode,failRender=false,failResize=false;
 const decoded=new Promise(r=>resolveDecode=r);
 function el(name){
  const classes=new Set(),style={setProperty(k,v){this[k]=v;}};
  return {name,id:name,style,dataset:{},attrs:{},listeners:{},inert:false,hidden:false,textContent:'',value:'',disabled:false,
   classList:{add(...s){s.forEach(n=>classes.add(n));},remove(...s){s.forEach(n=>classes.delete(n));},contains(n){return classes.has(n);},toggle(n,on){if(on)classes.add(n);else classes.delete(n);}},
   contains(target){return target===this||target?.parent===this;},
   focus(){document.activeElement=this;},scrollIntoView(){calls.push(['scrollIntoView',name]);},
   removeAttribute(k){if(k==='style'){Object.keys(style).filter(k=>k!=='setProperty').forEach(k=>delete style[k]);}else delete this.attrs[k];},
   setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},toggleAttribute(k,on){if(on)this.attrs[k]='';else delete this.attrs[k];},
   addEventListener(k,fn){this.listeners[k]=fn;},getBoundingClientRect(){return {top:0,bottom:810,height:810};}};
 }
 const elements=Object.fromEntries(['root','body','stage','home','ai','world','paint-rim','paint-inner','paint-edge','header','motion-toggle','progress','study-label','replay','keyframe','title','label','intro','links','all','quote','homeText','headerToggle','ai-reading'].map(n=>[n,el(n)]));
 elements['motion-toggle'].textContent='关闭动态';
 elements.home.querySelector=()=>({decode:()=>decoded});elements.home.querySelectorAll=()=>[elements.homeText];
 const aiChildren={h2:elements.title,'.section-label':elements.label,'.ai-intro':elements.intro,'.article-links':elements.links,'.text-link':elements.all,'.character-quote':elements.quote};
 elements.ai.querySelector=s=>s==='img'?{decode:()=>decoded}:aiChildren[s];
 elements.ai.getBoundingClientRect=()=>({top:context.innerHeight-context.scrollY,bottom:2*context.innerHeight-context.scrollY,height:context.innerHeight});
 elements['ai-reading'].getBoundingClientRect=()=>({top:(elements.root.classList.contains('v5-enhanced')?parseFloat(elements.root.style['--journey-height']):context.innerHeight*2)-context.scrollY});
 elements.header.querySelector=()=>elements.headerToggle;elements.header.querySelectorAll=()=>[];
 elements.keyframe.querySelectorAll=()=>[];
 document={documentElement:elements.root,body:elements.body,activeElement:null,querySelector:s=>s==='.site-header'?elements.header:elements[s.slice(1)],addEventListener(k,fn){events['document:'+k]=fn;}};
 const world={resize(w,h){calls.push(['resize',w,h]);if(failResize)throw Error('resize GPU failure');},render(q){calls.push(['render',q]);if(failRender)throw Error('GPU failure');},dispose(){calls.push(['dispose']);}};
 const reduced={matches:false,addEventListener(){}};
 const room={get matches(){return context.innerHeight>=640&&context.innerWidth>760;},addEventListener(){}};
 context=vm.createContext({...motion,document,innerHeight:height,innerWidth:1440,scrollY:0,URL,location:{href:'http://local/'+hash,pathname:'/',hash},history:{replaceState(){},pushState(){}},CSS:{supports:()=>true},matchMedia:q=>q.includes('prefers-reduced-motion')?reduced:room,
  requestAnimationFrame(fn){frames.push(fn);return frames.length;},scrollTo({top}){context.scrollY=top;calls.push(['scrollTo',top]);},addEventListener(k,fn){events[k]=fn;},console:{warn(...args){calls.push(['warn',...args]);}},loadWorld:async()=>({createWorld:()=>world})});
 vm.runInContext(source,context,{filename:'preview.mjs'});
 return {context,elements,calls,evaluate:code=>vm.runInContext(code,context),async ready(){resolveDecode();await settle();},async tick(){await settle();},toggle(){elements['motion-toggle'].listeners.click();},resize(h){context.innerHeight=h;events.resize();while(frames.length)frames.shift()();},failRender(){failRender=true;},failResize(){failResize=true;}};
}

test('off during pending image decode cancels enhancement',async()=>{
 const h=harness();await h.tick();h.toggle();await h.ready();
 assert.equal(h.evaluate('enabled'),false);assert.equal(h.evaluate('userOff'),true);assert.equal(h.elements.root.classList.contains('v5-enhanced'),false);
});
test('resize preserves mid-journey progress',async()=>{
 const h=harness();await h.ready();h.context.scrollY=486;h.evaluate('draw()');assert.equal(h.elements.root.dataset.progress,'0.5000');
 h.resize(1080);assert.equal(h.elements.root.dataset.progress,'0.5000');
});
test('resize in reading preserves reading anchor on screen',async()=>{
 const h=harness();await h.ready();h.context.scrollY=1800;
 const before=h.elements['ai-reading'].getBoundingClientRect().top;h.resize(1080);
 assert.equal(h.elements['ai-reading'].getBoundingClientRect().top,before);
});
test('runtime rendering failure releases sticky content into static flow',async()=>{
 const h=harness();await h.ready();h.context.scrollY=486;h.failRender();
 assert.doesNotThrow(()=>h.evaluate('draw()'));assert.equal(h.evaluate('enabled'),false);
 assert.equal(h.elements.root.classList.contains('v5-enhanced'),false);assert.equal(h.elements.home.inert,false);assert.equal(h.elements.ai.inert,false);
});
test('runtime resizing failure also releases content',async()=>{
 const h=harness();await h.ready();h.failResize();assert.doesNotThrow(()=>h.resize(1080));assert.equal(h.evaluate('enabled'),false);
});
test('416px desktop preview enables motion using actual viewport height',async()=>{
 const h=harness({height:416});await h.ready();assert.equal(h.evaluate('enabled'),true);assert.equal(h.elements.root.dataset.mode,'webgl');assert.equal(h.elements.root.style['--stage-height'],'416px');
});
test('very short window stays readable without WebGL or sticky travel',async()=>{
 const h=harness({height:320});await h.ready();assert.equal(h.evaluate('enabled'),false);assert.equal(h.elements.root.dataset.mode,'compact');assert.ok(!h.calls.some(c=>c[0]==='resize'));
});
test('direct AI hash arrives with complete links and focus',async()=>{
 const h=harness({hash:'#ai'});await h.ready();assert.equal(h.elements.root.dataset.progress,'1.0000');assert.equal(h.elements.ai.style.clipPath,'polygon(0% 0%,100% 0%,100% 100%,0% 100%)');assert.equal(h.elements.ai.style.opacity,undefined);assert.equal(h.elements.links.style.opacity,1);assert.equal(h.elements.ai.inert,false);assert.equal(h.elements.ai, h.context.document.activeElement);
});
