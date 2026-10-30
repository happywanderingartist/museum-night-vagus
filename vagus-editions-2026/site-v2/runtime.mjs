export function renderSafely(stage,pose,onFailure){
  try{stage.render(pose);return true;}catch(error){onFailure(error);return false;}
}
export async function acceptStage(load,{signal,isFailed}){
  const stage=await load();
  if(signal.aborted||isFailed()){stage.dispose();return null;}
  return stage;
}
export async function loadWithDeadline(task,milliseconds=15000){
  const controller=new AbortController();let timer;
  try{return await Promise.race([
    Promise.resolve().then(()=>task(controller.signal)),
    new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('三维加载超时，原画与项目仍可阅读。'));},milliseconds);})
  ]);}finally{clearTimeout(timer);}
}
