import test from 'node:test';
import assert from 'node:assert/strict';
import { sample, clampProgress } from '../camera.mjs';

test('camera starts on home, ends on AI with the same field of view',()=>{const a=sample(0,16/9),b=sample(1,16/9);assert.equal(a.x,0);assert.equal(b.x,1.12);assert.ok(Math.abs(a.z-b.z)<1e-9);assert.equal(a.fov,35);assert.equal(b.fov,35);assert.equal(a.home,1);assert.equal(b.ai,1);});
test('camera retreats before moving right, and advances only after horizontal alignment',()=>{const a=sample(0),b=sample(.25),c=sample(.4),d=sample(.55),e=sample(.75);assert.ok(b.z>a.z);assert.equal(b.x,0);assert.ok(c.x>0&&c.x<1.12);assert.equal(c.z,b.z);assert.equal(d.x,1.12);assert.equal(e.x,1.12);assert.ok(e.z<d.z);assert.equal(c.home,0);assert.equal(c.ai,0);});
test('invalid progress is safe and out of range progress clamps',()=>{assert.equal(clampProgress(NaN),0);assert.equal(clampProgress(Infinity),0);assert.equal(clampProgress(-1),0);assert.equal(clampProgress(2),1);});
test('a reverse visit to the same progress reproduces camera and text state',()=>{const points=Array.from({length:201},(_,i)=>i/200),forward=points.map(p=>sample(p));for(const p of [...points].reverse()){assert.deepEqual(sample(p),forward[Math.round(p*200)]);}});
test('all supported preview aspect ratios keep the camera in front of artwork and preserve zero rotation',()=>{for(const aspect of [1.25,1.6,16/9,2.4])for(let i=0;i<=1000;i++){const a=sample(i/1000,aspect);assert.ok(Number.isFinite(a.z)&&a.z>.14);assert.ok(a.x>=0&&a.x<=1.12);assert.equal(a.yaw,0);assert.equal(a.roll,0);}});
