import {loadWithDeadline} from './runtime.mjs';
try{
  await loadWithDeadline(async signal=>{const app=await import('./app.mjs');if(!signal.aborted)await app.start(signal);});
}catch(error){
  document.body.dataset.boot='failed';document.body.classList.remove('ready');
  document.querySelector('#stage').hidden=true;
  for(const id of ['#toggle','#review'])document.querySelector(id).disabled=true;
  document.querySelector('#status').textContent='三维未载入 · 原画可阅读';
  console.error('Vagus boot failed:',error);
}
