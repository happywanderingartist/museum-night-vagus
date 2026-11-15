// Parameters come from the public Nature Portfolio specification, lines 239–320.
// This is a mathematical reconstruction of that specification, not recovered JS.
export const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

export function spherePoints(count){
 const goldenAngle=Math.PI*(3-Math.sqrt(5));
 return Array.from({length:count},(_,index)=>{
  const y=count>1?1-index/(count-1)*2:0;
  const radius=Math.sqrt(Math.max(0,1-y*y));
  const angle=index*goldenAngle;
  const x=Math.cos(angle)*radius,z=Math.sin(angle)*radius;
  return {x,y,z,latitude:Math.asin(y)*180/Math.PI,longitude:Math.atan2(x,z)*180/Math.PI};
 });
}

export function dimensions(width,height){
 const small=width<=380,medium=width<=640;
 const radius=Math.max(small?108:medium?120:155,Math.min(480,height*(small?.38:medium?.42:.46),width*(small?.48:medium?.52:.58)));
 return {
  radius,
  cardWidth:Math.round(Math.max(72,radius*(small?.44:medium?.46:.47))),
  perspective:small?620:medium?760:width<=900?920:1150
 };
}

export function cardDepth(point,pitch,yaw){
 const pitchRadians=pitch*Math.PI/180,yawRadians=yaw*Math.PI/180;
 const pitchDepth=-point.y*Math.sin(pitchRadians)+point.z*Math.cos(pitchRadians);
 return -point.x*Math.sin(yawRadians)+pitchDepth*Math.cos(yawRadians);
}

export function appearance(depth,radius,camera,perspective,progress,focused=false,reading=false){
 const base=.14+.86*Math.pow(clamp((depth+1)/2,0,1),.85);
 const dim=clamp((1-Math.min(1,progress*1.6))*(1-base)+(reading?.78:0),0,1);
 const near=perspective*.66,absoluteDepth=depth*radius+camera;
 const opacity=focused?0:absoluteDepth>near?Math.max(0,1-(absoluteDepth-near)/190):1;
 return {dim,opacity};
}
