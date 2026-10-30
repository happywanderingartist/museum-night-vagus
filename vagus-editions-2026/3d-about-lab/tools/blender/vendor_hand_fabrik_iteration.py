"""Pose the official CC0 scan-based hand topology; no external character identity.
Asset: Blender Human Base Meshes 1.4.1 / Hand - Realistic / Dan Ulrich.
"""
import bpy,bmesh,math
import numpy as np
from mathutils import Vector,Matrix

CHAINS={'index':[19,16,3],'middle':[18,15,4],'ring':[17,14,5],
        'pinky':[13,12,11],'thumb':[23,22,21]}
TARGETS={
 'index':[[720,474,.035],[741,460,-.004],[785,448,-.005],[813,450,-.006]],
 'middle':[[725,502,.025],[742,490,-.005],[788,478,-.006],[815,477,-.006]],
 'ring':[[740,529,.016],[756,519,-.004],[787,509,-.005],[805,507,-.006]],
 'pinky':[[763,552,.012],[769,546,-.002],[781,537,-.004],[790,534,-.005]],
 'thumb':[[850,526,.022],[867,485,.017],[846,454,.010],[837,442,.008]]
}
def build_hand(root,source_point,card_center,card_rotation,clay):
    library=root/'sources/vendor/extracted/human-base-meshes-bundle-v1.4.1/human_base_meshes_bundle.blend'
    with bpy.data.libraries.load(str(library),link=False) as (src,dst):
        dst.objects=['Hand  - Realistic']
    ob=dst.objects[0];bpy.context.scene.collection.objects.link(ob)
    ob.name='HandForearm';ob.location=(0,0,0);ob.rotation_euler=(0,0,0);ob.scale=(1,1,1)
    mesh=ob.data
    original=[v.co.copy() for v in mesh.vertices]
    face_attr=mesh.attributes['.sculpt_face_set']
    face_regions=[entry.value for entry in face_attr.data]
    region_vertices={}
    for face in mesh.polygons:
        region=face_regions[face.index]
        region_vertices.setdefault(region,set()).update(face.vertices)
    def mean(ids):
        return sum((original[i] for i in ids),Vector())/len(ids)
    joints={}
    for name,chain in CHAINS.items():
        first=region_vertices[chain[0]] & region_vertices[24]
        j0=mean(first)
        j1=mean(region_vertices[chain[0]] & region_vertices[chain[1]])
        j2=mean(region_vertices[chain[1]] & region_vertices[chain[2]])
        candidates=region_vertices[chain[2]]
        axis=(j2-j1).normalized()
        tip=max((original[i] for i in candidates),key=lambda p:(p-j2).dot(axis)).copy()
        joints[name]=[j0,j1,j2,tip]
    wrist=mean([v.index for v in mesh.vertices if abs(v.co.z)<.006])
    forearm=mean([v.index for v in mesh.vertices if v.co.z>.072])
    target_joints={name:[source_point(u,v,d) for u,v,d in points] for name,points in TARGETS.items()}

    # Preserve the scanned palm and wrist with one rigid anatomical transform.
    zaxis=Vector((.8,-.6,-.10)).normalized()
    yaxis=Vector((0,0,-1));yaxis=(yaxis-zaxis*yaxis.dot(zaxis)).normalized()
    xaxis=yaxis.cross(zaxis).normalized()
    basis=Matrix((-xaxis*.85,yaxis*.85,zaxis*.85)).transposed()
    wrist_world=source_point(902,592,.040)
    def palm_point(p):return wrist_world+basis@(p-wrist)
    # Static FABRIK preserves every phalanx length; the earlier per-point palm warp is discarded.
    for name in CHAINS:
        root_world=palm_point(joints[name][0])
        goal=source_point(*TARGETS[name][-1])
        lengths=[(basis@(joints[name][i+1]-joints[name][i])).length for i in range(3)]
        pole=Vector((-.8,-.1,.6)).normalized() if name!='thumb' else Vector((.35,.1,-.75)).normalized()
        total=sum(lengths)
        if (goal-root_world).length>total*.985:goal=root_world+(goal-root_world).normalized()*total*.985
        points=[root_world+(goal-root_world)*(i/3)+pole*math.sin(math.pi*i/3)*total*.42 for i in range(4)]
        for _ in range(120):
            points[-1]=goal.copy()
            for i in range(2,-1,-1):points[i]=points[i+1]+(points[i]-points[i+1]).normalized()*lengths[i]
            points[0]=root_world.copy()
            for i in range(3):points[i+1]=points[i]+(points[i+1]-points[i]).normalized()*lengths[i]
            if (points[-1]-goal).length<1e-7:break
        target_joints[name]=points
    def segment_point(p,name,index):
        a,b=joints[name][index:index+2]
        c,d=target_joints[name][index:index+2]
        rest_world=basis@(b-a);rest_t=rest_world.normalized();target_t=(d-c).normalized()
        r=basis@(p-a);parallel=r.dot(rest_t)
        q=rest_t.rotation_difference(target_t)
        return c+target_t*parallel+q@(r-rest_t*parallel)

    owner={region:(name,i) for name,chain in CHAINS.items() for i,region in enumerate(chain)}
    incident=[[] for _ in original]
    for face in mesh.polygons:
        region=face_regions[face.index]
        if region==10:
            center=sum((original[i] for i in face.vertices),Vector())/len(face.vertices)
            name=min(CHAINS,key=lambda n:(center-joints[n][3]).length)
            region=CHAINS[name][2]
        for i in face.vertices:incident[i].append(region)
    for name in CHAINS:
        group=ob.vertex_groups.new(name='digit_'+name)
        for i,regions in enumerate(incident):
            weight=sum(1 for region in regions if region in CHAINS[name])/max(1,len(regions))
            if weight:group.add([i],weight,'REPLACE')
    for i,v in enumerate(mesh.vertices):
        proposed=[]
        for region in incident[i]:
            proposed.append(segment_point(original[i],*owner[region]) if region in owner else palm_point(original[i]))
        if proposed:v.co=sum(proposed,Vector())/len(proposed)
    # Region material IDs survive subdivision and identify exactly which skin is tested.
    mesh.materials.clear()
    labels=['palm','index','middle','ring','pinky','thumb']
    for label in labels:
        mat=clay.copy();mat.name='Skin_'+label;mesh.materials.append(mat)
    for face in mesh.polygons:
        region=face_regions[face.index]
        if region==10:
            center=sum((original[i] for i in face.vertices),Vector())/len(face.vertices)
            name=min(CHAINS,key=lambda n:(center-joints[n][3]).length)
        else:name=owner[region][0] if region in owner else 'palm'
        face.material_index=labels.index(name)
    bpy.context.view_layer.objects.active=ob
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True)
    for modifier in list(ob.modifiers):
        if modifier.type=='MULTIRES':
            modifier.levels=2;modifier.render_levels=2;modifier.sculpt_levels=2
            bpy.ops.object.modifier_apply(modifier=modifier.name)
    mesh=ob.data
    # Project each named finger's actual skin to its correct side of the rigid card.
    inverse_card=Matrix(card_rotation).transposed();normal=Vector(card_rotation[:,2])
    for name in CHAINS:
        group=ob.vertex_groups['digit_'+name]
        weighted=[];signed=[]
        for vertex in mesh.vertices:
            weight=next((g.weight for g in vertex.groups if g.group==group.index),0)
            if not weight:continue
            weighted.append((vertex,weight))
            point=inverse_card@(vertex.co-card_center)
            if weight>.6 and abs(point.x)<.0447 and abs(point.y)<.0267:signed.append(point.z)
        if signed:
            correction=(-.00028-max(signed)) if name=='thumb' else (.00028-min(signed))
            for vertex,weight in weighted:vertex.co+=normal*correction*weight
    mesh.update()
    # Cap the original open forearm end after evaluating the scan's multires detail.
    mesh=ob.data
    bm=bmesh.new();bm.from_mesh(mesh)
    boundary=[e for e in bm.edges if e.is_boundary]
    if boundary:bmesh.ops.holes_fill(bm,edges=boundary,sides=0)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
    for poly in mesh.polygons:poly.use_smooth=True
    ob['digit_groups']=list(CHAINS)
    ob['base_asset']='Blender Human Base Meshes v1.4.1 / Hand - Realistic'
    ob['base_author']='Dan Ulrich';ob['base_license']='CC0-1.0'
    return ob,labels
