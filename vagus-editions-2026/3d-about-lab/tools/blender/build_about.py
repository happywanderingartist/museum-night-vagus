"""G0/G1 source-art calibration and CC0-derived static clay modeling.
No website changes, no animation, no claim of a finished character.
"""
import bpy, json, math, sys
import numpy as np
from pathlib import Path
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view

ROOT=Path(sys.argv[sys.argv.index('--')+1])
OUT=ROOT/'evidence/gray'; OUT.mkdir(parents=True,exist_ok=True)
REF=json.loads((ROOT/'sources/about/reference.json').read_text(encoding='utf8'))
W,H=REF['width'],REF['height']
FOV=math.radians(35); F=W/(2*math.tan(FOV/2))
CX,CY=W/2,H/2
TARGET=np.array(REF['anchors']['cardCorners'],dtype=float)
LOCAL=np.array([[-.045,.027,0],[.045,.027,0],[.045,-.027,0],[-.045,-.027,0]])

def rotation(p):
    x,y,z=p
    rx=np.array([[1,0,0],[0,math.cos(x),-math.sin(x)],[0,math.sin(x),math.cos(x)]])
    ry=np.array([[math.cos(y),0,math.sin(y)],[0,1,0],[-math.sin(y),0,math.cos(y)]])
    rz=np.array([[math.cos(z),-math.sin(z),0],[math.sin(z),math.cos(z),0],[0,0,1]])
    return rz@ry@rx

def projection(points):
    points=np.asarray(points)
    return np.column_stack((CX+F*points[:,0]/-points[:,2],CY-F*points[:,1]/-points[:,2]))

def card_points(p):
    return LOCAL@rotation(p[:3]).T+p[3:]

# Fit a real rectangular card, not four arbitrary vertices, to observed corners.
length=np.linalg.norm(TARGET[1]-TARGET[0]); depth=F*.09/length
center=TARGET.mean(axis=0)
params=np.array([0,0,math.atan2(TARGET[0,1]-TARGET[1,1],TARGET[1,0]-TARGET[0,0]),
                 (center[0]-CX)*depth/F,(CY-center[1])*depth/F,-depth],dtype=float)
for _ in range(100):
    residual=(projection(card_points(params))-TARGET).flatten()
    jac=np.zeros((8,6))
    for j in range(6):
        step=1e-5
        q=params.copy();q[j]+=step
        jac[:,j]=((projection(card_points(q))-projection(card_points(params)))/step).flatten()
    update=np.linalg.solve(jac.T@jac+np.eye(6)*.01,-jac.T@residual)
    if np.linalg.norm(update)<1e-9:break
    update[:3]=np.clip(update[:3],-.12,.12)
    update[3:]=np.clip(update[3:],-.03,.03)
    candidate=params+update
    if np.linalg.norm(projection(card_points(candidate))-TARGET)>np.linalg.norm(residual):
        candidate=params+update*.2
    params=candidate
CARD_R=rotation(params[:3]); CARD_CENTER=Vector(params[3:]); CARD_NORMAL=Vector(CARD_R[:,2])

def ray_point(u,v,depth):
    return Vector(((u-CX)*depth/F,(CY-v)*depth/F,-depth))

def card_depth(u,v):
    ray=ray_point(u,v,1)
    return CARD_NORMAL.dot(CARD_CENTER)/CARD_NORMAL.dot(ray)

def source_point(u,v,offset=0):
    return ray_point(u,v,card_depth(u,v)+offset)

bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=W;scene.render.resolution_y=H;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
scene.render.film_transparent=False
scene.view_settings.view_transform='AgX'
scene.world.color=(.18,.18,.18)
scene.view_settings.look='AgX - Medium High Contrast'
scene.view_settings.exposure=-.8
bpy.context.preferences.filepaths.temporary_directory=str(ROOT/'tool-cache')

def material(name,color):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    shader=m.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value=(*color,1)
    shader.inputs['Roughness'].default_value=.76
    return m

clay=material('neutral hand clay',(.47,.49,.51))
frame_mat=material('frame clay',(.24,.26,.28))
paper=material('unprinted card',(.77,.78,.76))
nail_mat=material('nail clay',(.49,.50,.51))
wall_mat=material('wall gray',(.34,.36,.38))

def mesh(name,verts,faces,mat):
    data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update()
    ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob)
    if mat:ob.data.materials.append(mat)
    return ob

def smooth(ob):
    for poly in ob.data.polygons:poly.use_smooth=True

