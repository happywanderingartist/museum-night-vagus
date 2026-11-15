import * as T from '/site-v4/vendor/three.module.js';

// One shallow threshold surrounds the original AI composition at its final crop.
export function createWorld(canvas){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.setClearColor(0x000000,0);
 const scene=new T.Scene();
 const camera=new T.PerspectiveCamera(48,1,.06,90);
 const frame=new T.Group();
 scene.add(frame);
 scene.add(new T.HemisphereLight('#e0e8db','#213b30',2));
 const light=new T.DirectionalLight('#e6ebdb',2);
 light.position.set(-4,5,8);
 scene.add(light);
 const materials=[],geometries=[];
 function material(color){
  const surface=new T.MeshStandardMaterial({color,roughness:1,metalness:0});
  materials.push(surface);
  return surface;
 }
 const face=material('#294638'),reveal=material('#1d3c2e'),edge=material('#587761');
 function box(width,height,depth,x,y,z,surface){
  const geometry=new T.BoxGeometry(width,height,depth);
  const mesh=new T.Mesh(geometry,surface);
  geometries.push(geometry);
  mesh.position.set(x,y,z);
  frame.add(mesh);
 }
 // Only lateral jambs pass the viewer. Keeping the full height open avoids
 // enclosing the AI composition in a floating four-sided picture frame.
 box(50,60,.3,-27.5,0,-.15,face);
 box(50,60,.3,27.5,0,-.15,face);
 for(const side of [-1,1]){
  box(.1,60,.85,side*2.55,0,.425,reveal);
  box(.12,60,.12,side*2.56,0,.91,edge);
 }
 const tangent=Math.tan(T.MathUtils.degToRad(camera.fov/2));
 const startDistance=2.5/(tangent*.72),endDistance=2.5/(tangent*1.15);
 function resize(width,height){
  renderer.setSize(width,height,false);
  camera.aspect=width/height;
  camera.updateProjectionMatrix();
  frame.scale.x=camera.aspect;
 }
 function render(progress){
  camera.position.set(0,0,startDistance+(endDistance-startDistance)*progress);
  camera.lookAt(0,0,0);
  renderer.render(scene,camera);
 }
 function dispose(){
  for(const geometry of geometries)geometry.dispose();
  for(const surface of materials)surface.dispose();
  renderer.dispose();
 }
 return {resize,render,dispose};
}
