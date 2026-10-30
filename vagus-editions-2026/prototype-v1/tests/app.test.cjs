const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const api=require('../state.js');
// Narrow DOM boundary double, not a browser/rendering test. Execute the real app
// to check its public event effects. Removing handlers/focus/scroll calls fails.
function boot(hash=''){
 const events={},frames=[],media=[];
 let focused=null;
 function element(id=''){
  const listeners={},attrs={},classes=new Set(),css={};
  return {id,hidden:false,textContent:'',disabled:false,dataset:{},isConnected:true,
   addEventListener(n,f){listeners[n]=f;},fire(n,event={}){listeners[n]?.(event);},
   setAttribute(n,v){attrs[n]=v;},removeAttribute(n){delete attrs[n];},getAttribute(n){return attrs[n];},
   focus(){focused=this;},scrollIntoView(){this.scrolled=(this.scrolled||0)+1;},
   style:{setProperty(n,v){css[n]=v;}},classList:{toggle(n,on){on?classes.add(n):classes.delete(n);},contains(n){return classes.has(n);}},
   querySelector(){return null;},getBoundingClientRect(){return {top:id==='start'?-win.scrollY:0,height:720};},offsetHeight:720,css};
 }
 const nodes={};for(const key of ['.site-header','.nav-access','.motion-toggle','.continue','#speaker','#dialogue-title','#dialogue-text','.choices .primary','#asset-dialog','#dialog-title','#dialog-description'])nodes[key]=element(key);
 nodes['.site-header'].hidden=true;
 nodes['.nav-access'].hidden=true;
 const body=element('body'),target=element('start-reading'),missing=element('missing');missing.dataset.missing='START 真实原型';missing.hidden=true;
 const dialog=nodes['#asset-dialog'];dialog.showModal=()=>dialog.open=true;
 const stage=element('stage'),track=element('start'),art=element('art');track.dataset.motionScene='start';track.dataset.scene='start';track.firstElementChild=stage;track.querySelector=s=>s==='.scene-art, .home-art'?art:null;
 const home=element('home'),start=element('start');const navHome=element(),navStart=element();navHome.hash='#home';navStart.hash='#start';
 nodes['.site-header'].contains=target=>[nodes['.site-header'],navHome,navStart].includes(target);
 const doc={body,querySelector:s=>nodes[s]||null,querySelectorAll:s=>({'[data-motion-scene]':[track],'[data-scene]':[track],'[data-section]':[home,start],'.site-header nav a':[navHome,navStart],'[data-missing]':[missing],'a[href^="#"]':[],'img':[]}[s]||[]),getElementById:id=>id==='start-reading'?target:null};
 Object.defineProperty(doc,'activeElement',{get:()=>focused});
 const win={VagusState:api,scrollY:0,innerHeight:900,addEventListener(n,f){events[n]=f;}};
 const storage=new Map();
 const context={window:win,document:doc,location:{hash},matchMedia:q=>{const m={matches:!q.includes('prefers'),addEventListener(n,f){this.listener=f;}};media.push(m);return m;},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame:f=>(frames.push(f),frames.length),alert:()=>{}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../app.js'),'utf8'),context);
 return {nodes,body,target,missing,dialog,media,events,win,art,navHome,focused:()=>focused,flush(){while(frames.length)frames.shift()();}};
}
test('navigation appears on scroll and hides on return without stealing focus for intro',()=>{
 const b=boot();assert.equal(b.focused(),null);assert.equal(b.nodes['.site-header'].hidden,false);assert.equal(b.nodes['.site-header'].classList.contains('is-visible'),false);
 b.win.scrollY=200;b.events.scroll();b.flush();assert.equal(b.nodes['.site-header'].classList.contains('is-visible'),true);
 b.win.scrollY=0;b.events.scroll();b.flush();assert.equal(b.nodes['.site-header'].classList.contains('is-visible'),false);
});
test('short viewport still receives real scroll transforms and static switch resets them',()=>{
 const b=boot();b.win.innerHeight=474;b.win.scrollY=160;b.events.scroll();b.flush();
 assert.match(b.art.style.transform,/translate3d/);assert.notEqual(b.art.style.transform,'translate3d(0,0px,0) scale(1)');
 b.nodes['.motion-toggle'].fire('click');assert.equal(b.art.style.transform,'translate3d(0,0px,0) scale(1)');
});
test('motion switch and system preference disable the scrolling enhancement',()=>{
 const b=boot();assert.ok(b.body.classList.contains('motion-on'));
 b.nodes['.motion-toggle'].fire('click');assert.equal(b.body.classList.contains('motion-on'),false);
 b.media[0].matches=true;b.media[0].listener();assert.equal(b.nodes['.motion-toggle'].disabled,true);
});
test('missing asset dialog uses explicit state and returns focus on close',()=>{
 const b=boot();assert.equal(b.missing.hidden,false);b.missing.fire('click');assert.equal(b.dialog.open,true);
 assert.match(b.nodes['#dialog-title'].textContent,/待接入/);
 assert.match(b.nodes['#dialog-description'].textContent,/尚未接入START/);
 b.dialog.fire('close');assert.equal(b.focused(),b.missing);
});
test('direct fragment is aligned after enhanced layout, not only focused offscreen',()=>{
 const b=boot('#start-reading');b.flush();assert.equal(b.focused(),b.target);assert.ok(b.target.scrolled>0);
});
test('malformed fragment never crashes the enhancement',()=>{assert.doesNotThrow(()=>boot('#%ZZ'));});
test('keyboard navigation opens before any scrolling and Escape returns to its trigger',()=>{
 const b=boot(),entry=b.nodes['.nav-access'],header=b.nodes['.site-header'];
 assert.equal(entry.hidden,false);entry.fire('click');
 assert.equal(header.classList.contains('keyboard-open'),true);assert.equal(entry.getAttribute('aria-expanded'),'true');
 assert.equal(b.focused(),b.navHome);let prevented=false;
 header.fire('keydown',{key:'Escape',preventDefault(){prevented=true;}});
 assert.equal(header.classList.contains('keyboard-open'),false);assert.equal(entry.getAttribute('aria-expanded'),'false');
 assert.equal(b.focused(),entry);assert.equal(prevented,true);
});
