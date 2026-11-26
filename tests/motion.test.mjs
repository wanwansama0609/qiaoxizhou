import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import { builtAppScript } from './built-app.mjs';

const wait = (ms = 70) => new Promise(resolve => setTimeout(resolve, ms));

async function openMotionPage({ reduced = false, fine = true } = {}) {
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  const script = html.match(/src="(\/assets\/[^\"]+\.js)"/)[1];
  const errors = [];
  const console = new VirtualConsole();
  console.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM('<html><head></head><body><div id="root"></div></body></html>', {
    url: 'http://localhost:5173/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: console,
  });
  const w = dom.window;
  const preferences = { reduced, fine };
  const media = new Map();
  const matches = query => query.includes('prefers-reduced-motion') ? preferences.reduced : query.includes('pointer: fine') ? preferences.fine : query.includes('pointer: coarse') ? !preferences.fine : false;
  w.matchMedia = query => {
    if (!media.has(query)) {
      const listeners = new Set();
      media.set(query, { media: query, get matches() { return matches(query); }, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn), addListener: fn => listeners.add(fn), removeListener: fn => listeners.delete(fn), listeners });
    }
    return media.get(query);
  };
  const changePreferences = update => {
    Object.assign(preferences, update);
    for (const query of media.values()) for (const listener of [...query.listeners]) listener({ media: query.media, matches: query.matches });
  };
  w.fetch = async () => ({ ok: true, json: async () => JSON.parse(readFileSync(new URL('../public/content/project-media.json', import.meta.url), 'utf8')) });
  w.scrollTo = (x, y) => {
    w.scrollX = w.pageXOffset = typeof x === 'object' ? x.left || 0 : x || 0;
    w.scrollY = w.pageYOffset = typeof x === 'object' ? x.top || 0 : y || 0;
    w.document.documentElement.scrollTop = w.scrollY;
    w.document.body.scrollTop = w.scrollY;
  };
  Object.defineProperty(w, 'innerHeight', { value: 800, configurable: true });
  Object.defineProperty(w.document.documentElement, 'scrollHeight', { value: 6000, configurable: true });
  Object.defineProperty(w.document.documentElement, 'clientHeight', { value: 800, configurable: true });
  Object.defineProperty(w.document.body, 'scrollHeight', { value: 6000, configurable: true });
  Object.defineProperty(w.document.body, 'offsetHeight', { value: 6000, configurable: true });
  w.IntersectionObserver = class { constructor(callback) { this.callback = callback; } observe(target) { this.callback([{ target, isIntersecting: true }]); } disconnect() {} };
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  const rect = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} });
  w.HTMLElement.prototype.getBoundingClientRect = function () {
    if (this.classList.contains('hero-project-motion')) return rect(100, 100, 400, 500);
    if (this.classList.contains('skill-card')) return rect(150, 200, 300, 300);
    if (this.classList.contains('motion-reveal')) return rect(0, 1200 - w.scrollY, 600, 80);
    return rect(0, 0, 600, 80);
  };
  let orientationRequests = 0;
  w.DeviceOrientationEvent = { requestPermission() { orientationRequests++; return Promise.resolve('granted'); } };
  w.eval(await builtAppScript());
  await wait(120);
  if (fine && !reduced) {
    const deadline = Date.now() + 1500;
    while (!w.document.querySelector('.tilted-card__body')?.style.transform && Date.now() < deadline) await wait(20);
  }
  const pointer = (target, type, x, y, pointerType = 'mouse') => {
    const event = new w.MouseEvent(type, { bubbles: true, clientX: x, clientY: y });
    Object.defineProperty(event, 'pointerType', { value: pointerType });
    target.dispatchEvent(event);
  };
  return { dom, w, document: w.document, errors, changePreferences, pointer, orientationRequests: () => orientationRequests };
}

