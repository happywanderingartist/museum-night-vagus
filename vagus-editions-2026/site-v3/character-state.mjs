const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
const cycle=(time,duration)=>((Number.isFinite(time)?Math.max(0,time):0)%duration);

export function swipeFrame(time){
 const phase=cycle(time,7000);
 if(phase>=5000)return {progress:0,lift:0,thinking:true};
 const stroke=phase%1250;
 return stroke<875?{progress:smooth(stroke/875),lift:0,thinking:false}:
  {progress:1-smooth((stroke-875)/375),lift:Math.sin(Math.PI*(stroke-875)/375),thinking:false};
}
// The source patch deforms continuously; its border and wrist stay fixed.
export function handVertex([x,y],progress,lift=0){
 const weightX=x<811?smooth((x-790)/21):clamp((970-x)/159);
 const weightY=y<590?smooth((y-510)/80):smooth((650-y)/60);
 const weight=weightX*weightY;
 return [x+(-16*clamp(progress)+6*clamp(lift))*weight,y-48*clamp(progress)*weight];
}
export function handMesh(){
 const xs=[790,811,850,900,950,970,1020],ys=[510,550,590,620,650],triangles=[];
 for(let y=0;y<ys.length-1;y++)for(let x=0;x<xs.length-1;x++){
  const a=[xs[x],ys[y]],b=[xs[x+1],ys[y]],c=[xs[x+1],ys[y+1]],d=[xs[x],ys[y+1]];
  triangles.push([a,b,c],[a,c,d]);
 }
 return triangles;
}
export function triangleMatrix(source,destination){
 const [[x0,y0],[x1,y1],[x2,y2]]=source,[[u0,v0],[u1,v1],[u2,v2]]=destination;
 const den=x0*(y1-y2)+x1*(y2-y0)+x2*(y0-y1);
 const axis=(p0,p1,p2)=>[(p0*(y1-y2)+p1*(y2-y0)+p2*(y0-y1))/den,(p0*(x2-x1)+p1*(x0-x2)+p2*(x1-x0))/den,(p0*(x1*y2-x2*y1)+p1*(x2*y0-x0*y2)+p2*(x0*y1-x1*y0))/den];
 const [a,c,e]=axis(u0,u1,u2),[b,d,f]=axis(v0,v1,v2);
 return {a,b,c,d,e,f};
}
export function blinkOpacity(time){
 const phase=cycle(time,5800)-1200;
 if(phase<0||phase>=200)return 0;
 if(phase<60)return smooth(phase/60);
 if(phase<100)return 1;
 return 1-smooth((phase-100)/100);
}
export function coverViewBox(iw,ih,width,height,px=.5,py=.5){
 if(![iw,ih,width,height,px,py].every(Number.isFinite)||Math.min(iw,ih,width,height)<=0)return null;
 const scale=Math.max(width/iw,height/ih),x=-(width-iw*scale)*px/scale,y=-(height-ih*scale)*py/scale;
 return [x===0?0:x,y===0?0:y,width/scale,height/scale];
}
