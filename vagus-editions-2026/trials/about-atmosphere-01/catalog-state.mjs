const normalize=value=>String(value??'').normalize('NFKC').trim().toLocaleLowerCase();
export function filterEntries(entries,category='全部',query=''){
 const q=normalize(query),kind=normalize(category);
 return entries.filter(item=>(kind==='全部'||normalize(item.category)===kind)&&(!q||normalize([item.title,item.category,item.description].join(' ')).includes(q)));
}
