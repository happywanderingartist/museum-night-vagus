import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sampleMotion,ActiveClock} from '../motion.mjs';
test('three upward strokes occupy five seconds followed by a two-second hold',()=>{
 for(const [time,stroke,phase] of [[0,0,'swipe'],[.6,.5,'swipe'],[1.2,1,'swipe'],[5,0,'think'],[6.9,0,'think'],[7,0,'swipe'],[8.2,1,'swipe']]){
  const p=sampleMotion(time);assert.ok(Math.abs(p.stroke-stroke)<1e-6);assert.equal(p.phase,phase);
 }
});
test('system reduced motion returns the same static pose at every time',()=>{
 assert.deepEqual(sampleMotion(1,{reduced:true}),sampleMotion(9,{reduced:true}));
});
test('hidden time is not added when playback resumes',()=>{
 const c=new ActiveClock();c.setRunning(true,100);assert.equal(c.tick(1100),1);c.setRunning(false,1100);assert.equal(c.tick(11100),1);c.setRunning(true,11100);assert.equal(c.tick(12100),2);
});
