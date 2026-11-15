export function shouldStopPlayback({type,key,buttonFocused=false,scrollbar=false}){
 if(type==='wheel'||type==='touchstart')return true;
 if(type==='pointerdown')return scrollbar;
 if(type==='keydown')return !(buttonFocused&&key===' ')&&['PageDown','PageUp','ArrowDown','ArrowUp','Home','End',' '].includes(key);
 return false;
}
