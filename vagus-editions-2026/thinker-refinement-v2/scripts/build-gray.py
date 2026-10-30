"""Original local gray-model construction, skinning and animation. No cloud calls."""
import bpy, bmesh, math, os, json
from mathutils import Vector, Matrix
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'assets');EVIDENCE=os.path.join(ROOT,'evidence')
os.makedirs(OUT,exist_ok=True);os.makedirs(EVIDENCE,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.fps=30;scene.frame_start=0;scene.frame_end=210
BASE=.02802;CY=BASE+.0775;GLASS=.0055;L1=.045;L2=.033
MCP=Vector((-.108,CY+.024,.045))
def B(v):return Vector((v[0],-v[2],v[1]))
def C(v):return Vector((v.x,v.z,-v.y))
def material(name,value,rough=.75):
 m=bpy.data.materials.new(name);m.diffuse_color=(value,value,value,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*([value]*3),1);p.inputs['Roughness'].default_value=rough
 return m
clay=material('Neutral clay - material review not yet started',.53)
paper=material('Gray page block',.66);shell=material('Gray shell - orange in next stage',.36,.52)
dark=material('Dark glass and lenses',.10,.45);cloth=material('Sleeve alignment proxy',.42)
def empty(name,position=(0,0,0),parent=None):
 o=bpy.data.objects.new(name,None);scene.collection.objects.link(o);o.location=B(position);o.parent=parent;return o
assembly=empty('GrayAssembly')
def cube(name,center,size,mat,parent=assembly,bevel=.002):
 bpy.ops.mesh.primitive_cube_add(size=1);o=bpy.context.object;o.name=name;o.location=B(center);o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('Rounded manufactured edges','BEVEL');mod.width=bevel;mod.segments=5;bpy.ops.object.modifier_apply(modifier=mod.name)
 o.data.materials.append(mat);o.parent=parent
 # Keep broad faces planar, bevels smooth.
 for p in o.data.polygons:p.use_smooth=len(p.vertices)==4
 return o
def ellipsoid(name,center,radii,mat=clay,parent=assembly):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,radius=1);o=bpy.context.object;o.name=name;o.location=B(center);o.scale=(radii[0],radii[2],radii[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat);o.parent=parent
 for p in o.data.polygons:p.use_smooth=True
 return o
def capsule(name,a,b,r1,r2=None,mat=clay):
 a=Vector(a);b=Vector(b);r2=r1 if r2 is None else r2
 # A tapered tube plus rounded ends avoids a corrugated string-of-spheres surface.
 d=(b-a).normalized();u=d.cross(Vector((0,1,0)))
 if u.length<.1:u=d.cross(Vector((0,0,1)))
 u.normalize();v=d.cross(u).normalized();verts=[];faces=[];n=24
 for point,r in [(a,r1),(b,r2)]:
  for j in range(n):verts.append(tuple(B(point+r*(math.cos(j*math.tau/n)*u+math.sin(j*math.tau/n)*v))))
 for j in range(n):faces.append((j,(j+1)%n,n+(j+1)%n,n+j))
 faces.extend([tuple(reversed(range(n))),tuple(range(n,2*n))])
 mesh=bpy.data.meshes.new(name+' tube');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);o.parent=assembly;o.data.materials.append(mat)
 return [o,ellipsoid(name+' base',a,(r1,)*3,mat),ellipsoid(name+' end',b,(r2,)*3,mat)]

