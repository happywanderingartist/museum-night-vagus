const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const {createReadStream}=require('node:fs');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.json':'application/json; charset=utf-8','.pdf':'application/pdf','.mp3':'audio/mpeg','.m4a':'audio/mp4','.wav':'audio/wav','.ogg':'audio/ogg','.jpg':'image/jpeg','.jpeg':'image/jpeg'};
const entries=new Set(['atmosphere.mjs','atmosphere.css','about-rigid.mjs','assets/about-clean-plate.png','about-depth.mjs','about-depth-state.mjs','vendor/three.module.js','vendor/three.core.js','index.html','start.html','hug.html','xiaohongshu.html','podcast.html','literature.html','visual.html','about.html','works.html','ai.html','style.css','completion.css','app.js','state.js','chapter-pages.css','chapter-motion.mjs','chapter-state.mjs','catalog-state.mjs','content-state.mjs','site-features.mjs','scene-motion.mjs','motion-state.mjs','scene-motion.css','character-motion.mjs','character-state.mjs','character-profiles.mjs','assets/mona-blink.webp','assets/thinker-hand.webp','assets/home.webp','assets/ai.webp','assets/start.webp','assets/hug.webp','assets/xiaohongshu.webp','assets/podcast.webp','assets/literature.webp','assets/visual.webp','assets/about.webp','assets/mark.svg','assets/site-content.json','assets/catalog.json']);
function createServer(){return http.createServer(async(req,res)=>{
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{...headers,Allow:'GET, HEAD'});res.end();return;}
  let name;try{name=decodeURIComponent((req.url||'/').split('?')[0]).slice(1)||'index.html';}catch{res.writeHead(400,headers);res.end();return;}
  if(/[\x00-\x1f\x7f:\\]/.test(name)||name.split('/').some(p=>p.startsWith('.'))||!(entries.has(name)||(name.startsWith('public/')&&/\.(pdf|mp3|m4a|wav|ogg|webp|png|jpe?g)$/i.test(name)))){res.writeHead(404,headers);res.end();return;}
  const target=path.resolve(__dirname,name);if(!target.startsWith(__dirname+path.sep)){res.writeHead(404,headers);res.end();return;}
  try{
   const info=await fs.stat(target);if(!info.isFile()){res.writeHead(404,headers);res.end();return;}
   let start=0,end=info.size-1,status=200;
   const range=req.headers.range;
   if(range){
    const match=/^bytes=(\d*)-(\d*)$/.exec(range);
    let valid=Boolean(match&&(match[1]||match[2])&&info.size>0);
    if(valid){
     if(match[1]){start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),info.size-1):info.size-1;}
     else{const count=Number(match[2]);start=Math.max(0,info.size-count);end=info.size-1;valid=count>0;}
     valid=valid&&Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start>=0&&start<=end&&start<info.size;
    }
    if(!valid){res.writeHead(416,{...headers,'Content-Range':'bytes */'+info.size});res.end();return;}
    status=206;
   }
   res.writeHead(status,{...headers,'Accept-Ranges':'bytes','Content-Type':types[path.extname(target).toLowerCase()]||'application/octet-stream','Content-Length':Math.max(0,end-start+1),...(status===206?{'Content-Range':`bytes ${start}-${end}/${info.size}`}:{})});
   if(req.method==='HEAD'||info.size===0){res.end();return;}
   const stream=createReadStream(target,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  }catch{if(!res.headersSent){res.writeHead(404,headers);res.end();}else res.destroy();}
});}
module.exports={createServer};if(require.main===module)createServer().listen(4190,'127.0.0.1',()=>console.log('Vagus about-atmosphere-01: http://127.0.0.1:4190'));
