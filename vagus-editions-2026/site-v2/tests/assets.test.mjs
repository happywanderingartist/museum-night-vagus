import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('painted source is byte-identical to the approved baseline',async()=>{
  const image=await readFile(new URL('../assets/thinker-original.png',import.meta.url));
  assert.equal(createHash('sha256').update(image).digest('hex'),'45ca5d65a17e921e3bf0ee5353f4b5ed9a51c7eb061c7a1650020347bd314735');
});
test('every exported motion channel actually moves then holds exactly from 5 to 7 seconds',async()=>{
  const b=await readFile(new URL('../assets/gesture.glb',import.meta.url));const n=b.readUInt32LE(12);const g=JSON.parse(b.toString('utf8',20,20+n));const binary=20+n+8;
  const counts={SCALAR:1,VEC3:3,VEC4:4};
  function values(i){const a=g.accessors[i],v=g.bufferViews[a.bufferView];assert.equal(a.componentType,5126);const offset=binary+(v.byteOffset||0)+(a.byteOffset||0),size=counts[a.type];return Array.from({length:a.count},(_,r)=>Array.from({length:size},(_,c)=>b.readFloatLE(offset+r*(v.byteStride||size*4)+c*4)));}
  let channels=0;
  for(const animation of g.animations)for(const sampler of animation.samplers){
    const times=values(sampler.input).flat(),poses=values(sampler.output);const still=poses.filter((_,i)=>times[i]>=5&&times[i]<=7);
    assert.ok(still.length>=2);for(const p of still)assert.deepEqual(p,still[0]);assert.ok(poses.some(p=>JSON.stringify(p)!==JSON.stringify(poses[0])));channels++;
  }
  assert.ok(channels>=5);
});
test('every static relative vendor module dependency exists locally',async()=>{
  const queue=['../vendor/three/three.module.js','../vendor/three/addons/loaders/GLTFLoader.js'];const seen=new Set();
  while(queue.length){const url=new URL(queue.shift(),import.meta.url);if(seen.has(url.href))continue;seen.add(url.href);
    const source=await readFile(url,'utf8');
    for(const m of source.matchAll(/^import[\s\S]*?from\s+['"]([^'"]+)['"]/gm))if(m[1].startsWith('.'))queue.push(new URL(m[1],url).href);
  }
  assert.ok(seen.size>=5,'GLTF loader dependency graph incomplete');
});
test('local GLB contains real phone and articulated finger geometry plus animation',async()=>{
  const b=await readFile(new URL('../assets/gesture.glb',import.meta.url)).catch(()=>Buffer.alloc(0));
  assert.ok(b.length>10000,'animated asset has not been built');
  assert.equal(b.toString('ascii',0,4),'glTF');const n=b.readUInt32LE(12);
  const g=JSON.parse(b.toString('utf8',20,20+n));
  for(const name of ['PhoneBody','Screen','Wrist','IndexTip'])assert.ok(g.nodes.some(x=>x.name===name),name+' absent');
  assert.ok(g.meshes.length>=12);assert.ok(g.animations?.length>0,'asset has no animation');
  const animated=new Set(g.animations.flatMap(a=>a.channels.map(c=>g.nodes[c.target.node].name)));
  assert.ok(animated.has('Wrist'),'finger movement not exported');
  const arm=g.nodes.find(n=>n.name==='Carved forearm');
  assert.ok(arm.rotation&&Math.abs(arm.rotation[2])>.3,'forearm segment not oriented from elbow to wrist');
});
