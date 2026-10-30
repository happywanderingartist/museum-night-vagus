const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
function resolveRequest(url){
  let pathname;try{pathname=decodeURIComponent(url.split('?')[0]);}catch{return null;}
  if(/[\x00-\x1f\x7f:]/.test(pathname))return null;
  const parts=pathname.replaceAll('\\','/').split('/');
  if(parts.some(p=>p==='..'||p.startsWith('.')||p==='node_modules'))return null;
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  return file.startsWith(root+path.sep)?file:null;
}
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.glb':'model/gltf-binary','.woff2':'font/woff2','.json':'application/json'};
function createServer(){return http.createServer((req,res)=>{
  const file=resolveRequest(req.url||'/');
  if(!file){res.writeHead(403);res.end('Forbidden');return;}
  fs.stat(file,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
  });
});}
if(require.main===module)createServer().listen(4178,'127.0.0.1',()=>console.log('Vagus motion pilot: http://127.0.0.1:4178'));
module.exports={resolveRequest,createServer};
