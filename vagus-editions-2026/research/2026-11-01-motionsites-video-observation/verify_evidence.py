import json, pathlib, subprocess
root=pathlib.Path(__file__).parent
meta=json.loads((root/'video-metadata.json').read_text())
result=[]
for item in meta:
    p=root/'source'/item['file']
    run=subprocess.run([r'D:\AI-Data\Cache\Migrated\bilibili\ffmpeg\ffmpeg.exe','-v','error','-i',str(p),'-f','null','-'],capture_output=True)
    result.append({'file':p.name,'duration':item['duration_seconds'],'full_decode_exit_code':run.returncode,'decode_errors':run.stderr.decode(errors='replace'),'contact_sheet_exists':(root/f'{p.stem}-sheet-1.jpg').is_file()})
(root/'verification.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
assert len(result)==6 and all(x['full_decode_exit_code']==0 and not x['decode_errors'] and x['contact_sheet_exists'] for x in result)
