const test=require('node:test'),assert=require('node:assert/strict');
let api={};try{api=require('../state.js');}catch{}
test('navigation starts hidden, appears after scrolling and hides on returning to opening',()=>{
 assert.equal(typeof api.navVisible,'function');
 assert.equal(api.navVisible(0),false);assert.equal(api.navVisible(40),false);
 assert.equal(api.navVisible(120),true);assert.equal(api.navVisible(0),false);
});
test('scroll motion has a real intermediate state without tall-window gating',()=>{
 const a=api.sceneFrame('start',0,false),b=api.sceneFrame('start',.5,false),c=api.sceneFrame('start',1,false);
 assert.ok(a.scale>b.scale);assert.ok(b.scale>=c.scale);assert.notEqual(a.y,c.y);
 assert.equal(typeof api.entryInset,'function');assert.equal(api.entryInset(474,474),6);
 assert.equal(api.entryInset(0,474),0);assert.ok(api.entryInset(300,474)>0);
});
