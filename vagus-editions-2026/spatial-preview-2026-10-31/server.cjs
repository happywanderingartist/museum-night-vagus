const http=require('node:http');const fs=require('node:fs/promises');const path=require('node:path');
const base=__dirname,project=path.dirname(base);const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.txt':'text/plain; charset=utf-8'};
const preview=new Set(['index.html','preview.css','preview.mjs','camera.mjs','reading.html','input.mjs']);
const publicSite=new Set(['assets/home.webp','assets/ai.webp','vendor/three.module.js','vendor/three.core.js']);
function createServer(){return http.createServer(async(req,res)=>{try{if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}const url=new URL(req.url,'http://127.0.0.1');let requested=decodeURIComponent(url.pathname),file;
 if(requested.startsWith('/site-v4/')){const rel=requested.slice(9);if(!publicSite.has(rel))throw Error('Not public');file=path.join(project,'site-v4',rel);}
 else{const rel=requested==='/'?'index.html':requested.slice(1);if(!preview.has(rel))throw Error('Not public');file=path.join(base,rel);}
 const body=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'"});res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}});}
module.exports={createServer};if(require.main===module){const server=createServer();server.listen(4189,'127.0.0.1',()=>console.log('Vagus空间预览：http://127.0.0.1:4189'));server.on('error',e=>{console.error(e.message);process.exitCode=1;});}
