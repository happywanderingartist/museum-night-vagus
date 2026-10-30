const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const root=path.join(__dirname,'skills','vagus-editions-art-direction','assets');
const allowed=new Map([['/','scene-fixture.html'],['/scene-fixture.html','scene-fixture.html'],['/motion.css','motion.css'],['/motion-runtime.mjs','motion-runtime.mjs']]);
const server=http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://127.0.0.1').pathname,file=allowed.get(pathname);
 if(!file){res.writeHead(404);res.end();return;}
 try{const b=await fs.readFile(path.join(root,file));res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',file.endsWith('.mjs')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(b);}catch{res.writeHead(500);res.end('Unavailable');}
});
server.listen(0,'127.0.0.1',()=>console.log('Fixture only: http://127.0.0.1:'+server.address().port));
process.on('SIGINT',()=>server.close());
