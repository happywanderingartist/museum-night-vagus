import importlib.util, json, pathlib
result={}
for name in ['cv2','imageio_ffmpeg','av','PIL','requests']:
    spec=importlib.util.find_spec(name)
    result[name]=None if spec is None else spec.origin
print(json.dumps(result,ensure_ascii=False))
print(json.dumps({'source_directory':str(pathlib.Path(__file__).parent/'source'),'exists':(pathlib.Path(__file__).parent/'source').is_dir()},ensure_ascii=False))
