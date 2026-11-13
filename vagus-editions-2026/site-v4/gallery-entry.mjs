import {clamp, spherePoints} from './archive-motion.mjs';
import {dampedMotion} from './globe-motion.mjs';
import {createEntryTimeline} from './entry-timeline.mjs';

const $ = selector => document.querySelector(selector);
// This scene restores its own camera and scroll position together.
history.scrollRestoration = 'manual';
const experience = $('#experience');
const studio = $('#studio');
const studioArt = $('#studio-art');
const homeCopy = $('#home-copy');
const roomTone = $('#room-tone');
const portal = $('#reflection-window');
const placement = $('#gallery-placement');
const perspective = $('#perspective');
const collection = $('#collection');
const sheen = $('#lens-sheen');
const passage = $('#depth-passage');
const galleryHeader = $('#gallery-header');
const galleryCopy = $('#gallery-copy');
const reading = $('#reading');
const flatDirectory = $('#flat-directory');
const projectList = $('#project-list');
const globeGuide = $('#globe-guide');
const rotationButton = $('#rotation-toggle');
const progressControl = $('#progress');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const chapters = [
  {title: 'AI 行业观察', image: 'ai', page: 'ai.html', description: '在技术快速变化的时代，我更关心 AI 如何进入真实生活，以及它如何改变人们的创作、工作与表达方式。'},
  {title: 'START', image: 'start', page: 'start.html', description: '把喜欢的人和作品，变成有依据的出行线索。开发预览中，来源字段后台合同已有工程验收，内容与真实任务继续验证。'},
  {title: 'Hug', image: 'hug', page: 'hug.html', description: '把恢复生活秩序，拆成愿意尝试的一小步。浏览器原型已验证普通合成事项保存与刷新恢复，真实用户效果继续验证。'},
  {title: '小红书运营', image: 'xiaohongshu', page: 'xiaohongshu.html', description: '账号定位、选题、封面与传播。'},
  {title: '播客', image: 'podcast', page: 'podcast.html', description: '以嘉宾身份参与《螺丝在拧紧》Vol.116，讨论 AI、人文学科与青年就业。'},
  {title: '文学奖传播', image: 'literature', page: 'literature.html', description: '单向空间文学奖参与方案与书店联动，按真实职责与材料展开。'},
  {title: 'Vagus 网站视觉', image: 'visual', page: 'visual.html', description: 'Vagus 网站的章节原画、图文阅读与动效设计。'}
];
// Omit the poles so every painting comes into view during a horizontal revolution.
const distributedPoints = spherePoints(chapters.length + 2).slice(1, -1);
const points = [distributedPoints[3], ...distributedPoints.slice(0, 3), ...distributedPoints.slice(4)];
const frontIndex = 0;
const frontPoint = points[frontIndex];
const radians = Math.PI / 180;
let layout;
let progress = 0;
let selected = -1;
let selection = 0;
let yaw = 0;
let pitch = 0;
let hoverIndex = -1;
let pointer = null;
let pendingDragClick = null;
let playback = null;
let selectionPlayback = null;
let frame = 0;
let userMotionOff = false;
try { userMotionOff = sessionStorage.getItem('vagus-motion-off') === '1'; } catch {}
let motionOff = userMotionOff || reduced.matches;
let flatOpen = false;
let pendingFocus = null;
let rotationPaused = false;
let yawVelocity = 0;
let pitchVelocity = 0;
let lastFrameTime = 0;
let entryTimeline = null;
let scrollDriver = null;
let guideRemaining = 1.2;

const cards = points.map((point, index) => {
  const chapter = chapters[index % chapters.length];
  const card = document.createElement('button');
  card.className = 'painting';
  card.type = 'button';
  card.dataset.index = String(index);
  card.setAttribute('aria-label', `进入${chapter.title}`);
  const image = document.createElement('img');
  image.src = `assets/${chapter.image}.webp`;
  image.alt = chapter.title;
  image.draggable = false;
  const label = document.createElement('span');
  label.className = 'painting-name';
  label.textContent = chapter.title;
  label.setAttribute('aria-hidden', 'true');
  card.append(image, label);
  for (const side of ['top', 'right', 'bottom', 'left']) {
    const edge = document.createElement('span');
    edge.className = 'painting-edge ' + side;
    edge.setAttribute('aria-hidden', 'true');
    card.append(edge);
  }
  card.addEventListener('click', event => {
    if (pointer?.moved) return;
    openChapter(index, event.detail !== 0);
  });
  card.addEventListener('pointerenter', () => { if (finePointer.matches) { hoverIndex = index; requestRender(); } });
  card.addEventListener('pointerleave', () => { hoverIndex = -1; requestRender(); });
  collection.append(card);
  return card;
});

