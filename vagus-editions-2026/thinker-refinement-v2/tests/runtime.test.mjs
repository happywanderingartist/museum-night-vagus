import {test} from 'node:test';import assert from 'node:assert/strict';
const api=await import('../runtime.mjs').catch(()=>({}));
test('render failures invoke poster fallback, not an escaping exception',()=>{
  let failure;assert.equal(typeof api.renderSafely,'function');
  const ok=api.renderSafely({render(){throw Error('GPU lost');}},{},e=>failure=e);
  assert.equal(ok,false);assert.equal(failure.message,'GPU lost');
});
test('bounded boot aborts a never-ending model load',async()=>{
  assert.equal(typeof api.loadWithDeadline,'function');let signal;
  await assert.rejects(api.loadWithDeadline(s=>{signal=s;return new Promise(()=>{});},15),/超时/);
  assert.equal(signal.aborted,true);
});
test('successful boot returns real result without abort',async()=>{
  assert.equal(typeof api.loadWithDeadline,'function');
  assert.equal(await api.loadWithDeadline(async()=>42,100),42);
});
test('a stage that completes after context failure is disposed and never accepted',async()=>{
  assert.equal(typeof api.acceptStage,'function');let finish,failed=false,disposed=false;
  const pending=api.acceptStage(()=>new Promise(resolve=>finish=resolve),{signal:new AbortController().signal,isFailed:()=>failed});
  failed=true;finish({dispose(){disposed=true;}});
  assert.equal(await pending,null);assert.equal(disposed,true);
});
test('a stage completing after timeout cannot activate a late canvas',async()=>{
  assert.equal(typeof api.acceptStage,'function');const control=new AbortController();let finish,disposed=false;
  const pending=api.acceptStage(()=>new Promise(resolve=>finish=resolve),{signal:control.signal,isFailed:()=>false});
  control.abort();finish({dispose(){disposed=true;}});
  assert.equal(await pending,null);assert.equal(disposed,true);
});
