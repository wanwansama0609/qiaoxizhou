import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import { builtAppScript } from './built-app.mjs';

const wait = (ms = 45) => new Promise(resolve => setTimeout(resolve, ms));
async function until(check) {
  const deadline = Date.now() + 1500;
  while (!check() && Date.now() < deadline) await wait(20);
}
const order = ['one-more-move', 'neon-alley', 'potion-shop-sign', 'sci-fi-blaster', 'stylized-props', 'time-puzzle', 'infiltration', 'cs2-valorant', 'valorant-mobile', 'character-animation', 'character-rigging', 'elemental-magic', 'water-fire-monsters'];

async function setup() {
  const errors = []; const console = new VirtualConsole(); console.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM('<html><head></head><body><div id="root"></div></body></html>', { url: 'http://localhost:5173/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: console });
  const w = dom.window; const document = w.document;
  const preferences = { reduced: false }; const queries = new Map(); const observers = [];
  w.matchMedia = query => {
    if (!queries.has(query)) {
      const listeners = new Set();
      queries.set(query, { get matches() { return query.includes('prefers-reduced') ? preferences.reduced : query.includes('pointer: fine'); }, media: query, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn), listeners });
    }
    return queries.get(query);
  };
  w.fetch = async () => ({ ok: true, json: async () => JSON.parse(readFileSync(new URL('../public/content/project-media.json', import.meta.url), 'utf8')) });
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollTo = function ({ left }) { this.scrollLeft = left; };
  w.ResizeObserver = class { observe() {} disconnect() {} };
  w.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; }
    observe(target) { this.target = target; observers.push(this); this.callback([{ target, isIntersecting: !target.classList.contains('project-showcase'), intersectionRatio: target.classList.contains('project-showcase') ? 0 : 1 }]); }
    disconnect() { this.target = null; }
  };
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  // Advance only the reel clock explicitly. GSAP and pointer animations use real RAF.
  const nativeTimeout = w.setTimeout.bind(w); const nativeClear = w.clearTimeout.bind(w); const reelTimers = new Map(); let nextTimer = -1;
  w.setTimeout = (callback, delay, ...args) => {
    if (delay > 4000 && delay <= 5200) { const id = nextTimer--; reelTimers.set(id, { callback, args }); return id; }
    return nativeTimeout(callback, delay, ...args);
  };
  w.clearTimeout = id => { if (!reelTimers.delete(id)) nativeClear(id); };
  w.eval(await builtAppScript()); await wait(100);
  const root = () => document.querySelector('.project-showcase');
  await until(() => root() && observers.some(observer => observer.target === root()));
  const inView = visible => { for (const observer of observers) if (observer.target === root()) observer.callback([{ target: observer.target, isIntersecting: visible, intersectionRatio: visible ? 1 : 0 }]); };
  const tick = async () => { await until(() => reelTimers.size === 1); assert.equal(reelTimers.size, 1, `Exactly one autoplay clock: ${JSON.stringify(root()?.dataset)}`); const before = root().dataset.activeProject; const [id, timer] = [...reelTimers][0]; reelTimers.delete(id); timer.callback(...timer.args); await until(() => root().dataset.activeProject !== before); };
  const reduced = value => { preferences.reduced = value; for (const query of queries.values()) for (const listener of query.listeners) listener({ matches: query.matches, media: query.media }); };
  const pointer = (target, type, x = 0, y = 0, pointerType = 'mouse') => { const event = new w.MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0, relatedTarget: type === 'pointerout' ? document.body : null }); Object.defineProperty(event, 'pointerType', { value: pointerType }); target.dispatchEvent(event); };
  return { dom, w, document, errors, root, reelTimers, inView, tick, reduced, pointer };
}