const categories = ['观察与写作', '数字产品', '数字产品', '内容运营', '声音与表达', '活动策划', '视觉设计'];
for (const [index, chapter] of chapters.entries()) {
  const link = document.createElement('a');
  link.href = `${chapter.page}`;
  const image = document.createElement('img');
  image.src = `assets/${chapter.image}.webp`;
  image.alt = '';
  link.append(image, chapter.title + ' ↗');
  flatDirectory.append(link);

  const projectLink = document.createElement('a');
  projectLink.href = link.href;
  const number = document.createElement('span');
  number.className = 'project-number';
  number.textContent = String(index + 1).padStart(2, '0');
  const title = document.createElement('span');
  title.className = 'project-title';
  title.textContent = chapter.title;
  const category = document.createElement('span');
  category.className = 'project-category';
  category.textContent = categories[index];
  const arrow = document.createElement('span');
  arrow.textContent = '↗';
  arrow.setAttribute('aria-hidden', 'true');
  projectLink.append(number, title, category, arrow);
  projectLink.addEventListener('pointerenter', () => {
    if (finePointer.matches) { hoverIndex = index; requestRender(); }
  });
  projectLink.addEventListener('pointerleave', () => { hoverIndex = -1; requestRender(); });
  projectLink.addEventListener('focus', () => { hoverIndex = index; requestRender(); });
  projectLink.addEventListener('blur', () => { hoverIndex = -1; requestRender(); });
  projectList.append(projectLink);
}

for (const angle of [0, 45, 90, 135]) {
  const meridian = document.createElement('span');
  meridian.className = 'globe-meridian';
  meridian.dataset.angle = String(angle);
  globeGuide.append(meridian);
}
for (const latitude of [-.5, 0, .5]) {
  const parallel = document.createElement('span');
  parallel.className = 'globe-parallel';
  parallel.dataset.latitude = String(latitude);
  globeGuide.append(parallel);
}

const mix = (from, to, amount) => from + (to - from) * amount;
const phase = (value, from, to) => clamp((value - from) / (to - from), 0, 1);

// Shared site motion tokens. The curve is used only by timed playback.
function timedEase(value) {
  const x1 = .23, y1 = 1, x2 = .32, y2 = 1;
  const bezier = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  let lower = 0, upper = 1;
  for (let index = 0; index < 15; index++) {
    const middle = (lower + upper) / 2;
    if (bezier(middle, x1, x2) < value) lower = middle;
    else upper = middle;
  }
  return bezier((lower + upper) / 2, y1, y2);
}

function rotatePoint(point, yawDegrees, pitchDegrees) {
  const aroundY = yawDegrees * radians;
  const aroundX = pitchDegrees * radians;
  const x = point.x * Math.cos(aroundY) + point.z * Math.sin(aroundY);
  const z = -point.x * Math.sin(aroundY) + point.z * Math.cos(aroundY);
  const y = point.y * Math.cos(aroundX) + z * Math.sin(aroundX);
  return {x, y, z: -point.y * Math.sin(aroundX) + z * Math.cos(aroundX)};
}

function measure() {
  const previousProgress = layout ? clamp(scrollY / Math.max(1, layout.scrollDistance), 0, 1) : null;
  const width = experience.clientWidth, height = experience.clientHeight;
  const artworkScale = Math.max(width / 1671, height / 941);
  const radius = Math.min(height * .34, width * .29);
  const compact = width <= 700;
  layout = {
    width, height, artworkScale, radius,
    lensX: (width - 1671 * artworkScale) / 2 + 895 * artworkScale,
    lensY: (height - 941 * artworkScale) / 2 + 248 * artworkScale,
    centerX: width * (compact ? .68 : .66),
    centerY: height * (compact ? .40 : .49),
    cardWidth: Math.max(75, radius * .80),
    scrollDistance: document.documentElement.scrollHeight - innerHeight
  };
  if (previousProgress !== null) window.scrollTo(0, previousProgress * layout.scrollDistance);
  perspective.style.perspectiveOrigin = `${layout.centerX}px ${layout.centerY}px`;
  collection.style.left = `${layout.centerX}px`;
  collection.style.top = `${layout.centerY}px`;
  cards.forEach(card => { card.style.width = `${layout.cardWidth}px`; });
  globeGuide.querySelectorAll('.globe-meridian').forEach(meridian => {
    meridian.style.width = meridian.style.height = `${radius * 2}px`;
    meridian.style.transform = `translate(-50%, -50%) rotateY(${meridian.dataset.angle}deg)`;
  });
  globeGuide.querySelectorAll('.globe-parallel').forEach(parallel => {
    const latitude = Number(parallel.dataset.latitude);
    const diameter = Math.sqrt(1 - latitude * latitude) * radius * 2;
    parallel.style.width = parallel.style.height = `${diameter}px`;
    parallel.style.transform = `translate(-50%, -50%) translateY(${-latitude * radius}px) rotateX(90deg)`;
  });
  requestRender();
  scrollDriver?.refresh();
}

