"""Local, procedural Blender asset. No services, keys, or downloaded meshes."""
import bpy, math, os, json, hashlib
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'assets');os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.fps=30;scene.frame_start=0;scene.frame_end=210
def material(name,color,rough=.6,metal=0):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
    return m
stone=material('Warm carved limestone',(.59,.44,.28),.88)
orange=material('Vermilion enamel',(.69,.115,.034),.38,.12)
black=material('Camera obsidian',(.015,.018,.016),.24,.3)
glass=material('Screen glass',(.028,.075,.057),.22)
paper=material('Old book pages',(.47,.32,.16),.94)
leather=material('Dark oxblood leather',(.105,.037,.015),.8)
gold=material('Book tooling',(.36,.21,.08),.55,.18)
def empty(name,parent=None,loc=(0,0,0)):
    o=bpy.data.objects.new(name,None);scene.collection.objects.link(o);o.parent=parent;o.location=loc;return o
def cube(name,loc,scale,mat,parent=None,bevel=.03):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,0));o=bpy.context.object;o.name=name;o.parent=parent;o.location=loc;o.dimensions=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Soft machined edges','BEVEL');mod.width=bevel;mod.segments=4;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
    o.data.materials.append(mat)
    for p in o.data.polygons:p.use_smooth=True
    return o
def ellipsoid(name,loc,scale,mat,parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,radius=1);o=bpy.context.object;o.name=name;o.parent=parent;o.location=loc;o.scale=scale;o.data.materials.append(mat)
    for p in o.data.polygons:p.use_smooth=True
    return o
def segment(name,a,b,r,mat,parent=None):
    mid=(Vector(a)+Vector(b))/2;delta=Vector(b)-Vector(a)
    o=ellipsoid(name,mid,(r,r,delta.length/2+r*.4),mat,parent);o.rotation_mode='QUATERNION';o.rotation_quaternion=delta.to_track_quat('Z','Y');return o
rig=empty('GestureRig')
book=empty('Book',rig)
cube('Leather lower board',(0,0,.045),(3.1,1.35,.08),leather,book,.04)
for i in range(10):cube('Page layer %02d'%i,(0,.005,.095+i*.013),(3.00-abs(i-5)*.012,1.29,.012),paper,book,.008)
for x in [-.76,.76]:
    page=cube('Open book block', (x,0,.24),(1.5,1.25,.10),paper,book,.025);page.rotation_euler[1]=.07 if x<0 else -.07
cube('Spine ribbon',(0,.1,.24),(.035,1.4,.015),leather,book,.002)
for x in [-1.45,1.45]:cube('Gold tooling',(x,-.64,.09),(.025,.025,.05),gold,book,.006)
phone=empty('Phone',rig,(-.17,0,.24));phone.rotation_euler=(math.radians(-11),math.radians(-19),math.radians(2))
cube('PhoneBody',(0,0,.77),(.77,.095,1.54),orange,phone,.075)
cube('Screen',(0,.053,.77),(.687,.014,1.43),glass,phone,.065)
cube('Camera island',(-.18,-.065,1.29),(.29,.045,.39),orange,phone,.055)
for x,z in [(-.24,1.38),(-.13,1.2),(-.25,1.17)]:
    lens=ellipsoid('Lens',(x,-.095,z),(.067,.018,.067),black,phone)
