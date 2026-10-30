import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three/three.module.js';
import {sampleMotion} from '../motion.mjs';
const api=await import('../hand-contact.mjs').catch(()=>({}));
async function actualModel(){
  const b=await readFile(new URL('../assets/gesture.glb',import.meta.url));const g=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));
  const nodes=g.nodes.map(n=>{const o=new THREE.Group();o.name=n.name;if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);return o;});
  g.nodes.forEach((n,i)=>(n.children||[]).forEach(k=>nodes[i].add(nodes[k])));
  const model=new THREE.Group();for(const i of g.scenes[g.scene||0].nodes)model.add(nodes[i]);model.position.set(-.42,-2.1,.5);
  const parent=new THREE.Scene();parent.add(model);const phone=model.getObjectByName('Phone'),screen=model.getObjectByName('Screen');
  const mesh=g.meshes[g.nodes.find(n=>n.name==='Screen').mesh],bounds=g.accessors[mesh.primitives[0].attributes.POSITION];
  assert.equal(typeof api.createHandContactRig,'function','screen-to-fingertip constraint missing');
  const rig=api.createHandContactRig({model,phone,screen,texture:new THREE.Texture()});parent.add(rig.mesh);
  return {rig,phone,screen,parent,bounds};
}
function fingertip(mesh){const uv=mesh.geometry.attributes.uv,p=mesh.geometry.attributes.position;for(let i=0;i<uv.count;i++)if(Math.abs(uv.getX(i)-824/1672)<1e-6&&Math.abs(uv.getY(i)-(1-599/941))<1e-6)return mesh.localToWorld(new THREE.Vector3().fromBufferAttribute(p,i));throw Error('source fingertip anchor absent');}
test('real screen keeps the fingertip touching its glass at every sampled swipe and hold',async()=>{
  const {rig,screen,parent,bounds}=await actualModel();
  for(const t of [0,.3,.7,1,1.8,2.6,4.99,5,6.99,7,8,12,14]){
    rig.update(sampleMotion(t));parent.updateMatrixWorld(true);const local=screen.worldToLocal(fingertip(rig.mesh));
    assert.ok(local.x>bounds.min[0]&&local.x<bounds.max[0],`tip outside screen horizontally at ${t}s`);
    assert.ok(local.y>bounds.min[1]&&local.y<bounds.max[1],`tip outside screen vertically at ${t}s`);
    assert.ok(Math.abs(local.x-.30)<1e-5,`tip drifted from contact line at ${t}s: ${local.x}`);
    assert.ok(Math.abs(local.z+.009)<1e-5,`tip floating away from front glass at ${t}s: ${local.z}`);
  }
});
test('pose remains motionless during thought and leaves the wrist anchored',async()=>{
  const {rig}=await actualModel();rig.update(sampleMotion(5.1));const still=rig.mesh.geometry.attributes.position.array.slice();
  rig.update(sampleMotion(6.8));assert.deepEqual(rig.mesh.geometry.attributes.position.array,still);
  const uv=rig.mesh.geometry.attributes.uv,p=rig.mesh.geometry.attributes.position;
  rig.update(sampleMotion(.7));for(let i=0;i<uv.count;i++)if(uv.getX(i)*1672>=945)for(let k=0;k<3;k++)assert.equal(p.array[i*3+k],still[i*3+k]);
});
test('finger actually travels upward on glass instead of merely staying attached',async()=>{
  const {rig,screen,parent}=await actualModel();
  for(const [time,height] of [[0,-.10],[.6,.025],[1.2,.15],[7.6,.025]]){
    rig.update(sampleMotion(time));parent.updateMatrixWorld(true);const local=screen.worldToLocal(fingertip(rig.mesh));
    assert.ok(Math.abs(local.y-height)<1e-5,`missing upward movement at ${time}s: ${local.y}`);
  }
});
test('phone lower support does not rise from the book during first reveal',async()=>{
  const {rig,phone,parent}=await actualModel();rig.update(sampleMotion(0));parent.updateMatrixWorld(true);const y=phone.getWorldPosition(new THREE.Vector3()).y;
  for(const t of [.5,1,1.5,2.6,8]){rig.update(sampleMotion(t));parent.updateMatrixWorld(true);assert.ok(Math.abs(phone.getWorldPosition(new THREE.Vector3()).y-y)<1e-6);}
});
test('phone stays completely fixed even with legacy reveal input while fingertip moves',async()=>{
  const {rig,phone,parent}=await actualModel();rig.update(sampleMotion(0));parent.updateMatrixWorld(true);
  const baseline=phone.matrixWorld.elements.slice(),tip0=fingertip(rig.mesh);
  for(const t of [.6,1.2,5.5,7.6]){rig.update({...sampleMotion(t),peek:1});parent.updateMatrixWorld(true);assert.deepEqual(phone.matrixWorld.elements,baseline);}
  rig.update(sampleMotion(.6));parent.updateMatrixWorld(true);assert.ok(fingertip(rig.mesh).distanceTo(tip0)>.1,'finger stopped along with phone');
});
