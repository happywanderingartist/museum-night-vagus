import {test} from 'node:test';import assert from 'node:assert/strict';
const api=await import('../chapter-state.mjs').catch(()=>({}));
test('ticket line draws forward with scroll and restores on reverse',()=>{
  assert.equal(typeof api.chapterFrame,'function');
  assert.equal(api.chapterFrame('start',0,false).route,0);
  assert.equal(api.chapterFrame('start',.5,false).route,.5);
  assert.equal(api.chapterFrame('start',1,false).route,1);
  assert.equal(api.chapterFrame('start',.25,false).route,.25);
});
test('reduced motion exposes reading with no animated line or water',()=>{
  assert.equal(typeof api.chapterFrame,'function');
  assert.deepEqual(api.chapterFrame('hug',.5,true),{route:0,water:false});
  assert.deepEqual(api.chapterFrame('start',.5,true),{route:0,water:false});
});
test('scene progress clamps malformed input without hiding content',()=>{
  assert.equal(typeof api.chapterFrame,'function');
  assert.equal(api.chapterFrame('start',Infinity,false).route,0);
  assert.equal(api.chapterFrame('start',-10,false).route,0);
  assert.equal(api.chapterFrame('start',10,false).route,1);
});
