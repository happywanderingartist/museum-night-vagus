import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {dampedMotion} from '../globe-motion.mjs';
test('globe momentum decays to rest and remains independent of frame frequency',()=>{
  const whole=dampedMotion(60,1);
  let velocity=60,distance=0;
  for(let frame=0;frame<60;frame++){
    const next=dampedMotion(velocity,1/60);
    distance+=next.distance;velocity=next.velocity;
  }
  assert.ok(Math.abs(whole.distance-distance)<1e-10);
  assert.ok(Math.abs(whole.velocity-velocity)<1e-10);
  assert.ok(velocity<1);
});
test('globe preference respects the system and stores the user choice independently',async()=>{
  const source=await fs.readFile(new URL('../gallery-entry.mjs',import.meta.url),'utf8');
  assert.match(source,/motionOff = reduced.matches \|\| off/);
  assert.match(source,/reduced.addEventListener\('change', \(\) => setMotion\(userMotionOff\)\)/);
  assert.match(source,/sessionStorage.setItem\('vagus-motion-off'/);
  assert.match(source,/if \(off\) \{ moveTo\(1, false\); setFlat\(true\); \}/);
});
test('returning to gallery restores bounded saved angles and skips repeated entry',async()=>{
  const source=await fs.readFile(new URL('../gallery-entry.mjs',import.meta.url),'utf8');
  assert.match(source,/Number.isFinite\(pose\?\.yaw\)/);
  assert.match(source,/pitch = clamp\(pose.pitch, -60, 60\)/);
  assert.match(source,/rotationPaused = true;\n  moveTo\(1, false\)/);
});