test('all-project reel previews every project in order, loops, and pauses appropriately', async () => {
  const p = await setup(); const { document, root, reelTimers, inView, tick, pointer, w } = p;
  try {
    assert.equal(document.querySelector('.edit-projects'), null);
    assert.equal(document.querySelector('.showcase-play, .showcase-arrows'), null);
    const slider = document.querySelector('.showcase-slider');
    assert.equal(slider.type, 'range');
    assert.equal(slider.max, String(order.length - 1));
    assert.ok(slider.compareDocumentPosition(document.querySelector('.showcase-stage')) & w.Node.DOCUMENT_POSITION_FOLLOWING, 'Slider is above the preview');
    assert.equal(root().dataset.activeProject, order[0]);
    assert.equal(reelTimers.size, 0, 'Do not play outside the viewport');
    inView(true); await wait();
    for (let i = 1; i <= order.length; i++) { await tick(); assert.equal(root().dataset.activeProject, order[i % order.length]); assert.equal(slider.value, String(i % order.length)); }
    pointer(root(), 'pointerover'); await wait(); assert.equal(reelTimers.size, 0, 'Hover pauses');
    pointer(root(), 'pointerout'); await wait(); assert.equal(reelTimers.size, 1);
    const thumb = document.querySelector('[data-preview-id="neon-alley"]'); thumb.focus(); thumb.click(); await wait();
    assert.equal(root().dataset.activeProject, 'neon-alley'); assert.equal(reelTimers.size, 0, 'Keyboard focus pauses');
    slider.focus();
    for (const index of [order.length - 1, 0, 1]) {
      Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set.call(slider, String(index));
      slider.dispatchEvent(new w.Event('input', { bubbles: true }));
      slider.dispatchEvent(new w.Event('change', { bubbles: true }));
      await wait();
      assert.equal(root().dataset.activeProject, order[index]);
      assert.equal(document.querySelector('.showcase-thumbnails .is-current').dataset.previewId, order[index]);
      assert.equal(reelTimers.size, 0, 'Dragging a focused slider pauses autoplay');
    }
    document.querySelector('.hero-project').focus(); await until(() => root().dataset.playing === 'true'); assert.equal(root().dataset.playing, 'true');
    document.querySelector('.showcase-card.is-current').click(); await wait();
    assert.equal(document.querySelector('#dialog-title').textContent, '霓虹巷道：赛博朋克场景'); assert.equal(reelTimers.size, 0, 'Modal pauses');
    document.querySelector('dialog .icon-button').click(); await wait();
    document.querySelector('.hero-project').focus(); await wait();
    Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new w.Event('visibilitychange')); await wait(); assert.equal(reelTimers.size, 0);
    Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new w.Event('visibilitychange')); await wait(); assert.equal(reelTimers.size, 1);
    inView(false); await wait(); assert.equal(reelTimers.size, 0);
    assert.deepEqual(p.errors, []);
  } finally { p.dom.window.close(); }
});

test('manual preview, swipe, reduced motion and category switching retain working project links', async () => {
  const p = await setup(); const { document, root, pointer, w } = p;
  try {
    p.inView(true); await wait(); p.reduced(true); await wait();
    assert.equal(p.reelTimers.size, 0); assert.equal(document.querySelector('.showcase-slider').disabled, false);
    const stage = document.querySelector('.showcase-stage'); stage.focus();
    stage.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'End', bubbles: true })); await wait(); assert.equal(root().dataset.activeProject, order.at(-1));
    stage.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); await wait(); assert.equal(root().dataset.activeProject, order[0]);
    pointer(stage, 'pointerdown', 500, 200, 'touch'); pointer(stage, 'pointerup', 300, 200, 'touch'); await wait(); assert.equal(root().dataset.activeProject, order[1]);
    document.querySelector('.showcase-card.is-current').click(); await wait(); assert.equal(document.querySelector('dialog'), null, 'A swipe must not also open a project');
    await wait(310); document.querySelector('.showcase-card.is-current').click(); await wait(); assert.ok(document.querySelector('dialog[open]'));
    document.querySelector('dialog .icon-button').click(); await wait();
    document.querySelector('[data-category="modeling"]').click(); await wait(); assert.equal(root(), null); assert.equal(document.querySelectorAll('.project-card').length, 5); assert.ok(document.querySelector('.gallery-scrollbar'));
    document.querySelector('[data-category="all"]').click(); await wait(); assert.ok(root()); assert.equal(document.querySelectorAll('.showcase-thumbnails button').length, 13);
    assert.deepEqual(p.errors, []);
  } finally { p.dom.window.close(); }
});
