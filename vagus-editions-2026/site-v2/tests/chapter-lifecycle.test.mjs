import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {chapterFrame} from '../chapter-state.mjs';

test('backgrounding pauses CSS scene synchronously even if animation frames are suspended',async()=>{
 const events={},queue=[],classes=new Set(),scene={dataset:{chapter:'hug'},getBoundingClientRect:()=>({top:0,bottom:900,height:900}),querySelectorAll:()=>[],classList:{toggle(name,on){if(on)classes.add(name);else classes.delete(name);},remove(name){classes.delete(name);}}};
 const document={hidden:false,body:{classList:{contains:()=>true}},querySelector:()=>null,querySelectorAll:()=>[scene],addEventListener(name,fn){events[name]=fn;}};
 const source=(await readFile(new URL('../chapter-motion.mjs',import.meta.url),'utf8')).replace(/^import[^\n]+\n/,'');
 vm.runInNewContext(source,{document,chapterFrame,innerHeight:900,matchMedia:()=>({matches:false,addEventListener(){}}),sessionStorage:{getItem:()=>null},MutationObserver:class{observe(){}},addEventListener(){},requestAnimationFrame(fn){queue.push(fn);return queue.length;}});
 queue.shift()();assert.equal(classes.has('is-in-view'),true);
 document.hidden=true;events.visibilitychange();
 // Do not drain frames: browsers may suspend them while hidden.
 assert.equal(classes.has('is-in-view'),false);
 document.hidden=false;events.visibilitychange();queue.shift()();
 assert.equal(classes.has('is-in-view'),true);
});
