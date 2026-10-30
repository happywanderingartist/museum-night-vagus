import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
const result=await readFile(new URL('../evidence/gray/model-audit.json',import.meta.url),'utf8').then(JSON.parse).catch(()=>null);
test('Blender generated a closed continuous hand with all five digit groups',()=>{
 assert.ok(result,'actual Blender asset audit is required');
 assert.equal(result.hand.components,1,'fingers and palm must form one connected surface');
 assert.equal(result.hand.nonManifoldEdges,0);
 assert.deepEqual(result.hand.digitGroups.sort(),['index','middle','pinky','ring','thumb']);
 assert.ok(result.hand.vertices>2000);
 assert.equal(result.hand.baseLicense,'CC0-1.0','the reviewed anatomy asset provenance must be preserved');
});
test('actual modeled card corners match the source calibration target',()=>{
 assert.ok(result,'actual Blender asset audit is required');
 assert.ok(Math.max(...result.card.reprojectionErrorPx)<=3,JSON.stringify(result.card.reprojectionErrorPx));
 assert.ok(Math.abs(result.card.widthM-.09)<1e-6);
 assert.ok(result.card.thicknessM>0&&result.card.thicknessM<.001);
});
test('editable source and all required camera renders exist',async()=>{
 assert.ok(result,'actual Blender asset audit is required');
 for(const path of ['sources/about/about-gray.blend','evidence/gray/front.png','evidence/gray/side.png','evidence/gray/hand-close.png','evidence/gray/overlay.png']){
  assert.ok((await stat(new URL('../'+path,import.meta.url))).size>5000,path);
 }
});