function requestRender() {
  if (!frame && !document.hidden) frame = requestAnimationFrame(render);
}

function render(now) {
  frame = 0;
  const deltaSeconds = lastFrameTime ? Math.max((now - lastFrameTime) / 1000, 0) : 0;
  lastFrameTime = now;
  if (playback) {
    const amount = phase(now, playback.started, playback.started + playback.duration);
    const value = mix(playback.from, playback.to, timedEase(amount));
    window.scrollTo(0, value * layout.scrollDistance);
    if (amount === 1) {
      window.scrollTo(0, playback.to * layout.scrollDistance);
      pendingFocus = playback.to >= .999 ? projectList.querySelector('a') : $('#invite');
      playback = null;
      updatePlaybackButtons();
    }
  }
  scrollDriver?.update();
  progress = motionOff ? 1 : scrollDriver ? scrollDriver.progress : clamp(scrollY / Math.max(1, layout.scrollDistance), 0, 1);
  if (selectionPlayback) {
    const amount = phase(now, selectionPlayback.started, selectionPlayback.started + selectionPlayback.duration);
    selection = mix(selectionPlayback.from, selectionPlayback.to, timedEase(amount));
    if (amount === 1) {
      selection = selectionPlayback.to;
      selectionPlayback = null;
      if (selection === 0) { pendingFocus = cards[selected]; selected = -1; }
      else pendingFocus = $('#return-gallery');
    }
  }

  const {width, height, lensX, lensY, artworkScale, centerX, centerY, radius, cardWidth} = layout;
  const scene = entryTimeline?.seek(progress);
  const approach = scene ? scene.approach : phase(progress, .08, .36);
  const zoom = Math.exp(Math.log(1.75) * approach);
  const targetX = mix(lensX, width * .54, approach) + Math.sin(approach * Math.PI) * width * .016;
  const targetY = mix(lensY, height * .46, approach) - Math.sin(approach * Math.PI) * height * .018;
  const translateX = clamp(targetX - lensX * zoom, width * (1 - zoom), 0);
  const translateY = clamp(targetY - lensY * zoom, height * (1 - zoom), 0);
  const destinationX = lensX * zoom + translateX;
  const destinationY = lensY * zoom + translateY;
  studioArt.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoom})`;
  homeCopy.style.opacity = String(scene ? scene.copy : 1 - phase(progress, .06, .20));
  homeCopy.inert = progress > .20;
  const opening = scene ? scene.opening : phase(progress, .24, .82);
  const portalX = mix(destinationX, centerX, opening);
  const portalY = mix(destinationY, centerY, opening);
  const physicalRadius = 25 * artworkScale * zoom;
  const maximumRadius = Math.hypot(width, height);
  // Reveal the surrounding room before its circular edge can become a second subject.
  const maskOpening = 1 - (1 - opening) ** 2.4;
  const radiusX = physicalRadius * (maximumRadius / physicalRadius) ** maskOpening;
  const radiusY = radiusX * mix(.86, 1, opening);
  const galleryScale = mix(physicalRadius / (radius * 1.10), 1, opening);
  portal.style.clipPath = `ellipse(${radiusX}px ${radiusY}px at ${portalX}px ${portalY}px)`;
  portal.style.maskImage = `radial-gradient(ellipse ${radiusX}px ${radiusY}px at ${portalX}px ${portalY}px, black 87%, transparent 100%)`;
  const reflectedOpacity = mix(0, .45, scene ? scene.reflection : phase(progress, .12, .30));
  portal.style.opacity = String(mix(reflectedOpacity, 1, phase(progress, .24, .34)));
  placement.style.transform = `translate(${portalX - centerX * galleryScale}px, ${portalY - centerY * galleryScale}px) scale(${galleryScale})`;
  roomTone.style.opacity = String(scene ? scene.tone : phase(progress, .42, .82));
  studio.style.visibility = progress >= .82 ? 'hidden' : 'visible';
  if (passage) {
    passage.style.opacity = String(scene ? scene.passage : phase(progress, .32, .44) * (1 - phase(progress, .68, .82)));
    passage.style.perspectiveOrigin = `${centerX}px ${centerY}px`;
    passage.querySelectorAll('.passage-frame').forEach((edge, index) => {
      const depth = mix(-1050 - index * 360, 1000 - index * 500, phase(progress, .32, .82));
      edge.style.left = `${centerX}px`;
      edge.style.top = `${centerY}px`;
      edge.style.width = `${width * .58}px`;
      edge.style.height = `${height * .70}px`;
      edge.style.transform = `translate(-50%, -50%) translateZ(${depth}px)`;
    });
  }
  sheen.style.width = `${radiusX * 2}px`;
  sheen.style.height = `${radiusY * 2}px`;
  sheen.style.transform = `translate(${portalX - radiusX}px, ${portalY - radiusY}px)`;
  sheen.style.opacity = String(phase(progress, .08, .18) * (1 - phase(progress, .30, .55)) * .3);

  const galleryReady = progress >= .999;
  const available = galleryReady && selected < 0 && !flatOpen;
  const focusedOnProject = document.activeElement.matches(':focus-visible') &&
    (projectList.contains(document.activeElement) || collection.contains(document.activeElement));
  const globeIdle = available && !motionOff && !pointer && !focusedOnProject;
  const autoRotating = globeIdle && !rotationPaused && hoverIndex < 0;
  if (globeIdle) {
    const yawMotion = dampedMotion(yawVelocity, deltaSeconds);
    const pitchMotion = dampedMotion(pitchVelocity, deltaSeconds);
    yaw += yawMotion.distance;
    pitch = clamp(pitch + pitchMotion.distance, -60, 60);
    yawVelocity = yawMotion.velocity;
    pitchVelocity = pitchMotion.velocity;
    if (Math.abs(yawVelocity) < .05) yawVelocity = 0;
    if (Math.abs(pitchVelocity) < .05) pitchVelocity = 0;
    if (autoRotating) {
      yaw += 3.6 * deltaSeconds;
      if (guideRemaining > 0) {
        guideRemaining -= deltaSeconds;
        if (guideRemaining <= 0) rotationPaused = true;
      }
    }
  }
  portal.inert = !available;
  galleryHeader.hidden = !galleryReady || selected >= 0;
  const labels = scene ? scene.labels : phase(progress, .82, .98);
  galleryCopy.hidden = progress < .82 || selected >= 0 || flatOpen;
  galleryCopy.style.opacity = String(labels);
  $('#gallery-title').style.transform = `translateY(${(1 - labels) * 8}px)`;
  projectList.style.opacity = String(labels);
  galleryCopy.inert = !available;
  homeCopy.setAttribute('aria-hidden', String(progress > .2));
  progressControl.value = String(Math.round(progress * 1000));
  $('#progress-text').textContent = `${Math.round(progress * 100)}%`;
  experience.dataset.progress = progress.toFixed(4);
  experience.dataset.selection = selection.toFixed(4);
  experience.dataset.state = selected >= 0 ? (selection > .999 ? 'reading' : 'opening') : galleryReady ? 'gallery' : 'studio';
  const hasMomentum = yawVelocity !== 0 || pitchVelocity !== 0;
  const idleRotation = rotationPaused ? (hasMomentum ? 'coasting' : 'paused') : 'automatic';
  const rotationHeld = !globeIdle || (!rotationPaused && hoverIndex >= 0);
  experience.dataset.rotation = pointer ? 'dragging' : !available || motionOff ? 'inactive' : rotationHeld ? 'held' : idleRotation;
  experience.dataset.yaw = yaw.toFixed(4);
  experience.dataset.pitch = pitch.toFixed(4);
  rotationButton.textContent = rotationPaused ? '开启自动漫游' : '暂停自动漫游';
  rotationButton.setAttribute('aria-pressed', String(rotationPaused));

  const currentYaw = -frontPoint.longitude + yaw + mix(7, 0, opening);
  const currentPitch = -frontPoint.latitude + pitch;
  globeGuide.style.transform = `rotateX(${currentPitch}deg) rotateY(${currentYaw}deg)`;
  globeGuide.style.opacity = String(phase(progress, .76, 1) * (1 - phase(selection, 0, .35)));
  cards.forEach((card, index) => {
    const point = rotatePoint(points[index], currentYaw, currentPitch);
    const focused = index === selected;
    const hover = index === hoverIndex && available && !motionOff;
    let x = point.x * radius;
    let y = -point.y * radius;
    let z = point.z * radius;
    let rotationY = Math.atan2(point.x, point.z) / radians;
    let rotationX = Math.asin(clamp(point.y, -1, 1)) / radians;
    let scale = hover ? 1.045 : 1;
    let opacity = 1;
    if (selected >= 0) {
      if (focused) {
        x = mix(x, width / 2 - centerX, selection);
        y = mix(y, height / 2 - centerY, selection);
        z = mix(z, 0, selection);
        rotationX *= 1 - selection;
        rotationY *= 1 - selection;
        scale = mix(1, Math.max(width, height * 1672 / 941) / (cardWidth - 6), selection);
      } else {
        x += (point.x < 0 ? -1 : 1) * width * selection;
        y += -point.y * height * .2 * selection;
        z -= radius * selection;
        opacity = 1 - phase(selection, .1, .74);
      }
    }
    card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotationY}deg) rotateX(${rotationX}deg) scale(${scale})`;
    card.style.opacity = String(opacity);
    card.querySelector('img').style.filter = `brightness(${focused ? 1 : mix(.40, 1, phase(point.z, -.8, .85))})`;
    card.style.backgroundColor = focused ? `rgba(211, 204, 178, ${1 - selection})` : '#d3ccb2';
    card.style.boxShadow = focused && selection > .9 ? 'none' : '';
    card.tabIndex = available && point.z > .08 ? 0 : -1;
    card.dataset.facing = point.z > .08 ? 'front' : 'back';
  });

  reading.hidden = selected < 0;
  reading.style.opacity = String(phase(selection, .45, 1));
  reading.inert = selection < .999;
  updatePlaybackButtons();
  if (pendingFocus) { pendingFocus.focus({preventScroll: true}); pendingFocus = null; }
  const globeMoving = globeIdle && (autoRotating || hasMomentum);
  if (playback || selectionPlayback || globeMoving) requestRender();
  else lastFrameTime = 0;
}

