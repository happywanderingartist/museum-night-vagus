const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.mp4':'video/mp4','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};

function createServer(){
 return http.createServer(async(request,response)=>{
  try{
   if(!['GET','HEAD'].includes(request.method)){response.writeHead(405);response.end();return;}
   const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
   if(pathname==='/'){response.writeHead(302,{Location:'/reference/index.html','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});response.end();return;}
   if(pathname.includes('\\')||pathname.split('/').some(part=>part==='..'||part.startsWith('.')))throw Error('Path');
   let base,relative;
   if(pathname.startsWith('/reference/')){base=path.resolve(__dirname,'reference');relative=pathname.slice(11);}
   else if(pathname.startsWith('/site-v4/')){base=path.resolve(__dirname,'../site-v4');relative=pathname.slice(9);}
   else throw Error('Path');
   const file=path.resolve(base,relative),type=types[path.extname(file)];
   if(!file.startsWith(base+path.sep)||!type)throw Error('Path');
   const body=await fs.readFile(file);
   const headers={'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Accept-Ranges':'bytes','Content-Security-Policy':"default-src 'self'; img-src 'self' data: blob:; media-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; base-uri 'none'"};
   let start=0,end=body.length-1,status=200;
   if(request.headers.range){
    const match=/^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
    if(!match||(!match[1]&&!match[2])){response.writeHead(416,{'Content-Range':`bytes */${body.length}`});response.end();return;}
    start=match[1]?Number(match[1]):Math.max(0,body.length-Number(match[2]));
    end=match[1]&&match[2]?Math.min(Number(match[2]),body.length-1):body.length-1;
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=body.length){response.writeHead(416,{'Content-Range':`bytes */${body.length}`});response.end();return;}
    status=206;headers['Content-Range']=`bytes ${start}-${end}/${body.length}`;
   }
   headers['Content-Length']=String(end-start+1);
   response.writeHead(status,headers);response.end(request.method==='HEAD'?undefined:body.subarray(start,end+1));
  }catch{response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});response.end('Not found');}
 });
}
module.exports={createServer};
if(require.main===module){const server=createServer();server.listen(4196,'127.0.0.1',()=>console.log('Reference study http://127.0.0.1:4196/ | Vagus http://127.0.0.1:4196/site-v4/spatial-archive.html'));server.on('error',error=>{console.error(error.message);process.exitCode=1;});}
