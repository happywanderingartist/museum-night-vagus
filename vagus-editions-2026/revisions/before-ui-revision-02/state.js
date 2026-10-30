(function(root){
 'use strict';
 const clamp=n=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
 const ramp=(p,a,b)=>clamp((p-a)/(b-a));
 function progress(scroll,top,travel){
  if(!Number.isFinite(scroll)||!Number.isFinite(top))return 0;
  return travel>0?clamp((scroll-top)/travel):(scroll>top?1:0);
 }
 function sceneFrame(kind,value,reduced){
  if(reduced)return {scale:1,x:0,y:0,titleOpacity:1,boundary:100,accent:0};
  const p=clamp(value),hug=kind==='hug';
  return {scale:1+(hug?.045:.12)*(1-ramp(p,0,.45)),x:0,y:-12*ramp(p,0,.5),
   titleOpacity:1-ramp(p,.25,.6),boundary:100*(1-ramp(p,hug?.42:.32,1)),accent:ramp(p,.26,.55)*(1-ramp(p,.65,.85))};
 }
 function createDialogue(){
  const frames=[{speaker:'蒙娜丽莎',title:'',text:'咋的，没看过名画上班吗？'},{speaker:'Vagus',title:'Hello，我是 Vagus。',text:'欢迎来到我的网站，这里记录了我在艺术、设计与 AI 之间的游走与探索。你愿意和我一起开启这场博物馆奇妙夜吗？'}];
  let index=0;
  return {current(){return {...frames[index],choicesEnabled:true,canAdvance:index<frames.length-1};},advance(){index=Math.min(index+1,frames.length-1);return this.current();}};
 }
 const api={progress,sceneFrame,createDialogue};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.VagusState=api;
})(typeof window!=='undefined'?window:globalThis);