function updatePlaybackButtons() {
  $('#play').textContent = progress >= .999 ? '重播进入' : '播放进入';
  $('#pause').disabled = !playback;
}

function stopPlayback() {
  playback = null;
  updatePlaybackButtons();
}

function clearDragClick() {
  if (pendingDragClick) portal.removeEventListener('click', pendingDragClick, true);
  pendingDragClick = null;
}

function cancelDrag() {
  clearDragClick();
  const active = pointer;
  pointer = null;
  if (active && portal.hasPointerCapture(active.id)) portal.releasePointerCapture(active.id);
  yawVelocity = pitchVelocity = 0;
  requestRender();
}

function moveTo(value, animate = true) {
  stopPlayback();
  cancelDrag();
  if (selected >= 0) { selected = -1; selection = 0; selectionPlayback = null; }
  setFlat(false);
  if (motionOff || !animate) {
    window.scrollTo(0, value * layout.scrollDistance);
    if (!motionOff) pendingFocus = value >= .999 ? projectList.querySelector('a') : $('#invite');
    requestRender();
    return;
  }
  const from = clamp(scrollY / Math.max(1, layout.scrollDistance), 0, 1);
  playback = {from, to: value, started: performance.now(), duration: 1200 * Math.abs(value - from)};
  updatePlaybackButtons();
  requestRender();
}

