import {places, smallSteps, initialStart, startTransition, initialHug, hugTransition} from './product-demo-state.mjs';
let animeMotion = null;
import('./vendor/anime/loader.mjs').then(({anime}) => {
  animeMotion = anime;
  document.querySelectorAll('[data-product-demo]').forEach(root => { root.dataset.motionEngine = 'anime'; });
}).catch(() => {});

function writeText(root, selector, value) {
  root.querySelectorAll(selector).forEach(element => { element.textContent = value; });
}

function renderStart(root, state) {
  const place = places.find(item => item.id === state.selected);
  const panel = state.handoff ? 'handoff' : state.detail ? 'detail' : state.tab;
  root.querySelector('[data-demo-action="back"]').textContent = state.tab === 'saved' ? '← 返回想去' : '← 返回探索';
  root.querySelectorAll('[data-start-panel]').forEach(element => { element.hidden = element.dataset.startPanel !== panel; });
  root.querySelectorAll('.phone-tabs button').forEach(button => {
    if (button.dataset.value === state.tab) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  root.querySelectorAll('.map-pin').forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.value === state.selected)); });
  writeText(root, '[data-place-title]', place.title);
  writeText(root, '[data-place-kind]', place.kind + ' · ' + place.id.toUpperCase());
  writeText(root, '[data-place-note]', place.note);
  writeText(root, '[data-place-source]', place.source);
  writeText(root, '[data-place-condition]', place.condition);
  root.querySelector('#start-source-detail').hidden = !state.source;
  root.querySelector('[data-demo-action="source"]').setAttribute('aria-expanded', String(state.source));
  writeText(root, '[data-source-symbol]', state.source ? '−' : '＋');
  const saved = state.saved.includes(state.selected);
  const saveButton = root.querySelector('[data-save-button]');
  saveButton.textContent = saved ? '已存为想去 · 点击取消' : '存为想去';
  saveButton.setAttribute('aria-pressed', String(saved));
  const list = root.querySelector('[data-saved-list]');
  list.replaceChildren();
  if (state.saved.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-note';
    empty.textContent = '还没有收藏。遇见喜欢的地方，可以先存为想去。';
    list.append(empty);
  }
  for (const id of state.saved) {
    const item = places.find(place => place.id === id);
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.demoAction = 'saved-place';
    button.dataset.value = id;
    button.textContent = item.title + ' ↗';
    list.append(button);
  }
}

function renderHug(root, state) {
  root.dataset.taskStatus = state.status;
  root.querySelectorAll('[data-hug-panel]').forEach(element => { element.hidden = element.dataset.hugPanel !== state.tab; });
  root.querySelectorAll('.phone-tabs button').forEach(button => {
    if (button.dataset.value === state.tab) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  root.querySelectorAll('.intent-options button').forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.value === state.intent)); });
  root.querySelectorAll('[data-hug-intent]').forEach(element => { element.hidden = element.dataset.hugIntent !== state.intent; });
  writeText(root, '[data-step-title]', smallSteps[state.step].title);
  writeText(root, '[data-step-detail]', smallSteps[state.step].detail);
  root.querySelectorAll('[data-preview-actions]').forEach(element => { element.hidden = state.status !== 'preview'; });
  root.querySelectorAll('[data-existing-note]').forEach(element => { element.hidden = state.status === 'preview'; });
  const smaller = root.querySelector('[data-demo-action="smaller"]');
  smaller.disabled = state.step === smallSteps.length - 1;
  smaller.textContent = smaller.disabled ? '已经足够小了' : '再小一点';
  root.querySelectorAll('[data-state-actions]').forEach(element => { element.hidden = element.dataset.stateActions !== state.status; });
  const labels = {preview: '还没有采纳事项', accepted: '已采纳 · 可以改变主意', completed: '已完成 · 可以撤销'};
  writeText(root, '[data-task-state]', labels[state.status]);
  writeText(root, '[data-task-symbol]', state.status === 'completed' ? '✓' : '○');
  root.querySelector('[data-garden-default]').hidden = state.status !== 'preview';
  root.querySelector('[data-garden-accepted]').hidden = state.status === 'preview';
  root.querySelector('[data-garden-receipt]').hidden = state.status !== 'completed';
  const gardenTitle = {preview: '在这里坐一会儿。', accepted: '已经记下这一小步。', completed: '为今天的照料，留一个回响。'};
  const gardenNote = {preview: '没有事项，也有休息的位置。', accepted: '按你的节奏来，随时可以改变主意。', completed: '完成记录留在今天，也可以撤销。'};
  writeText(root, '[data-garden-title]', gardenTitle[state.status]);
  writeText(root, '[data-garden-note]', gardenNote[state.status]);
}

