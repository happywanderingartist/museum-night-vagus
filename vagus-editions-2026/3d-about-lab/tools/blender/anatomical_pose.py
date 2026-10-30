"""Manual source landmarks + native Blender preserve-volume static deformation."""
import bpy,math,json
import numpy as np
from mathutils import Vector,Matrix,Euler

def fit_hand(root,joints,wrist,source_point,scale=.90):
 config=json.loads((root/'sources/about/refinement.json').read_text());f=1672/(2*math.tan(math.radians(35)/2))
 def project(p):return np.array([836+f*p[0]/-p[2],470.5-f*p[1]/-p[2]])
 names=list(joints)+['wrist'];observed=np.array([config['palmAnchors'][n] for n in names]);local=np.array([list(joints[n][0]-wrist) if n!='wrist' else [0,0,0] for n in names])
 mirror=np.diag([1,1,1]);z=Vector((.8,-.6,-.1)).normalized();y=Vector((.2,-.8,-.6));y=(y-z*y.dot(z)).normalized();x=y.cross(z).normalized()
 initial=Matrix((x,y,z)).transposed().to_euler();origin=source_point(*config['palmAnchors']['wrist'],.025);p0=np.array([*initial,*origin]);importance=np.array([1,1,1,1,.6,2])
 def basis(p):return np.array(Euler(tuple(p[:3])).to_matrix())@mirror*scale
 def residual(p):
  points=local@basis(p).T+p[3:];r=np.array([(project(pt)-target)*w for pt,target,w in zip(points,observed,importance)]).flatten();dorsal=basis(p)@np.array([0,1,0])/scale
  return np.r_[r,(p[5]-origin.z)*50,max(0,-dorsal[2])*.8]
 solutions=[]
 for turn in [0,math.pi/2,math.pi,-math.pi/2]:
  p=p0.copy();p[0]+=turn;damping=.1
  for _ in range(110):
   r=residual(p);jac=np.zeros((len(r),6))
   for j in range(6):
    q=p.copy();q[j]+=1e-5;jac[:,j]=(residual(q)-r)/1e-5
   step=np.linalg.solve(jac.T@jac+np.eye(6)*damping,-jac.T@r);step[:3]=np.clip(step[:3],-.15,.15);step[3:]=np.clip(step[3:],-.035,.035)
   if np.linalg.norm(step)<1e-9:break
   if np.linalg.norm(residual(p+step))<np.linalg.norm(r):p+=step;damping=max(.001,damping*.6)
   else:damping=min(1e6,damping*4)
  solutions.append((np.linalg.norm(residual(p)),p))
 _,params=min(solutions,key=lambda item:item[0]);b=Matrix(basis(params));origin=Vector(params[3:])
 def palm(p):return origin+b@(p-wrist)
 def ray(u,v):return Vector(((u-836)/f,(470.5-v)/f,-1))
 def ray_steps(start,pixel,length):
  start_pixel=project(start)
  for blend in [1,.98,.94,.86,.72,.5]:
   uv=start_pixel+(np.array(pixel)-start_pixel)*blend;d=ray(*uv);aa=d.length_squared;bb=-2*d.dot(start);cc=start.length_squared-length*length;disc=bb*bb-4*aa*cc
   if disc>=0:return [d*((-bb+sign*math.sqrt(disc))/(2*aa)) for sign in [-1,1]]
  return [start+Vector((.5,.5,0)).normalized()*length]
 targets={};audit={'method':'manual source landmarks; native DQ static bake','palmResidualPx':{},'fingers':{}}
 for name in names:audit['palmResidualPx'][name]=float(np.linalg.norm(project(palm(joints[name][0]) if name!='wrist' else origin)-config['palmAnchors'][name]))
 for name,rest in joints.items():
  paths=[[palm(rest[0])]];lengths=[(b@(rest[i+1]-rest[i])).length for i in range(3)]
  for i,pixel in enumerate(config['digitPixels'][name]):paths=[path+[pt] for path in paths for pt in ray_steps(path[-1],pixel,lengths[i])]
  u,v=config['digitPixels'][name][-1];center=source_point(u,v,0)+Vector(config['cardNormal'])*(.006 if name!='thumb' else -.006)
  def cost(path):
   directions=[(path[i+1]-path[i]).normalized() for i in range(3)];angles=[math.acos(max(-1,min(1,directions[i].dot(directions[i+1])))) for i in range(2)]
   return (path[-1]-center).length*100+sum(max(0,a-math.radians(105))**2 for a in angles)*5+sum(abs(pt.z-center.z) for pt in path[1:-1])*.3
  target=min(paths,key=cost);targets[name]=target;audit['fingers'][name]={'sourcePixelGuide':config['digitPixels'][name],'projectedJoints':[project(pt).tolist() for pt in target],'lengthM':lengths,'targetWorld':[list(pt) for pt in target]}
 (root/'evidence/gray/pose-guide.json').write_text(json.dumps(audit,indent=2));return b,origin,targets,audit

