import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import vm from 'node:vm';

// Use the neighboring site controller after this file is installed in site/tests.
const installedController = new URL('../gallery-entry.mjs', import.meta.url);
const reviewController = pathToFileURL('D:/AI-Data/Projects/ChatGPT/AI产品/design-lab/vagus-site-finish-2026-11-12/site-v4/gallery-entry.mjs');
const controllerURL = existsSync(installedController) ? installedController : reviewController;
const {clamp, spherePoints} = await import(new URL('./archive-motion.mjs', controllerURL));
const {dampedMotion} = await import(new URL('./globe-motion.mjs', controllerURL));
const controllerSource = readFileSync(controllerURL, 'utf8').replace(/^import .*;\r?\n/gm, '');

class EventTargetStub {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, callback, options = {}) {
    const normalized = typeof options === 'boolean' ? {capture: options} : options;
    const records = this.listeners.get(type) || [];
    records.push({callback, capture: Boolean(normalized.capture), once: Boolean(normalized.once)});
    this.listeners.set(type, records);
  }

  removeEventListener(type, callback) {
    const records = this.listeners.get(type) || [];
    this.listeners.set(type, records.filter(record => record.callback !== callback));
  }

  dispatch(type, event = {}, capture = false) {
    const records = [...(this.listeners.get(type) || [])];
    for (const record of records) {
      if (record.capture !== capture) continue;
      if (record.once) this.removeEventListener(type, record.callback);
      record.callback(event);
    }
  }
}

class ElementStub extends EventTargetStub {
  constructor(tagName, document) {
    super();
    this.tagName = tagName;
    this.ownerDocument = document;
    this.children = [];
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    this.hidden = false;
    this.inert = false;
    this.clientWidth = 1280;
    this.clientHeight = 762;
    this.capturedPointers = new Set();
    const classes = new Set();
    this.classList = {
      contains: name => classes.has(name),
      toggle(name, enabled) {
        const next = enabled === undefined ? !classes.has(name) : Boolean(enabled);
        if (next) classes.add(name);
        else classes.delete(name);
        return next;
      }
    };
  }