# Smooth centreline sweep; curled fingers use rounded arcs, not four box edges.
static_digit_paths=[]
def curved_digit(name,points,radii,flatten=.92):
 pts=[Vector(p) for p in points];static_digit_paths.append(pts);rings=[];verts=[];faces=[];n=24
 for i in range(len(pts)-1):
  p0=pts[max(0,i-1)];p1=pts[i];p2=pts[i+1];p3=pts[min(len(pts)-1,i+2)]
  for j in range(7):
   t=j/7
   center=.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t)
   tangent=.5*((-p0+p2)+2*(2*p0-5*p1+4*p2-p3)*t+3*(-p0+3*p1-3*p2+p3)*t*t)
   rings.append((center,tangent.normalized(),radii[i]*(1-t)+radii[i+1]*t))
 rings.append((pts[-1],(pts[-1]-pts[-2]).normalized(),radii[-1]))
 for center,d,r in rings:
  u=d.cross(Vector((0,1,0)))
  if u.length<.1:u=d.cross(Vector((0,0,1)))
  u.normalize();v=d.cross(u).normalized()
  for j in range(n):verts.append(tuple(B(center+r*(math.cos(j*math.tau/n)*u+flatten*math.sin(j*math.tau/n)*v))))
 for i in range(len(rings)-1):
  for j in range(n):a=i*n+j;b=i*n+(j+1)%n;faces.append((a,b,b+n,a+n))
 faces.extend([tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))])
 mesh=bpy.data.meshes.new(name+' continuous sweep');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);o.parent=assembly;o.data.materials.append(clay)
 return [o,ellipsoid(name+' rounded end',pts[-1],(radii[-1],)*3)]

def sleeve_cuff():
 # Closed thickness around an open tube: both ends have annular rims.
 verts=[];faces=[];nx=30;n=96
 for inner in [False,True]:
  for i in range(nx+1):
   t=i/nx;x=-.345+.131*t;ry=.043-.015*t;rz=.036-.012*t
   for j in range(n):
    a=j*math.tau/n;fold=(.0028+.002*t)*math.cos(7*a+1.4*t)+.0013*math.cos(11*a-.7*t)
    thickness=.0026 if inner else 0
    y=CY+.004+(ry+fold-thickness)*math.cos(a);z=.055+(rz+fold-thickness)*math.sin(a)
    # Uneven stitched edge and folds, fixed in space throughout playback.
    xx=x+.003*math.sin(3*a)*t*t
    verts.append(tuple(B((xx,y,z))))
 count=(nx+1)*n
 for inner in [0,1]:
  off=inner*count
  for i in range(nx):
   for j in range(n):
    a=off+i*n+j;b=off+i*n+(j+1)%n;face=(a,b,b+n,a+n);faces.append(face if inner==0 else tuple(reversed(face)))
 for i in [0,nx]:
  for j in range(n):
   a=i*n+j;b=i*n+(j+1)%n;faces.append((a,a+count,b+count,b))
 mesh=bpy.data.meshes.new('Open thick folded sleeve');mesh.from_pydata(verts,[],faces);mesh.update();bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
 o=bpy.data.objects.new('SleeveCuff',mesh);scene.collection.objects.link(o);o.parent=assembly;o.data.materials.append(cloth)
 for poly in mesh.polygons:poly.use_smooth=True
 return o

def hand_loft():
 profiles=[(-.375,.027,.024,.060),(-.34,.026,.023,.058),(-.29,.023,.020,.056),(-.24,.0185,.016,.053),(-.21,.017,.0145,.051),(-.19,.022,.0155,.049),(-.17,.028,.016,.047),(-.145,.031,.016,.047),(-.120,.030,.015,.047),(-.113,.026,.013,.048),(-.103,.014,.009,.050)]
 rings=[]
 for i in range(len(profiles)-1):
  p0=Vector(profiles[max(0,i-1)]);p1=Vector(profiles[i]);p2=Vector(profiles[i+1]);p3=Vector(profiles[min(len(profiles)-1,i+2)])
  for j in range(5):
   t=j/5;rings.append(.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t))
 rings.append(Vector(profiles[-1]));verts=[];faces=[];n=32
 for x,ry,rz,cz in rings:
  for j in range(n):
   c=math.cos(j*math.tau/n);s=math.sin(j*math.tau/n)
   verts.append(tuple(B((x,CY+ry*math.copysign(abs(c)**1.04,c),cz+rz*math.copysign(abs(s)**1.08,s)))))
 for i in range(len(rings)-1):
  for j in range(n):a=i*n+j;b=i*n+(j+1)%n;faces.append((a,b,b+n,a+n))
 faces.extend([tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))])
 mesh=bpy.data.meshes.new('Tapered forearm wrist palm');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new('ContinuousHandBody',mesh);scene.collection.objects.link(o);o.parent=assembly;o.data.materials.append(clay);return o
