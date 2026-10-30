// Artifact export only; no network, dependency installation, or source-image mutation.
const fs = require('node:fs/promises');
const path = require('node:path');
const { createRequire } = require('node:module');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const bundleRequire = createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/artifact.cjs');
const sharp = bundleRequire('sharp');
const JSZip = bundleRequire('jszip');
const root = __dirname;
const skillName = 'vagus-editions-art-direction';
const skillRoot = path.join(root, 'skills', skillName);

async function listFiles(dir) {
  const result = [];
  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) result.push(...await listFiles(file));
    else result.push(file);
  }
  return result.sort();
}

async function main() {
  const sourcePath = path.join(root, 'visuals/thinker-raw-v1.png');
  const source = await fs.readFile(sourcePath);
  const sourceHash = crypto.createHash('sha256').update(source).digest('hex');
  const background = await fs.readFile(path.join(root, 'visuals/thinker-background-v1.svg'), 'utf8');
  const ui = await fs.readFile(path.join(root, 'visuals/thinker-ui-v1.svg'), 'utf8');
  const inner = svg => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const composition = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><title>Vagus 思想者静态视觉方案 01</title>${inner(background)}<g transform="translate(1530 40) scale(-0.55 0.55)"><image width="1024" height="1536" href="data:image/png;base64,${source.toString('base64')}"/></g>${inner(ui)}</svg>`;
  await fs.writeFile(path.join(root, 'visuals/thinker-composition-v1.svg'), composition);
  await sharp(Buffer.from(composition)).png().toFile(path.join(root, 'visuals/thinker-preview-v1.png'));

  const docs = [
    ['skill', 'SKILL.md'],
    ['vagus-constraints', 'references/vagus-constraints.md'],
    ['checklist', 'references/checklist.md'],
    ['scene-grammar', 'references/scene-grammar.md'],
    ['storyboard', 'references/storyboard.md'],
    ['anti-examples', 'references/anti-examples.md'],
    ['codex-guide', 'references/codex-guide.md'],
    ['sources', 'references/sources.md']
  ];
  const standalone = [];
  for (const [anchor, file] of docs) {
    let content = await fs.readFile(path.join(skillRoot, file), 'utf8');
    if (file === 'SKILL.md') content = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    content = content.replace(/\]\((?:references\/)?([a-z-]+)\.md\)/g, ']($1)').replace(/\]\(([a-z-]+)\)/g, '](#$1)');
    standalone.push(`<a id="${anchor}"></a>\n\n${content.trim()}`);
  }
  standalone.push('<a id="thinker-direction"></a>\n\n' + await fs.readFile(path.join(root, 'THINKER-DIRECTION.md'), 'utf8'));
  await fs.writeFile(path.join(root, 'Vagus-Editions-Design-Principles.md'), standalone.join('\n\n---\n\n') + '\n');

  const skillText = await fs.readFile(path.join(skillRoot, 'SKILL.md'), 'utf8');
  assert(skillText.startsWith('---\nname: ' + skillName + '\n'));
  assert(/\ndescription: Use when .+\n/.test(skillText));
  assert(skillName.length <= 64);
  const brokenLinks = [];
  for (const file of await listFiles(skillRoot)) {
    if (!file.endsWith('.md')) continue;
    const text = await fs.readFile(file, 'utf8');
    for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^(https?:|#)/.test(match[1])) continue;
      try { await fs.access(path.resolve(path.dirname(file), match[1])); }
      catch { brokenLinks.push({ file, target: match[1] }); }
    }
  }
  assert.deepEqual(brokenLinks, []);
  const raw = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alpha = { min: 255, max: 0, transparent: 0, partial: 0, opaque: 0 };
  for (let i = 3; i < raw.data.length; i += 4) {
    const value = raw.data[i];
    alpha.min = Math.min(alpha.min, value);
    alpha.max = Math.max(alpha.max, value);
    alpha[value === 0 ? 'transparent' : value === 255 ? 'opaque' : 'partial']++;
  }
  assert(alpha.transparent > 0);
  assert.equal(sourceHash, crypto.createHash('sha256').update(await fs.readFile(sourcePath)).digest('hex'));
  const rgb = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const lum = hex => hex.match(/../g).map(c => rgb(parseInt(c, 16) / 255)).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const contrast = (lum('f7f7ff') + 0.05) / (lum('4b4ba5') + 0.05);
  assert(contrast >= 4.5);
  const installZip = new JSZip();
  for (const file of await listFiles(skillRoot)) installZip.file(skillName + '/' + path.relative(skillRoot, file).replaceAll('\\', '/'), await fs.readFile(file));
  const installBuffer = await installZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const installName = 'vagus-editions-art-direction-v1.1.0.zip';
  await fs.writeFile(path.join(root, installName), installBuffer);
  const reopened = await JSZip.loadAsync(installBuffer, { checkCRC32: true });
  const entries = Object.keys(reopened.files).filter(x => !reopened.files[x].dir);
  assert.equal(entries.length, 9);
  for (const name of entries) assert.equal(await reopened.file(name).async('string'), await fs.readFile(path.join(skillRoot, name.slice(skillName.length + 1)), 'utf8'));
  const report = {
    skillName, version: '1.1.0', generatedAt: new Date().toISOString(),
    checks: { frontmatterBasic: 'pass (not full YAML parser)', relativeLinks: 'pass', archiveCRCAndRoundtrip: 'pass', sourceUnchanged: 'pass', exportedPreview: '1600x900', uiTextEditable: ui.includes('<text'), v1FlatColorContrastOnly: Number(contrast.toFixed(2)), alpha },
    sourceSha256: sourceHash,
    skillArchiveEntries: entries,
    skillArchiveSha256: crypto.createHash('sha256').update(installBuffer).digest('hex'),
    limits: ['Official quick_validate.py could not run: bundled Python lacks PyYAML; custom basic structural checks used.', 'Chrome is connected, but page and screenshot reads fail with Debugger unattached; no scrolling or browser acceptance.', 'One baseline and one independent forward-use skill test on v1.0; v1.1 revisions have not had independent forward-use testing.', 'Generated asset alpha maximum is 254, not 255; preserve original and review compositing.', 'v1.1 installed in D:/AI-Data/Shared/skills/vagus-editions-art-direction, all nine files compared; current-session automatic discovery not verified.', 'User rejected v1 flat composition and v2 natural-landscape composition; neither is visually accepted.']
  };
  await fs.writeFile(path.join(root, 'validation.json'), JSON.stringify(report, null, 2) + '\n');
  const fullZip = new JSZip();
  const deliveryFiles = (await listFiles(root)).filter(f => !f.endsWith('.zip') && path.basename(f) !== 'build-delivery.cjs');
  for (const file of deliveryFiles) fullZip.file('Vagus-Editions-2026/' + path.relative(root, file).replaceAll('\\', '/'), await fs.readFile(file));
  fullZip.file('Vagus-Editions-2026/' + installName, installBuffer);
  const fullBuffer = await fullZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  await fs.writeFile(path.join(root, 'Vagus-Thinker-Delivery-v1.1.zip'), fullBuffer);
  await JSZip.loadAsync(fullBuffer, { checkCRC32: true });
  console.log(JSON.stringify({ ...report, fullArchiveBytes: fullBuffer.length }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
