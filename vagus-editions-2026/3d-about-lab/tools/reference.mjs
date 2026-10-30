import {createHash} from 'node:crypto';
export function validateReference(config,bytes){
 const errors=[];
 if(!Number.isInteger(config.width)||!Number.isInteger(config.height)||Math.min(config.width,config.height)<=0)errors.push('invalid source dimensions');
 if(bytes.length<24||bytes.toString('ascii',1,4)!=='PNG'||bytes.readUInt32BE(16)!==config.width||bytes.readUInt32BE(20)!==config.height)errors.push('PNG dimensions differ');
 if(createHash('sha256').update(bytes).digest('hex')!==config.sourceSha256)errors.push('source hash changed');
 const corners=config.anchors?.cardCorners;
 if(!Array.isArray(corners)||corners.length!==4||corners.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isFinite(v))))errors.push('four measured card corners required');
 return errors;
}
export function sourceToScreen([x,y],config,{width,height}){
 const scale=Math.max(width/config.width,height/config.height),[px,py]=config.objectPosition;
 return [x*scale+(width-config.width*scale)*px,y*scale+(height-config.height*scale)*py];
}
