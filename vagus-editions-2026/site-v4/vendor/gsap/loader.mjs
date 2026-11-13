// These official UMD files run as classic scripts, preserving their browser globals.
function loadScript(file) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL(file, import.meta.url).href;
    script.onload = resolve;
    script.onerror = () => { script.remove(); reject(new Error('Unable to load ' + file)); };
    document.head.append(script);
  });
}
await loadScript('./gsap.min.js');
await loadScript('./ScrollTrigger.min.js');
export const gsap = window.gsap;
export const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
