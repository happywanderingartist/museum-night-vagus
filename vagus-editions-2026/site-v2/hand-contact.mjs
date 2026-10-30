import * as THREE from './vendor/three/three.module.js';

// Coordinates are measured in the existing 1672 × 941 source painting.
const TIP_PIXEL=[824,599];
const OUTLINE=[[824,599],[829,582],[850,568],[870,554],[892,549],[921,550],[949,542],[974,546],[1004,544],[1038,532],[1064,548],[1078,582],[1035,599],[1004,609],[977,614],[954,618],[938,613],[921,623],[905,637],[891,635],[884,623],[871,635],[859,631],[850,617],[852,603],[857,594],[850,591],[838,601],[825,607]];
const pixelToWorld=([x,y])=>new THREE.Vector3((x-836)/100,(470.5-y)/100,3);

export function createHandContactRig({texture,model,phone,screen}){
  const shape=new THREE.Shape(OUTLINE.map(p=>{const v=pixelToWorld(p);return new THREE.Vector2(v.x,v.y);}));
  const geometry=new THREE.ShapeGeometry(shape),positions=geometry.attributes.position;
  const uv=[],weights=[];
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i)*100+836,y=470.5-positions.getY(i)*100;
    uv.push(x/1672,1-y/941);
    weights.push(Math.pow(THREE.MathUtils.clamp((945-x)/(945-TIP_PIXEL[0]),0,1),1.35));
    positions.setZ(i,3);
  }
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  const original=positions.array.slice(),restTip=pixelToWorld(TIP_PIXEL);
  const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
  mesh.name='PaintedHandWithScreenContact';
  // Actual GLB glass face: x ±.3435, y ±.715, front z=-.007.
  // Keep the contact just inside the right edge, not on the visible back shell.
  const neutralLocal=new THREE.Vector3(.30,-.10,-.009);
  // Fixed back/side view: glass faces the character, away from the observer.
  // The previous back-facing pose forced the painted finger through the shell.
  phone.quaternion.setFromEuler(new THREE.Euler(.30,-.95,.22,'XYZ'));
  model.updateWorldMatrix(true,true);
  const before=screen.localToWorld(neutralLocal.clone());
  const registered=restTip.clone();
  const delta=registered.clone().sub(before);
  if(model.parent){
    const a=model.parent.worldToLocal(registered.clone()),b=model.parent.worldToLocal(before.clone());
    model.position.add(a.sub(b));
  }else model.position.add(delta);
  model.updateWorldMatrix(true,true);
  const basePosition=phone.position.clone(),baseQuaternion=phone.quaternion.clone();
  function update(sample){
    phone.position.copy(basePosition);
    phone.quaternion.copy(baseQuaternion);
    model.updateWorldMatrix(true,true);
    const target=screen.localToWorld(neutralLocal.clone().add(new THREE.Vector3(0,.25*sample.stroke,0)));
    const localTarget=mesh.parent?mesh.parent.worldToLocal(target):target;
    const shift=localTarget.sub(restTip);
    for(let i=0;i<positions.count;i++){
      const vertex=new THREE.Vector3(original[i*3]+shift.x*weights[i],original[i*3+1]+shift.y*weights[i],original[i*3+2]+shift.z*weights[i]);
      const world=mesh.parent?mesh.parent.localToWorld(vertex.clone()):vertex.clone();
      const glassLocal=screen.worldToLocal(world);
      // Constrain the whole painted pad, not only its leading anchor. Every
      // triangle then remains outside the glass/body half-space as it slides.
      if(glassLocal.z>-.009){glassLocal.z=-.009;screen.localToWorld(glassLocal);if(mesh.parent)mesh.parent.worldToLocal(glassLocal);vertex.copy(glassLocal);}
      positions.setXYZ(i,vertex.x,vertex.y,vertex.z);
    }
    positions.needsUpdate=true;geometry.computeBoundingSphere();
  }
  return {mesh,update};
}