def bake_native_dq(ob,original,joints,basis,wrist,origin,targets,regions,weights,owner):
 def palm(p):return origin+basis@(p-wrist)
 data=bpy.data.armatures.new('StaticPoseField');arm=bpy.data.objects.new('StaticPoseField',data);bpy.context.scene.collection.objects.link(arm);bpy.context.view_layer.objects.active=arm;arm.select_set(True);bpy.ops.object.mode_set(mode='EDIT');normal=(basis@Vector((0,1,0))).normalized()
 for region in regions:
  bone=data.edit_bones.new('region_'+str(region))
  if region in owner:
   name,i=owner[region];bone.head=palm(joints[name][i]);bone.tail=palm(joints[name][i+1])
  else:
   bone.head=origin+basis@Vector((0,0,.075));bone.tail=sum((palm(j[0]) for j in joints.values()),Vector())/len(joints)
  bone.align_roll(normal)
 for region in regions:
  if region in owner:
   name,i=owner[region];bone=data.edit_bones['region_'+str(region)];bone.parent=data.edit_bones['region_'+str(24 if i==0 else next(r for r in regions if owner.get(r)==(name,i-1)))];bone.use_connect=False
 bpy.ops.object.mode_set(mode='OBJECT')
 # Native bone heat produces continuous influence across webbing and joints.
 for group in list(ob.vertex_groups):
  if group.name.startswith('region_'):ob.vertex_groups.remove(group)
 bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);arm.select_set(True);bpy.context.view_layer.objects.active=arm
 bpy.ops.object.parent_set(type='ARMATURE_AUTO')
 ob.parent=None
 # Parallel transport the existing anatomical roll; do not force every nail flat to camera.
 rotations={}
 for region in regions:
  if region not in owner:continue
  name,i=owner[region];head,tail=targets[name][i:i+2];y=(tail-head).normalized()
  source_y=(basis@(joints[name][i+1]-joints[name][i])).normalized()
  if i==0:q=source_y.rotation_difference(y)
  else:
   parent_q=rotations[name][-1];q=(parent_q@source_y).rotation_difference(y)@parent_q
  rotations.setdefault(name,[]).append(q)
  source_z=data.bones['region_'+str(region)].matrix_local.to_3x3()@Vector((0,0,1));z=q@source_z;z=(z-y*z.dot(y)).normalized();x=y.cross(z).normalized()
  matrix=Matrix((x,y,z)).transposed().to_4x4();matrix.translation=head;arm.pose.bones['region_'+str(region)].matrix=matrix;bpy.context.view_layer.update()
 bpy.context.view_layer.update();bpy.context.view_layer.objects.active=ob;modifier=next(m for m in ob.modifiers if m.type=='ARMATURE');modifier.use_deform_preserve_volume=True;bpy.ops.object.modifier_apply(modifier=modifier.name);bpy.data.objects.remove(arm,do_unlink=True);ob['deformation_method']='Blender native preserve-volume DQ, baked static; not an approved animation rig'
