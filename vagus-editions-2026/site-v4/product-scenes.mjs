// The artwork controller owns heroes. This controller owns only new product figures.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const records = [...document.querySelectorAll('[data-product-reveal]')].map(element => ({element, seen: false, animation: null}));
const enabled = () => document.body.classList.contains('motion-on') && !reduced.matches && !document.hidden;
function cancel() {
  for (const record of records) {
    record.animation?.cancel();
    record.animation = null;
    record.element.dataset.motion = 'static';
  }
}
function reveal() {
  if (!enabled()) { cancel(); return; }
  for (const record of records) {
    const box = record.element.getBoundingClientRect();
    if (record.seen || box.top >= innerHeight * .9 || box.bottom <= 0) continue;
    record.seen = true;
    if (typeof record.element.animate !== 'function') continue;
    record.element.dataset.motion = 'revealed';
    record.animation = record.element.animate(
      [{opacity: .6, transform: 'translateY(24px)'}, {opacity: 1, transform: 'translateY(0)'}],
      {duration: 650, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'none'}
    );
    record.animation.finished.then(() => { record.animation = null; }, () => { record.animation = null; });
  }
}
if (typeof IntersectionObserver === 'function') {
  const observer = new IntersectionObserver(reveal, {threshold: .12});
  records.forEach(record => observer.observe(record.element));
} else addEventListener('scroll', reveal, {passive: true});
new MutationObserver(reveal).observe(document.body, {attributes: true, attributeFilter: ['class']});
document.addEventListener('visibilitychange', reveal);
reduced.addEventListener('change', reveal);
reveal();
