import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
const api=await import('../server.cjs').catch(()=>({}));
test('server resolves only paths inside the pilot directory',()=>{
  assert.equal(typeof api.resolveRequest,'function');
  assert.ok(api.resolveRequest('/').endsWith('index.html'));
  assert.equal(api.resolveRequest('/%2e%2e/%2e%2e/secrets'),null);
  assert.equal(api.resolveRequest('/%ZZ'),null);
  assert.equal(api.resolveRequest('/node_modules/three/package.json'),null);
  assert.equal(api.resolveRequest('/.git/config'),null);
  assert.equal(api.resolveRequest('/assets/%00'),null);
});
test('malformed HTTP request is rejected and server continues serving',async()=>{
  const server=api.createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=server.address().port;
  const request=path=>new Promise((resolve,reject)=>http.get({hostname:'127.0.0.1',port,path},r=>{r.resume();r.on('end',()=>resolve(r.statusCode));}).on('error',reject));
  try{assert.equal(await request('/assets/%00'),403);assert.equal(await request('/'),200);}finally{await new Promise(resolve=>server.close(resolve));}
});
