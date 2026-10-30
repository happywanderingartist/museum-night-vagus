const clamp=n=>Math.max(0,Math.min(1,n));

// Only the artwork moves. Reading content never fades out with scroll.
export function cameraFrame(kind,{top,height,viewport,width,disabled=false}){
 if(disabled||width<=760||![top,height,viewport,width].every(Number.isFinite)||height<=0||viewport<=0)return {x:0,y:0,scale:1};
 const phase=clamp((viewport-top)/(viewport+height))-.5;
 const horizontal=kind==='ai'?-1:kind==='start'?1:0;
 return {x:horizontal*phase*32,y:-phase*(kind==='hug'?24:48),scale:1.06};
}
export function inEntryBand(rect,viewport){return viewport>0&&rect.bottom>0&&rect.top<viewport*.88;}
export function routeProgress(top,viewport){return viewport>0&&Number.isFinite(top)?clamp((viewport*.85-top)/(viewport*.85)):0;}
