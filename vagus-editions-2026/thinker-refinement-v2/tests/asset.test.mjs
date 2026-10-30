import {test,before} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three/three.module.js';
import {GLTFLoader} from '../vendor/three/addons/loaders/GLTFLoader.js';
let gltf,mixer,hand,phone;
before(async()=>{
 const b=await readFile(new URL('../assets/thinker-gray.glb',import.meta.url));
 gltf=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 hand=gltf.scene.getObjectByName('HandMesh');phone=gltf.scene.getObjectByName('Phone');
 assert.ok(hand?.isSkinnedMesh,'hand must be a real skinned volume, not a texture plane');
 mixer=new THREE.AnimationMixer(gltf.scene);mixer.clipAction(gltf.animations[0]).play();
});
function at(t){mixer.setTime(t);gltf.scene.updateMatrixWorld(true);hand.skeleton.update();}
function vertices(){const a=[];for(let i=0;i<hand.geometry.attributes.position.count;i++)a.push(hand.localToWorld(hand.getVertexPosition(i,new THREE.Vector3())));return a;}
test('continuous hand mesh has depth and an exported finger skeleton',()=>{
 at(0);const b=new THREE.Box3().setFromPoints(vertices()),s=b.getSize(new THREE.Vector3());
 assert.ok(s.z>.035&&s.y>.06&&s.x>.20);assert.ok(hand.skeleton.bones.length>=4);assert.ok(gltf.animations[0].duration>=7);assert.ok(hand.geometry.attributes.position.count>1500);
});
test('the hand is one connected surface instead of disconnected finger capsules',()=>{
 const p=hand.geometry.attributes.position,n=p.count,parent=Int32Array.from({length:n},(_,i)=>i),same=new Map();
 function root(a){while(parent[a]!==a){parent[a]=parent[parent[a]];a=parent[a];}return a;}
 function join(a,b){parent[root(a)]=root(b);}
 for(let i=0;i<n;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(x=>Math.round(x*1e7)).join(',');if(same.has(key))join(i,same.get(key));else same.set(key,i);}
 const ix=hand.geometry.index;for(let i=0;i<ix.count;i+=3){join(ix.getX(i),ix.getX(i+1));join(ix.getX(i),ix.getX(i+2));}
 assert.equal(new Set(Array.from({length:n},(_,i)=>root(i))).size,1,'hand contains detached geometry');
});
test('whole deformed hand stays outside glass and a defined pad patch makes numerical contact',()=>{
 for(let k=0;k<=70;k++){
  at(k/10);const points=vertices(),min=points.reduce((a,v)=>Math.min(a,v.z),Infinity);
  assert.ok(min>=.00548,`hand penetrates glass at ${k/10}s: ${min}`);
  const contact=points.filter(v=>v.x>-.036&&v.x<-.015&&v.z<.010&&v.y>.06&&v.y<.15);
  assert.ok(contact.length>5);const gap=Math.min(...contact.map(v=>v.z))-.0055;
  assert.ok(gap>=-.00002&&gap<.00008,`pad is not touching glass at ${k/10}s: ${gap}`);
 }
});
test('actual pad surface moves up 28mm while the phone and wrist stay fixed',()=>{
 function padY(){const p=vertices().filter(v=>v.z<.0068&&Math.abs(v.x)<.034);return p.reduce((s,v)=>s+v.y,0)/p.length;}
 at(0);const y0=padY(),matrix=phone.matrixWorld.elements.slice(),wrist=gltf.scene.getObjectByName('WristAnchor').getWorldPosition(new THREE.Vector3());
 at(1.2);assert.ok(Math.abs(padY()-y0-.028)<.001);
 for(const t of [.6,1.2,2.6,5.5,8]){at(t);assert.deepEqual(phone.matrixWorld.elements,matrix);assert.ok(gltf.scene.getObjectByName('WristAnchor').getWorldPosition(new THREE.Vector3()).distanceTo(wrist)<1e-7);}
});
test('the actual skinned mesh is still throughout the two-second thinking pause',()=>{
 at(5.1);const p=vertices();at(6.9);const q=vertices();assert.ok(p.every((v,i)=>v.distanceTo(q[i])<1e-6));
});
test('the actual wrist and forearm surface do not move along with the index',()=>{
 at(0);const baseline=vertices(),fixed=baseline.map((p,i)=>p.x<-.19?i:-1).filter(i=>i>=0);assert.ok(fixed.length>100);
 at(1.2);const moving=vertices();assert.ok(fixed.every(i=>moving[i].distanceTo(baseline[i])<1e-7),'wrist surface moved despite stationary anchor');
});
test('phone rests on the real page surface, rather than hovering above the book',()=>{
 at(0);const body=gltf.scene.getObjectByName('PhoneBody'),bottom=new THREE.Box3().setFromObject(body).min.y;
 const pages=gltf.scene.getObjectByName('BookPages'),ray=new THREE.Raycaster(new THREE.Vector3(0,.06,0),new THREE.Vector3(0,-1,0));
 const hit=ray.intersectObject(pages,true)[0];assert.ok(hit);assert.ok(Math.abs(bottom-hit.point.y)<.0008,`phone/book gap ${bottom-hit.point.y}`);
 const normal=hit.face.normal.clone().transformDirection(pages.matrixWorld);assert.ok(normal.y>.5,'upper page surface must face upward for correct light and shadow');
});
test('full phone underside clears the pages and includes a genuine support region',()=>{
 at(0);const body=gltf.scene.getObjectByName('PhoneBody'),pages=gltf.scene.getObjectByName('BookPages');let support=0,samples=0;
 for(let i=0;i<=16;i++)for(const z of [-.003,-.001,0,.001,.003]){
  const x=-.032+i*.004;
  const underside=new THREE.Raycaster(new THREE.Vector3(x,.019,z),new THREE.Vector3(0,1,0),0,.03).intersectObject(body,true)[0];
  const page=new THREE.Raycaster(new THREE.Vector3(x,.06,z),new THREE.Vector3(0,-1,0),0,.05).intersectObject(pages,true)[0];
  assert.ok(underside&&page);const gap=underside.point.y-page.point.y;samples++;
  assert.ok(gap>=-.00002,`underside enters page at ${x},${z}: ${gap}`);if(gap<.00008)support++;
 }
 assert.ok(samples===85&&support>=3,'phone must touch a support region, not float above every page sample');
});
test('default and close-up observer rays see shell and never the screen',()=>{
 at(0);for(const eye of [new THREE.Vector3(.28,.17,-.50),new THREE.Vector3(.17,.13,-.35)]){
  for(const x of [-.025,0,.025])for(const y of [.06,.105,.15]){
   const target=new THREE.Vector3(x,y,.0055),ray=new THREE.Raycaster(eye,target.sub(eye).normalize(),0,2),hit=ray.intersectObject(phone,true)[0];
   assert.ok(hit&&hit.object.name!=='Screen','observer can see glass');
  }
 }
});