function openChapter(index, animate = true) {
  if (progress < .999 || selected >= 0 || flatOpen) return;
  stopPlayback();
  rotationPaused = true;
  yawVelocity = pitchVelocity = 0;
  selected = index;
  selection = 0;
  const chapter = chapters[index % chapters.length];
  $('#reading-title').textContent = chapter.title;
  $('#reading-intro').textContent = chapter.description;
  $('#reading-category').textContent = chapter.image === 'ai' ? '01 / AFTER-HOURS THINKING' : 'VAGUS / THE COLLECTION';
  $('#article-links').hidden = chapter.image !== 'ai';
  const comparison = $('#compare-link');
  comparison.hidden = !['start','hug'].includes(chapter.image);
  comparison.href = `public/product-cases-2026-11-11/${chapter.image}-compare.html`;
  $('#chapter-link').href = `${chapter.page}`;
  $('#chapter-link').textContent = chapter.image === 'ai' ? '查看全部作品 ↗' : '进入项目详情 ↗';
  reading.scrollTop = 0;
  if (motionOff || !animate) {
    selection = 1;
    pendingFocus = $('#return-gallery');
    requestRender();
  } else {
    selectionPlayback = {from: 0, to: 1, started: performance.now(), duration: 850};
    requestRender();
  }
}

