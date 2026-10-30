import {createRegistrationCamera} from './registration.mjs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const views={composition:{eye:[.28,.17,-.50],target:[-.10,.085,.025]},close:{eye:[.17,.13,-.35],target:[-.065,.10,.025]},contact:{eye:[-.22,.22,.35],target:[-.075,.105,.025]}};
export async function createStage(canvas,{signal}={}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.setClearColor(0xc4cbc1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 const scene=new THREE.Scene(),studyCamera=new THREE.PerspectiveCamera(35,1,.005,3);let camera=studyCamera,registration=null,viewName='composition',model=null,mixer=null,disposed=false,width=0,height=0;
 function release(root){root.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])m.dispose();});}
 function onAbort(){dispose();}
 function dispose(){if(disposed)return;disposed=true;signal?.removeEventListener('abort',onAbort);release(scene);renderer.dispose();}
 try{
  if(signal?.aborted){dispose();throw Error('Gray stage cancelled');}
  signal?.addEventListener('abort',onAbort,{once:true});
  scene.add(new THREE.HemisphereLight(0xf2f2df,0x58685b,1.8));
  const key=new THREE.DirectionalLight(0xfff3df,2.8);key.position.set(.12,.55,-.32);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-.5;key.shadow.camera.right=.5;key.shadow.camera.top=.45;key.shadow.camera.bottom=-.3;key.shadow.camera.near=.05;key.shadow.camera.far=1.5;key.shadow.bias=-.0002;key.shadow.normalBias=.0012;key.target.position.set(-.1,.08,0);scene.add(key,key.target);
  const fill=new THREE.DirectionalLight(0xd0dfd6,.7);fill.position.set(-.4,.2,.2);scene.add(fill);
  const response=await fetch('./assets/registration.json',{signal});if(!response.ok)throw Error('Registration configuration unavailable');registration=await response.json();
  const gltf=await new GLTFLoader().loadAsync('./assets/thinker-gray.glb');model=gltf.scene;if(disposed||signal?.aborted){release(model);throw Error('Gray stage cancelled');}scene.add(model);model.traverse(o=>{if(o.isMesh){o.castShadow=o.name!=='Table';o.receiveShadow=true;}});
  mixer=new THREE.AnimationMixer(model);mixer.clipAction(gltf.animations[0]).play();
  function setView(name){viewName=name;const registered=name==='registration';model.getObjectByName('Book').visible=!registered;model.getObjectByName('Table').visible=!registered;model.getObjectByName('SleeveCuff').visible=!registered;renderer.setClearColor(0xc4cbc1,registered?0:1);if(registered){const rect=canvas.getBoundingClientRect();camera=createRegistrationCamera(registration,rect.width,rect.height);}else{camera=studyCamera;const v=views[name]||views.composition;camera.position.fromArray(v.eye);camera.lookAt(new THREE.Vector3().fromArray(v.target));camera.updateMatrixWorld(true);}width=0;}
  function render(time){if(disposed)return;const rect=canvas.getBoundingClientRect();if(width!==rect.width||height!==rect.height){width=rect.width;height=rect.height;renderer.setSize(width,height,false);if(viewName==='registration')camera=createRegistrationCamera(registration,width,height);else{camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();}}mixer.setTime(time%7);renderer.render(scene,camera);}
  setView('composition');return {render,setView,dispose};
 }catch(error){dispose();throw error;}
}
