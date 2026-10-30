const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),files=[...fs.readdirSync(root).filter(n=>/\.(mjs|cjs|js)$/.test(n)),...fs.readdirSync(path.join(root,'scripts')).filter(n=>/\.(mjs|cjs|js)$/.test(n)).map(n=>'scripts/'+n)];
for(const file of files){const r=cp.spawnSync(process.execPath,['--check',file],{cwd:root,encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stderr);process.exit(r.status||1);}}
fs.writeFileSync(path.join(root,'evidence/syntax.json'),JSON.stringify({passed:true,files},null,2));console.log('Syntax checks passed: '+files.length+' JavaScript files.');
