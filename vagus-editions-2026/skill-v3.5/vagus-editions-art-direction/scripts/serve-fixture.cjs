// Explicit local validation helper; serves only the three bundled fixture assets.
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const base=path.join(__dirname,'..','assets');
const files=new Map([['/','scene-fixture.html'],['/scene-fixture.html','scene-fixture.html'],['/motion.css','motion.css'],['/motion-runtime.mjs','motion-runtime.mjs']]);
const server=http.createServer(async(req,res)=>{
 const file=files.get(new URL(req.url,'http://127.0.0.1').pathname);
 if(!file){res.writeHead(404);res.end();return;}
 try{
  const data=await fs.readFile(path.join(base,file));
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Type',file.endsWith('.mjs')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');
  res.end(data);
 }catch{res.writeHead(500);res.end('Fixture unavailable');}
});
server.listen(0,'127.0.0.1',()=>console.log('Local fixture: http://127.0.0.1:'+server.address().port));
process.on('SIGINT',()=>server.close());
