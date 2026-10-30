import bpy,json,sys
from pathlib import Path
ROOT=Path(sys.argv[sys.argv.index('--')+1])
library=ROOT/'sources/vendor/extracted/human-base-meshes-bundle-v1.4.1/human_base_meshes_bundle.blend'
with bpy.data.libraries.load(str(library),link=False) as (source,target):
    names=source.objects
    target.objects=[name for name in names if name=='Hand  - Realistic']
objects=[]
for ob in target.objects:
    if ob is None:continue
    objects.append({'name':ob.name,'type':ob.type,
      'vertices':len(ob.data.vertices) if ob.type=='MESH' else 0,
      'bounds':[list(p) for p in ob.bound_box],
      'groups':[g.name for g in ob.vertex_groups] if ob.type=='MESH' else [],
      'modifiers':[(m.name,m.type) for m in ob.modifiers],
      'author':ob.asset_data.author if ob.asset_data else None,
      'description':ob.asset_data.description if ob.asset_data else None,
      'custom':{k:str(ob[k]) for k in ob.keys()}})
    if ob.type=='MESH':
        mesh=ob.data
        attrs=[]
        for attribute in mesh.attributes:
            attrs.append({'name':attribute.name,'domain':attribute.domain,'type':attribute.data_type})
        face_set=mesh.attributes.get('.sculpt_face_set')
        regions={}
        if face_set:
            for poly in mesh.polygons:
                key=str(face_set.data[poly.index].value)
                regions.setdefault(key,set()).update(poly.vertices)
        data={'vertices':[list(v.co) for v in mesh.vertices],
              'faces':[list(p.vertices) for p in mesh.polygons],
              'attributes':attrs,'regions':{k:sorted(v) for k,v in regions.items()}}
        (ROOT/'sources/vendor/hand-rest-mesh.json').write_text(json.dumps(data),encoding='utf8')
        objects[-1]['attributes']=attrs
        objects[-1]['regionBounds']={k:{'vertices':len(v),'min':[min(mesh.vertices[i].co[a] for i in v) for a in range(3)],
            'max':[max(mesh.vertices[i].co[a] for i in v) for a in range(3)]} for k,v in regions.items()}
report={'names':names,'hands':objects}
(ROOT/'sources/vendor/inspection.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report),flush=True)
