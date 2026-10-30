"""G0/G1 source-art calibration and original static clay modeling.
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

def ellipsoid(name,center,scale,mat,quat=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,location=center)
    ob=bpy.context.object;ob.name=name;ob.scale=scale
    if quat:ob.rotation_mode='QUATERNION';ob.rotation_quaternion=quat
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    ob.data.materials.append(mat);smooth(ob)
    return ob

def catmull(points,samples=7):
    points=[Vector(p) for p in points];out=[]
    for i in range(len(points)-1):
        a=points[max(i-1,0)];b=points[i];c=points[i+1];d=points[min(i+2,len(points)-1)]
        for j in range(samples):
            t=j/samples
            out.append(.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t))
    return out+[points[-1]]

def sweep(name,centers,radii,mat,flatten=.82):
    verts=[];faces=[];segments=48
    for i,c in enumerate(centers):
        tangent=(centers[min(i+1,len(centers)-1)]-centers[max(0,i-1)]).normalized()
        n=Vector((0,0,1));n=(n-tangent*n.dot(tangent)).normalized()
        b=tangent.cross(n).normalized()
        r=radii[i]
        for j in range(segments):
            a=2*math.pi*j/segments
            verts.append(c+n*(math.cos(a)*r*flatten)+b*(math.sin(a)*r))
        if i:
            for j in range(segments):
                p=(i-1)*segments+j;q=(i-1)*segments+(j+1)%segments
                faces.append((p,q,q+segments,p+segments))
    faces.append(tuple(reversed(range(segments))))
    faces.append(tuple((len(centers)-1)*segments+j for j in range(segments)))
    ob=mesh(name,verts,faces,mat);smooth(ob);return ob

# Source-observed curled finger paths. Depth is a proposed volume, not recovered anatomy.
DIGITS={
 'index':[[797,497],[746,483],[727,472],[746,459],[786,450],[814,450]],
 'middle':[[809,525],[748,518],[727,505],[747,491],[791,479],[817,477]],
 'ring':[[820,547],[763,548],[742,536],[754,522],[788,510],[806,506]],
 'pinky':[[823,558],[782,571],[754,561],[758,545],[778,536],[790,533]],
 'thumb':[[856,536],[866,506],[859,479],[843,455],[837,440]]
}
parts=[];tips={}
for name,path in DIGITS.items():
    world=[]
    for i,(u,v) in enumerate(path):
        t=i/(len(path)-1)
        # Root merges into the palm; distal pad lies just in front of the card.
        offset=(.015*(1-t)-.006*t) if name!='thumb' else (.018-.011*t)
        world.append(source_point(u,v,offset))
    centers=catmull(world,7)
    base={'index':.009,'middle':.0095,'ring':.0085,'pinky':.007,'thumb':.010}[name]
    radii=[]
    for i in range(len(centers)):
        t=i/(len(centers)-1)
        r=base*(1-.25*t)
        # An anatomical knuckle and a softly rounded distal pad, not capped cylinders.
        r*=1+.10*math.exp(-((t-.48)/.07)**2)
        r*=1-.10*math.exp(-((t-.72)/.035)**2)
        if t>.90:r*=max(.12,math.sqrt(max(0,1-((t-.90)/.105)**2)))
        radii.append(r)
    part=sweep(name+' construction',centers,radii,clay)
    bpy.context.view_layer.update()
    inverse_card=Matrix(CARD_R).transposed()
    signed=[]
    for vertex in part.data.vertices:
        point=inverse_card@(part.matrix_world@vertex.co-CARD_CENTER)
        if abs(point.x)<.0448 and abs(point.y)<.0268:signed.append(point.z)
    if signed:
        correction=(-.00035-max(signed)) if name=='thumb' else (.00015-min(signed))
        part.location+=CARD_NORMAL*correction
    parts.append(part)
    tips[name]=(centers[-4],(centers[-1]-centers[-6]).normalized(),base*.68)

palm=ellipsoid('palm construction',source_point(812,532,.012),(.030,.031,.013),clay)
parts.append(palm)
# Thenar mound joins the thumb base rather than leaving it as a detached digit.
parts.append(ellipsoid('thenar construction',source_point(844,517,.012),(.015,.026,.014),clay))
parts.append(ellipsoid('ulnar palm construction',source_point(813,552,.014),(.023,.018,.014),clay))
arm_uv=[[984,674],[959,650],[925,613],[891,582],[864,561],[835,546]]
arm_world=[source_point(u,v,.16*(1-i/(len(arm_uv)-1))+.016) for i,(u,v) in enumerate(arm_uv)]
arm_centers=catmull(arm_world,9)
arm_radius=[.030-(.030-.020)*i/(len(arm_centers)-1) for i in range(len(arm_centers))]
parts.append(sweep('forearm construction',arm_centers,arm_radius,clay,flatten=.85))

# Fuse the authored volumes into a single continuous watertight sculpt.
bpy.ops.object.select_all(action='DESELECT')
for ob in parts:ob.select_set(True)
bpy.context.view_layer.objects.active=palm;bpy.ops.object.join()
hand=bpy.context.object;hand.name='HandForearm'
remesh=hand.modifiers.new('continuous clay topology','REMESH');remesh.mode='VOXEL';remesh.voxel_size=.00085
bpy.ops.object.modifier_apply(modifier=remesh.name)
polish=hand.modifiers.new('sculpt relaxation','SMOOTH');polish.factor=.55;polish.iterations=10
bpy.ops.object.modifier_apply(modifier=polish.name);smooth(hand)
hand['digit_groups']=list(DIGITS)
# Shallow sculpt creases on the camera-facing skin. These are geometry, not a skin texture.
world=np.array([hand.matrix_world@v.co for v in hand.data.vertices])
pixel=projection(world)
normal_matrix=hand.matrix_world.to_3x3()
front_weight=np.array([max(0,(normal_matrix@v.normal).z) for v in hand.data.vertices])
displacement=np.zeros(len(world))
creases=[(756,459,2,10),(759,488,2,10),(770,519,2,9),(774,544,2,7),(834,518,3,20)]
for x,y,sx,sy in creases:
    displacement+=.00032*np.exp(-((pixel[:,0]-x)/sx)**2-((pixel[:,1]-y)/sy)**2)
displacement+=.0011*np.exp(-((pixel[:,0]-815)/26)**2-((pixel[:,1]-525)/24)**2)
for i,v in enumerate(hand.data.vertices):v.co.z-=float(displacement[i]*front_weight[i])
hand.data.update();bpy.context.view_layer.update()
# Nail patches raycast onto the actual fused finger surface: no floating oval beads.
bvh=BVHTree.FromObject(hand,bpy.context.evaluated_depsgraph_get())
inverse_hand=hand.matrix_world.inverted()
origin=inverse_hand@Vector((0,0,0))
nail_layout={'index':(801,450,9,5.5),'middle':(805,477,8,5),'ring':(795,507,7,4.6),'pinky':(779,534,6,4)}
for name,(u,v,rx,ry) in nail_layout.items():
    angle=math.atan2(DIGITS[name][-1][1]-DIGITS[name][-2][1],DIGITS[name][-1][0]-DIGITS[name][-2][0])
    image_points=[(u,v)]+[(u+rx*math.cos(a)*math.cos(angle)-ry*math.sin(a)*math.sin(angle),v+rx*math.cos(a)*math.sin(angle)+ry*math.sin(a)*math.cos(angle)) for a in [2*math.pi*i/32 for i in range(32)]]
    surface=[]
    for x,y in image_points:
        direction=(inverse_hand.to_3x3()@ray_point(x,y,1)).normalized()
        hit=bvh.ray_cast(origin,direction,10)
        if hit[0] is None:break
        surface.append(hand.matrix_world@(hit[0]+hit[1]*.00012))
    if len(surface)==33:
        nail=mesh(name+' nail',surface,[(0,i+1,(i+1)%32+1) for i in range(32)],nail_mat);smooth(nail)

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
light('large soft key',(-.5,.7,-.7),110,.75)
light('soft fill',(.55,.2,-1),40,.6)

def render(name,cam,width=W,height=H):
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
audit={'scope':'G0/G1 static original gray trial; no rig or motion','hand':{'vertices':len(vertices),'components':components,'nonManifoldEdges':nonmanifold,'digitGroups':list(DIGITS)},
 'card':{'widthM':.09,'heightM':.054,'thicknessM':.0004,'sourceCorners':TARGET.tolist(),'projectedCorners':projected,'reprojectionErrorPx':errors},
 'limitations':['character face/body is an explicitly flat grayscale reference layer','background repair and alpha artwork layers not delivered','static hand has no bone rig or accepted contact animation','frame off-canvas edges/depth inferred; not recovered geometry']}
(OUT/'model-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf8')
camera={'projection':'perspective','horizontalFovDeg':35,'position':[0,0,0],'rotationEuler':[0,0,0],
 'width':W,'height':H,'near':.01,'far':30,'scale':'metres','cardPose':params.tolist(),'reprojectionErrorPx':errors,
 'approval':'pending visual review; depth inferred from proposed physical card size'}
(ROOT/'sources/about/camera.json').write_text(json.dumps(camera,ensure_ascii=False,indent=2),encoding='utf8')
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'sources/about/about-gray.blend'))
print('VAGUS_GRAY_AUDIT '+json.dumps(audit,ensure_ascii=False),flush=True)
