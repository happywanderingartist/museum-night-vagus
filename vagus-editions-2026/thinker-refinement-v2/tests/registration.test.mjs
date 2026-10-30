import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three/three.module.js';
import {createRegistrationCamera} from '../registration.mjs';
import {GLTFLoader} from '../vendor/three/addons/loaders/GLTFLoader.js';
const config=JSON.parse(await readFile(new URL('../assets/registration.json',import.meta.url),'utf8'));
test('actual source camera aligns measured landmarks and preserves contain framing on resize',()=>{
 for(const [w,h] of [[1672,941],[1064,665],[390,320]]){
  const camera=createRegistrationCamera(config,w,h),fit=Math.min(w/1672,h/941);
  for(const mark of config.landmarks){
   const p=new THREE.Vector3().fromArray(mark.world).project(camera),px=(p.x+1)*w/2,py=(1-p.y)*h/2;
   const desired=[(w-1672*fit)/2+mark.target[0]*fit,(h-941*fit)/2+mark.target[1]*fit];
   assert.ok(Math.hypot(px-desired[0],py-desired[1])<6*fit,'registration exceeds six source pixels');
  }
 }
});
test('source registration camera sees the shell, never glass',async()=>{
 const b=await readFile(new URL('../assets/thinker-gray.glb',import.meta.url)),g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');g.scene.updateMatrixWorld(true);
 const phone=g.scene.getObjectByName('Phone'),camera=createRegistrationCamera(config,1672,941),direction=camera.getWorldDirection(new THREE.Vector3());
 for(const x of [-.025,0,.025])for(const y of [.06,.105,.15]){
  const target=new THREE.Vector3(x,y,.0055),ray=new THREE.Raycaster(target.clone().addScaledVector(direction,-2),direction,0,3),hit=ray.intersectObject(phone,true)[0];assert.ok(hit&&hit.object.name!=='Screen');
 }
});
