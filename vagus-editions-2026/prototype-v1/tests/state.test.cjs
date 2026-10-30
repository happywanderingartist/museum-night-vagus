const test=require('node:test');
const assert=require('node:assert/strict');
let api={};try{api=require('../state.js');}catch{}
test('progress clamps at both ends, reverses and handles zero travel',()=>{
 assert.equal(typeof api.progress,'function');
 assert.equal(api.progress(80,100,800),0);
 assert.equal(api.progress(500,100,800),.5);
 assert.equal(api.progress(900,100,800),1);
 assert.equal(api.progress(1300,100,800),1);
 assert.equal(api.progress(300,100,800),.25);
 assert.equal(api.progress(100,100,0),0);
 assert.equal(api.progress(101,100,0),1);
 assert.equal(api.progress(NaN,100,800),0);
});
test('scene keyframes preserve art while reading boundary takes over',()=>{
 assert.equal(typeof api.sceneFrame,'function');
 const a=api.sceneFrame('start',0,false),b=api.sceneFrame('start',1,false);
 assert.equal(a.boundary,100); assert.equal(a.titleOpacity,1);
 assert.equal(b.boundary,0); assert.equal(b.scale,1); assert.equal(b.titleOpacity,0);
 assert.ok(api.sceneFrame('start',.5,false).boundary<100);
 assert.notEqual(api.sceneFrame('start',.5,false).boundary,api.sceneFrame('hug',.5,false).boundary);
 assert.deepEqual(api.sceneFrame('ai',-2,false),api.sceneFrame('ai',0,false));
});
test('reduced motion uses static composition and no covering boundary',()=>{
 assert.equal(typeof api.sceneFrame,'function');
 for(const kind of ['ai','start','hug'])assert.deepEqual(api.sceneFrame(kind,.8,true),{scale:1,x:0,y:0,titleOpacity:1,boundary:100,accent:0});
});
test('dialogue choices available immediately and advance clamps',()=>{
 assert.equal(typeof api.createDialogue,'function');
 const d=api.createDialogue();assert.equal(d.current().choicesEnabled,true);
 assert.equal(d.current().speaker,'蒙娜丽莎');
 d.advance();assert.equal(d.current().speaker,'Vagus');assert.equal(d.current().canAdvance,false);
 for(let i=0;i<30;i++)d.advance();assert.equal(d.current().speaker,'Vagus');
});
