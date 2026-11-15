export const clampProgress = value => Number.isFinite(value) ? Math.min(1,Math.max(0,value)) : 0;
const smooth = value => {const u=clampProgress(value);return u*u*u*(u*(u*6-15)+10);};
export function sample(value,aspect=16/9){
 const p=clampProgress(value),safeAspect=Number.isFinite(aspect)&&aspect>0?aspect:16/9;
 const near=Math.min(.5625,1/safeAspect)/(2*Math.tan(35*Math.PI/360))*.995;
 const far=Math.max(1.35,near*1.52);
 const x=p<=.25?0:p>=.55?1.12:1.12*smooth((p-.25)/.30);
 const z=p<=.25?near+(far-near)*smooth(p/.25):p<=.55?far:far-(far-near)*smooth((p-.55)/.45);
 const home=1-smooth((p-.015)/.17),ai=smooth((p-.79)/.19);
 const phase=p<=.015?'首页停留':p<.25?'退离工作室':p<.55?'经过两幅画之间':p<.98?'进入 AI 阅览室':'AI 阅读';
 return {p,x,z,yaw:0,roll:0,fov:35,home,ai,phase};
}
