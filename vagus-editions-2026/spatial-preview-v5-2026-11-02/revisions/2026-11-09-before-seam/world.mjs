import * as T from '/site-v4/vendor/three.module.js';

export function createWorld(canvas){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.setClearColor('#18372e');
 const scene=new T.Scene(); scene.background=new T.Color('#18372e');
 scene.fog=new T.Fog('#19382e',12,38);
 const camera=new T.PerspectiveCamera(48,1,.06,70); camera.position.set(0,2,6);
 const ambient=new T.HemisphereLight('#e5e1c7','#2f291f',2.1); scene.add(ambient);
 const daylight=new T.DirectionalLight('#d5e4d4',2.1); daylight.position.set(-3,5,6); scene.add(daylight);
 const materials=[],geometries=[];
 const mat=(color,roughness=.85)=>{const m=new T.MeshStandardMaterial({color,roughness,metalness:0});materials.push(m);return m;};
 const pale=mat('#77978a'),green=mat('#31584a'),deep=mat('#1e4034'),trim=mat('#284d3f'),wood=mat('#5a422f'),stone=mat('#b3ab84'),brass=mat('#99845a',.45);
 function box(w,h,d,x,y,z,m){const g=new T.BoxGeometry(w,h,d);geometries.push(g);const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);scene.add(mesh);return mesh;}
 box(8,.25,34,0,-.125,-8,wood); box(8,.2,34,0,5.35,-8,deep);
 for(let i=0;i<3;i++){
  const z=3-i*10,m=[pale,green,deep][i];
  box(.35,5.4,10,-4.15,2.6,z-5,m);box(.35,5.4,10,4.15,2.6,z-5,m);
 }
 // Pilasters and low rails give reliable near/far occlusion without inventing exhibits.
 for(const z of [3,-4,-11,-18]){
  for(const side of [-1,1]){
   box(.35,5.1,.35,side*3.9,2.55,z,trim);
   box(.48,.12,.52,side*3.87,.28,z,stone);
   box(.48,.12,.52,side*3.87,4.95,z,stone);
  }
  box(7.9,.13,.35,0,5.0,z,trim);
 }
 for(const side of [-1,1]){
  box(.15,.2,33,side*3.92,.3,-8,trim);
  box(.12,.035,33,side*3.91,.43,-8,brass);
 }
 for(let j=0;j<17;j++){
  const z=7-j*2;
  box(7.8,.012,.018,0,.006,z,brass);
 }
 for(const x of [-2,0,2])box(.016,.014,33,x,.008,-8,brass);
 // The far light is part of the new environment, not a miniature AI picture.
 box(8,5.4,.2,0,2.6,-25,deep);
 const glow=new T.MeshBasicMaterial({color:'#dec697'});materials.push(glow);
 box(1.8,3.7,.1,0,1.85,-24.8,glow);
 box(2.1,.18,.2,0,3.82,-24.7,stone);
 for(const x of [-1,1])box(.14,3.7,.2,x,1.85,-24.7,stone);
 const warm=new T.PointLight('#ffd9a1',22,22,2);warm.position.set(0,3,-20);scene.add(warm);
 const foreground=new T.PointLight('#c2d7c7',10,13,2);foreground.position.set(-2,3,2);scene.add(foreground);
 for(const z of [-5,-13]){
  const m=new T.MeshBasicMaterial({color:'#ceba83'});materials.push(m);
  box(.14,.2,.18,-3.8,2.7,z,m);const light=new T.PointLight('#efd3a1',7,8,2);light.position.set(-3.6,2.8,z);scene.add(light);
 }
 function resize(w,h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 function render(q){camera.position.z=6-18*q;camera.lookAt(0,2,camera.position.z-10);renderer.render(scene,camera);}
 function dispose(){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();renderer.dispose();}
 return {resize,render,dispose};
}
