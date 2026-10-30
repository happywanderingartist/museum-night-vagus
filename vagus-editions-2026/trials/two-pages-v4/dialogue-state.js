(function(root){
 function createDialogue(){
  const frames=[{speaker:'蒙娜丽莎',title:'',text:'咋的，没看过名画上班吗？'},{speaker:'Vagus',title:'Hello，我是 Vagus。',text:'欢迎来到我的网站，这里记录了我在艺术、设计与 AI 之间的游走与探索。你愿意和我一起开启这场博物馆奇妙夜吗？'}];
  let index=0;
  return {current(){return {...frames[index],choicesEnabled:true,canAdvance:index<frames.length-1};},advance(){index=Math.min(index+1,frames.length-1);return this.current();}};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={createDialogue};
 else root.VagusDialogue={createDialogue};
})(typeof window!=='undefined'?window:globalThis);