def pose(stroke):
 pad=Vector((-.027,CY-.014+.028*stroke,.0133));dip=pad+Vector((-.020,0,.015))
 dvec=dip-MCP;d=dvec.length;u=dvec.normalized();v=(Vector((0,0,1))-u*u.z).normalized()
 a=(L1*L1-L2*L2+d*d)/(2*d);h=math.sqrt(max(0,L1*L1-a*a));pip=MCP+u*a+v*h
 return [MCP.copy(),pip,dip,pad]
rest=pose(0)

# Actual closed page surface: an open gutter, two curved page blocks and covers.
book=empty('Book',parent=assembly)
cube('LowerCover',(-.05,.005,0),(.278,.008,.175),cloth,book,.002)
def top_y(x,z):return .023+.005*math.sin(math.pi*abs(x+.05)/.13)-.001*(z/.082)**2
verts=[];faces=[];nx=64;nz=24;x0=-.18;x1=.08;z0=-.082;z1=.082
for layer in range(2):
 for i in range(nx+1):
  x=x0+(x1-x0)*i/nx
  for j in range(nz+1):
   z=z0+(z1-z0)*j/nz;verts.append(tuple(B((x,top_y(x,z) if layer==0 else .010,z))))
stride=nz+1;count=(nx+1)*stride
for i in range(nx):
 for j in range(nz):
  a=i*stride+j;b=a+stride
  faces.append((a,b,b+1,a+1));faces.append((count+a+1,count+b+1,count+b,count+a))
for i in range(nx):
 for j in [0,nz]:
  a=i*stride+j;b=a+stride;faces.append((a,count+a,count+b,b))
for j in range(nz):
 for i in [0,nx]:
  a=i*stride+j;b=a+1;faces.append((a,b,count+b,count+a))
mesh=bpy.data.meshes.new('Closed curved book pages');mesh.from_pydata(verts,[],faces);mesh.update()
bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
pages=bpy.data.objects.new('BookPages',mesh);scene.collection.objects.link(pages);pages.parent=book;pages.data.materials.append(paper)
for p in mesh.polygons:p.use_smooth=False
empty('BookSupport',(0,top_y(0,0),0),book)
# Quiet page edges with real shallow grooves, no printed fake text.
for i in range(4):cube('PageEdge_%d'%i,(-.05,.011+i*.0022,-.083),(.255,.00035,.0005),cloth,book,.0001)
phone=empty('Phone',parent=assembly)
cube('PhoneBody',(0,CY,0),(.074,.155,.009),shell,phone,.0035)
cube('Screen',(0,CY,.0049),(.066,.143,.0012),dark,phone,.0024)
cube('CameraIsland',(.019,CY+.049,-.0064),(.026,.036,.004),shell,phone,.003)
for x,y in [(.024,CY+.057),(.012,CY+.041),(.025,CY+.037)]:ellipsoid('RearLens',(x,y,-.009),(.0058,.0058,.0018),dark,phone)
cube('SideButton',(-.0373,CY+.014,0),(.0011,.018,.0035),shell,phone,.0004)
empty('PhoneSupport',(0,BASE,0),phone)
cube('Table',(-.075,-.016,0),(.80,.032,.43),cloth,assembly,.008)

# Model a continuous palm, forearm, three curled fingers, thumb and extended index.
parts=[]
parts.append(hand_loft())
parts.append(ellipsoid('Thenar',(-.151,CY-.021,.044),(.025,.013,.008)))
for i,(a,b) in enumerate(zip(rest,rest[1:])):parts+=capsule('Index_%d'%i,a,b,[.0083,.0072,.0063][i],[.0078,.0068,.0061][i])
for i,p in enumerate(rest[:3]):parts.append(ellipsoid('IndexKnuckle_%d'%i,p,(.0083,.008,.008)))
parts.append(ellipsoid('IndexPad',rest[-1],(.0088,.0072,.0075)))
for i in range(3):
 y=-.006-i*.014
 points=[(-.120-i*.006,CY+y,.047),(-.087-i*.008,CY+y-.008,.062),(-.080-i*.009,CY+y-.019,.077),(-.102-i*.008,CY+y-.023,.088),(-.129-i*.006,CY+y-.012,.073)]
 r=.0081-i*.00065
 parts+=curved_digit('RelaxedCurl_%d'%i,points,[r*1.12,r,r*.93,r*.83,r*.70])
