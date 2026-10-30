import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three/three.module.js';
import {GLTFLoader} from '../vendor/three/addons/loaders/GLTFLoader.js';
test('sleeve has an open, thick cuff overlapping the real wrist instead of a sphere',async()=>{
 const bytes=await readFile(new URL('../assets/thinker-gray.glb',import.meta.url));
 const g=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');g.scene.updateMatrixWorld(true);
 const cuff=g.scene.getObjectByName('SleeveCuff');assert.ok(cuff?.isMesh,'real open sleeve cuff missing');
 const box=new THREE.Box3().setFromObject(cuff);assert.ok(box.min.x<-.30&&box.max.x>-.225);
 const center=new THREE.Vector3(-.19,.10952,.055),ray=new THREE.Raycaster(center,new THREE.Vector3(-1,0,0),0,.17);
 assert.equal(ray.intersectObject(cuff,true).length,0,'sleeve axis is capped instead of open');
 const cross=new THREE.Raycaster(new THREE.Vector3(-.23,.10952,-.04),new THREE.Vector3(0,0,1),0,.20);
 const hits=cross.intersectObject(cuff,true);assert.ok(hits.length>=2,'cuff must have distinct inner and outer walls');
 assert.ok(hits[1].distance-hits[0].distance>.001,'cuff wall has no thickness');
});
