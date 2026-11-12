import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { foldPose, smoothStep } from './motion.mjs';

test('smoothstep clamps its interval and preserves the midpoint', () => {
  assert.equal(smoothStep(0.12, 0.62, 0), 0);
  assert.equal(smoothStep(0.12, 0.62, 1), 1);
  assert.ok(Math.abs(smoothStep(0.12, 0.62, 0.37) - 0.5) < 1e-12);
});

test('a turn starts with a flat fully visible old page', () => {
  const pose = foldPose(0, 600, true);
  assert.equal(pose.angle, 0);
  assert.equal(pose.lift, 0);
  assert.equal(pose.shift, 0);
  assert.equal(pose.opacity, 1);
  assert.equal(pose.destinationOpacity, 0);
});

test('a turn settles on a fully visible destination with reference angles', () => {
  const pose = foldPose(1, 600, true);
  assert.equal(pose.angle, 78);
  assert.equal(pose.lift, 8);
  assert.equal(pose.opacity, 0);
  assert.equal(pose.destinationOpacity, 1);
  assert.deepEqual(pose.hinges, [-78, 156, -156]);
});

test('forward and backward turns depart on opposite sides at proportional distance', () => {
  const forward = foldPose(1, 600, true);
  const backward = foldPose(1, 600, false);
  assert.ok(forward.shift < 0);
  assert.ok(backward.shift > 0);
  assert.ok(Math.abs(backward.shift - forward.shift - 1020) < 1e-10);
  assert.equal(foldPose(1, 1200, true).shift, forward.shift * 2);
});

test('static HTML keeps every reading section accessible and the Book keyboard reachable', () => {
  const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  for (const id of ['leaf-1', 'leaf-2', 'leaf-3', 'panel-scene', 'panel-step', 'panel-choice']) {
    const tag = html.match(new RegExp(`<[^>]+id="${id}"[^>]*>`))[0];
    assert.doesNotMatch(tag, /\bhidden\b|\binert\b/);
  }
  assert.match(html, /id="book-stage"[^>]*tabindex="0"/);
});

test('original START and HUG artwork is present without pixel changes', () => {
  const expected = {
    'start.webp': '5ec4074e4bc130a119f47e382323aaddd2e6379b071a90dbc67e02a4c623a3a6',
    'hug.webp': '13411ea0e5dce972f008f46e2603b968f63bff325da8ccf0d3fd198fe49549e1',
  };
  for (const [name, hash] of Object.entries(expected)) {
    const art = readFileSync(new URL(`./assets/${name}`, import.meta.url));
    assert.equal(createHash('sha256').update(art).digest('hex'), hash);
  }
});

test('animated image and text blocks retain readable static content', () => {
  const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  const script = readFileSync(new URL('./motion.mjs', import.meta.url), 'utf8');
  assert.match(html, /data-reveal>让故事有呼吸/);
  assert.match(html, /data-image-reveal><img[^>]+alt="[^"]+"/);
  assert.match(html, /<option value="340">Vagus · 轻页切<\/option>/);
  assert.match(script, /const motionAllowed = \(\) => !staticMode\.checked && !reducedMotion\.matches/);
  assert.match(script, /function lightPageTurn\(source, destination\)/);
});
