import bpy,json,sys,hashlib
from pathlib import Path
from mathutils.bvhtree import BVHTree
from mathutils import Vector
ROOT=Path(sys.argv[sys.argv.index('--')+1])
blend=ROOT/'sources/about/about-gray.blend'
bpy.ops.wm.open_mainfile(filepath=str(blend))
bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get()
def tree(name,material=None):
    ob=bpy.data.objects[name];evaluated=ob.evaluated_get(deps);mesh=evaluated.to_mesh()
    vertices=[evaluated.matrix_world@v.co for v in mesh.vertices]
    faces=[tuple(p.vertices) for p in mesh.polygons if material is None or mesh.materials[p.material_index].name==material]
    if not faces:raise RuntimeError('No faces for '+str(material))
    result=BVHTree.FromPolygons(vertices,faces,epsilon=1e-8)
    evaluated.to_mesh_clear();return result
hand,card,frame=tree('HandForearm'),tree('BusinessCard'),tree('FrameFront')
card_object=bpy.data.objects['BusinessCard'];normal=card_object.matrix_world.to_3x3()@Vector((0,0,1))
def contact(label,side):
    skin=tree('HandForearm','Skin_'+label);best=None
    for i in range(181):
        for j in range(109):
            point=card_object.matrix_world@Vector((-.045+.09*i/180,-.027+.054*j/108,side*.0002))
            hit,norm,face,distance=skin.find_nearest(point)
            if hit is None:continue
            # Enforce the named digit really is on the requested side, not merely near an edge.
            signed=(card_object.matrix_world.inverted()@hit).z
            if side*signed<.0002:continue
            if best is None or distance<best['distanceM']:
                best={'digit':label,'material':'Skin_'+label,'cardSide':side,'distanceM':distance,'cardPointWorld':list(point),'skinPointWorld':list(hit),'skinNormalWorld':list(norm),'skinFace':face,'cardNormalWorld':list(normal*side)}
    return best
index=contact('index',1);thumb=contact('thumb',-1)
by_digit={label:len(tree('HandForearm','Skin_'+label).overlap(card)) for label in ['palm','index','middle','ring','pinky','thumb']}
report={'overlapsByDigit':by_digit,'method':'evaluated world-space BVH; digit material filtered contact; 0.5mm card grid',
        'sourceBlendSha256':hashlib.sha256(blend.read_bytes()).hexdigest(),
        'handCardTrianglePairs':len(hand.overlap(card)),
        'handFrameTrianglePairs':len(hand.overlap(frame)),
        'cardFrameTrianglePairs':len(card.overlap(frame)),
        'indexFrontContactM':index['distanceM'] if index else None,
        'thumbBackContactM':thumb['distanceM'] if thumb else None,
        'witnesses':{'indexFront':index,'thumbBack':thumb},
        'contactDistanceMeaning':'sampled upper bound to specified digit surface, not pressure or physics simulation',
        'notCovered':'no animation, no skin deformation acceptance, no aesthetic acceptance, no complete self-collision certification'}
report['technicalPass']=report['handCardTrianglePairs']==0 and report['handFrameTrianglePairs']==0 and report['cardFrameTrianglePairs']==0 and index is not None and thumb is not None and index['distanceM']<=.0005 and thumb['distanceM']<=.0005
(ROOT/'evidence/gray/static-contact.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report),flush=True)
