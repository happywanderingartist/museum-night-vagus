export function chapterFrame(kind,value,reduced){
  const p=Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
  return {route:!reduced&&kind==='start'?p:0,water:!reduced&&kind==='hug'};
}
