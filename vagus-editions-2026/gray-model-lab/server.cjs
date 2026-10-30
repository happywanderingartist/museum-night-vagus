const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const entries=new Set(['index.html','style.css','app.mjs','stage.mjs','motion.mjs','runtime.mjs','assets/thinker-gray.glb','assets/thinker-gray.blend','assets/gray-poster.png','assets/reference.webp']);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.glb':'model/gltf-binary','.png':'image/png','.webp':'image/webp'};
function createServer(){return http.createServer(async(req,res)=>{
 const h={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{...h,Allow:'GET, HEAD'});res.end();return;}
 let name;try{name=decodeURIComponent((req.url||'/').split('?')[0]).slice(1)||'index.html';}catch{res.writeHead(400,h);res.end();return;}
 if(/[\x00-\x1f\x7f:\\]/.test(name)||name.split('/').some(p=>p.startsWith('.'))||!(entries.has(name)||/^vendor\/three\/[a-zA-Z0-9_./-]+$/.test(name))){res.writeHead(404,h);res.end();return;}
 const target=path.resolve(__dirname,name);if(!target.startsWith(__dirname+path.sep)){res.writeHead(404,h);res.end();return;}
 try{const b=await fs.readFile(target);res.writeHead(200,{...h,'Content-Type':types[path.extname(name)]||'application/octet-stream','Content-Length':b.length,...(name.endsWith('.blend')?{'Content-Disposition':'attachment; filename="thinker-gray.blend"'}:{})});res.end(req.method==='HEAD'?undefined:b);}catch{res.writeHead(404,h);res.end();}
});}
module.exports={createServer};if(require.main===module)createServer().listen(4180,'127.0.0.1',()=>console.log('Vagus gray-model review: http://127.0.0.1:4180'));
