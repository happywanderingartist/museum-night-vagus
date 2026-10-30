const test=require('node:test'),assert=require('node:assert/strict'),http=require('node:http');
let createServer;try{({createServer}=require('../server.cjs'));}catch{}
function request(port,url,method='GET'){return new Promise((resolve,reject)=>{http.request({hostname:'127.0.0.1',port,path:url,method},r=>{let body='';r.on('data',c=>body+=c);r.on('end',()=>resolve({status:r.statusCode,body,headers:r.headers}));}).on('error',reject).end();});}
test('local server serves only public files and rejects traversal and writes',async t=>{
 assert.equal(typeof createServer,'function');
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
 const port=server.address().port;
 assert.equal((await request(port,'/')).status,200);
 assert.equal((await request(port,'/style.css')).headers['content-type'],'text/css; charset=utf-8');
 assert.equal((await request(port,'/assets/home.webp','HEAD')).body,'');
 for(const p of ['/../PLAN.md','/%2e%2e/PLAN.md','/scripts/prepare-assets.cjs','/assets/manifest.json','/nonexistent','/%ZZ'])assert.notEqual((await request(port,p)).status,200);
 assert.equal((await request(port,'/','POST')).status,405);
});
