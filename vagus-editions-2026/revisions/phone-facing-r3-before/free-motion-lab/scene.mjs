import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createHandContactRig} from './hand-contact.mjs';
// The original artwork is a locked background, not a simulated 3D room.
const W=16.72,H=9.41;
function clonePatch(texture,points,offset){
  const cx=points.reduce((s,p)=>s+p[0],0)/points.length,cy=points.reduce((s,p)=>s+p[1],0)/points.length;
  const pos=[],uv=[],alpha=[],indices=[];
  function vertex(x,y,a){pos.push((x-836)/100,(470.5-y)/100,.01);uv.push((x+offset[0])/1672,1-(y+offset[1])/941);alpha.push(a);}
  vertex(cx,cy,1);
  for(const [x,y] of points)vertex(cx+(x-cx)*.92,cy+(y-cy)*.92,1);
  for(const [x,y] of points)vertex(x,y,0);
  const n=points.length;
  for(let i=0;i<n;i++){const a=1+i,b=1+(i+1)%n,c=1+n+i,d=1+n+(i+1)%n;indices.push(0,a,b,a,c,b,b,c,d);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('opacity',new THREE.Float32BufferAttribute(alpha,1));g.setIndex(indices);
  const m=new THREE.ShaderMaterial({uniforms:{map:{value:texture}},transparent:true,depthWrite:false,vertexShader:'attribute float opacity; varying vec2 vUv; varying float a; void main(){vUv=uv;a=opacity;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform sampler2D map;varying vec2 vUv;varying float a;void main(){gl_FragColor=vec4(texture2D(map,vUv).rgb,a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
  m.side=THREE.DoubleSide;
  return new THREE.Mesh(g,m);
}
export async function createStage(canvas,progress=()=>{}){
  progress('建立本地三维画布…');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
  const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(-W/2,W/2,H/2,-H/2,.1,100);camera.position.z=20;
  progress('载入原画图层…');
  const texture=await new THREE.TextureLoader().loadAsync('./assets/thinker-original.png');texture.colorSpace=THREE.SRGBColorSpace;
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:texture})));
  // Local background reconstruction only; master image remains byte-identical.
  scene.add(clonePatch(texture,[[715,508],[786,506],[816,576],[839,664],[793,677],[747,607]],[-16,-150]));
  scene.add(clonePatch(texture,[[816,573],[852,547],[919,537],[1003,541],[1028,563],[1018,612],[963,648],[902,651],[853,632],[818,609]],[-290,-100]));
  scene.add(new THREE.HemisphereLight(0xf2dfb8,0x242d1e,2.1));
  const key=new THREE.DirectionalLight(0xffe2b4,2.4);key.position.set(-3,6,8);scene.add(key);
  const fill=new THREE.DirectionalLight(0x71836c,.45);fill.position.set(5,0,3);scene.add(fill);
  progress('载入手机与手部模型…');
  const gltf=await new GLTFLoader().loadAsync('./assets/gesture.glb');
  const model=gltf.scene;model.position.set(-.42,-2.1,.5);scene.add(model);
  // Keep the painted open book; its matching 3D study remains in the asset file.
  model.getObjectByName('Book').visible=false;
  model.getObjectByName('Wrist').visible=false;
  model.getObjectByName('Forearm').visible=false;
  const mixer=new THREE.AnimationMixer(model);for(const clip of gltf.animations)mixer.clipAction(clip).play();
  const phone=model.getObjectByName('Phone');
  const screen=model.getObjectByName('Screen');
  const contact=createHandContactRig({texture,model,phone,screen});scene.add(contact.mesh);
  // A typographic excerpt of this page, not an invented product screenshot.
  const surface=document.createElement('canvas');surface.width=360;surface.height=720;
  const ctx=surface.getContext('2d');ctx.fillStyle='#11281f';ctx.fillRect(0,0,360,720);ctx.fillStyle='#f1dbc2';ctx.font='italic 42px Georgia';ctx.fillText('Vagus',28,80);ctx.fillStyle='#e97442';ctx.fillRect(28,120,66,4);ctx.fillStyle='#e9dcc3';ctx.font='26px sans-serif';ctx.fillText('人工智能观察',28,192);ctx.font='17px sans-serif';ctx.fillText('先停一下，再看清楚。',28,245);ctx.fillStyle='#a8af93';ctx.font='16px sans-serif';ctx.fillText('本页标题摘录 / 非产品截图',28,640);
  const screenTexture=new THREE.CanvasTexture(surface);screenTexture.colorSpace=THREE.SRGBColorSpace;screen.material=new THREE.MeshBasicMaterial({map:screenTexture});
  let width=0,height=0;
  function resize(){const r=canvas.getBoundingClientRect();if(r.width===width&&r.height===height)return;width=r.width;height=r.height;renderer.setSize(width,height,false);const scale=Math.min(W/width,H/height);camera.left=-width*scale/2;camera.right=width*scale/2;camera.top=height*scale/2;camera.bottom=-height*scale/2;camera.updateProjectionMatrix();}
  function render(sample){
    resize();mixer.setTime(sample.phase==='still'?0:sample.cycleTime);
    contact.update(sample);
    renderer.render(scene,camera);
  }
  function dispose(){scene.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])m.dispose();});texture.dispose();screenTexture.dispose();renderer.dispose();}
  return {render,dispose};
}
