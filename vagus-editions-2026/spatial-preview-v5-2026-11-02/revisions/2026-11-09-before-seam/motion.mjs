export const unit=(a,b,p)=>Math.min(1,Math.max(0,(p-a)/(b-a)));
export const smooth=t=>t*t*t*(t*(t*6-15)+10);
export function sample(progress){
 const p=Number.isFinite(progress)?Math.min(1,Math.max(0,progress)):0;
 return {p,opening:unit(.06,.38,p),camera:smooth(unit(.26,.88,p)),arrival:unit(.64,.88,p),
  homeVisible:p<.38,homeText:1-unit(.01,.17,p),title:unit(.74,.80,p),intro:unit(.76,.84,p),links:unit(.82,.88,p)};
}
export function openingPoints(t){
 const rx=1.15*t*t,ry=1.4*t*t;
 return Array.from({length:64},(_,i)=>{
  const a=i*Math.PI/32,shape=1+.045*Math.sin(3*a+.5)+.025*Math.cos(5*a);
  return [.42+Math.cos(a)*rx*shape,.45+Math.sin(a)*ry*shape];
 });
}
export function outsideOpening(t){
 const vertices=openingPoints(t).map(([x,y])=>`${x*100}% ${y*100}%`);
 return `polygon(evenodd,0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,${vertices.join(',')},${vertices[0]},0% 0%)`;
}