test('React Bits tilt, spotlight and scroll reveal work while preserving native controls', async () => {
  const page = await openMotionPage();
  const { document, w, pointer, changePreferences, errors, dom } = page;
  try {
    const hero = document.querySelector('.hero-project-motion');
    const body = hero.querySelector('.tilted-card__body');
    const button = hero.querySelector('button.hero-project');
    assert.ok(button, 'The original keyboard-accessible button remains');
    assert.equal(hero.getAttribute('role'), null, 'No nested button role');
    pointer(button, 'pointermove', 465, 170);
    await wait(350);
    const tilt = body.style.transform.match(/rotateX\(([-\d.]+)deg\) rotateY\(([-\d.]+)deg\)/);
    assert.ok(tilt, body.style.transform);
    assert.ok(Math.abs(Number(tilt[1])) > 0.1 && Math.abs(Number(tilt[1])) < 4.5);
    assert.ok(Math.abs(Number(tilt[2])) > 0.1 && Math.abs(Number(tilt[2])) < 4.5);
    const card = document.querySelector('.skill-card');
    pointer(card, 'pointermove', 230, 260);
    await wait(220);
    assert.ok(Number(card.querySelector('.spotlight-card__light').style.opacity) > 0);
    assert.ok(Number(card.querySelector('.spotlight-card__light').style.opacity) <= 0.1);
    const gameCover = document.querySelector('[data-game-id="cs2"] .favorite-game-art');
    assert.ok(gameCover.querySelector('img[src="/media/games/cs2-thumb.webp"]'));
    pointer(gameCover, 'pointerenter', 200, 240);
    await wait(180);
    assert.ok(Number(gameCover.querySelector('.glare-hover__glare').style.opacity) > 0, 'Favorite game covers have the same hover sheen as project covers');
    w.scrollTo(0, 750); w.document.dispatchEvent(new w.Event('scroll', { bubbles: true }));
    await wait(750);
    const revealed = document.querySelector('.motion-reveal');
    assert.equal(Number(revealed.style.opacity || 1), 1, JSON.stringify({ scrollY: w.scrollY, top: revealed.getBoundingClientRect().top, triggers: w.gsap?.core.globals().ScrollTrigger?.getAll().map(trigger => ({ start: trigger.start, end: trigger.end, scroll: trigger.scroll(), progress: trigger.progress })) }));
    assert.notEqual(revealed.style.visibility, 'hidden');
    const gameGroups = [...document.querySelectorAll('.favorite-game-group')];
    assert.equal(gameGroups.length, 7);
    const deadline = Date.now() + 1500;
    while (gameGroups.some(group => Number(group.style.opacity || 1) < 1) && Date.now() < deadline) await wait(20);
    for (const group of gameGroups) assert.equal(Number(group.style.opacity || 1), 1);
    button.focus(); button.click(); await wait();
    assert.ok(document.querySelector('dialog[open]'));
    document.querySelector('dialog .icon-button').click(); await wait();
    assert.equal(document.activeElement, button);
    changePreferences({ reduced: true }); await wait();
    pointer(button, 'pointermove', 490, 190); pointer(card, 'pointermove', 200, 230); await wait();
    assert.equal(body.style.transform, '');
    assert.equal(card.querySelector('.spotlight-card__light').style.opacity, '0');
    assert.equal(gameCover.querySelector('.glare-hover__glare').style.opacity, '0');
    for (const item of document.querySelectorAll('.motion-reveal')) {
      assert.notEqual(item.style.visibility, 'hidden');
      assert.equal(Number(item.style.opacity || 1), 1);
    }
    assert.equal(page.orientationRequests(), 0);
    assert.deepEqual(errors, []);
  } finally { dom.window.close(); }
});

test('touch and reduced-motion modes keep content and project clicks available', async () => {
  for (const settings of [{ fine: false }, { reduced: true }]) {
    const page = await openMotionPage(settings);
    const { document, pointer, errors, dom } = page;
    try {
      const button = document.querySelector('.hero-project');
      const body = document.querySelector('.tilted-card__body');
      pointer(button, 'pointerdown', 250, 250, 'touch');
      pointer(button, 'pointermove', 290, 300, 'touch'); await wait();
      assert.equal(body.style.transform, '');
      button.click(); await wait();
      assert.ok(document.querySelector('dialog[open]'));
      assert.equal(document.querySelectorAll('.spotlight-card.skill-card').length, 6);
      assert.equal(page.orientationRequests(), 0);
      assert.deepEqual(errors, []);
    } finally { dom.window.close(); }
  }
});
