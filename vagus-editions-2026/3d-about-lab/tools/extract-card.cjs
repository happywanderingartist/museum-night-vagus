// Reproducible corner observation; manual face/wrist anchors remain approximate.
const fs=require('node:fs'),path=require('node:path');
const {createRequire}=require('node:module');
const sharp=createRequire('C:/Users/15049/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/')('sharp');
const root=path.resolve(__dirname,'..');
(async()=>{
 const {data,info}=await sharp(path.join(root,'sources/about/reference.png')).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const points=[];
 for(let y=330;y<=495;y++)for(let x=760;x<=980;x++){
  const i=(y*info.width+x)*info.channels,r=data[i],g=data[i+1],b=data[i+2];
  if(r>185&&g>180&&b>155&&r-b<65)points.push([x,y]);
 }
 const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
 points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const lo=[],hi=[];
 for(const p of points){while(lo.length>=2&&cross(lo.at(-2),lo.at(-1),p)<=0)lo.pop();lo.push(p);}
 for(const p of [...points].reverse()){while(hi.length>=2&&cross(hi.at(-2),hi.at(-1),p)<=0)hi.pop();hi.push(p);}
 let hull=lo.slice(0,-1).concat(hi.slice(0,-1)),full=[...hull];
 while(hull.length>4){let k=0,area=Infinity;for(let i=0;i<hull.length;i++){let a=Math.abs(cross(hull[(i+hull.length-1)%hull.length],hull[i],hull[(i+1)%hull.length]));if(a<area){area=a;k=i;}}hull.splice(k,1);}
 const sorted=[...hull].sort((a,b)=>a[0]-b[0]),left=sorted.slice(0,2).sort((a,b)=>a[1]-b[1]),right=sorted.slice(2).sort((a,b)=>a[1]-b[1]);
 const corners=[left[0],right[0],right[1],left[1]];
 const result={method:'ROI white threshold, monotone convex hull, smallest triangle area vertex removal',threshold:{r:185,g:180,b:155,rMinusB:65},roi:[760,330,980,495],candidatePixels:points.length,hull:full,corners,limitation:'observed white region; occluded edges and antialiasing affect corner choice'};
 fs.writeFileSync(path.join(root,'evidence/gray/card-extraction.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({candidatePixels:points.length,corners}));
})().catch(e=>{console.error(e);process.exitCode=1});
