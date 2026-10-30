const test=require('node:test'),assert=require('node:assert/strict');
// Expected behavior: opening quote -> invitation; choices remain enabled from entry.
// A no-op advance or hiding choices until completion must fail these tests.
let createDialogue;try{({createDialogue}=require('./dialogue-state.js'));}catch{}
test('entry already exposes all choices without waiting for text',()=>{
 assert.equal(typeof createDialogue,'function');
 const d=createDialogue();assert.equal(d.current().speaker,'蒙娜丽莎');
 assert.equal(d.current().text,'咋的，没看过名画上班吗？');
 assert.equal(d.current().choicesEnabled,true);
});
test('advance reveals the supplied Vagus introduction, not invented copy',()=>{
 assert.equal(typeof createDialogue,'function');
 const d=createDialogue();d.advance();
 assert.equal(d.current().speaker,'Vagus');
 assert.equal(d.current().title,'Hello，我是 Vagus。');
 assert.equal(d.current().text,'欢迎来到我的网站，这里记录了我在艺术、设计与 AI 之间的游走与探索。你愿意和我一起开启这场博物馆奇妙夜吗？');
 assert.equal(d.current().choicesEnabled,true);assert.equal(d.current().canAdvance,false);
});
test('repeated clicks do not overflow, clear text, or loop the greeting',()=>{
 assert.equal(typeof createDialogue,'function');
 const d=createDialogue();for(let i=0;i<30;i++)d.advance();
 assert.equal(d.current().speaker,'Vagus');assert.equal(d.current().canAdvance,false);
});
