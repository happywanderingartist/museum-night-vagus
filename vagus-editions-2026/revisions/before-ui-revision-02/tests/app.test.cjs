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
   addEventListener(n,f){listeners[n]=f;},fire(n){listeners[n]?.();},
   setAttribute(n,v){attrs[n]=v;},removeAttribute(n){delete attrs[n];},getAttribute(n){return attrs[n];},
   focus(){focused=this;},scrollIntoView(){this.scrolled=(this.scrolled||0)+1;},
   style:{setProperty(n,v){css[n]=v;}},classList:{toggle(n,on){on?classes.add(n):classes.delete(n);},contains(n){return classes.has(n);}},
   getBoundingClientRect(){return {top:0,height:1575};},offsetHeight:900,css};
 }
 const nodes={};for(const key of ['.motion-toggle','.continue','#speaker','#dialogue-title','#dialogue-text','.choices .primary','#asset-dialog','#dialog-title','#dialog-description'])nodes[key]=element(key);
 const body=element('body'),target=element('start-reading'),missing=element('missing');missing.dataset.missing='START 真实原型';missing.hidden=true;
 const dialog=nodes['#asset-dialog'];dialog.showModal=()=>dialog.open=true;
 const stage=element('stage'),track=element('start');track.dataset.scene='start';track.firstElementChild=stage;
 const home=element('home'),start=element('start');const navHome=element(),navStart=element();navHome.hash='#home';navStart.hash='#start';
 const doc={body,querySelector:s=>nodes[s]||null,querySelectorAll:s=>({'[data-scene]':[track],'[data-section]':[home,start],'.site-header nav a':[navHome,navStart],'[data-missing]':[missing],'a[href^="#"]':[],'img':[]}[s]||[]),getElementById:id=>id==='start-reading'?target:null};
 const win={VagusState:api,scrollY:0,innerHeight:900,addEventListener(n,f){events[n]=f;}};
 const storage=new Map();
 const context={window:win,document:doc,location:{hash},matchMedia:q=>{const m={matches:!q.includes('prefers'),addEventListener(n,f){this.listener=f;}};media.push(m);return m;},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame:f=>(frames.push(f),frames.length),alert:()=>{}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../app.js'),'utf8'),context);
 return {nodes,body,target,missing,dialog,media,events,win,focused:()=>focused,flush(){while(frames.length)frames.shift()();}};
}
test('dialogue click renders invitation and restores visible keyboard path',()=>{
 const b=boot();b.nodes['.continue'].fire('click');
 assert.equal(b.nodes['#speaker'].textContent,'Vagus');assert.equal(b.nodes['#dialogue-title'].hidden,false);
 assert.equal(b.nodes['.continue'].hidden,true);assert.equal(b.focused(),b.nodes['.choices .primary']);
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
