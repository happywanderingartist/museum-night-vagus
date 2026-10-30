import {characterProfile,patchPose,patchVertex} from './character-profiles.mjs';
const part=characterProfile('about').parts[0];
export function aboutVertex(x,y,time,scroll=0){
 const amount=patchPose(part,time),q=patchVertex(part,[x,y],amount);
 const portrait=Math.exp(-(((x-1230)/420)**4+((y-440)/540)**4)),arm=Math.exp(-(((x-900)/230)**4+((y-490)/220)**4));
 const depth=portrait*28+arm*36,shift=Math.max(-1,Math.min(1,scroll));
 return [q[0]-836+depth*(Math.sin(time/6000)*.045+shift*.14),470.5-q[1]+depth*shift*.04,depth];
}
