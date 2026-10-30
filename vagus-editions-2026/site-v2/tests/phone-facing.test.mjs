import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three/three.module.js';
import {createHandContactRig} from '../hand-contact.mjs';
import {sampleMotion} from '../motion.mjs';

// Real exported phone geometry, including the back shell, not a point-only proxy.
async function fixture(){
 const b=await readFile(new URL('../assets/gesture.glb',import.meta.url));
 const length=b.readUInt32LE(12),g=JSON.parse(b.toString('utf8',20,20+length)),start=20+length+8;
 const sizes={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
 function attribute(id){const a=g.accessors[id],v=g.bufferViews[a.bufferView],bytes={5126:4,5123:2,5125:4}[a.componentType],size=sizes[a.type],data=[];
  for(let i=0;i<a.count;i++)for(let j=0;j<size;j++){const offset=start+(v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||size*bytes)+j*bytes;data.push(a.componentType===5126?b.readFloatLE(offset):a.componentType===5123?b.readUInt16LE(offset):b.readUInt32LE(offset));}
  return new THREE.BufferAttribute(a.componentType===5126?new Float32Array(data):new Uint32Array(data),size);
 }
 const nodes=g.nodes.map(n=>{let o;
  if(n.mesh!==undefined){const p=g.meshes[n.mesh].primitives[0],geometry=new THREE.BufferGeometry();geometry.setAttribute('position',attribute(p.attributes.POSITION));if(p.indices!==undefined)geometry.setIndex(attribute(p.indices));o=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));}
  else o=new THREE.Group();o.name=n.name;if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);return o;
 });
 g.nodes.forEach((n,i)=>(n.children||[]).forEach(k=>nodes[i].add(nodes[k])));
 const model=new THREE.Group();for(const i of g.scenes[g.scene||0].nodes)model.add(nodes[i]);model.position.set(-.42,-2.1,.5);
 const parent=new THREE.Scene();parent.add(model);const phone=model.getObjectByName('Phone'),screen=model.getObjectByName('Screen');
 const rig=createHandContactRig({texture:new THREE.Texture(),model,phone,screen});parent.add(rig.mesh);
 return {rig,phone,screen,parent};
}
test('glass faces the approaching painted hand rather than the back shell',async()=>{
 const {rig,screen,parent}=await fixture();rig.update(sampleMotion(0));parent.updateMatrixWorld(true);
 const normal=new THREE.Vector3(0,0,-1).transformDirection(screen.matrixWorld);
 const wrist=new THREE.Vector3(2.3,-.8,3),center=screen.getWorldPosition(new THREE.Vector3());
 assert.ok(normal.dot(wrist.sub(center).normalize())>.65,'screen is facing away from the hand');
 assert.ok(normal.x>.65,'screen must face the character to its right');
});
test('the observer sees the back shell, with every interior glass sample hidden behind the phone',async()=>{
 const {rig,phone,screen,parent}=await fixture();rig.update(sampleMotion(0));parent.updateMatrixWorld(true);
 const normal=new THREE.Vector3(0,0,-1).transformDirection(screen.matrixWorld);
 assert.ok(normal.z<-.3,'glass must face away from the observer');
 for(const x of [-.25,0,.25])for(const y of [-.55,0,.55]){
  const point=screen.localToWorld(new THREE.Vector3(x,y,-.007)),origin=point.clone().setZ(20);
  const hit=new THREE.Raycaster(origin,new THREE.Vector3(0,0,-1),0,30).intersectObject(phone,true)[0];
  assert.ok(hit&&hit.object.name!=='Screen',`observer can see glass at ${x},${y}`);
 }
});
test('the complete moving finger stays in front of glass instead of cutting through the phone',async()=>{
 const {rig,screen,parent}=await fixture();
 for(const t of [0,.3,.6,1.2,1.5,2.5,4.9,5.5,6.9,7.6]){
  rig.update(sampleMotion(t));parent.updateMatrixWorld(true);const p=rig.mesh.geometry.attributes.position;
  for(let i=0;i<p.count;i++){
   const local=screen.worldToLocal(rig.mesh.localToWorld(new THREE.Vector3().fromBufferAttribute(p,i)));
   assert.ok(local.z<=-.0075,`hand vertex ${i} crosses glass/body at ${t}s: ${local.z}`);
  }
 }
});
test('an approach ray meets glass before any phone shell at every swipe height',async()=>{
 const {rig,phone,screen,parent}=await fixture();
 for(const t of [0,.6,1.2,5.5,7.6]){
  rig.update(sampleMotion(t));parent.updateMatrixWorld(true);
  const uv=rig.mesh.geometry.attributes.uv,p=rig.mesh.geometry.attributes.position;
  const i=Array.from({length:uv.count},(_,k)=>k).find(k=>Math.abs(uv.getX(k)-824/1672)<1e-6&&Math.abs(uv.getY(k)-(1-599/941))<1e-6);
  const tip=rig.mesh.localToWorld(new THREE.Vector3().fromBufferAttribute(p,i)),normal=new THREE.Vector3(0,0,-1).transformDirection(screen.matrixWorld);
  const ray=new THREE.Raycaster(tip.clone().addScaledVector(normal,.1),normal.clone().negate(),0,1);
  assert.equal(ray.intersectObject(phone,true)[0]?.object.name,'Screen',`shell obstructs finger at ${t}s`);
 }
});
