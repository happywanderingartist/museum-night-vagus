import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {createServer} = require('../server.cjs');

test('installed animation libraries and their module entry points load through the normal server', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  try {
    for (const file of ['vendor/gsap/gsap.min.js', 'vendor/gsap/ScrollTrigger.min.js', 'vendor/gsap/loader.mjs', 'vendor/anime/anime.umd.min.js', 'vendor/anime/loader.mjs', 'entry-timeline.mjs']) {
      const response = await fetch(origin + '/' + file);
      assert.equal(response.status, 200, file);
      assert.match(response.headers.get('content-type'), /javascript/, file);
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
