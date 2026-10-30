// Choices remain independent of dialogue progression; no forced typing or waits.
const advanceButton=document.querySelector('#continue-dialogue');
if(advanceButton){
 const dialogue=window.VagusDialogue.createDialogue();
 advanceButton.addEventListener('click',()=>{
  const frame=dialogue.advance(),title=document.querySelector('#hello');
  document.querySelector('#speaker').textContent=frame.speaker;
  title.textContent=frame.title;title.hidden=!frame.title;
  document.querySelector('#dialogue-text').textContent=frame.text;
  advanceButton.hidden=!frame.canAdvance;
  if(!frame.canAdvance)document.querySelector('.choices .primary').focus({preventScroll:true});
 });
}
// Trial-only disclosure. Missing destinations are explicit, never fake publications.
const dialog=document.querySelector('#pending-dialog');
document.querySelectorAll('[data-pending]').forEach(button=>button.addEventListener('click',()=>{
 const key=button.dataset.pending;
 document.querySelector('#pending-title').textContent=key==='resume'?'简历尚未接入试稿':key==='all'?'作品全集尚未接入试稿':key+'：原文待接入';
 document.querySelector('#pending-copy').textContent=key==='resume'?'本轮先确认视觉与入口排布，未提供的真实简历不会用虚构内容替代。':'作品名称来自设计方案，原文与链接仍待接入。本轮不生成虚构文章详情或成果。';
 dialog.showModal();
}));
