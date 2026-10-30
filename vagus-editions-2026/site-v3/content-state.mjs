export function resolveContentURL(value,base){
 if(typeof value!=='string'||!value.trim())return null;
 try{const url=new URL(value,base);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password?url.href:null;}catch{return null;}
}

export function personalWorkItems(value,base){
 if(!Array.isArray(value))return [];
 return value.flatMap(item=>{
  if(!item||typeof item.title!=='string'||!item.title.trim())return [];
  const src=resolveContentURL(item.src,base);if(!src)return [];
  return [{src,title:item.title.trim(),alt:typeof item.alt==='string'?item.alt:item.title.trim(),caption:typeof item.caption==='string'?item.caption:item.title.trim()}];
 });
}
