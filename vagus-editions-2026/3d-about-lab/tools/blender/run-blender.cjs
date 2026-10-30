const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),project=path.dirname(root),cache=path.join(root,'tool-cache');
fs.mkdirSync(cache,{recursive:true});
const executable=path.join(project,'toolchain/blender-4.5.15-windows-x64/blender.exe');
const script=path.join(__dirname,process.argv.includes('--inspect-pose')?'inspect_pose.py':process.argv.includes('--inspect-vendor')?'inspect_vendor.py':process.argv.includes('--check')?'validate_static.py':'build_about.py');
const child=spawn(executable,['--background','--disable-autoexec','--factory-startup','--python-exit-code','1','--python',script,'--',root,...process.argv.slice(2)],{
 cwd:root,windowsHide:true,stdio:'inherit',env:{...process.env,BLENDER_USER_CONFIG:path.join(cache,'config'),TEMP:cache,TMP:cache}
});
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
const isBuild=!process.argv.includes('--detail-only')&&!process.argv.includes('--inspect-pose')&&!process.argv.includes('--pose-check')&&!process.argv.includes('--check')&&!process.argv.includes('--inspect-vendor');
const inputs=['tools/blender/build_about.py','tools/blender/vendor_hand.py','tools/blender/refine_cuff.py','tools/blender/anatomical_pose.py','sources/about/refinement.json','tools/blender/run-blender.cjs','sources/about/reference.png','sources/about/reference.json','sources/vendor/SOURCES.json'];
const outputs=['sources/about/about-gray.blend','sources/about/camera.json','evidence/gray/front.png','evidence/gray/overlay.png','evidence/gray/hand-close.png','evidence/gray/side.png','evidence/gray/side-context.png','evidence/gray/model-audit.json'];
const manifestPath=path.join(root,'evidence/gray/build-manifest.json'),startedAt=Date.now();
if(isBuild&&fs.existsSync(manifestPath))fs.renameSync(manifestPath,manifestPath+'.previous');
child.on('exit',code=>{
 process.exitCode=code??1;
 if(code!==0||!isBuild)return;
 try{
  for(const p of outputs)if(fs.statSync(path.join(root,p)).mtimeMs<startedAt-1000)throw new Error('stale output: '+p);
  const crypto=require('node:crypto');
  const files=[...inputs,...outputs].map(p=>({path:p,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')}));
  fs.writeFileSync(manifestPath,JSON.stringify({scope:'static build only; not aesthetic acceptance',startedAt:new Date(startedAt).toISOString(),finishedAt:new Date().toISOString(),files},null,2));
 }catch(error){console.error(error.message);process.exitCode=1;}
});
