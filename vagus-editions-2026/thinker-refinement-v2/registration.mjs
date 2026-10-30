import * as THREE from './vendor/three/three.module.js';
export function createRegistrationCamera(config,width,height){
 const [W,H]=config.referenceSize,s=config.pixelsPerMeter,r=config.rotationMatrix,fit=Math.min(width/W,height/H),camera=new THREE.OrthographicCamera(-width/(2*fit*s),width/(2*fit*s),height/(2*fit*s),-height/(2*fit*s),.01,4);
 const right=new THREE.Vector3(...r[0]),down=new THREE.Vector3(...r[1]),forward=new THREE.Vector3(...r[2]);
 const basis=new THREE.Matrix4().makeBasis(right,down.clone().negate(),forward.clone().negate());camera.quaternion.setFromRotationMatrix(basis);
 camera.position.copy(right).multiplyScalar((W/2-config.offset[0])/s).addScaledVector(down,(H/2-config.offset[1])/s).addScaledVector(forward,-2);
 camera.updateMatrixWorld(true);camera.updateProjectionMatrix();return camera;
}
