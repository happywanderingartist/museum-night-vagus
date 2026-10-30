export function mountAtmosphere(w){
 const doc=w.document,body=doc.body,scene=doc.querySelector('.collection-art'),image=scene?.querySelector('.collection-image');if(!scene||!image)return null;
 const query=w.matchMedia('(prefers-reduced-motion: reduce)'),button=doc.querySelector('[data-motion-toggle]'),camera=doc.createElement('div'),light=doc.createElement('div');
 camera.className='atmosphere-camera';light.className='atmosphere-light';light.setAttribute('aria-hidden','true');image.parentNode.insertBefore(camera,image);camera.append(image);scene.append(light);
 const listeners=[],animations=new Set();let disabled=false,frame=0,dead=false,entered=Boolean(w.location.hash),keyboard=false;
 try{disabled=w.sessionStorage.getItem('vagus-motion-off')==='1';}catch{}
 const on=(target,type,fn,opts)=>{target.addEventListener(type,fn,opts);listeners.push(()=>target.removeEventListener(type,fn,opts));};
 const cancel=()=>{for(const a of animations)a.cancel();animations.clear();};
 const enabled=()=>!disabled&&!query.matches;
 function entrance(){if(entered)return;entered=true;if(!enabled()||keyboard||w.scrollY>64)return;const els=scene.querySelectorAll('.art-category,.art-copy h1,.art-subtitle,.art-read,.art-quip');let i=0;for(const el of els){if(!el.animate)continue;const a=el.animate([{opacity:.35,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:550,delay:Math.min(i++*65,260),easing:'cubic-bezier(.23,1,.32,1)'});animations.add(a);a.finished.then(()=>animations.delete(a),()=>animations.delete(a));}}
 function render(){frame=0;if(dead)return;const r=scene.getBoundingClientRect(),visible=r.bottom>0&&r.top<w.innerHeight&&!doc.hidden,active=enabled();body.classList.toggle('atmosphere-enabled',active);body.classList.toggle('atmosphere-scrolled',w.scrollY>48);scene.classList.toggle('atmosphere-visible',visible&&active);camera.style.setProperty('--art-drift',active&&w.innerWidth>760?Math.min(26,Math.max(0,-r.top*.045))+'px':'0px');if(!active||!visible)cancel();if(visible&&image.complete)entrance();}
 function queue(){if(!frame&&!dead)frame=w.requestAnimationFrame(render);}
 function mode(){if(button){button.hidden=false;button.disabled=query.matches;button.textContent=query.matches?'系统已减少动态':disabled?'开启动效':'关闭动态';button.setAttribute('aria-pressed',String(disabled||query.matches));}if(!enabled()){cancel();body.classList.remove('atmosphere-enabled');scene.classList.remove('atmosphere-visible');camera.style.setProperty('--art-drift','0px');}queue();}
 if(button)on(button,'click',()=>{disabled=!disabled;try{w.sessionStorage.setItem('vagus-motion-off',disabled?'1':'0');}catch{}mode();});
 on(w,'scroll',queue,{passive:true});on(w,'resize',queue);on(w,'pageshow',queue);on(w,'hashchange',()=>{entered=true;cancel();queue();});on(query,'change',mode);on(image,'load',queue);
 on(doc,'visibilitychange',()=>{if(doc.hidden){scene.classList.remove('atmosphere-visible');cancel();}else queue();});on(doc,'keydown',e=>{if(e.key==='Tab'){keyboard=true;cancel();}});mode();
 return {destroy(){dead=true;if(frame)w.cancelAnimationFrame(frame);cancel();listeners.forEach(f=>f());body.classList.remove('atmosphere-enabled','atmosphere-scrolled');scene.classList.remove('atmosphere-visible');camera.before(image);camera.remove();light.remove();}};
}
if(typeof window!=='undefined')mountAtmosphere(window);