for (const root of document.querySelectorAll('[data-product-demo]')) {
  const isStart = root.dataset.productDemo === 'start';
  let state = isStart ? initialStart() : initialHug();
  let animation = null;
  const render = () => isStart ? renderStart(root, state) : renderHug(root, state);
  const cancelAnimation = () => {
    if (animation?.revert) animation.revert();
    else animation?.cancel();
    animation = null;
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  reduced.addEventListener('change', cancelAnimation);
  document.addEventListener('visibilitychange', cancelAnimation);
  new MutationObserver(cancelAnimation).observe(document.body, {attributes: true, attributeFilter: ['class']});
  render();
  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-demo-action]');
    if (!button || !root.contains(button) || button.disabled) return;
    const {demoAction, value} = button.dataset;
    cancelAnimation();
    const previousPanel = root.querySelector('.phone-content > section:not([hidden])');
    if (isStart && demoAction === 'saved-place') {
      state = startTransition(state, 'place', value);
      state = startTransition(state, 'detail');
    } else {
      state = isStart ? startTransition(state, demoAction, value) : hugTransition(state, demoAction, value);
    }
    render();
    const currentPanel = root.querySelector('.phone-content > section:not([hidden])');
    const motionAllowed = event.detail > 0 && document.body.classList.contains('motion-on') && !reduced.matches && !document.hidden;
    if (motionAllowed && previousPanel !== currentPanel) {
      if (animeMotion) {
        animation = animeMotion.animate(currentPanel, {
          opacity: [.65, 1], translateY: [8, 0], duration: 220,
          ease: animeMotion.cubicBezier(.23, 1, .32, 1),
          onComplete: self => { self.revert(); if (animation === self) animation = null; }
        });
      } else animation = currentPanel.animate([{opacity: .65, transform: 'translateY(8px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 220, easing: 'cubic-bezier(.23,1,.32,1)'});
    }
    if (motionAllowed && animeMotion && ['place', 'complete'].includes(demoAction)) {
      const target = isStart ? root.querySelector('.map-pin[aria-pressed="true"]') : root.querySelector('[data-task-symbol]');
      animation = animeMotion.animate(target, {
        scale: [1, 1.12, 1], duration: demoAction === 'complete' ? 280 : 220,
        ease: animeMotion.cubicBezier(.23, 1, .32, 1),
        onComplete: self => { self.revert(); if (animation === self) animation = null; }
      });
      root.dataset.lastFeedback = demoAction;
    }
    const content = root.querySelector('.phone-content');
    if (['tab', 'detail', 'handoff', 'back', 'saved-place', 'accept', 'withdraw'].includes(demoAction)) content.scrollTop = 0;
    let focusTarget = null;
    if (['detail', 'saved-place'].includes(demoAction)) focusTarget = root.querySelector('[data-detail-title]');
    if (demoAction === 'back') {
      focusTarget = state.tab === 'saved' ? root.querySelector('.saved-list [data-value="' + state.selected + '"]') : root.querySelector('[data-demo-action="detail"]');
      focusTarget ??= currentPanel.querySelector('h3');
    }
    if (!isStart && demoAction === 'accept') focusTarget = root.querySelector('[data-task-heading]');
    if (!isStart && demoAction === 'complete') focusTarget = root.querySelector('[data-demo-action="undo"]');
    if (!isStart && demoAction === 'undo') focusTarget = root.querySelector('[data-demo-action="complete"]');
    if (!isStart && demoAction === 'withdraw') focusTarget = root.querySelector('[data-demo-action="accept"]');
    if (!isStart && demoAction === 'smaller' && button.disabled) focusTarget = root.querySelector('[data-demo-action="accept"]');
    if (focusTarget?.closest('[hidden]')) focusTarget = currentPanel.querySelector('h3');
    if (!focusTarget && previousPanel !== currentPanel && !button.closest('.phone-tabs')) focusTarget = currentPanel.querySelector('h3');
    if (focusTarget) {
      if (focusTarget.matches('h3, h4')) focusTarget.tabIndex = -1;
      focusTarget.focus({preventScroll: true});
    }
    let message = isStart ? root.querySelector('[data-place-title]').textContent : root.querySelector('[data-task-state]').textContent;
    if (demoAction === 'save') message = root.querySelector('[data-save-button]').textContent;
    if (demoAction === 'smaller') message = smallSteps[state.step].title;
    if (demoAction === 'intent') message = {listen: '已选择聊一会儿', step: '已选择做一小步', rest: '已选择先休息'}[value];
    root.querySelector('[data-demo-status]').textContent = message;
  });
}
