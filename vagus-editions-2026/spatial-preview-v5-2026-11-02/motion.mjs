export const unit=(a,b,p)=>Math.min(1,Math.max(0,(p-a)/(b-a)));
export const smooth=t=>t*t*t*(t*(t*6-15)+10);
export function sample(progress){
 const p=Number.isFinite(progress)?Math.min(1,Math.max(0,progress)):0;
 return {
  p,
  homeLift:smooth(unit(.04,.5,p)),
  camera:smooth(unit(.12,.76,p)),
  arrival:unit(.04,.5,p),
  homeVisible:p<.5,
  homeText:1-unit(.02,.17,p),
  title:unit(.5,.64,p),
  intro:unit(.55,.7,p),
  links:unit(.64,.76,p)
 };
}
