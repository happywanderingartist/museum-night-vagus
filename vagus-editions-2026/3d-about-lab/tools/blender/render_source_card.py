"""Render only the calibrated physical card, with source-art camera projection.

This is a static layering test. It does not replace the hand or create a 3D
character. All outputs go to evidence/card-layer-01; the site is untouched.
"""
import bpy
import sys
from pathlib import Path
from bpy_extras.object_utils import world_to_camera_view

ROOT = Path(sys.argv[sys.argv.index('--') + 1])
OUT = ROOT / 'evidence' / 'card-layer-01'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT / 'sources/about/about-gray.blend'))
scene = bpy.context.scene
scene.use_nodes = False
card = bpy.data.objects['BusinessCard']
front = bpy.data.objects['LockedSourceCamera']

for ob in bpy.data.objects:
    if ob.type == 'MESH':
        ob.hide_render = ob != card

uv = card.data.uv_layers.active or card.data.uv_layers.new(name='Source camera projection')
for face in card.data.polygons:
    for loop_index in face.loop_indices:
        loop = card.data.loops[loop_index]
        point = card.matrix_world @ card.data.vertices[loop.vertex_index].co
        projected = world_to_camera_view(scene, front, point)
        # Both Blender's camera result and texture UV use bottom-left Y.
        # The prior hybrid test inverted this value and sampled hand pixels.
        uv.data[loop_index].uv = (projected.x, projected.y)

mat = bpy.data.materials.new('Source card pixels — static test')
mat.use_nodes = True
nodes = mat.node_tree.nodes
nodes.clear()
tex = nodes.new('ShaderNodeTexImage')
tex.image = bpy.data.images.load(str(OUT / 'card-texture-clean.png'))
tex.interpolation = 'Linear'
emission = nodes.new('ShaderNodeEmission')
output = nodes.new('ShaderNodeOutputMaterial')
mat.node_tree.links.new(tex.outputs['Color'], emission.inputs['Color'])
mat.node_tree.links.new(emission.outputs[0], output.inputs['Surface'])
card.data.materials.clear()
card.data.materials.append(mat)

scene.render.engine = 'CYCLES'
scene.cycles.samples = 16
scene.cycles.use_denoising = False
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.resolution_percentage = 100
scene.render.resolution_x = 1672
scene.render.resolution_y = 941
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'Medium High Contrast'
scene.view_settings.exposure = 0
scene.view_settings.gamma = 1
scene.camera = front
scene['review_scope'] = 'Source-preserving 3D card only; hand/person remain original 2D art'
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'sources/about/about-card-layer.blend'))
scene.render.filepath = str(OUT / 'card-front-rgba.png')
bpy.ops.render.render(write_still=True)

scene.camera = bpy.data.objects['SideDiagnosticCamera']
scene.render.resolution_x = 1200
scene.render.resolution_y = 1000
scene.render.filepath = str(OUT / 'card-side-rgba.png')
bpy.ops.render.render(write_still=True)