test('adjacent palm edges do not tear across the index-weight transition',()=>{
 at(0);const rest=vertices(),ix=hand.geometry.index,edges=new Map();
 for(let k=0;k<ix.count;k+=3)for(const [a,b] of [[ix.getX(k),ix.getX(k+1)],[ix.getX(k+1),ix.getX(k+2)],[ix.getX(k+2),ix.getX(k)]]){
  const p=rest[a],q=rest[b],length=p.distanceTo(q);
  if(p.x>-.125&&p.x<-.075&&q.x>-.125&&q.x<-.075&&p.y>.085&&q.y>.085&&length>.0005&&length<.006)edges.set(Math.min(a,b)+','+Math.max(a,b),{a,b,length});
 }
 assert.ok(edges.size>100);
 for(const time of [.6,1.2,2.6,4.2]){at(time);const points=vertices();for(const {a,b,length} of edges.values())assert.ok(points[a].distanceTo(points[b])/length<1.8,`palm edge ${a}-${b} over-stretches at ${time}s: ${points[a].distanceTo(points[b])/length}`);}
});

test('curled fingers remain still instead of inheriting the index swipe',()=>{at(0);const p=vertices(),fixed=p.map((v,i)=>v.x>-.115&&v.x<-.078&&v.y<.104&&v.z>.060?i:-1).filter(i=>i>=0);assert.ok(fixed.length>100);for(const t of [.6,1.2,2.6]){at(t);const q=vertices();assert.ok(fixed.every(i=>p[i].distanceTo(q[i])<1e-7),'curled finger surface follows the index');}});
