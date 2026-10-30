import bpy,json,sys
from pathlib import Path
from mathutils import Vector
root=Path(sys.argv[sys.argv.index('--')+1]);bpy.ops.wm.open_mainfile(filepath=str(root/'sources/about/about-gray.blend'))
ob=bpy.data.objects['HandForearm'];mesh=ob.data;attr=mesh.attributes.get('.sculpt_face_set');by={}
for face in mesh.polygons:
 if attr and attr.data[face.index].value==10:
  name=mesh.materials[face.material_index].name
  by.setdefault(name,[]).append({'center':list(face.center),'normal':list(face.normal),'area':face.area})
(root/'evidence/gray/nail-inspection.json').write_text(json.dumps(by,indent=2))
print(json.dumps({name:{'faces':len(faces),'meanNormal':list(sum((Vector(f['normal']) for f in faces),Vector()).normalized())} for name,faces in by.items()}))
