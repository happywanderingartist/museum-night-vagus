import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialStart, startTransition, initialHug, hugTransition} from '../product-demo-state.mjs';

test('START selection, detail and back preserve the selected place', () => {
  const selected = startTransition(initialStart(), 'place', 'b');
  const detail = startTransition(selected, 'detail');
  assert.equal(detail.detail, true);
  assert.equal(startTransition(detail, 'back').selected, 'b');
  assert.equal(startTransition(selected, 'place', 'unknown'), selected);
});
test('START saves individual places and Book stays separate', () => {
  const saved = startTransition(initialStart(), 'save');
  assert.deepEqual(saved.saved, ['a']);
  assert.deepEqual(startTransition(saved, 'tab', 'book').saved, ['a']);
  assert.deepEqual(startTransition(saved, 'save').saved, []);
});
test('START travel preparation returns to the same place and retains saved state', () => {
  const selected = startTransition(startTransition(initialStart(), 'place', 'b'), 'save');
  const handoff = startTransition(startTransition(selected, 'detail'), 'handoff');
  assert.equal(handoff.handoff, true);
  const returned = startTransition(handoff, 'back');
  assert.equal(returned.handoff, false);
  assert.equal(returned.detail, true);
  assert.equal(returned.selected, 'b');
  assert.deepEqual(returned.saved, ['b']);
});
test('HUG smaller stops at the last supported step', () => {
  let state = initialHug();
  for (let i = 0; i < 10; i++) state = hugTransition(state, 'smaller');
  assert.equal(state.step, 2);
  assert.equal(state.status, 'preview');
});
test('HUG acceptance and completion have distinct reversible states', () => {
  const accepted = hugTransition(initialHug(), 'accept');
  assert.equal(accepted.status, 'accepted');
  assert.equal(accepted.tab, 'step');
  const completed = hugTransition(accepted, 'complete');
  assert.equal(completed.status, 'completed');
  const undo = hugTransition(completed, 'undo');
  assert.equal(undo.status, 'accepted');
  assert.equal(hugTransition(undo, 'withdraw').status, 'preview');
});
test('HUG rest and listening never accept or complete a task', () => {
  const rest = hugTransition(initialHug(), 'intent', 'rest');
  assert.equal(rest.status, 'preview');
  assert.equal(hugTransition(rest, 'intent', 'listen').status, 'preview');
  assert.equal(hugTransition(rest, 'complete').status, 'preview');
});
