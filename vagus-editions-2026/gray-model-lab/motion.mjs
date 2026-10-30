const ease=x=>x*x*(3-2*x);
export function sampleMotion(seconds,{reduced=false}={}){
 const time=reduced?0:(Number.isFinite(seconds)&&seconds>0?seconds:0)%7;
 const u=(time%(5/3))/(5/3),active=!reduced&&time<5;
 return {time,phase:reduced?'still':active?'swipe':'think',stroke:active?(u<.72?ease(u/.72):1-ease((u-.72)/.28)):0};
}
export class ActiveClock{
 #elapsed=0;#last=null;#running=false;
 tick(now){if(Number.isFinite(now)&&this.#last!==null&&this.#running)this.#elapsed+=Math.max(0,now-this.#last)/1000;if(Number.isFinite(now))this.#last=now;return this.#elapsed;}
 setRunning(value,now){this.tick(now);this.#running=Boolean(value);}
}
