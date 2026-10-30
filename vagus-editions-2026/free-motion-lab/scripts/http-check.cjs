const http=require('node:http');
for(const p of ['/','/app.mjs','/scene.mjs','/vendor/three/three.module.js','/vendor/three/three.core.js','/assets/gesture.glb']){
  const start=Date.now();http.get({hostname:'127.0.0.1',port:4178,path:p},r=>{let n=0;r.on('data',b=>n+=b.length);r.on('end',()=>console.log(p,r.statusCode,r.headers['content-type'],n,Date.now()-start));}).on('error',e=>console.error(p,e.code));
}