parts+=curved_digit('Thumb',[(-.158,CY-.024,.043),(-.140,CY-.047,.027),(-.114,CY-.053,.022),(-.096,CY-.045,.024)],[.011,.010,.0085,.0071],.90)
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();hand=bpy.context.object;hand.name='HandMesh'
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
hand.data.remesh_voxel_size=.00065;hand.data.use_remesh_preserve_volume=True
bpy.ops.object.voxel_remesh()
smooth=hand.modifiers.new('Anatomical surface continuity','SMOOTH');smooth.factor=.45;smooth.iterations=6;bpy.ops.object.modifier_apply(modifier=smooth.name)
decimate=hand.modifiers.new('Web gray-model topology budget','DECIMATE');decimate.ratio=.25;bpy.ops.object.modifier_apply(modifier=decimate.name)
for p in hand.data.polygons:p.use_smooth=True

# Calibrate the actual remeshed pad surface before binding. The distal segment
# keeps its orientation throughout the swipe, so this is an asset-space fit.
pad_front=min(C(v.co).z for v in hand.data.vertices if -.036<C(v.co).x<-.015 and C(v.co).z<.010)
pad_correction=pad_front-(GLASS+.00001)
for vert in hand.data.vertices:
 p=C(vert.co)
 if p.x>-.047:
  influence=max(0,min(1,(p.x+.047)/.006));p.z-=pad_correction*influence;vert.co=B(p)

# A real armature, with fixed hand anchor and three index phalanges.
arm_data=bpy.data.armatures.new('HandSkeleton');arm=bpy.data.objects.new('HandRig',arm_data);scene.collection.objects.link(arm);arm.parent=assembly
bpy.context.view_layer.objects.active=arm;hand.select_set(False);arm.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
anchor=arm_data.edit_bones.new('HandAnchor');anchor.head=B((-.35,CY,.05));anchor.tail=B((-.20,CY,.05))
names=['IndexProximal','IndexMiddle','IndexDistal'];prev=anchor
for i,name in enumerate(names):
 bone=arm_data.edit_bones.new(name);bone.head=B(rest[i]);bone.tail=B(rest[i+1]);bone.parent=prev;bone.use_connect=i>0;prev=bone
bpy.ops.object.mode_set(mode='OBJECT')
groups={name:hand.vertex_groups.new(name=name) for name in ['HandAnchor']+names}
lengths=[(rest[i+1]-rest[i]).length for i in range(3)];starts=[0,lengths[0],lengths[0]+lengths[1]]
def closest(point):
 result=None
 for i in range(3):
  d=rest[i+1]-rest[i];t=max(0,min(1,(point-rest[i]).dot(d)/d.length_squared));distance=(point-(rest[i]+t*d)).length
  value=(distance,starts[i]+t*lengths[i])
  if result is None or distance<result[0]:result=value
 return result
def static_distance(point):
 distances=[]
 for path in static_digit_paths:
  for a,b in zip(path,path[1:]):
   d=b-a;t=max(0,min(1,(point-a).dot(d)/d.length_squared));distances.append((point-(a+t*d)).length)
 return min(distances)
for vert in hand.data.vertices:
 p=C(vert.co);dist,s=closest(p)
 weights={'HandAnchor':1.0}
 if p.x>-.122 and dist<.018 and static_distance(p)>dist+.003:
  weights={names[0]:1.0}
  if s<.008:weights={'HandAnchor':1-s/.008,names[0]:s/.008}
  else:
   for j,joint in enumerate([lengths[0],lengths[0]+lengths[1]]):
    width=.0045
    if s>joint+width:weights={names[j+1]:1.0}
    elif s>=joint-width:
     f=(s-joint+width)/(2*width);weights={names[j]:1-f,names[j+1]:f};break
 # Smooth spatial envelope prevents a hard weight boundary across the palm.
 if weights!={'HandAnchor':1.0}:
  influence=max(0,min(1,(.018-dist)/.009));influence=influence*influence*(3-2*influence)
  gate=max(0,min(1,(p.y-CY-.004)/.012));gate=gate*gate*(3-2*gate)
  distal=max(0,min(1,(p.x+.125)/.055));distal=distal*distal*(3-2*distal)
  influence*=gate+(1-gate)*distal
  weights={name:value*influence for name,value in weights.items()}
  weights['HandAnchor']=weights.get('HandAnchor',0)+1-influence
 for name,weight in weights.items():
  if weight>0:groups[name].add([vert.index],weight,'REPLACE')
