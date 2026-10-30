import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const mod = await import('../assets/motion-runtime.mjs').catch(() => null);
test('reference runtime is included and exports a pure timeline sampler', () => {
 assert.equal(typeof mod?.sampleScene,'function','Missing executable scene timeline');
});
test('immersive scene separates camera pullback, title exit and reading handoff', () => {
 assert.ok(mod,'Missing executable scene timeline');
 const a=mod.sampleScene('immersive',0), b=mod.sampleScene('immersive',.45), c=mod.sampleScene('immersive',1);
 assert.ok(a.subject.scale>b.subject.scale);
 assert.ok(a.title.opacity>b.title.opacity);
 assert.ok(b.description.opacity>a.description.opacity);
 assert.equal(c.reading.reveal,1);
 assert.equal(a.reading.reveal,0);
 assert.notEqual(a.background.scale-b.background.scale,a.subject.scale-b.subject.scale);
});
test('editorial scene uses restrained crop progression, not immersive stage choreography', () => {
 assert.ok(mod);
 const a=mod.sampleScene('editorial',0),b=mod.sampleScene('editorial',1);
 assert.ok(Math.abs(a.subject.scale-b.subject.scale)<.1);
 assert.equal(a.title.opacity,1);
 assert.equal(b.title.opacity,1);
 assert.equal(b.reading.reveal,0);
});
test('sampling is reversible without hidden playhead or spring drift',()=>{
 assert.ok(mod);
 const a=mod.sampleScene('immersive',.4);
 mod.sampleScene('immersive',.9);
 assert.deepEqual(mod.sampleScene('immersive',.4),a);
});
test('input clamps, rejects unknown profiles and guards invalid geometry',()=>{
 assert.ok(mod);
 assert.deepEqual(mod.sampleScene('immersive',-9),mod.sampleScene('immersive',0));
 assert.deepEqual(mod.sampleScene('immersive',9),mod.sampleScene('immersive',1));
 assert.throws(()=>mod.sampleScene('unknown',0));
 assert.throws(()=>mod.sampleScene('immersive',NaN));
 assert.equal(mod.sceneProgress(100,100,0,900),0);
 assert.equal(mod.sceneProgress(550,100,1800,900),.5);
});
test('reduced or single-column mode keeps all content visible in static document flow',()=>{
 assert.ok(mod);
 for(const p of [0,.25,.5,.75,1]){
  const v=mod.sampleScene('immersive',p,{static:true});
  assert.equal(v.title.opacity,1);assert.equal(v.description.opacity,1);
  assert.equal(v.subject.scale,1);assert.equal(v.reading.reveal,0);
 }
});
test('reading material overscans past its irregular top edge at the final frame',()=>{
 assert.ok(mod);
 const edge={style:{}};
 const root={dataset:{},querySelector:s=>s==='[data-layer="reading"]'?edge:null};
 mod.applyScene(root,mod.sampleScene('immersive',1));
 assert.equal(edge.style.transform,'translateY(-6%)');
});
test('foreground links switch to reading ink as the material covers their lower safe area',()=>{
 assert.ok(mod);
 assert.equal(mod.sampleScene('immersive',.6).navTone,'light');
});
test('short editorial scenes advance as they leave the viewport without a sticky spacer',()=>{
 assert.equal(mod.sceneProgress(100,100,720,900,'editorial'),0);
 assert.equal(mod.sceneProgress(460,100,720,900,'editorial'),.5);
 assert.equal(mod.sceneProgress(820,100,720,900,'editorial'),1);
 assert.equal(mod.sceneProgress(1000,100,720,900,'editorial'),1);
 assert.equal(mod.sceneProgress(100,100,0,900,'editorial'),0);
});
test('editorial progress reverses and also works for scenes taller than the viewport',()=>{
 assert.equal(mod.sceneProgress(1000,100,1800,900,'editorial'),.5);
 assert.equal(mod.sceneProgress(550,100,1800,900,'editorial'),.25);
 assert.equal(mod.sceneProgress(0,100,720,900,'editorial'),0);
});
// Numeric CSS geometry preflight, not a substitute for browser layout/screenshot checks.
// A regression to zero gutters must expose the runtime's upward translation.
test('shared layer gutters cover the background through both timelines',async()=>{
 const css=await readFile(new URL('../assets/motion.css',import.meta.url),'utf8');
 const bleed=Number(css.match(/--scene-bleed:\s*([\d.]+)px/)?.[1]??0);
 for(const profile of ['immersive','editorial']) for(const height of [320,720,900,1440]) {
  for(let step=0;step<=100;step++) {
   const {scale,y}=mod.sampleScene(profile,step/100).background;
   const size=height+2*bleed,origin=.55*size;
   const top=-bleed+origin*(1-scale)+y;
   const bottom=-bleed+origin+(size-origin)*scale+y;
   assert.ok(top<=1e-7&&bottom>=height-1e-7,`${profile} p=${step/100}: ${top}..${bottom} misses 0..${height}`);
  }
 }
});
