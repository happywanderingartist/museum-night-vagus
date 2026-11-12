export function smoothStep(start, end, progress) {
  const value = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return value * value * (3 - 2 * value);
}

// Numeric trajectory traced in engine-notes.md. Content and presentation are original.
export function foldPose(progress, width, forward) {
  const opening = smoothStep(0.12, 0.62, progress);
  const departure = smoothStep(0.52, 1, progress);
  const angle = 52 * opening + 26 * departure;
  const lift = 22 * smoothStep(0, 0.16, progress) + 12 * opening - 26 * departure;
  const shift = (width - width * Math.cos(angle * Math.PI / 180)) * 0.22
    + (forward ? -0.58 : 1.12) * width * departure;
  return {
    angle, lift, shift,
    hinges: [-angle, 2 * angle, -2 * angle],
    opacity: 1 - smoothStep(0.82, 1, progress),
    destinationOpacity: smoothStep(0.48, 0.76, progress),
  };
}

function initialize() {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const staticMode = document.querySelector('#static-mode');
  const stage = document.querySelector('#book-stage');
  const pages = [...stage.querySelectorAll('.book-leaf')];
  const previousButton = document.querySelector('#book-prev');
  const nextButton = document.querySelector('#book-next');
  const choice = document.querySelector('#book-choice');
  const pace = document.querySelector('#book-pace');
  const status = document.querySelector('#book-status');
  let currentPage = 0;
  let frame = 0;
  let foldLayer = null;
  let pageGhost = null;
  let pageAnimations = [];
  const entranceAnimations = new Set();
  let panelAnimation = null;
  let plantAnimation = null;

  const motionAllowed = () => !staticMode.checked && !reducedMotion.matches && !document.hidden;

  function stopFold() {
    cancelAnimationFrame(frame);
    frame = 0;
    pageAnimations.forEach(animation => animation.cancel());
    pageAnimations = [];
    pageGhost?.remove();
    pageGhost = null;
    foldLayer?.remove();
    foldLayer = null;
    pages.forEach(page => { page.style.opacity = ''; });
    stage.dataset.turning = 'false';
  }

  function animateElement(element, keyframes, options) {
    if (!motionAllowed()) return null;
    const animation = element.animate(keyframes, { easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both', ...options });
    animation.finished.catch(() => {}).finally(() => {
      animation.cancel();
      entranceAnimations.delete(animation);
    });
    entranceAnimations.add(animation);
    return animation;
  }

  function lightPageTurn(source, destination) {
    const ghost = source.cloneNode(true);
    ghost.removeAttribute('id');
    ghost.querySelectorAll('[id], [aria-labelledby]').forEach(element => {
      element.removeAttribute('id');
      element.removeAttribute('aria-labelledby');
    });
    ghost.classList.add('page-ghost');
    ghost.hidden = false;
    ghost.setAttribute('aria-hidden', 'true');
    ghost.inert = true;
    stage.append(ghost);
    pageGhost = ghost;
    stage.dataset.turning = 'true';
    pageAnimations = [
      ghost.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(-12px)' }], { duration: 280, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' }),
      destination.animate([{ opacity: .12 }, { opacity: 1 }], { duration: 340, easing: 'cubic-bezier(.23,1,.32,1)' }),
    ];
    destination.querySelectorAll('.leaf-copy .eyebrow, .leaf-copy h3, .leaf-copy > p:not(.eyebrow)').forEach((element, index) => {
      const animation = animateElement(element,
        [{ opacity: 0, transform: 'translateY(9px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 340, delay: 50 + index * 55 });
      if (animation) pageAnimations.push(animation);
    });
    const image = destination.querySelector('.chapter-image');
    if (image) {
      const animation = animateElement(image,
        [{ transform: 'scale(1.035)' }, { transform: 'scale(1)' }],
        { duration: 460 });
      if (animation) pageAnimations.push(animation);
    }
    Promise.allSettled(pageAnimations.map(animation => animation.finished)).then(() => {
      if (pageGhost === ghost) stopFold();
    });
  }

  function makeFold(source) {
    const width = stage.clientWidth;
    const third = width / 3;
    const layer = document.createElement('div');
    layer.className = 'fold-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.inert = true;
    const panels = [];
    let parent = layer;
    for (let index = 0; index < 3; index++) {
      const panel = document.createElement('div');
      panel.className = 'fold-panel';
      panel.style.width = `${third}px`;
      const clip = document.createElement('div');
      clip.className = 'fold-clip';
      const copy = source.cloneNode(true);
      copy.hidden = false;
      copy.inert = true;
      copy.classList.add('fold-copy');
      copy.style.width = `${width}px`;
      copy.style.left = `${-index * third}px`;
      [copy, ...copy.querySelectorAll('[id], [aria-labelledby]')].forEach(element => {
        element.removeAttribute('id');
        element.removeAttribute('aria-labelledby');
      });
      const shade = document.createElement('div');
      shade.className = 'fold-shade';
      clip.append(copy, shade);
      panel.append(clip);
      parent.append(panel);
      panels.push(panel);
      parent = panel;
    }
    stage.append(layer);
    return { layer, panels, width };
  }

  function turnPage(target) {
    const nextPage = Math.max(0, Math.min(pages.length - 1, target));
    if (nextPage === currentPage) return;
    stopFold();
    const focusedControl = document.activeElement;
    const oldPage = pages[currentPage];
    const forward = nextPage > currentPage;
    const useFold = pace.value === '1280' && motionAllowed();
    const folded = useFold ? makeFold(oldPage) : null;
    oldPage.hidden = true;
    oldPage.inert = true;
    currentPage = nextPage;
    const destination = pages[currentPage];
    destination.hidden = false;
    destination.inert = false;
    choice.value = String(currentPage);
    previousButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage === pages.length - 1;
    status.textContent = `第${currentPage + 1}页，共${pages.length}页`;
    stage.dataset.page = String(currentPage + 1);
    if ((focusedControl === previousButton && previousButton.disabled)
      || (focusedControl === nextButton && nextButton.disabled)) {
      destination.focus({ preventScroll: true });
    }
    if (!folded) {
      if (motionAllowed()) lightPageTurn(oldPage, destination);
      return;
    }
    foldLayer = folded.layer;
    stage.dataset.turning = 'true';
    destination.style.opacity = '0';
    const duration = Number(pace.value);
    const started = performance.now();
    function draw(now) {
      const progress = Math.min(1, (now - started) / duration);
      const pose = foldPose(progress, folded.width, forward);
      folded.panels.forEach((panel, index) => {
        const shift = index === 0 ? pose.shift : 0;
        const lift = index === 0 ? pose.lift : 0;
        panel.style.transform = `translateX(${shift}px) translateZ(${lift}px) rotateY(${pose.hinges[index]}deg)`;
      });
      folded.layer.style.opacity = String(pose.opacity);
      destination.style.opacity = String(pose.destinationOpacity);
      if (progress < 1) frame = requestAnimationFrame(draw);
      else stopFold();
    }
    frame = requestAnimationFrame(draw);
  }

  previousButton.addEventListener('click', () => turnPage(currentPage - 1));
  nextButton.addEventListener('click', () => turnPage(currentPage + 1));
  choice.addEventListener('change', () => turnPage(Number(choice.value)));
  stage.addEventListener('keydown', event => {
    const targets = { ArrowLeft: currentPage - 1, ArrowRight: currentPage + 1, Home: 0, End: pages.length - 1 };
    if (!(event.key in targets) || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    turnPage(targets[event.key]);
    pages[currentPage].focus({ preventScroll: true });
  });

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab) {
    panelAnimation?.cancel();
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (motionAllowed()) {
      panelAnimation = panel.animate([
        { opacity: 0 }, { opacity: 1 },
      ], { duration: 300, easing: 'cubic-bezier(.23,1,.32,1)' });
      panel.querySelectorAll('h3, p').forEach((element, index) => animateElement(element,
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 360, delay: index * 65 }));
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      const targets = { ArrowLeft: (index + tabs.length - 1) % tabs.length, ArrowRight: (index + 1) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (!(event.key in targets)) return;
      event.preventDefault();
      const target = tabs[targets[event.key]];
      selectTab(target);
      target.focus();
    });
  });

  const garden = document.querySelector('#garden-card');
  const gardenStatus = document.querySelector('#garden-status');
  const accept = document.querySelector('#accept-step');
  const rest = document.querySelector('#rest-step');
  const undo = document.querySelector('#undo-step');
  const plant = document.querySelector('.plant');
  function setGardenState(state) {
    plantAnimation?.cancel();
    const wasUndoFocused = document.activeElement === undo;
    garden.dataset.state = state;
    const accepted = state === 'accepted';
    accept.hidden = accepted;
    undo.hidden = !accepted;
    gardenStatus.textContent = accepted ? '已采纳。等你愿意时，再开始。' : state === 'resting' ? '先休息一会儿，回来再决定。' : '按自己的节奏决定。';
    if (accepted && motionAllowed()) plantAnimation = plant.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-3deg)', offset: 0.35 },
      { transform: 'rotate(2deg)', offset: 0.65 }, { transform: 'rotate(0deg)' },
    ], { duration: 420, easing: 'cubic-bezier(.23,1,.32,1)' });
    if (accepted) undo.focus({ preventScroll: true });
    else if (wasUndoFocused) accept.focus({ preventScroll: true });
  }
  accept.addEventListener('click', () => setGardenState('accepted'));
  rest.addEventListener('click', () => setGardenState('resting'));
  undo.addEventListener('click', () => setGardenState('idle'));

  function settleMotion() {
    stopFold();
    panelAnimation?.cancel();
    plantAnimation?.cancel();
    entranceAnimations.forEach(animation => animation.cancel());
    entranceAnimations.clear();
  }
  staticMode.addEventListener('change', () => {
    document.body.dataset.static = String(staticMode.checked);
    document.documentElement.style.scrollBehavior = staticMode.checked ? 'auto' : '';
    settleMotion();
  });
  reducedMotion.addEventListener('change', settleMotion);
  document.addEventListener('visibilitychange', () => { if (document.hidden) settleMotion(); });
  window.addEventListener('resize', stopFold);
  window.addEventListener('pagehide', settleMotion);

  pages.forEach((page, index) => {
    page.hidden = index !== 0;
    page.inert = index !== 0;
  });
  tabs.forEach((tab, index) => {
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    panel.hidden = index !== 0;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
  });
  stage.setAttribute('aria-label', 'START介绍册，左右方向键翻页');
  document.body.dataset.enhanced = 'true';
  const revealTargets = [...document.querySelectorAll('[data-reveal], [data-image-reveal]')];
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      if (entry.target.hasAttribute('data-image-reveal')) {
        const image = entry.target.querySelector('img');
        if (image) animateElement(image,
          [{ opacity: .55, transform: 'scale(1.035)' }, { opacity: 1, transform: 'scale(1)' }],
          { duration: 560 });
      } else {
        animateElement(entry.target,
          [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 440, delay: Math.min(revealTargets.indexOf(entry.target) % 3, 2) * 60 });
      }
    });
  }, { threshold: .18 });
  revealTargets.forEach(target => revealObserver.observe(target));
}

if (typeof document !== 'undefined') initialize();