# The accepted free-tool scope now uses the official CC0 anatomical hand base.
sys.path.insert(0,str(ROOT/'tools/blender'))
from vendor_hand import build_hand
hand,skin_labels=build_hand(ROOT,source_point,CARD_CENTER,CARD_R,clay)
DIGITS={name:[] for name in skin_labels if name!='palm'}

from refine_cuff import build_cuff
cuffs=build_cuff(hand,mesh,material,smooth)

# A physically rectangular business card, calibrated to the source plane.
bpy.ops.mesh.primitive_cube_add(size=1)
card=bpy.context.object;card.name='BusinessCard'
card.dimensions=(.09,.054,.0004)
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
card.location=CARD_CENTER;card.rotation_mode='QUATERNION';card.rotation_quaternion=Matrix(CARD_R).to_quaternion()
card.data.materials.append(paper)
bevel=card.modifiers.new('paper edge','BEVEL');bevel.width=.00015;bevel.segments=3
card.modifiers.new('paper normals','WEIGHTED_NORMAL')

# Gray frame with real inner walls and profiled moulding; off-canvas edges are inferred.
outer=np.array([[827,-40],[1730,-40],[1730,950],[827,840]],dtype=float)
inner=np.array([[910,-10],[1650,-10],[1650,840],[910,770]],dtype=float)
frame_depth=float(-CARD_CENTER.z+.18)
profiles=[(0,.0),(.12,-.005),(.27,-.016),(.43,-.007),(.60,-.012),(.78,-.023),(1,-.006)]
fv=[];ff=[]
for t,offset in profiles:
    for u,v in outer*(1-t)+inner*t:fv.append(ray_point(u,v,frame_depth+offset))
for i in range(len(profiles)-1):
    for j in range(4):ff.append((i*4+j,i*4+(j+1)%4,(i+1)*4+(j+1)%4,(i+1)*4+j))
back_start=len(fv)
for u,v in outer:fv.append(ray_point(u,v,frame_depth+.035))
for u,v in inner:fv.append(ray_point(u,v,frame_depth+.035))
for j in range(4):
    q=(j+1)%4
    ff.append((j,q,back_start+q,back_start+j))
    k=(len(profiles)-1)*4
    ff.append((k+j,back_start+4+j,back_start+4+q,k+q))
    ff.append((back_start+j,back_start+q,back_start+4+q,back_start+4+j))
frame=mesh('FrameFront',fv,ff,frame_mat)
bev=frame.modifiers.new('moulding edge softness','BEVEL');bev.width=.0011;bev.segments=3
frame.modifiers.new('frame normals','WEIGHTED_NORMAL')

def painting_polygon():
    uv=inner.tolist()
    ob=mesh('CharacterPainting',[ray_point(u,v,frame_depth+.055) for u,v in uv],[tuple(range(len(uv)))],None)
    layer=ob.data.uv_layers.new()
    for poly in ob.data.polygons:
        for li in poly.loop_indices:
            u,v=uv[ob.data.loops[li].vertex_index];layer.data[li].uv=(u/W,1-v/H)
    mat=bpy.data.materials.new('grayscale reference painting — NOT a modeled face');mat.use_nodes=True
    nodes=mat.node_tree.nodes;nodes.clear();links=mat.node_tree.links
    tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(ROOT/'sources/about/reference.png'))
    bw=nodes.new('ShaderNodeRGBToBW');em=nodes.new('ShaderNodeEmission');em.inputs['Strength'].default_value=.7
    output=nodes.new('ShaderNodeOutputMaterial')
    links.new(tex.outputs['Color'],bw.inputs[0]);links.new(bw.outputs[0],em.inputs['Color']);links.new(em.outputs[0],output.inputs[0])
    ob.data.materials.append(mat)
    ob['role_note']='flat reference painting, not 3D face/body'
    return ob
portrait=painting_polygon()
wall=mesh('Wall',[ray_point(u,v,frame_depth+.22) for u,v in [[-500,-500],[W+500,-500],[W+500,H+500],[-500,H+500]]],[(0,1,2,3)],wall_mat)

def add_camera(name,location,target=None):
    data=bpy.data.cameras.new(name);ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob)
    ob.location=location;data.type='PERSP';data.sensor_fit='HORIZONTAL';data.sensor_width=36
    data.lens=36/(2*math.tan(FOV/2));data.clip_start=.01;data.clip_end=30
    if target is not None:
        direction=(Vector(target)-ob.location).normalized()
        right=direction.cross(Vector((0,1,0))).normalized()
        up=right.cross(direction).normalized()
        ob.rotation_euler=Matrix((right,up,-direction)).transposed().to_euler()
    return ob
front=add_camera('LockedSourceCamera',(0,0,0))
scene.camera=front

