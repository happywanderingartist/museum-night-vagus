// The paused GSAP timeline is sampled directly by scroll progress.
export function createEntryTimeline(gsap) {
  const model = {approach: 0, opening: 0, reflection: 0, tone: 0, copy: 1, labels: 0, passage: 0, settled: 0};
  const keys = Object.keys(model);
  const timeline = gsap.timeline({paused: true, defaults: {ease: 'none'}})
    .to(model, {approach: 1, duration: .28}, .08)
    .to(model, {copy: 0, duration: .14}, .06)
    .to(model, {reflection: 1, duration: .18}, .12)
    .to(model, {opening: 1, duration: .58}, .24)
    .to(model, {tone: 1, duration: .40}, .42)
    .to(model, {passage: 1, duration: .12}, .32)
    .to(model, {passage: 0, duration: .14}, .68)
    .to(model, {labels: 1, duration: .16}, .82)
    .to(model, {settled: 1, duration: .18}, .82);
  return {
    seek(progress) {
      const value = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
      timeline.progress(value, true);
      return Object.fromEntries(keys.map(key => [key, model[key]]));
    },
    destroy() { timeline.kill(); }
  };
}
