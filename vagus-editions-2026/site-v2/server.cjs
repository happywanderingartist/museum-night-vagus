const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.glb':'model/gltf-binary'};
const entries=new Set(['index.html','start.html','hug.html','style.css','app.js','state.js','chapter-pages.css','chapter-motion.mjs','chapter-state.mjs','three-bridge.mjs','scene.mjs','hand-contact.mjs','motion.mjs','runtime.mjs']);
function createServer(){return http.createServer(async(req,res)=>{
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{...headers,Allow:'GET, HEAD'});res.end();return;}
  let name;try{name=decodeURIComponent((req.url||'/').split('?')[0]).slice(1)||'index.html';}catch{res.writeHead(400,headers);res.end();return;}
  if(/[\x00-\x1f\x7f:\\]/.test(name)||name.split('/').some(p=>p.startsWith('.'))||!(entries.has(name)||/^(assets|vendor)\/[a-zA-Z0-9_./-]+$/.test(name))){res.writeHead(404,headers);res.end();return;}
  const target=path.resolve(__dirname,name);if(!target.startsWith(__dirname+path.sep)){res.writeHead(404,headers);res.end();return;}
  try{const data=await fs.readFile(target);res.writeHead(200,{...headers,'Content-Type':types[path.extname(target)]||'application/octet-stream','Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);}catch{res.writeHead(404,headers);res.end();}
});}
module.exports={createServer};if(require.main===module)createServer().listen(4179,'127.0.0.1',()=>console.log('Vagus site-v2: http://127.0.0.1:4179'));
