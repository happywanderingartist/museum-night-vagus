import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {gsap}=require('../vendor/gsap/gsap.min.js');
const module=await import('../entry-timeline.mjs').catch(()=>({}));

test('entry timeline keeps the cover legible, opens the room and settles into the directory',()=>{
  assert.equal(typeof module.createEntryTimeline,'function');
  const timeline=module.createEntryTimeline(gsap);
  const cover=timeline.seek(0);
  assert.equal(cover.copy,1);
  assert.equal(cover.opening,0);
  assert.equal(cover.approach,0);
  const threshold=timeline.seek(.56);
  assert.ok(threshold.opening>.5);
  const end=timeline.seek(1);
  assert.equal(end.opening,1);
  assert.equal(end.copy,0);
  assert.equal(end.labels,1);
  assert.equal(end.passage,0);
  timeline.destroy();
});
test('entry progress is deterministic on stop, reverse and direct jumps',()=>{
  assert.equal(typeof module.createEntryTimeline,'function');
  const timeline=module.createEntryTimeline(gsap);
  const forward=timeline.seek(.68);
  timeline.seek(.22);
  assert.deepEqual(timeline.seek(.68),forward);
  assert.deepEqual(timeline.seek(.68),forward);
  assert.deepEqual(timeline.seek(-1),timeline.seek(0));
  assert.deepEqual(timeline.seek(2),timeline.seek(1));
  timeline.destroy();
});