function returnToGallery(animate = true) {
  if (selected < 0) return;
  if (motionOff || !animate) {
    pendingFocus = cards[selected];
    selected = -1;
    selection = 0;
    selectionPlayback = null;
  } else selectionPlayback = {from: selection, to: 0, started: performance.now(), duration: 650 * selection};
  requestRender();
}

function setFlat(open, focus = false) {
  const returnFocus = flatOpen && !open && flatDirectory.contains(document.activeElement);
  flatOpen = open;
  flatDirectory.hidden = !open;
  $('#flat-button').setAttribute('aria-expanded', String(open));
  $('#flat-button').textContent = open ? '空间目录' : '平面目录';
  if (open && focus) pendingFocus = flatDirectory.querySelector('a');
  if (returnFocus) pendingFocus = $('#flat-button');
  requestRender();
}

function setMotion(off) {
  stopPlayback();
  cancelDrag();
  motionOff = reduced.matches || off;
  off = motionOff;
  document.body.classList.toggle('motion-off', off);
  document.body.classList.toggle('motion-on', !off);
  $('#motion').disabled = reduced.matches;
  yawVelocity = pitchVelocity = 0;
  $('#motion').setAttribute('aria-pressed', String(off));
  $('#motion').textContent = reduced.matches ? '系统已减少动态' : off ? '开启动效' : '关闭动态';
  $('#play').disabled = off;
  $('#cover-button').disabled = off;
  progressControl.disabled = off;
  if (off) { moveTo(1, false); setFlat(true); }
  else setFlat(false);
  requestRender();
}

