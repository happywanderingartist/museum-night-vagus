const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
// Static declared-colour calculation, not a rendered browser contrast audit.
// Catches a transparent/low-contrast reading jump when the paper crosses it.
const css=fs.readFileSync(require.resolve('../style.css'),'utf8');
function declarations(selector){const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const m=css.match(new RegExp(escaped+'\\{([^}]+)\\}'));return Object.fromEntries((m?.[1]||'').split(';').filter(x=>x.includes(':')).map(x=>{const i=x.indexOf(':');return [x.slice(0,i).trim(),x.slice(i+1).trim()];}));}
function light(hex){const a=hex.replace('#','');const values=[0,2,4].map(i=>{const x=parseInt(a.slice(i,i+2),16)/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return values[0]*.2126+values[1]*.7152+values[2]*.0722;}
test('reading jump retains at least 4.5:1 declared contrast when paper covers it',()=>{
 const link=declarations('.scene-enter');
 for(const kind of ['start','hug']){
  const vars=declarations('.'+kind),resolve=v=>v?.startsWith('var(')?vars[v.slice(4,-1)]:v;
  const fore=resolve(link.color),back=resolve(link.background)||vars['--paper'];
  assert.match(fore,/^#[a-f0-9]{6}$/i);assert.match(back,/^#[a-f0-9]{6}$/i);
  const x=light(fore),y=light(back);assert.ok((Math.max(x,y)+.05)/(Math.min(x,y)+.05)>=4.5,kind+' reading jump loses contrast');
 }
});
test('dark chapter body actually inherits light text rather than the root dark ink',()=>{
 const root=declarations(':root');
 const resolve=(value,tokens)=>value?.startsWith('var(')?tokens[value.slice(4,-1)]:value;
 const rootInk=resolve(root.color,root);
 for(const kind of ['ai','start']){
  const tokens={...root,...declarations('.'+kind)};
  const localColour=declarations('.reading').color||declarations('.chapter').color;
  const fore=localColour?resolve(localColour,tokens):rootInk;
  const back=resolve(declarations('.paper').background,tokens);
  const x=light(fore),y=light(back);
  assert.ok((Math.max(x,y)+.05)/(Math.min(x,y)+.05)>=4.5,kind+' body text lost contrast through inheritance');
 }
});
