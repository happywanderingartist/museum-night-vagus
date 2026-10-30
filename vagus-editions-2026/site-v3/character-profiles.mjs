// Source-image coordinates. All held objects live inside a rigid plateau.
const smooth=n=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
const profiles={
 start:{label:'递票',height:940,parts:[{bounds:[220,440,970,905],rigid:[335,565,855,820],pivot:[330,575],move:[16,-5],angle:.45,scale:.012,cycle:8200,rise:850,hold:650,fall:1300,delay:180}]},
 xiaohongshu:{label:'校正封面',parts:[{bounds:[700,320,1620,850],rigid:[820,390,1340,735],pivot:[1070,720],move:[1,-8],angle:-.6,scale:0,cycle:9200,rise:650,hold:550,fall:950,delay:300}],locks:['<path d="M678 675 L1672 786 L1672 941 L678 941 Z"/>']},
 podcast:{label:'侧头倾听',parts:[{bounds:[0,0,930,941],rigid:[100,35,750,680],pivot:[385,680],move:[0,-2],angle:.8,scale:0,cycle:10400,rise:1300,hold:1000,fall:1600,delay:200}]},
 literature:{label:'抬对讲机',parts:[{bounds:[1080,190,1450,925],rigid:[1150,240,1320,730],pivot:[1180,795],move:[-3,-8],angle:-.65,scale:0,cycle:8800,rise:800,hold:700,fall:1100,delay:420}]},
 visual:{label:'递画笔',parts:[
  {bounds:[880,0,1672,465],rigid:[950,120,1410,375],pivot:[1510,180],move:[-13,5],angle:-.3,scale:0,cycle:9400,rise:1100,hold:650,fall:1500,delay:150},
  {bounds:[0,345,850,860],rigid:[180,390,770,630],pivot:[100,680],move:[6,-3],angle:0,scale:0,cycle:9400,rise:1050,hold:600,fall:1450,delay:520}
 ]},
 about:{label:'递名片',parts:[{bounds:[540,245,1250,815],rigid:[700,345,1030,670],pivot:[1090,650],move:[-12,-4],angle:.15,scale:.006,cycle:9600,rise:1000,hold:900,fall:1400,delay:220}],locks:['<rect x="820" y="0" width="185" height="245"/>','<rect x="820" y="815" width="852" height="126"/>']}
};
export function characterProfile(kind){return profiles[kind]||null;}
export function profileKinds(){return Object.keys(profiles);}
export function patchPose(part,time){
 const phase=Math.max(0,Number.isFinite(time)?time:0)%part.cycle-part.delay;
 if(phase<=0)return 0;
 if(phase<part.rise)return smooth(phase/part.rise);
 if(phase<part.rise+part.hold)return 1;
 if(phase<part.rise+part.hold+part.fall)return 1-smooth((phase-part.rise-part.hold)/part.fall);
 return 0;
}
export function patchVertex(part,[x,y],progress){
 const [l,t,r,b]=part.bounds,[il,it,ir,ib]=part.rigid;
 const weight=(v,a,c,d,z)=>v<=a||v>=z?0:v<c?smooth((v-a)/(c-a)):v>d?smooth((z-v)/(z-d)):1;
 const blend=weight(x,l,il,ir,r)*weight(y,t,it,ib,b)*Math.max(0,Math.min(1,progress));
 const [px,py]=part.pivot,a=part.angle*Math.PI/180*blend,s=1+part.scale*blend;
 return [px+((x-px)*Math.cos(a)-(y-py)*Math.sin(a))*s+part.move[0]*blend,py+((x-px)*Math.sin(a)+(y-py)*Math.cos(a))*s+part.move[1]*blend];
}
export function patchMesh(part){
 const [l,t,r,b]=part.bounds,[il,it,ir,ib]=part.rigid;
 const axis=(a,c,d,z)=>[a,(a+c)/2,c,(2*c+d)/3,(c+2*d)/3,d,(d+z)/2,z];
 const xs=axis(l,il,ir,r),ys=axis(t,it,ib,b),mesh=[];
 for(let y=0;y<ys.length-1;y++)for(let x=0;x<xs.length-1;x++){
  const a=[xs[x],ys[y]],b=[xs[x+1],ys[y]],c=[xs[x+1],ys[y+1]],d=[xs[x],ys[y+1]];mesh.push([a,b,c],[a,c,d]);
 }return mesh;
}
