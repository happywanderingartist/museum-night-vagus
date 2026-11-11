import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const stage = path.dirname(fileURLToPath(import.meta.url));
const project = 'D:/AI-Data/博物馆奇妙夜/vagus-editions-2026';
const target = path.join(project, 'site-v4/public/product-cases-2026-11-11');
const captures = 'C:/Users/15049/.codex/visualizations/2026/10/31/01a190b2-e966-77b0-bbb5-b79000d23e41';
const mappings = [
  ['linear-reference-20261111.jpg', 'research/linear-first.jpg'],
  ['linear-body-20261111.jpg', 'research/linear-body.jpg'],
  ['headspace-reference-20261111.jpg', 'research/headspace-first.jpg'],
  ['headspace-body-20261111.jpg', 'research/headspace-body.jpg'],
  ['coda-reference-20261111.jpg', 'research/coda-first.jpg'],
  ['coda-body-20261111.jpg', 'research/coda-body.jpg'],
  ['todoist-reference-20261111.jpg', 'research/todoist-first.jpg'],
  ['todoist-body-20261111.jpg', 'research/todoist-body.jpg'],
  ['growth-reference-20261111.jpg', 'research/growth-access.jpg'],
  ['start-intro-20261111.jpg', 'assets/start-intro.jpg'],
  ['hug-intro-20261111.jpg', 'assets/hug-intro.jpg'],
  ['start-page-20261111.jpg', 'views/start-page.jpg'],
  ['hug-page-20261111.jpg', 'views/hug-page.jpg'],
  ['start-compare-20261111.jpg', 'views/start-compare.jpg'],
  ['hug-compare-20261111.jpg', 'views/hug-compare.jpg'],
  ['browser-navigation-20261112.json', 'browser-navigation.json']
];
const exported = [];
for (const [sourceName, relative] of mappings) {
  const source = path.join(captures, sourceName);
  let bytes;
  try { bytes = await fs.readFile(source); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  const destination = path.join(target, relative);
  await fs.mkdir(path.dirname(destination), {recursive: true});
  await fs.writeFile(destination, bytes);
  const copied = await fs.readFile(destination);
  const digest = value => crypto.createHash('sha256').update(value).digest('hex');
  if (digest(bytes) !== digest(copied)) throw new Error(`Copy differs: ${relative}`);
  exported.push({source, destination, bytes: bytes.length, sha256: digest(bytes)});
}
const server = path.join(project, 'reference-rebuild-2026-11-09/server.cjs');
const before = await fs.readFile(server, 'utf8');
if (!before.includes("'.jpg':")) {
  const backup = path.join(project, 'docs/superpowers/specs/2026-11-11-product-cases-before/server.cjs');
  await fs.mkdir(path.dirname(backup), {recursive: true});
  try { await fs.writeFile(backup, before, {flag: 'wx'}); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  await fs.writeFile(server, before.replace("'.png':'image/png'", "'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'"));
}
const normalServer = path.join(project, 'site-v4/server.cjs');
const normalBefore = await fs.readFile(normalServer, 'utf8');
if (!normalBefore.includes('const productCaseReviewEntries=')) {
  const backup = path.join(project, 'docs/superpowers/specs/2026-11-11-product-cases-before/site-server.cjs');
  try { await fs.writeFile(backup, normalBefore, {flag: 'wx'}); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  const insertion = "const productCaseReviewEntries=['index.html','start.html','hug.html','start-compare.html','hug-compare.html','start-intro.html','hug-intro.html','cases.css'];\nfor(const file of productCaseReviewEntries)entries.add('public/product-cases-2026-11-11/'+file);\n";
  await fs.writeFile(normalServer, normalBefore.replace('function createServer(){', insertion + 'function createServer(){'));
}
for (const [name, destination] of [
  ['research-study.md', path.join(project, 'research/2026-11-11-product-case-reference-study.md')],
  ['design-spec.md', path.join(project, 'docs/superpowers/specs/2026-11-11-start-hug-case-design.md')]
]) {
  try { await fs.copyFile(path.join(stage, name), destination); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
await fs.writeFile(path.join(target, 'export-manifest.json'), JSON.stringify({date: '2026-11-11', reasonForTemporaryC: 'Browser tool denied D-drive exports; browser capture used the permitted visualization directory, followed by verified D-drive copies.', exported}, null, 2));
console.log(JSON.stringify({target, verifiedExports: exported.length}, null, 2));
