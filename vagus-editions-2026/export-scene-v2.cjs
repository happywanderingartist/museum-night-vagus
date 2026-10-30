const fs = require('node:fs/promises');
const path = require('node:path');
const { createRequire } = require('node:module');
const req = createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/export.cjs');
const sharp = req('sharp');
async function main() {
  const dir = path.join(__dirname, 'visuals');
  const bg = (await fs.readFile(path.join(dir, 'thinker-background-v2.png'))).toString('base64');
  const person = (await fs.readFile(path.join(dir, 'thinker-raw-v1.png'))).toString('base64');
  const ui = (await fs.readFile(path.join(dir, 'thinker-ui-v1.svg'), 'utf8')).replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace('font-weight="600" font-size="160"', 'font-weight="300" font-size="150"');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><title>Vagus 思想者场景修订 02</title><image width="1600" height="900" preserveAspectRatio="xMidYMid slice" href="data:image/png;base64,${bg}"/><g transform="translate(1530 40) scale(-0.55 0.55)"><image width="1024" height="1536" href="data:image/png;base64,${person}"/></g>${ui}</svg>`;
  await fs.writeFile(path.join(dir, 'thinker-composition-v2.svg'), svg);
  await sharp(Buffer.from(svg)).png().toFile(path.join(dir, 'thinker-preview-v2.png'));
  console.log('Exported layered SVG and 1600x900 preview; original figure unchanged.');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
