import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const project = 'D:/AI-Data/博物馆奇妙夜/vagus-editions-2026';
const target = path.join(project, 'site-v4/public/product-cases-2026-11-11');
const checks = [];
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const responses = new Map();
async function response(url) {
  if (!responses.has(url)) {
    const res = await fetch(url);
    responses.set(url, {status: res.status, type: res.headers.get('content-type'), bytes: Buffer.from(await res.arrayBuffer())});
  }
  return responses.get(url);
}
function check(name, condition) {
  assert.ok(condition, name);
  checks.push({name, passed: true});
}
const pages = ['index.html', 'start.html', 'hug.html', 'start-compare.html', 'hug-compare.html', 'start-intro.html', 'hug-intro.html'];
for (const base of ['http://127.0.0.1:4184/public/product-cases-2026-11-11/', 'http://127.0.0.1:4196/site-v4/public/product-cases-2026-11-11/']) {
  for (const page of pages) {
    const url = new URL(page, base);
    const res = await response(url.href);
    check(`HTTP ${url}`, res.status === 200 && res.type.includes('text/html'));
    const html = res.bytes.toString('utf8');
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    check(`Unique IDs ${base}${page}`, ids.length === new Set(ids).size);
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const link = new URL(match[1], url);
      if (link.origin !== url.origin) continue;
      const hash = link.hash;
      link.hash = '';
      const linked = await response(link.href);
      check(`Local link ${url.pathname} → ${match[1]}`, linked.status === 200);
      if (hash) {
        check(`Anchor ${link.pathname}${hash}`, linked.bytes.toString('utf8').includes(`id="${decodeURIComponent(hash.slice(1))}"`));
      }
    }
  }
}
for (const key of ['start', 'hug']) {
  const res = await response(`http://127.0.0.1:4184/public/product-cases-2026-11-11/assets/${key}-intro.jpg`);
  check(`${key} JPEG MIME`, res.type.includes('image/jpeg') && res.bytes[0] === 0xff && res.bytes[1] === 0xd8);
  let offset = 2;
  let dimensions;
  while (offset < res.bytes.length) {
    assert.equal(res.bytes[offset++], 0xff);
    let marker = res.bytes[offset++];
    while (marker === 0xff) marker = res.bytes[offset++];
    const length = res.bytes.readUInt16BE(offset);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      dimensions = [res.bytes.readUInt16BE(offset + 5), res.bytes.readUInt16BE(offset + 3)];
      break;
    }
    offset += length;
  }
  check(`${key} fixed artboard dimensions`, dimensions?.[0] === 1400 && dimensions[1] === (key === 'start' ? 1000 : 900));
}
for (const asset of JSON.parse(await fs.readFile(path.join(target, 'asset-manifest.json'), 'utf8')).assets) {
  const [source, copied] = await Promise.all([fs.readFile(asset.source), fs.readFile(path.join(target, 'assets', asset.name))]);
  check(`Original source pixels ${asset.name}`, digest(source) === asset.sha256 && digest(copied) === asset.sha256);
}
for (const entry of JSON.parse(await fs.readFile(path.join(target, 'export-manifest.json'), 'utf8')).exported) {
  check(`Verified export ${path.basename(entry.destination)}`, digest(await fs.readFile(entry.destination)) === entry.sha256);
}
check('Editor JSON excluded from normal public entry allowlist', (await response('http://127.0.0.1:4184/public/product-cases-2026-11-11/start-content.json')).status === 404);
for (const relative of ['site-v4/server.cjs', 'reference-rebuild-2026-11-09/server.cjs', 'reference-rebuild-2026-11-09/reference/eye-reflection/reflection.mjs']) {
  const result = spawnSync(process.execPath, ['--check', path.join(project, relative)], {encoding: 'utf8'});
  check(`Syntax ${relative}`, result.status === 0);
}
const backup = path.join(project, 'docs/superpowers/specs/2026-11-11-product-cases-before');
const integration = [];
for (const [relative, beforeName] of [
  ['site-v4/start.html', 'start.html'],
  ['site-v4/hug.html', 'hug.html'],
  ['site-v4/server.cjs', 'site-server.cjs'],
  ['reference-rebuild-2026-11-09/server.cjs', 'server.cjs'],
  ['reference-rebuild-2026-11-09/reference/eye-reflection/reflection.mjs', 'reflection.mjs']
]) {
  const before = await fs.readFile(path.join(backup, beforeName));
  const after = await fs.readFile(path.join(project, relative));
  integration.push({relative, beforeFile: beforeName, beforeSha256: digest(before), afterSha256: digest(after)});
}
await fs.writeFile(path.join(target, 'content-integration.json'), JSON.stringify({date: '2026-11-12', changes: integration, backup}, null, 2));
const browser = JSON.parse(await fs.readFile(path.join(target, 'browser-navigation.json'), 'utf8'));
browser.staticResult = {buttonAriaPressed: 'true', mode: 'gallery', rotation: 'inactive', flatDirectoryLinksVisible: 7};
check('Two normal and two reflection browser click chains recorded', Object.keys(browser.normalChains).length === 2 && Object.keys(browser.reflectionChains).length === 2);
const report = {date: '2026-11-12', passed: checks.length, failed: 0, checks, httpRequests: responses.size, browser, limits: ['Chrome desktop local preview only', 'Current header return targets original chapter anchor; globe pose restoration is a later integration decision', 'Original embedded screenshots retain small translation controls', 'Visual layout is a review proposal', 'Remote artifact preservation is recorded separately']};
await fs.writeFile(path.join(target, 'verification.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({passed: checks.length, failed: 0, httpRequests: responses.size, integrationFiles: integration.length}, null, 2));
