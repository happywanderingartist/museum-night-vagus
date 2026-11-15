const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const sharp = createRequire('C:/Program Files/WindowsApps/OpenAI.Codex_26.1027.3384.0_x64__2p2nqsd0c76g0/app/resources/cua_node/bin/render.cjs')('sharp');
const folder = path.resolve(__dirname, '../../docs/superpowers/specs');
(async()=>{
 for (const suffix of ['frames','space','reading']) {
  const base = path.join(folder,`2026-11-01-vagus-continuous-gallery-v5-${suffix}`);
  await sharp(fs.readFileSync(base+'.svg')).png().toFile(base+'.png');
  console.log(path.basename(base)+': rendered');
 }
})();
