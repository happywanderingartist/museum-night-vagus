"""Static layered cloth cuff; no simulation or final oil-paint texture."""
import bpy,math
import numpy as np
from mathutils import Vector

def build_cuff(hand,mesh,material,smooth):
    axis=Vector(hand['forearm_axis_world']);center=Vector(hand['forearm_end_world'])
    u=axis.cross(Vector((0,0,1))).normalized();v=axis.cross(u).normalized()
    # Fit the cuff opening to the actual evaluated forearm cross-section.
    section=[vertex.co-center for vertex in hand.data.vertices if abs((vertex.co-center).dot(axis))<.006]
    planar=np.array([[point.dot(u),point.dot(v)] for point in section])
    eigenvalues,eigenvectors=np.linalg.eigh(np.cov(planar.T));direction=eigenvectors[:,1]
    u2=(u*float(direction[0])+v*float(direction[1])).normalized();v2=axis.cross(u2).normalized();u,v=u2,v2
    rx=max(abs(point.dot(u)) for point in section);ry=max(abs(point.dot(v)) for point in section)
    enclosure=max(math.sqrt((point.dot(u)/rx)**2+(point.dot(v)/ry)**2) for point in section)
    rx=rx*enclosure+.0006;ry=ry*enclosure+.0006
    def fabric(name,color,roughness):
        mat=material(name,color);shader=mat.node_tree.nodes.get('Principled BSDF');shader.inputs['Roughness'].default_value=roughness
        shader.inputs['Sheen Weight'].default_value=.16
        noise=mat.node_tree.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=850;noise.inputs['Detail'].default_value=2
        bump=mat.node_tree.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.11;bump.inputs['Distance'].default_value=.00013
        mat.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height']);mat.node_tree.links.new(bump.outputs['Normal'],shader.inputs['Normal'])
        return mat
    def make(name,rows,coords,mat,thickness):
        count=64;verts=[];faces=[]
        for i in range(rows):
            t=i/(rows-1)
            for j in range(count):
                angle=j*2*math.pi/count;along,rx,ry=coords(t,angle)
                verts.append(center+axis*along+u*(rx*math.cos(angle))+v*(ry*math.sin(angle)))
        for i in range(rows-1):
            for j in range(count):faces.append((i*count+j,i*count+(j+1)%count,(i+1)*count+(j+1)%count,(i+1)*count+j))
        ob=mesh(name,verts,faces,mat);smooth(ob)
        sub=ob.modifiers.new('soft fabric folds','SUBSURF');sub.levels=1;sub.render_levels=1
        solid=ob.modifiers.new('cloth edge thickness','SOLIDIFY');solid.thickness=thickness;solid.offset=0;solid.use_rim=True
        bpy.context.view_layer.objects.active=ob
        for mod in list(ob.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
        ob['status']='modeled static cuff, not reconstructed original lace or simulated cloth'
        return ob
    def sleeve(t,a):
        fold=.0008*math.sin(7*a+1.4*t)+.0004*math.sin(3*a-.8*t)
        return (-.004+.029*t,rx*(1.035+.09*t)+fold,ry*(1.035+.09*t)+fold*.75)
    def linen(t,a):
        rim=t*t
        wave=.0022*math.sin(9*a+.25)+.00065*math.sin(17*a+1.2)
        along=-.014+.016*t+rim*wave
        fold=.0015*rim*math.cos(9*a+.25)+.0005*math.sin(4*a+t)*math.sin(math.pi*t)
        return (along,rx+.001+.003*t+fold,ry+.001+.0025*t+fold*.8)
    sleeve_ob=make('SleeveVelvet',8,sleeve,fabric('neutral charcoal velvet',(.11,.12,.13),.94),.001)
    linen_ob=make('SleeveLinenRuffle',9,linen,fabric('neutral linen',(.61,.60,.56),.86),.00055)
    return [sleeve_ob,linen_ob]
