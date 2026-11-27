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
    while ((!w.document.querySelector('.tilted-card__body')?.style.transform || !w.document.querySelector('[data-target-cursor-style]')) && Date.now() < deadline) await wait(20);
  }
  const pointer = (target, type, x, y, pointerType = 'mouse') => {
    const event = new w.MouseEvent(type, { bubbles: true, clientX: x, clientY: y });
    Object.defineProperty(event, 'pointerType', { value: pointerType });
    target.dispatchEvent(event);
  };
  return { dom, w, document: w.document, errors, changePreferences, pointer, orientationRequests: () => orientationRequests };
}

test('hero highlight, spotlight and scroll reveal work while preserving native controls', async () => {
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
    assert.match(body.style.transform, /rotateX\(0(?:\.0+)?deg\) rotateY\(0(?:\.0+)?deg\) scale\(1(?:\.0+)?\)/);
    assert.ok(Number(body.style.getPropertyValue('--tc-glare')) > 0, 'Hover feedback remains visible without moving the artwork');
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

test('enhanced cursor locks to links, pulses on click and restores native input safely', async () => {
  const { document, w, pointer, changePreferences, errors, dom } = await openMotionPage();
  const cursorRule = () => document.querySelector('[data-target-cursor-style]')?.textContent || '';
  try {
    const cursor = document.querySelector('.target-cursor');
    assert.ok(cursor);
    assert.equal(cursor.getAttribute('aria-hidden'), 'true');
    assert.equal(cursorRule(), '', 'The system cursor remains until the mouse enters');
    pointer(document.body, 'pointermove', 80, 90);
    await wait(150);
    assert.match(cursorRule(), /cursor: none/);
    assert.ok(Number(cursor.style.opacity) > 0);
    assert.match(cursor.querySelector('.target-cursor__dot').style.transform, /80px, 90px/);

    const link = document.querySelector('.main-nav a');
    pointer(link, 'pointermove', 80, 30);
    await wait(600);
    assert.equal(cursor.dataset.locked, 'true');
    const corners = [...cursor.querySelectorAll('.target-cursor__corner')];
    const x = corner => Number(corner.style.transform.match(/translate3d\(([-\d.]+)px/)[1]);
    assert.ok(Math.abs(x(corners[1]) - x(corners[0])) > 580, 'Corners frame the link');
    const ripple = cursor.querySelector('.target-cursor__ripple');
    assert.equal(ripple.classList.contains('is-active'), false);
    pointer(link, 'pointerdown', 80, 30);
    assert.equal(ripple.classList.contains('is-active'), true);
    assert.equal(ripple.style.left, '80px');
    assert.equal(ripple.style.top, '30px');
    pointer(link, 'pointerup', 80, 30);

    pointer(document.querySelector('.showcase-slider'), 'pointermove', 100, 40);
    assert.equal(cursorRule(), '', 'The slider retains its native drag cursor');
    assert.equal(ripple.classList.contains('is-active'), false);
    pointer(link, 'pointermove', 80, 30);
    w.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Tab' }));
    assert.equal(cursorRule(), '');
    assert.equal(cursor.style.opacity, '0');
    pointer(link, 'pointermove', 80, 30);
    w.dispatchEvent(new w.Event('blur'));
    assert.equal(cursorRule(), '');
    assert.equal(cursor.style.opacity, '0');
    pointer(link, 'pointermove', 80, 30);
    pointer(link, 'pointerdown', 80, 30, 'touch');
    assert.equal(cursorRule(), '', 'Hybrid touch does not leave an invisible native cursor');

    pointer(link, 'pointermove', 80, 30);
    document.querySelector('.hero-project').click();
    await wait();
    const dialog = document.querySelector('dialog[open]');
    assert.ok(dialog);
    const modalCursor = dialog.querySelector('.target-cursor');
    assert.ok(modalCursor, 'The cursor is rendered in the modal top layer');
    assert.equal(modalCursor.parentElement, dialog);
    assert.equal(document.querySelectorAll('.target-cursor').length, 1);
    const modalLink = dialog.querySelector('.dialog-actions a');
    pointer(modalLink, 'pointermove', 250, 40);
    await wait(150);
    assert.equal(modalCursor.dataset.locked, 'true');
    assert.ok(Number(modalCursor.style.opacity) > 0);
    assert.match(cursorRule(), /data-target-cursor-scope/);
    assert.match(cursorRule(), /::backdrop/);
    assert.doesNotMatch(cursorRule(), /^html/);
    pointer(modalLink, 'pointerdown', 250, 40);
    assert.ok(modalCursor.querySelector('.target-cursor__ripple.is-active'));
    pointer(modalLink, 'pointerup', 250, 40);
    const closeButton = dialog.querySelector('.icon-button');
    pointer(closeButton, 'pointermove', 560, 30);
    assert.equal(modalCursor.dataset.locked, 'true');
    // Retarget in the modal's own scroll context without dropping the cursor.
    document.elementFromPoint = () => closeButton;
    dialog.dispatchEvent(new w.Event('scroll'));
    await wait();
    assert.equal(modalCursor.dataset.locked, 'true');
    closeButton.click();
    await wait();
    assert.equal(document.querySelector('dialog'), null);
    assert.equal(document.querySelector('.target-cursor').parentElement, document.body);
    assert.equal(document.querySelectorAll('.target-cursor').length, 1);
    assert.equal(cursorRule(), '', 'Closing the modal cleans up its cursor-hiding rule');
    assert.equal(document.querySelector('[data-target-cursor-scope]'), null);
    pointer(link, 'pointermove', 80, 30);
    changePreferences({ reduced: true });
    await wait();
    assert.equal(document.querySelector('.target-cursor'), null);
    assert.equal(cursorRule(), '');
    changePreferences({ reduced: false, fine: false });
    await wait();
    assert.equal(document.querySelector('.target-cursor'), null);
    assert.deepEqual(errors, []);
  } finally { dom.window.close(); }
});

test('hero artwork and cursor frame remain still during small pointer movements', async () => {
  const { document, pointer, errors, dom } = await openMotionPage();
  try {
    const anchor = document.querySelector('.hero-project-slot');
    const button = anchor.querySelector('.hero-project');
    const tilt = anchor.querySelector('.tilted-card');
    const body = anchor.querySelector('.tilted-card__body');
    let animatedReads = 0;
    anchor.getBoundingClientRect = () => ({ left: 100, top: 100, width: 400, height: 500 });
    button.getBoundingClientRect = () => {
      animatedReads++;
      return { left: 90 + 10 * Math.sin(animatedReads), top: 80, width: 425, height: 545 };
    };
    pointer(button, 'pointermove', 465, 170);
    await wait(850);
    const cursor = document.querySelector('.target-cursor');
    assert.equal(cursor.dataset.locked, 'true');
    assert.equal(animatedReads, 0, 'Cursor should never chase the transformed card bounds');
    const positions = () => [...cursor.querySelectorAll('.target-cursor__corner')].flatMap(corner => {
      const match = corner.style.transform.match(/translate3d\(([-\d.]+)px, ([-\d.]+)px/);
      return [Number(match[1]), Number(match[2])];
    });
    const settled = positions();
    assert.deepEqual(settled, [91, 91, 509, 91, 509, 609, 91, 609]);
    const fixedTransform = body.style.transform;
    assert.match(fixedTransform, /rotateX\(0(?:\.0+)?deg\) rotateY\(0(?:\.0+)?deg\) scale\(1(?:\.0+)?\)/);
    // Exercise the reported trigger: tiny movements, not just a stationary hover.
    for (const [dx, dy] of [[1, 0], [2, 1], [1, 2], [-1, 1], [0, -1], [1, 0]]) {
      pointer(button, 'pointermove', 465 + dx, 170 + dy);
      await wait(50);
      assert.equal(body.style.transform, fixedTransform, 'Small movements must not rotate or scale the card');
      assert.deepEqual(positions(), settled, 'The cursor frame must stay attached to the card');
    }
    // The hit element can change from artwork to its stable parent at a tilted edge.
    for (const hit of [tilt, anchor, button.querySelector('img'), button]) {
      pointer(hit, 'pointermove', 465, 170);
      await wait();
      assert.equal(cursor.dataset.locked, 'true');
      assert.deepEqual(positions(), settled, 'Hovering within the card must not restart the lock');
    }
    assert.equal(body.style.transform, fixedTransform);
    assert.equal(animatedReads, 0);
    assert.deepEqual(errors, []);
  } finally { dom.window.close(); }
});

test('carousel side cards keep a compact cursor and release old selection frames', async () => {
  const { document, pointer, errors, dom } = await openMotionPage();
  try {
    const stage = document.querySelector('.showcase-stage');
    stage.focus();
    document.querySelector('[data-preview-id="potion-shop-sign"]').click();
    await wait();
    const cursor = document.querySelector('.target-cursor');
    const current = document.querySelector('.showcase-card.is-current');
    pointer(current, 'pointermove', 350, 250);
    await wait(150);
    assert.equal(cursor.dataset.locked, 'true', 'The center card retains the full frame');

    const left = document.querySelector('.showcase-card[data-project-id="neon-alley"]');
    const right = document.querySelector('.showcase-card[data-project-id="sci-fi-blaster"]');
    for (const card of [left, right]) {
      // The complete side card extends outside the visible carousel viewport.
      card.getBoundingClientRect = () => ({ left: -300, top: 200, width: 860, height: 600 });
      pointer(card.querySelector('img'), 'pointermove', 60, 380);
      await wait(550);
      assert.equal(cursor.dataset.locked, 'false');
      assert.ok(Number(cursor.style.opacity) > 0, 'The custom cursor remains visible');
      for (const corner of cursor.querySelectorAll('.target-cursor__corner')) {
        const [, x, y] = corner.style.transform.match(/translate3d\(([-\d.]+)px, ([-\d.]+)px/);
        assert.ok(Math.abs(Number(x) - 60) < 50 && Math.abs(Number(y) - 380) < 50, 'Corners stay near the pointer instead of enclosing a clipped card');
      }
    }

    pointer(current, 'pointermove', 350, 250);
    await wait();
    assert.equal(cursor.dataset.locked, 'true');
    document.querySelector('[data-preview-id="sci-fi-blaster"]').click();
    await wait();
    assert.equal(cursor.dataset.locked, 'false', 'Demoting a selected card releases the frame without needing mouse movement');
    pointer(document.querySelector('.showcase-card.is-current'), 'pointermove', 350, 250);
    await wait();
    assert.equal(cursor.dataset.locked, 'true');
    assert.deepEqual(errors, []);
  } finally { dom.window.close(); }
});

test('touch and reduced-motion modes keep content and project clicks available', async () => {
  for (const settings of [{ fine: false }, { reduced: true }]) {
    const page = await openMotionPage(settings);
    const { document, pointer, errors, dom } = page;
    try {
      assert.equal(document.querySelector('.target-cursor'), null);
      assert.equal(document.querySelector('[data-target-cursor-style]'), null);
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
