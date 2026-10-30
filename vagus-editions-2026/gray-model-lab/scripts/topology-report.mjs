import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three/three.module.js';
import {GLTFLoader} from '../vendor/three/addons/loaders/GLTFLoader.js';
const b=await readFile(new URL('../assets/thinker-gray.glb',import.meta.url)),g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
const hand=g.scene.getObjectByName('HandMesh'),p=hand.geometry.attributes.position,n=p.count,parent=Int32Array.from({length:n},(_,i)=>i),ix=hand.geometry.index;
function root(i){while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;}
for(let i=0;i<ix.count;i+=3){parent[root(ix.getX(i))]=root(ix.getX(i+1));parent[root(ix.getX(i+1))]=root(ix.getX(i+2));}
const components=new Map();for(let i=0;i<n;i++){const r=root(i);if(!components.has(r))components.set(r,{count:0,box:new THREE.Box3()});const c=components.get(r);c.count++;c.box.expandByPoint(new THREE.Vector3().fromBufferAttribute(p,i));}
console.log(JSON.stringify([...components.values()].map(c=>({count:c.count,min:c.box.min.toArray(),max:c.box.max.toArray()}))));
