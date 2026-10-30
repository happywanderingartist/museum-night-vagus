const ease = x => x*x*(3-2*x);
export function sampleMotion(seconds,{reduced=false}={}) {
  const t=Number.isFinite(seconds)&&seconds>0?seconds:0;
  if(reduced)return {phase:'still',cycleTime:0,peek:0,stroke:0,lift:0};
  const cycleTime=t%7;
  const u=(cycleTime% (5/3))/(5/3);
  const active=cycleTime<5;
  const stroke=active?(u<.72?ease(u/.72):1-ease((u-.72)/.28)):0;
  const lift=active&&u>.72?Math.sin((u-.72)/.28*Math.PI)*.06:0;
  return {phase:active?'swipe':'think',cycleTime,peek:0,stroke,lift};
}
export class ActiveClock {
  #elapsed=0; #last=null; #running=false;
  introSeen=false;
  tick(now){
    if(Number.isFinite(now)&&this.#last!==null&&this.#running)this.#elapsed+=Math.max(0,now-this.#last)/1000;
    if(Number.isFinite(now))this.#last=now;
    return this.#elapsed;
  }
  setRunning(value,now){this.tick(now);this.#running=Boolean(value);}
  skipIntro(){this.introSeen=true;}
}