  append(...children) {
    this.children.push(...children);
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  querySelector(selector) {
    return this.children.find(child => child.tagName === selector) || null;
  }

  querySelectorAll(selector) {
    return this.children.filter(child => '.' + child.className === selector);
  }

  contains(element) {
    return this === element || this.children.some(child => child.contains?.(element));
  }

  matches() {
    return false;
  }

  closest() {
    return null;
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  hasPointerCapture(id) {
    return this.capturedPointers.has(id);
  }

  setPointerCapture(id) {
    this.capturedPointers.add(id);
  }

  releasePointerCapture(id) {
    this.capturedPointers.delete(id);
  }
}

function createControllerHarness(hash = '#gallery') {
  const document = new EventTargetStub();
  const windowEvents = new EventTargetStub();
  const elements = new Map();
  const storage = new Map();
  const frames = new Map();
  let clock = 0;
  let nextFrameId = 0;

  function element(selector) {
    if (!elements.has(selector)) elements.set(selector, new ElementStub('div', document));
    return elements.get(selector);
  }

  document.querySelector = element;
  document.createElement = tagName => new ElementStub(tagName, document);
  document.documentElement = {scrollHeight: 1560};
  document.body = new ElementStub('body', document);
  document.activeElement = document.body;
  document.hidden = false;
  const reduced = Object.assign(new EventTargetStub(), {matches: false});
  const finePointer = Object.assign(new EventTargetStub(), {matches: true});

  const context = {
    document,
    history: {},
    location: {hash},
    innerHeight: 800,
    scrollY: 0,
    performance: {now: () => clock},
    matchMedia: query => query.includes('reduced-motion') ? reduced : finePointer,
    sessionStorage: {
      getItem: key => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value)
    },
    addEventListener: windowEvents.addEventListener.bind(windowEvents),
    requestAnimationFrame(callback) {
      const id = ++nextFrameId;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame: id => frames.delete(id),
    scrollTo: (x, y) => { context.scrollY = y; },
    setTimeout,
    clearTimeout,
    clamp,
    spherePoints,
    dampedMotion
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(controllerSource, context, {filename: controllerURL.pathname});

  function render(elapsed = 16) {
    clock += elapsed;
    const pending = [...frames.values()];
    frames.clear();
    for (const callback of pending) callback(clock);
  }

  const portal = element('#reflection-window');
  const experience = element('#experience');
  const painting = element('#collection').children.find(child => child.className === 'painting');

  function pointer(type, overrides = {}) {
    const event = {
      pointerId: 1,
      button: 0,
      isPrimary: true,
      clientX: 100,
      clientY: 100,
      ...overrides
    };
    const target = type === 'pointerup' || type === 'pointercancel' ? windowEvents : portal;
    target.dispatch(type, event);
    return event;
  }

  function clickPainting(overrides = {}) {
    const event = {
      pointerId: 1,
      button: 0,
      detail: 1,
      target: painting,
      defaultPrevented: false,
      propagationStopped: false,
      preventDefault() { this.defaultPrevented = true; },
      stopPropagation() { this.propagationStopped = true; },
      ...overrides
    };
    // The portal's capture listener runs before the painting's own click handler.
    portal.dispatch('click', event, true);
    if (!event.propagationStopped) painting.dispatch('click', event);
    if (!event.propagationStopped) document.dispatch('click', event);
    render(1000);
    return event;
  }

  function drag() {
    pointer('pointerdown');
    clock += 20;
    pointer('pointermove', {clientX: 150});
    pointer('pointerup', {clientX: 150});
    render();
  }

  render();
  assert.equal(experience.dataset.state, hash === '#gallery' ? 'gallery' : 'studio');
  return {pointer, clickPainting, drag, render, portal, experience, document, element, windowEvents, context, painting};
}

test('secondary mouse buttons cannot start a gallery drag', () => {
  const gallery = createControllerHarness();
  gallery.pointer('pointerdown', {button: 2});
  gallery.pointer('pointermove', {button: 2, clientX: 160});
  gallery.render();
  assert.equal(gallery.experience.dataset.yaw, '0.0000');
  assert.notEqual(gallery.experience.dataset.rotation, 'dragging');
  assert.equal(gallery.portal.hasPointerCapture(1), false);
});

test('a non-primary pointer cannot start a gallery drag', () => {
  const gallery = createControllerHarness();
  gallery.pointer('pointerdown', {pointerId: 2, isPrimary: false});
  gallery.pointer('pointermove', {pointerId: 2, isPrimary: false, clientX: 160});
  gallery.render();
  assert.equal(gallery.experience.dataset.yaw, '0.0000');
  assert.notEqual(gallery.experience.dataset.rotation, 'dragging');
});

test('a competing pointerdown cannot replace the active drag', () => {
  const gallery = createControllerHarness();
  gallery.pointer('pointerdown');
  gallery.pointer('pointerdown', {pointerId: 2, clientX: 500});
  gallery.pointer('pointermove', {pointerId: 2, clientX: 600});
  gallery.render();
  assert.equal(gallery.experience.dataset.yaw, '0.0000');
  gallery.pointer('pointermove', {clientX: 150});
  gallery.render();
  assert.equal(gallery.experience.dataset.yaw, '9.0000');
  assert.equal(gallery.portal.hasPointerCapture(1), true);
  assert.equal(gallery.portal.hasPointerCapture(2), false);
});

test('a drag still suppresses its immediate compatibility click', () => {
  const gallery = createControllerHarness();
  gallery.drag();
  const click = gallery.clickPainting();
  assert.equal(click.defaultPrevented, true);
  assert.equal(gallery.experience.dataset.state, 'gallery');
});

test('a drag without a compatibility click cannot swallow a later primary gesture', () => {
  const gallery = createControllerHarness();
  gallery.drag();
  gallery.pointer('pointerdown', {pointerId: 3});
  gallery.pointer('pointerup', {pointerId: 3});
  const click = gallery.clickPainting({pointerId: 3});
  assert.equal(click.defaultPrevented, false);
  assert.equal(gallery.experience.dataset.state, 'reading');
});

test('pending drag suppression lets a keyboard activation reach its painting', () => {
  const gallery = createControllerHarness();
  gallery.drag();
  const click = gallery.clickPainting({detail: 0, pointerId: -1});
  assert.equal(click.defaultPrevented, false);
  assert.equal(gallery.experience.dataset.state, 'reading');
});

test('pointer cancellation clears pending drag-click suppression', () => {
  const gallery = createControllerHarness();
  gallery.drag();
  gallery.pointer('pointercancel');
  const click = gallery.clickPainting();
  assert.equal(click.defaultPrevented, false);
  assert.equal(gallery.experience.dataset.state, 'reading');
});

test('resize preserves a new native scroll position before the next render', () => {
  const gallery = createControllerHarness();
  gallery.context.scrollY = 380;
  gallery.document.documentElement.scrollHeight = 2320;
  gallery.windowEvents.dispatch('resize');
  assert.equal(gallery.context.scrollY, 760);
});

test('keyboard entry focuses a visible project link', () => {
  const gallery = createControllerHarness('#home');
  gallery.element('#invite').focus();
  gallery.element('#invite').dispatch('click', {detail: 0});
  gallery.render();
  assert.equal(gallery.experience.dataset.state, 'gallery');
  assert.equal(gallery.document.activeElement, gallery.element('#project-list').querySelector('a'));
});

test('Escape returns focus from the flat directory to its visible trigger', () => {
  const gallery = createControllerHarness();
  gallery.element('#flat-button').dispatch('click');
  gallery.render();
  assert.equal(gallery.document.activeElement, gallery.element('#flat-directory').querySelector('a'));
  gallery.windowEvents.dispatch('keydown', {key: 'Escape'});
  gallery.render();
  assert.equal(gallery.document.activeElement, gallery.element('#flat-button'));
});

test('returning from a hidden tab focuses the completed reading state', () => {
  const gallery = createControllerHarness();
  gallery.painting.focus();
  gallery.painting.dispatch('click', {detail: 1});
  gallery.render(600);
  gallery.document.hidden = true;
  gallery.document.dispatch('visibilitychange');
  gallery.document.hidden = false;
  gallery.document.dispatch('visibilitychange');
  gallery.render();
  assert.equal(gallery.experience.dataset.state, 'reading');
  assert.equal(gallery.document.activeElement, gallery.element('#return-gallery'));
});
