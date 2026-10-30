"""Pose the official CC0 scan-based hand topology; no external character identity.
Asset: Blender Human Base Meshes 1.4.1 / Hand - Realistic / Dan Ulrich.
"""
import bpy,bmesh,math,json
import numpy as np
from mathutils import Vector,Matrix,Quaternion

CHAINS={'index':[19,16,3],'middle':[18,15,4],'ring':[17,14,5],
        'pinky':[13,12,11],'thumb':[23,22,21]}
def build_hand(root,source_point,card_center,card_rotation,clay):
    library=root/'sources/vendor/extracted/human-base-meshes-bundle-v1.4.1/human_base_meshes_bundle.blend'
    with bpy.data.libraries.load(str(library),link=False) as (src,dst):
        dst.objects=['Hand  - Realistic']
    ob=dst.objects[0];bpy.context.scene.collection.objects.link(ob)
    ob.name='HandForearm';ob.location=(0,0,0);ob.rotation_euler=(0,0,0);ob.scale=(1,1,1)
    # Evaluate scan detail before posing so stored multires displacements cannot
    # introduce stale-rest-pose spikes after the joints are moved.
    bpy.context.view_layer.objects.active=ob
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True)
    for modifier in list(ob.modifiers):
        if modifier.type=='MULTIRES':
            modifier.levels=2;modifier.render_levels=2
            bpy.ops.object.modifier_apply(modifier=modifier.name)
    mesh=ob.data
    original=[Vector((v.co.x*.88,v.co.y*.90,v.co.z)) for v in mesh.vertices]
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
    target_joints={}

    # Preserve the scanned palm and wrist with one rigid anatomical transform.
    zaxis=Vector((.8,-.6,-.10)).normalized()
    config=json.loads((root/'sources/about/refinement.json').read_text())
    yaxis=Vector((.2,-.8,-.6));yaxis=(yaxis-zaxis*yaxis.dot(zaxis)).normalized()
    yaxis=Quaternion(zaxis,math.radians(config.get('palmRollDeg',0)))@yaxis
    xaxis=yaxis.cross(zaxis).normalized()
    basis=Matrix((-xaxis*.90,yaxis*.90,zaxis*.90)).transposed()
    wrist_world=source_point(865,554,.025)
    def palm_point(p):return wrist_world+basis@(p-wrist)
    # Aim bounded, length-preserving curls at the observed grasp, rather than free FABRIK folds.
    grasp={'index':(816,450,.003),'middle':(824,491,.010),
           'ring':(822,519,.010),'pinky':(807,544,.010),'thumb':(831,453,-.008)}
    normal=Vector(card_rotation[:,2])
    joint_rotations={}
    for name in CHAINS:
        u,v,depth=grasp[name];root_world=palm_point(joints[name][0])
        goal=source_point(u,v,0)+normal*depth
        angles=([.25,1.15,.55] if name!='thumb' else [-.25,-.75,-.4])
        if name!='thumb':angles=[angle*config.get('curlSign',1) for angle in angles]
        bend_axis=(basis@Vector((1,0,0))).normalized()
        def curled(scale):
            points=[root_world.copy()];cumulative=Quaternion((1,0,0,0))
            for i,angle in enumerate(angles):
                cumulative=Quaternion(bend_axis,angle*scale)@cumulative
                points.append(points[-1]+cumulative@(basis@(joints[name][i+1]-joints[name][i])))
            return points
        candidates=[(i/150,curled(i/150)) for i in range(226)]
        scale,points=min(candidates,key=lambda item:abs((item[1][-1]-item[1][0]).length-(goal-root_world).length))
        q=(points[-1]-points[0]).rotation_difference(goal-root_world)
        target_joints[name]=[root_world+q@(p-root_world) for p in points]
        cumulative=Quaternion((1,0,0,0));joint_rotations[name]=[]
        for angle in angles:
            cumulative=Quaternion(bend_axis,angle*scale)@cumulative
            joint_rotations[name].append(q@cumulative)
    def segment_point(p,name,index):
        a,b=joints[name][index:index+2]
        c,d=target_joints[name][index:index+2]
        return c+joint_rotations[name][index]@(basis@(p-a))

    owner={region:(name,i) for name,chain in CHAINS.items() for i,region in enumerate(chain)}
    incident=[[] for _ in original]
    for face in mesh.polygons:
        region=face_regions[face.index]
        if region==10:
            center=sum((original[i] for i in face.vertices),Vector())/len(face.vertices)
            name=min(CHAINS,key=lambda n:(center-joints[n][3]).length)
            region=CHAINS[name][2]
        for i in face.vertices:incident[i].append(region)
    # Smooth bone influence across topology, instead of changing transforms at one vertex ring.
    regions=[24]+list(owner);region_index={r:i for i,r in enumerate(regions)}
    weights=np.zeros((len(original),len(regions)))
    for i,entries in enumerate(incident):
        for region in entries:weights[i,region_index.get(region,0)]+=1/max(1,len(entries))
    neighbors=[[] for _ in original]
    for edge in mesh.edges:
        a,b=edge.vertices;neighbors[a].append(b);neighbors[b].append(a)
    for _ in range(16):
        new=weights.copy()
        for i,adjacent in enumerate(neighbors):
            if adjacent:new[i]=weights[i]*.6+weights[adjacent].mean(axis=0)*.4
        weights=new
    for name in CHAINS:
        group=ob.vertex_groups.new(name='digit_'+name)
        columns=[region_index[r] for r in CHAINS[name]]
        for i in range(len(original)):
            weight=float(weights[i,columns].sum())
            if weight>.00001:group.add([i],weight,'REPLACE')
    for i,vertex in enumerate(mesh.vertices):
        point=Vector()
        for region,column in region_index.items():
            weight=float(weights[i,column])
            if weight<1e-7:continue
            mapped=segment_point(original[i],*owner[region]) if region in owner else palm_point(original[i])
            point+=mapped*weight
        vertex.co=point
    # Region material IDs survive subdivision and identify exactly which skin is tested.
    mesh.materials.clear()
    labels=['palm','index','middle','ring','pinky','thumb']
    nail_attribute=mesh.attributes.new(name='nail_mask',type='FLOAT',domain='FACE')
    for face in mesh.polygons:nail_attribute.data[face.index].value=1 if face_regions[face.index]==10 else 0
    for label in labels:
        mat=clay.copy();mat.name='Skin_'+label
        nodes=mat.node_tree.nodes;links=mat.node_tree.links
        shader=nodes.get('Principled BSDF');attribute=nodes.new('ShaderNodeAttribute');attribute.attribute_name='nail_mask'
        color=nodes.new('ShaderNodeMixRGB');color.inputs[1].default_value=(.47,.49,.51,1);color.inputs[2].default_value=(.64,.63,.60,1)
        links.new(attribute.outputs['Fac'],color.inputs[0]);links.new(color.outputs[0],shader.inputs['Base Color'])
        rough=nodes.new('ShaderNodeMapRange');rough.inputs['From Min'].default_value=0;rough.inputs['From Max'].default_value=1;rough.inputs['To Min'].default_value=.78;rough.inputs['To Max'].default_value=.30
        links.new(attribute.outputs['Fac'],rough.inputs['Value']);links.new(rough.outputs['Result'],shader.inputs['Roughness'])
        mesh.materials.append(mat)
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
    # Static sculpt correction: establish the distal thumb support, then flatten only
    # the card-adjacent pads. This is not a rigged deformation or pressure simulation.
    inv=Matrix(card_rotation).transposed();normal=Vector(card_rotation[:,2])
    thumb_group=ob.vertex_groups['digit_thumb']
    thumb_vertices=[vertex for vertex in mesh.vertices if any(g.group==thumb_group.index and g.weight>.9 for g in vertex.groups)]
    target=card_center+Matrix(card_rotation)@Vector((-.026,-.021,-.00045))
    closest=min(thumb_vertices,key=lambda vertex:(vertex.co-target).length)
    delta=target-closest.co
    for vertex in mesh.vertices:
        weight=next((g.weight for g in vertex.groups if g.group==thumb_group.index),0)
        if weight:vertex.co+=delta*weight
    for name,side in [('index',1),('thumb',-1)]:
        group=ob.vertex_groups['digit_'+name];weighted=[];corrections=[]
        for vertex in mesh.vertices:
            weight=next((g.weight for g in vertex.groups if g.group==group.index),0)
            if weight<.001:continue
            weighted.append((vertex,weight));point=inv@(vertex.co-card_center)
            if weight>.5 and abs(point.x)<.045 and abs(point.y)<.027:
                corrections.append((side*.00045-point.z)/weight)
        if corrections:
            correction=max(corrections) if side==1 else min(corrections)
            for vertex,weight in weighted:vertex.co+=normal*correction*weight
    # Resolve remaining edge-crossing triangles with a continuous digit translation.
    # Vertex-only plane tests miss triangles crossing the narrow card edge.
    from mathutils.bvhtree import BVHTree
    card_vertices=[card_center+Matrix(card_rotation)@Vector((x,y,z)) for x in [-.045,.045] for y in [-.027,.027] for z in [-.0002,.0002]]
    box_faces=[(0,1,3,2),(4,6,7,5),(0,4,5,1),(2,3,7,6),(0,2,6,4),(1,5,7,3)]
    card_bvh=BVHTree.FromPolygons(card_vertices,box_faces)
    index_group=ob.vertex_groups['digit_index'];base=[vertex.co.copy() for vertex in mesh.vertices]
    influences=[next((g.weight for g in vertex.groups if g.group==index_group.index),0) for vertex in mesh.vertices]
    def overlaps(offset):
        coords=[point+normal*offset*weight for point,weight in zip(base,influences)]
        surface=BVHTree.FromPolygons(coords,[tuple(face.vertices) for face in mesh.polygons])
        return bool(surface.overlap(card_bvh))
    if overlaps(0) and not overlaps(.04):
        lo,hi=0,.04
        for _ in range(22):
            mid=(lo+hi)/2
            if overlaps(mid):lo=mid
            else:hi=mid
        for vertex,point,weight in zip(mesh.vertices,base,influences):vertex.co=point+normal*(hi+.00025)*weight
    mesh.update()
    # Cap the original open forearm end after evaluating the scan's multires detail.
    mesh=ob.data
    bm=bmesh.new();bm.from_mesh(mesh)
    boundary=[e for e in bm.edges if e.is_boundary]
    if boundary:bmesh.ops.holes_fill(bm,edges=boundary,sides=0)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
    for poly in mesh.polygons:poly.use_smooth=True
    ob['forearm_end_world']=list(palm_point(forearm))
    ob['forearm_axis_world']=list((basis@Vector((0,0,1))).normalized())
    ob['digit_groups']=list(CHAINS)
    ob['base_asset']='Blender Human Base Meshes v1.4.1 / Hand - Realistic'
    ob['base_author']='Dan Ulrich';ob['base_license']='CC0-1.0'
    return ob,labels
