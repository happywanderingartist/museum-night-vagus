import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('actual static hand surface does not intersect the card or frame',async()=>{
 const report=await readFile(new URL('../evidence/gray/static-contact.json',import.meta.url),'utf8').then(JSON.parse).catch(()=>null);
 assert.ok(report,'Blender world-space surface check is required');
 assert.equal(report.handCardTrianglePairs,0,'hand intersects card faces');
 assert.equal(report.handFrameTrianglePairs,0,'forearm intersects frame');
 assert.equal(report.cardFrameTrianglePairs,0,'card intersects frame');
 assert.equal(report.witnesses.indexFront.digit,'index');
 assert.equal(report.witnesses.thumbBack.digit,'thumb');
 assert.equal(report.sourceBlendSha256,createHash('sha256').update(await readFile(new URL('../sources/about/about-gray.blend',import.meta.url))).digest('hex')); 
 assert.ok(Number.isFinite(report.indexFrontContactM)&&Number.isFinite(report.thumbBackContactM));
 assert.ok(report.indexFrontContactM<=.0005,'index pad floats away from the card');
 assert.ok(report.thumbBackContactM<=.0005,'thumb does not support the card back');
});