cube('Side key',(.393,0,.95),(.018,.05,.22),orange,phone,.008)
cube('Earpiece',(0,.065,1.43),(.17,.01,.014),black,phone,.006)
# An articulated geometric proxy: explicitly not a scan of the original statue.
wrist=empty('Wrist',rig,(1.16,.18,1.05))
ellipsoid('Palm',(0,0,0),(.27,.13,.19),stone,wrist)
ellipsoid('Thenar',(.035,-.04,-.10),(.17,.13,.16),stone,wrist)
# Index finger points left, onto the screen. Separate joints permit a real flex.
index=empty('IndexJoint',wrist,(-.15,.005,.065))
segment('Index proximal',(0,0,0),(-.24,.025,.045),.062,stone,index)
tip=empty('IndexTip',index,(-.24,.025,.045))
segment('Index middle',(0,0,0),(-.15,.014,-.055),.049,stone,tip)
ellipsoid('Index distal',(-.18,.014,-.079),(.072,.048,.05),stone,tip)
for j in range(3):
    z=-.035-j*.071;x=-.03+j*.07
    segment('Curled finger %dA'%j,(x,.02,z),(-.22+j*.045,.055,z-.10),.057-j*.004,stone,wrist)
    segment('Curled finger %dB'%j,(-.22+j*.045,.055,z-.10),(-.10+j*.045,-.015,z-.18),.052-j*.004,stone,wrist)
segment('Thumb proximal',(.12,-.07,-.05),(-.01,-.13,-.21),.08,stone,wrist)
segment('Thumb tip',(-.01,-.13,-.21),(-.17,-.08,-.24),.062,stone,wrist)
forearm=empty('Forearm',rig,(2.28,.16,1.16))
arm=segment('Carved forearm',(0,0,0),(-1.15,0,-.11),.145,stone,forearm)
for frame in range(211):
    t=frame/30;c=t%7;u=(c%(5/3))/(5/3)
    ease=lambda x:x*x*(3-2*x)
    stroke=(ease(u/.72) if u<.72 else 1-ease((u-.72)/.28)) if c<5 else 0
    lift=math.sin((u-.72)/.28*math.pi)*.06 if c<5 and u>.72 else 0
    wrist.location=(1.16-.10*stroke,.18+lift,1.05+.23*stroke)
    wrist.rotation_euler[1]=-.025*stroke
    index.rotation_euler[1]=-.10*stroke
    tip.rotation_euler[1]=.12*stroke
    # Forearm stays fixed at elbow, follows wrist with small angular change.
    forearm.rotation_euler[1]=.18*stroke
    for obj,props in [(wrist,['location','rotation_euler']),(index,['rotation_euler']),(tip,['rotation_euler']),(forearm,['rotation_euler'])]:
        for prop in props:obj.keyframe_insert(data_path=prop,frame=frame,group='Five seconds swipe / two seconds thought')
scene.frame_set(0)
world=scene.world or bpy.data.worlds.new('World');scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.12,.16,.12,1);world.node_tree.nodes['Background'].inputs[1].default_value=.5
def area(name,pos,power,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
area('Warm key',(-3,-4,6),450,5);area('Soft fill',(4,-1,3),80,4)
bpy.ops.object.camera_add(location=(3,-8,4));camera=bpy.context.object;camera.name='Asset review camera';camera.rotation_euler=(Vector((.5,0,1))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=5.6;scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.render.resolution_x=1200;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'gesture.blend'))
# No lights/cameras exported; webpage provides its own matched stage lighting.
bpy.ops.object.select_all(action='DESELECT')
for obj in scene.objects:
    if obj.type in {'MESH','EMPTY'}:obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'gesture.glb'),export_format='GLB',use_selection=True,export_animations=True,export_frame_range=True,export_force_sampling=True,export_animation_mode='SCENE')
scene.render.filepath=os.path.join(OUT,'gesture-review.png');bpy.ops.render.render(write_still=True)
with open(os.path.join(OUT,'thinker-original.png'),'rb') as f:source_hash=hashlib.sha256(f.read()).hexdigest()
with open(os.path.join(OUT,'asset-audit.json'),'w',encoding='utf8') as f:json.dump({'generator':'Blender '+bpy.app.version_string,'procedural':True,'cloud_calls':0,'frames':211,'fps':30,'duration_seconds':7,'scope':'3D phone, open book, articulated geometric hand proxy; not a complete sculpted person','web_scope':'3D phone plus source-textured 2.5D hand; proxy hand and model book hidden in webpage','source_sha256':source_hash,'source_script':'scripts/build-thinker.py'},f,ensure_ascii=False,indent=2)
print('VAGUS_ASSET_BUILD_OK')
