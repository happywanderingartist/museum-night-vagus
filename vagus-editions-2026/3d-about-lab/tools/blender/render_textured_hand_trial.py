"""Source-pixel texture on the existing CC0 hand as an isolated visual trial."""
import bpy
import sys
from pathlib import Path
from bpy_extras.object_utils import world_to_camera_view

ROOT = Path(sys.argv[sys.argv.index('--') + 1])
OUT = ROOT / 'evidence' / 'textured-hand-01'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT / 'sources/about/about-gray.blend'))
scene = bpy.context.scene
scene.use_nodes = False
front = bpy.data.objects['LockedSourceCamera']
hand = bpy.data.objects['HandForearm']
card = bpy.data.objects['BusinessCard']
for ob in bpy.data.objects:
    if ob.type == 'MESH':
        ob.hide_render = ob not in (hand, card) and not ob.name.lower().startswith('cuff')

def projected_material(ob, source, name):
    uv = ob.data.uv_layers.active or ob.data.uv_layers.new(name='Source camera projection')
    for face in ob.data.polygons:
        for li in face.loop_indices:
            vertex = ob.data.loops[li].vertex_index
            point = ob.matrix_world @ ob.data.vertices[vertex].co
            q = world_to_camera_view(scene,front,point)
            uv.data[li].uv = (q.x,q.y)
    mat=bpy.data.materials.new(name)
    mat.use_nodes=True
    nodes=mat.node_tree.nodes;nodes.clear()
    tex=nodes.new('ShaderNodeTexImage')
    tex.image=bpy.data.images.load(str(source))
    tex.interpolation='Linear'
    em=nodes.new('ShaderNodeEmission')
    out=nodes.new('ShaderNodeOutputMaterial')
    mat.node_tree.links.new(tex.outputs['Color'],em.inputs['Color'])
    mat.node_tree.links.new(em.outputs[0],out.inputs['Surface'])
    ob.data.materials.clear();ob.data.materials.append(mat)
    for poly in ob.data.polygons:poly.material_index=0

projected_material(hand,ROOT/'sources/about/reference.png','Hand source projection — trial only')
for ob in bpy.data.objects:
    if ob.type=='MESH' and ob.name.lower().startswith('cuff'):
        projected_material(ob,ROOT/'sources/about/reference.png','Cuff source projection — trial only')
projected_material(card,ROOT/'evidence/card-layer-01/card-texture-clean.png','Clean card projection')
scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=False
scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGBA';scene.render.resolution_percentage=100
scene.view_settings.view_transform='Standard';scene.view_settings.look='Medium High Contrast'
scene.view_settings.exposure=0;scene.view_settings.gamma=1
for name,camera,width,height in [
    ('front.png',front,1672,941),
    ('close.png',bpy.data.objects['HandDetailCamera'],1200,1000),
    ('side.png',bpy.data.objects['SideDiagnosticCamera'],1200,1000),
]:
    scene.camera=camera;scene.render.resolution_x=width;scene.render.resolution_y=height
    scene.render.filepath=str(OUT/name);bpy.ops.render.render(write_still=True)