hand.parent=arm;mod=hand.modifiers.new('Real index-finger skinning','ARMATURE');mod.object=arm
empty('WristAnchor',(-.204,CY,.050),assembly)
# Explicit sleeve socket is a positioning proxy, not a finished painted robe.
socket=empty('SleeveSocket',(-.235,CY+.004,.055),assembly)
sleeve_cuff()
def stroke_at(t):
 c=t%7;u=(c%(5/3))/(5/3);ease=lambda x:x*x*(3-2*x)
 return (ease(u/.72) if u<.72 else 1-ease((u-.72)/.28)) if c<5 else 0
for frame in range(211):
 pts=pose(stroke_at(frame/30))
 for i,name in enumerate(names):
  pb=arm.pose.bones[name];a=B(pts[i]);d=B(pts[i+1])-a;q=d.to_track_quat('Y','Z');pb.matrix=Matrix.LocRotScale(a,q,Vector((1,1,1)))
  bpy.context.view_layer.update();pb.rotation_mode='QUATERNION';pb.keyframe_insert('location',frame=frame);pb.keyframe_insert('rotation_quaternion',frame=frame);pb.keyframe_insert('scale',frame=frame)
if arm.animation_data and arm.animation_data.action:
 arm.animation_data.action.name='Swipe5_Hold2'
 for fc in arm.animation_data.action.fcurves:
  for key in fc.keyframe_points:key.interpolation='LINEAR'
scene.frame_set(0);bpy.context.view_layer.update()

# Consistent clay lighting and actual renderable gray assembly.
world=scene.world or bpy.data.worlds.new('GrayWorld');scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.14,.16,.16,1);world.node_tree.nodes['Background'].inputs[1].default_value=.4
def light(name,c,power,size):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=B(c);o.rotation_euler=(B((-.08,.08,0))-o.location).to_track_quat('-Z','Y').to_euler()
light('Large soft key',(.12,.55,-.32),22,.45);light('Gentle fill',(-.42,.20,.18),7,.35)
bpy.ops.object.camera_add(location=B((.28,.17,-.50)));camera=bpy.context.object;camera.name='ApprovedBackView';camera.rotation_euler=(B((-.10,.085,.025))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=.54;scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.render.resolution_x=1440;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'thinker-gray.blend'))
bpy.ops.object.select_all(action='DESELECT')
for obj in scene.objects:
 if obj.type in {'MESH','ARMATURE','EMPTY'}:obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'thinker-gray.glb'),export_format='GLB',use_selection=True,export_animations=True,export_frame_range=True,export_force_sampling=True,export_animation_mode='SCENE')
scene.render.filepath=os.path.join(EVIDENCE,'gray-overview.png');bpy.ops.render.render(write_still=True)
audit={'generator':'Blender '+bpy.app.version_string,'kind':'refined gray model v2, art acceptance pending','cloud_calls':0,'hand_vertices':len(hand.data.vertices),'hand_polygons':len(hand.data.polygons),'skin_bones':list(names)+['HandAnchor'],'seconds':7,'fps':30,'phone_base_m':BASE,'glass_front_m':GLASS,'pad_correction_after_remesh_m':pad_correction,'scope':'hand/forearm, phone, open book, table and thick open sleeve; source-view registration only, no final material stage'}
with open(os.path.join(OUT,'model-audit.json'),'w',encoding='utf8') as f:json.dump(audit,f,ensure_ascii=False,indent=2)
print('VAGUS_GRAY_MODEL_BUILT',json.dumps(audit))