$('#invite').addEventListener('click', event => moveTo(1, event.detail !== 0));
$('#play').addEventListener('click', () => {
  if (progress >= .999) { window.scrollTo(0, 0); progress = 0; }
  moveTo(1);
});
$('#pause').addEventListener('click', stopPlayback);
$('#cover-button').addEventListener('click', event => moveTo(0, event.detail !== 0));
$('#skip').addEventListener('click', () => moveTo(1, false));
$('#visit-ai').addEventListener('click', event => openChapter(frontIndex, event.detail !== 0));
$('#return-gallery').addEventListener('click', event => returnToGallery(event.detail !== 0));
$('#flat-button').addEventListener('click', () => setFlat(!flatOpen, true));
rotationButton.addEventListener('click', () => {
  guideRemaining = 0;
  rotationPaused = !rotationPaused;
  yawVelocity = pitchVelocity = 0;
  hoverIndex = -1;
  requestRender();
});
$('#motion').addEventListener('click', () => {
  userMotionOff = !userMotionOff;
  try { sessionStorage.setItem('vagus-motion-off', userMotionOff ? '1' : '0'); } catch {}
  setMotion(userMotionOff);
});
progressControl.addEventListener('input', () => moveTo(Number(progressControl.value) / 1000, false));
addEventListener('scroll', () => { if (!scrollDriver) requestRender(); updatePlaybackButtons(); }, {passive: true});
addEventListener('wheel', stopPlayback, {passive: true});
addEventListener('touchstart', stopPlayback, {passive: true});
addEventListener('resize', measure);
addEventListener('keydown', event => {
  stopPlayback();
  if (event.key === 'Escape') { if (selected >= 0) returnToGallery(false); else setFlat(false); }
});
reduced.addEventListener('change', () => setMotion(userMotionOff));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelDrag();
    stopPlayback();
    selectionPlayback = null;
    yawVelocity = pitchVelocity = 0;
    lastFrameTime = 0;
    cancelAnimationFrame(frame);
    frame = 0;
  }
  else {
    if (selected >= 0) {
      const interruptedIndex = selected;
      selection = selection > .5 ? 1 : 0;
      if (selection) pendingFocus = $('#return-gallery');
      else { selected = -1; pendingFocus = cards[interruptedIndex]; }
    } else if (homeCopy.inert && homeCopy.contains(document.activeElement)) {
      pendingFocus = progress >= .999 ? projectList.querySelector('a') : $('#skip');
    }
    requestRender();
  }
});
portal.addEventListener('pointerdown', event => {
  if (pointer || event.button !== 0 || event.isPrimary === false) return;
  clearDragClick();
  if (progress < .999 || selected >= 0 || motionOff) return;
  pointer = {id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, lastTime: performance.now(), yaw, pitch, moved: false};
  yawVelocity = pitchVelocity = 0;
  requestRender();
});
portal.addEventListener('pointermove', event => {
  if (!pointer || pointer.id !== event.pointerId) return;
  const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
  if (Math.hypot(dx, dy) < 7) return;
  pointer.moved = true;
  rotationPaused = true;
  if (!finePointer.matches && Math.abs(dy) > Math.abs(dx)) { pointer = null; return; }
  portal.setPointerCapture(event.pointerId);
  const now = performance.now();
  const deltaSeconds = Math.max((now - pointer.lastTime) / 1000, .008);
  yawVelocity = clamp((event.clientX - pointer.lastX) * .18 / deltaSeconds, -75, 75);
  pitchVelocity = clamp(-(event.clientY - pointer.lastY) * .18 / deltaSeconds, -60, 60);
  yaw = pointer.yaw + dx * .18;
  pitch = clamp(pointer.pitch - dy * .18, -60, 60);
  pointer.lastX = event.clientX;
  pointer.lastY = event.clientY;
  pointer.lastTime = now;
  hoverIndex = -1;
  requestRender();
});
addEventListener('pointerup', event => {
  if (!pointer || pointer.id !== event.pointerId) return;
  const dragged = pointer.moved;
  if (portal.hasPointerCapture(event.pointerId)) portal.releasePointerCapture(event.pointerId);
  pointer = null;
  requestRender();
  if (dragged) {
    clearDragClick();
    pendingDragClick = event => {
      clearDragClick();
      if (event.detail === 0) return;
      event.preventDefault();
      event.stopPropagation();
    };
    portal.addEventListener('click', pendingDragClick, {capture: true, once: true});
  }
});
addEventListener('pointercancel', cancelDrag);
portal.addEventListener('lostpointercapture', event => {
  if (pointer?.id === event.pointerId) cancelDrag();
});
collection.addEventListener('focusin', requestRender);
collection.addEventListener('focusout', requestRender);

function rememberGallery() {
  try { sessionStorage.setItem('vagus-gallery-position', JSON.stringify({yaw, pitch})); } catch {}
}
document.addEventListener('click', event => {
  if (event.target.closest?.('a[href]') && progress >= .999) rememberGallery();
});
addEventListener('pagehide', rememberGallery);
addEventListener('pageshow', event => {
  if (event.persisted) {
    try { userMotionOff = sessionStorage.getItem('vagus-motion-off') === '1'; } catch {}
    setMotion(userMotionOff);
  }
  if (location.hash === '#gallery' && selected < 0) requestAnimationFrame(() => moveTo(1, false));
});
measure();
document.body.classList.toggle('motion-on', !motionOff);
if (motionOff) setMotion(true);
else if (location.hash && location.hash !== '#home') {
  try {
    const pose = JSON.parse(sessionStorage.getItem('vagus-gallery-position'));
    if (Number.isFinite(pose?.yaw) && Number.isFinite(pose?.pitch)) { yaw = pose.yaw; pitch = clamp(pose.pitch, -60, 60); }
  } catch {}
  rotationPaused = true;
  moveTo(1, false);
}
requestRender();
// Optional libraries enhance the scene after the working native entry is mounted.
import('./vendor/gsap/loader.mjs').then(({gsap, ScrollTrigger}) => {
  entryTimeline = createEntryTimeline(gsap);
  scrollDriver = ScrollTrigger.create({
    start: 0,
    end: () => Math.max(1, layout.scrollDistance),
    onUpdate: requestRender,
    onRefresh: requestRender,
    invalidateOnRefresh: true
  });
  experience.dataset.motionEngine = 'gsap';
  requestRender();
}).catch(error => {
  experience.dataset.motionEngine = 'native';
  experience.dataset.motionError = error.message;
});
