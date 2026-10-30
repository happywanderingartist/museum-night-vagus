import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const api=await import('../tools/reference.mjs').catch(()=>({}));
const config=JSON.parse(await readFile(new URL('../sources/about/reference.json',import.meta.url)));
const bytes=await readFile(new URL('../sources/about/reference.png',import.meta.url));
test('source dimensions, measured card corners and byte identity are validated',()=>{
 assert.equal(typeof api.validateReference,'function','reference validator must exist');
 assert.deepEqual(api.validateReference(config,bytes),[]);
 assert.ok(api.validateReference({...config,anchors:{}},bytes).length);
 assert.ok(api.validateReference({...config,width:0},bytes).length);
 assert.ok(api.validateReference(config,Buffer.concat([bytes,Buffer.from('changed')])).length);
});
test('cover calibration respects actual scene size and off-centre cropping',()=>{
 assert.equal(typeof api.sourceToScreen,'function','cover mapping must exist');
 assert.deepEqual(api.sourceToScreen([836,470.5],config,{width:1672,height:941}),[836,470.5]);
 const mapped=api.sourceToScreen([836,470.5],config,{width:1440,height:738});
 assert.ok(Math.abs(mapped[0]-720)<1e-8);
 assert.ok(Math.abs(mapped[1]-369)<1e-8);
 const off=api.sourceToScreen([0,0],{...config,objectPosition:[0,.5]},{width:390,height:700});
 assert.equal(off[0],0);
});

test('saved extraction reproduces the actual card corner observations',async()=>{
 const extracted=JSON.parse(await readFile(new URL('../evidence/gray/card-extraction.json',import.meta.url)));
 assert.equal(extracted.candidatePixels,13133);
 assert.deepEqual(extracted.corners,config.anchors.cardCorners);
});
