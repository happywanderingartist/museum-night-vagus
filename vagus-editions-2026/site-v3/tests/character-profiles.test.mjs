import {test} from 'node:test';import assert from 'node:assert/strict';
import {profileKinds,characterProfile,patchMesh,patchPose,patchVertex} from '../character-profiles.mjs';
import {triangleMatrix} from '../character-state.mjs';
import {mountCharacterMotion} from '../character-motion.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,a+' != '+b);
test('six remaining scenes have bounded, returning character actions',()=>{
 assert.deepEqual(profileKinds().sort(),['about','literature','podcast','start','visual','xiaohongshu']);
 for(const kind of profileKinds())for(const part of characterProfile(kind).parts){
  assert.equal(patchPose(part,0),0);assert.equal(patchPose(part,part.delay+part.rise+part.hold/2),1);
  assert.equal(patchPose(part,part.cycle-1),0);assert.equal(patchPose(part,part.cycle),0);
  const [l,t,r,b]=part.bounds;for(const p of [[l,t],[r,t],[r,b],[l,b],[(l+r)/2,t],[l,(t+b)/2]]){
   const q=patchVertex(part,p,1);near(q[0],p[0]);near(q[1],p[1]);
  }
 }
});
test('held props and hands share one rigid transform, with no folded triangles',()=>{
 for(const kind of profileKinds())for(const part of characterProfile(kind).parts){
  const [l,t,r,b]=part.rigid,points=[[l,t],[r,t],[r,b],[l,b]],out=points.map(p=>patchVertex(part,p,1));
  const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  near(dist(out[0],out[1])/dist(points[0],points[1]),1+part.scale);
  near(dist(out[0],out[2])/dist(points[0],points[2]),1+part.scale);
  assert.ok(dist(out[0],points[0])>1,kind+' visibly changes pose');
  for(const progress of [0,.25,.5,.75,1])for(const triangle of patchMesh(part)){
   const m=triangleMatrix(triangle,triangle.map(p=>patchVertex(part,p,progress)));assert.ok(m.a*m.d-m.b*m.c>.7,kind+' has no fold/collapse');
  }
 }
});
function fixture(kind,fail=false){
 let svg,serial=0;const frames=new Map(),sources=[],pieces=[];
 const w={document:{createElementNS(){svg={style:{},attributes:{},setAttribute(k,v){this.attributes[k]=v;},querySelector(){return null;},querySelectorAll(q){if(q!=='[data-patch-triangle]')return [];const count=[...this.innerHTML.matchAll(/data-patch-triangle=/g)].length;pieces.push(...Array.from({length:count},()=>({attributes:{},writes:0,setAttribute(k,v){this.attributes[k]=v;this.writes++;}})));return pieces;},remove(){this.removed=true;}};return svg;}},Image:class{set src(v){sources.push(v);queueMicrotask(()=>fail?this.onerror():this.onload());}},getComputedStyle:()=>({objectPosition:'50% 50%'}),requestAnimationFrame(fn){frames.set(++serial,fn);return serial;},cancelAnimationFrame(id){frames.delete(id);}};
 const actor=mountCharacterMotion(w,{kind,image:{clientWidth:1672,clientHeight:941},layer:{append(){}}});
 return {actor,svg,frames,pieces,sources,frame(t){const work=[...frames.values()];frames.clear();work.forEach(fn=>fn(t));}};
}
test('every new scene actually mounts, lazy-loads, changes its own pose and stops',async()=>{
 for(const kind of profileKinds()){const f=fixture(kind);assert.ok(f.actor,kind);assert.equal(f.sources.length,0);
  f.actor.setActive(true);await new Promise(r=>setImmediate(r));assert.deepEqual(f.sources,['assets/'+kind+'.webp']);
  f.frame(0);f.frame(1100);const still=f.pieces.map(p=>p.attributes.transform);
  f.frame(2800);assert.notDeepEqual(f.pieces.map(p=>p.attributes.transform),still,kind);
  f.frame(7100);const writes=f.pieces[0].writes;f.frame(7200);assert.equal(f.pieces[0].writes,writes,'rest does not rewrite triangles');
  f.actor.setActive(false);assert.equal(f.frames.size,0);assert.equal(f.svg.style.opacity,'0');f.actor.destroy();assert.equal(f.svg.removed,true);
 }
});
test('new actions leave the original scene visible when loading fails',async()=>{
 const f=fixture('about',true);f.actor.setActive(true);await new Promise(r=>setImmediate(r));assert.equal(f.frames.size,0);assert.equal(f.svg.style.opacity,'0');f.actor.destroy();
});