def light(name,location,power,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size
    ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.location=location
    ob.rotation_euler=(source_point(840,540)-ob.location).to_track_quat('-Z','Y').to_euler()
light('large soft key',(-.5,.7,-.7),25,.75)
light('soft fill',(.55,.2,-1),5,.6)

def render(name,cam,width=W,height=H):
    if '--pose-check' in sys.argv:return
    if '--detail-only' in sys.argv and name not in ['hand-close.png','side.png']:return
    scene.camera=cam;scene.render.resolution_x=width;scene.render.resolution_y=height
    scene.render.filepath=str(OUT/name);bpy.ops.render.render(write_still=True)
render('front.png',front)

# Overlay is a diagnostic on the unchanged source, not a cleaned final backdrop.
scene.use_nodes=True
nodes=scene.node_tree.nodes;nodes.clear();links=scene.node_tree.links
source=nodes.new('CompositorNodeImage');source.image=bpy.data.images.get('reference.png')
layers=nodes.new('CompositorNodeRLayers')
mix=nodes.new('CompositorNodeMixRGB');mix.blend_type='MIX';mix.inputs[0].default_value=.48
result=nodes.new('CompositorNodeComposite')
links.new(source.outputs['Image'],mix.inputs[1]);links.new(layers.outputs['Image'],mix.inputs[2]);links.new(mix.outputs[0],result.inputs[0])
render('overlay.png',front)
scene.use_nodes=False

hand_center=source_point(806,520,.006)
close=add_camera('HandDetailCamera',hand_center+Vector((-.018,.01,.45)),hand_center)
close.data.lens=62
for ob in [frame,portrait,wall]:ob.hide_render=True
render('hand-close.png',close,1200,1000)
side=add_camera('SideDiagnosticCamera',hand_center+Vector((-.38,.05,.22)),hand_center)
side.data.lens=55
render('side.png',side,1200,1000)
for ob in [frame,portrait,wall]:ob.hide_render=False
render('side-context.png',side,1200,1000)
scene.camera=front;scene.render.resolution_x=W;scene.render.resolution_y=H

# Audit actual Blender geometry/projection; this does not certify visual beauty.
vertices=hand.data.vertices;edges=hand.data.edges
neighbors=[[] for _ in vertices]
for e in edges:
    a,b=e.vertices;neighbors[a].append(b);neighbors[b].append(a)
seen=set();components=0
for i in range(len(vertices)):
    if i in seen:continue
    components+=1;stack=[i];seen.add(i)
    while stack:
        for q in neighbors[stack.pop()]:
            if q not in seen:seen.add(q);stack.append(q)
edge_faces={}
for p in hand.data.polygons:
    for a,b in p.edge_keys:
        key=tuple(sorted((a,b)));edge_faces[key]=edge_faces.get(key,0)+1
nonmanifold=sum(1 for e in edges if edge_faces.get(tuple(sorted(e.vertices)),0)!=2)
scene.camera=front;bpy.context.view_layer.update()
projected=[]
for corner in LOCAL:
    world=card.matrix_world@Vector(corner)
    p=world_to_camera_view(scene,front,world);projected.append([p.x*W,(1-p.y)*H])
errors=np.linalg.norm(np.array(projected)-TARGET,axis=1).tolist()
audit={'scope':'G0/G1 static CC0-derived anatomy trial; no rig or motion','hand':{'vertices':len(vertices),'components':components,'nonManifoldEdges':nonmanifold,'digitGroups':list(DIGITS),'baseLicense':hand.get('base_license'),'baseAsset':hand.get('base_asset'),'baseAuthor':hand.get('base_author')},
 'card':{'widthM':.09,'heightM':.054,'thicknessM':.0004,'sourceCorners':TARGET.tolist(),'projectedCorners':projected,'reprojectionErrorPx':errors},
 'limitations':['character face/body is an explicitly flat grayscale reference layer','background repair and alpha artwork layers not delivered','static hand has no bone rig or accepted contact animation','frame off-canvas edges/depth inferred; not recovered geometry']}
(OUT/'model-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf8')
camera={'projection':'perspective','horizontalFovDeg':35,'position':[0,0,0],'rotationEuler':[0,0,0],
 'width':W,'height':H,'near':.01,'far':30,'scale':'metres','cardPose':params.tolist(),'reprojectionErrorPx':errors,
 'approval':'pending visual review; depth inferred from proposed physical card size'}
(ROOT/'sources/about/camera.json').write_text(json.dumps(camera,ensure_ascii=False,indent=2),encoding='utf8')
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'sources/about/about-gray.blend'))
print('VAGUS_GRAY_AUDIT '+json.dumps(audit,ensure_ascii=False),flush=True)
