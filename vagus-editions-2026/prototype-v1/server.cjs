const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const root=__dirname;
const publicFiles=new Map([
 ['index.html','text/html; charset=utf-8'],['style.css','text/css; charset=utf-8'],['state.js','text/javascript; charset=utf-8'],['app.js','text/javascript; charset=utf-8'],['assets/mark.svg','image/svg+xml'],
 ...['home','ai','start','hug'].map(n=>['assets/'+n+'.webp','image/webp'])
]);
function createServer(){return http.createServer(async(req,res)=>{
 const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",'Referrer-Policy':'no-referrer'};
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{...headers,Allow:'GET, HEAD'});res.end();return;}
 let file;try{file=decodeURIComponent(req.url.split('?')[0]).slice(1)||'index.html';}catch{res.writeHead(400,headers);res.end();return;}
 if(!publicFiles.has(file)){res.writeHead(404,headers);res.end('Not found');return;}
 try{const data=await fs.readFile(path.join(root,file));res.writeHead(200,{...headers,'Content-Type':publicFiles.get(file),'Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);}catch{res.writeHead(404,headers);res.end('Not found');}
 });}
module.exports={createServer};
if(require.main===module){const server=createServer();server.listen(0,'127.0.0.1',()=>console.log('Vagus local preview: http://127.0.0.1:'+server.address().port));}
