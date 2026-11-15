const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const local=new Set(['index.html','preview.css','preview.mjs','world.mjs','motion.mjs']);
const publicTypes={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.txt':'text/plain; charset=utf-8'};
function createServer(){return http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file;
  if(pathname.includes('\\')||pathname.split('/').some(x=>x==='..'||x.startsWith('.')))throw Error('Path');
  if(pathname.startsWith('/site-v4/')){
   const base=path.resolve(__dirname,'../site-v4'),rel=pathname.slice(9);
   file=path.resolve(base,rel);if(!file.startsWith(base+path.sep)||!publicTypes[path.extname(file)])throw Error('Path');
  }else{
   const rel=pathname==='/'?'index.html':pathname.slice(1);if(!local.has(rel))throw Error('Path');file=path.join(__dirname,rel);
  }
  const body=await fs.readFile(file);
  res.writeHead(200,{'Content-Type':publicTypes[path.extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'"});
  res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}
});}
module.exports={createServer};
if(require.main===module){require('./assemble.cjs');const server=createServer();server.listen(4195,'127.0.0.1',()=>console.log('Vagus v5: http://127.0.0.1:4195/'));server.on('error',e=>{console.error(e.message);process.exitCode=1;});}
