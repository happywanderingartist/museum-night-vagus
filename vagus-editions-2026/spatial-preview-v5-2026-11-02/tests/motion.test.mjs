import test from 'node:test';
import assert from 'node:assert/strict';
import {sample} from '../motion.mjs';

test('direct entry and endpoints stay complete',()=>{
 assert.equal(sample(-10).p,0); assert.equal(sample(Infinity).p,0);
 assert.equal(sample(0).homeText,1); assert.equal(sample(0).camera,0);
 const end=sample(2); assert.equal(end.p,1); assert.equal(end.camera,1);
 assert.equal(end.arrival,1); assert.equal(end.links,1); assert.equal(end.homeVisible,false);
});
test('forward camera overlaps the vertical handoff and stops before reading',()=>{
 assert.equal(sample(.1).camera,0); assert.ok(sample(.22).camera>0);
 assert.equal(sample(.88).camera,1); assert.equal(sample(.96).camera,1);
 let previous=0;
 for(let i=0;i<=1000;i++){const current=sample(i/1000).camera; assert.ok(current>=previous); previous=current;}
});
test('reverse and stopping require no previous state or timer',()=>{
 const forward=Array.from({length:101},(_,i)=>sample(i/100));
 for(let i=100;i>=0;i--) assert.deepEqual(sample(i/100),forward[i]);
 assert.deepEqual(sample(.5),sample(.5));
});
test('home leaves as one plane and AI is already behind the shared boundary',()=>{
 assert.equal(sample(0).homeLift,0); assert.equal(sample(.5).homeLift,1);
 assert.ok(sample(.22).homeLift>0); assert.ok(sample(.22).arrival>0);
 assert.equal(sample(.5).homeVisible,false); assert.equal(sample(.8).title,1);
 assert.equal(sample(.88).links,1);
});
