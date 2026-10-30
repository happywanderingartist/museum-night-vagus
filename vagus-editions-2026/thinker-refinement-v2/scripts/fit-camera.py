from pathlib import Path
import json, numpy as np
def rotation(p):
 a,b,c=p;ca,sa=np.cos(a),np.sin(a);cb,sb=np.cos(b),np.sin(b);cc,sc=np.cos(c+np.pi),np.sin(c+np.pi)
 return np.array([[cc,-sc,0],[sc,cc,0],[0,0,1]])@np.array([[cb,0,sb],[0,1,0],[-sb,0,cb]])@np.array([[1,0,0],[0,ca,-sa],[0,sa,ca]])
base=.02802
world=np.array([[.0335,base+.1515,-.0045],[-.0335,base+.1515,-.0045],[.0335,base+.0035,-.0045],[-.0335,base+.0035,-.0045],[-.204,base+.0775,.050]])
image=np.array([[727,519],[782,525],[768,650],[824,656],[1000,582]])
def project(p):return (world@rotation(p[:3]).T)[:,:2]*np.exp(p[3])+p[4:6]
def residual(p):return (project(p)-image).ravel()
def fit(start):
 p=np.array(start,dtype=float);damping=.01
 for iteration in range(500):
  f=residual(p);J=np.column_stack([(residual(p+np.eye(6)[j]*1e-6)-f)/1e-6 for j in range(6)])
  delta=np.linalg.solve(J.T@J+damping*np.diag(np.maximum(np.diag(J.T@J),1)),J.T@f);q=p-delta
  if np.dot(residual(q),residual(q))<np.dot(f,f):
   p=q;damping=max(damping*.5,1e-9)
   if np.linalg.norm(delta)<1e-9:break
  else:damping=min(damping*4,1e9)
 return p
best=min([fit([.15,y,-.3,np.log(1000),790,740]) for y in [-.6,.2,.6]],key=lambda p:np.dot(residual(p),residual(p)))
report={'rotationMatrix':rotation(best[:3]).tolist(),'pixelsPerMeter':float(np.exp(best[3])),'offset':best[4:6].tolist(),'referenceSize':[1672,941],'landmarks':[{'world':w.tolist(),'target':t.tolist(),'projected':q.tolist(),'errorPixels':float(np.linalg.norm(q-t))} for w,t,q in zip(world,image,project(best))],'rmsPixels':float(np.sqrt(np.mean(residual(best)**2))),'method':'least-squares orthographic source-view registration, not final scene calibration'}
out=Path(__file__).resolve().parents[1]/'assets/registration.json';out.write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report))
