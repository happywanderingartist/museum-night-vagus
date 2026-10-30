import {test} from 'node:test';
import assert from 'node:assert/strict';
const api=await import('../motion.mjs').catch(()=>({}));
const sample=api.sampleMotion??(()=>({phase:'missing implementation'}));
test('phone never reveals or turns, including the first swipe',()=>{
  for(const t of [0,.3,1,1.8,2.6,5,7,8,14,701])assert.equal(sample(t).peek,0);
});
test('later seven-second cycles never reveal the screen',()=>{
  for(const t of [7,8,14,15,701])assert.equal(sample(t).peek,0);
  assert.equal(sample(1,{introSeen:true}).peek,0);
});
test('five seconds of gesture followed by two seconds of thought',()=>{
  assert.equal(sample(4.99).phase,'swipe');assert.equal(sample(5).phase,'think');
  assert.equal(sample(6.99).phase,'think');assert.equal(sample(7).phase,'swipe');
  assert.equal(sample(12).phase,'think');assert.equal(sample(14).phase,'swipe');
});
test('hand moves within swipe and remains motionless throughout thought',()=>{
  assert.notEqual(sample(.2).stroke,sample(.7).stroke);
  assert.deepEqual([sample(5.1).stroke,sample(5.1).lift],[sample(6.8).stroke,sample(6.8).lift]);
});
test('reduced motion has no screen reveal and a stable pose',()=>{
  assert.deepEqual(sample(1,{reduced:true}),sample(99,{reduced:true}));
  assert.equal(sample(1,{reduced:true}).peek,0);
});
test('negative or invalid time produces a stable starting frame',()=>{
  for(const t of [-100,NaN,Infinity])assert.deepEqual(sample(t),sample(0));
});
test('clock freezes while hidden and does not catch up on resume',()=>{
  assert.equal(typeof api.ActiveClock,'function','active-time controller not implemented');
  const c=new api.ActiveClock();c.setRunning(true,1000);assert.equal(c.tick(2000),1);
  c.setRunning(false,2000);assert.equal(c.tick(100000),1);c.setRunning(true,100000);
  assert.equal(c.tick(100500),1.5);
});
test('leaving a scene consumes intro without restarting its reveal',()=>{
  assert.equal(typeof api.ActiveClock,'function','active-time controller not implemented');
  const c=new api.ActiveClock();c.skipIntro();assert.equal(c.introSeen,true);
  assert.equal(sample(.8,{introSeen:c.introSeen}).peek,0);
});
