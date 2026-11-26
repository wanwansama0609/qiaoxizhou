import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import { projects, profile, skills, categories } from '../src/content.js';
import { projectTitlesZh, translateTerm } from '../src/localization.js';
import { favoriteGames } from '../src/favoriteGames.js';
import { builtAppScript } from './built-app.mjs';

// DOM integration checks exercise the built app. Layout needs separate browser
// verification; native dialog APIs are mocked here.
test('Portfolio interactions and content', async t => {
  const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  const scriptPath = html.match(/src="(\/assets\/[^\"]+\.js)"/)[1];
  const errors = [];
  const console = new VirtualConsole();
  console.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM('<!doctype html><html><head><meta name="description" content=""></head><body><div id="root"></div></body></html>', {
    url: 'http://localhost:5173', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: console,
  });
  const { window } = dom;
  const { document } = window;
  let clipboard = '';
  const media = JSON.parse(readFileSync(new URL('../public/content/project-media.json', import.meta.url), 'utf8'));
  window.fetch = async () => ({ ok: true, json: async () => media });
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  // ScrollTrigger saves/restores viewport position during its measurements.
  window.scrollTo = (x, y) => {
    window.scrollX = window.pageXOffset = typeof x === 'object' ? x.left || 0 : x || 0;
    window.scrollY = window.pageYOffset = typeof x === 'object' ? x.top || 0 : y || 0;
    document.documentElement.scrollTop = window.scrollY;
  };
  window.IntersectionObserver = class { observe() {} disconnect() {} };
  window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  // Simulate a three-card desktop viewport; verify navigation separately from layout.
  Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', { get() { return this.classList.contains('project-track') ? 1200 : 0; } });
  Object.defineProperty(window.HTMLElement.prototype, 'scrollWidth', { get() { return this.classList.contains('project-track') ? Math.max(1200, this.children.length * (1220 / 3) - 20) : 0; } });
  const originalRect = window.HTMLElement.prototype.getBoundingClientRect;
  window.HTMLElement.prototype.getBoundingClientRect = function () { return this.classList.contains('project-card') ? { width: 1180 / 3 } : originalRect.call(this); };
  window.HTMLElement.prototype.scrollTo = function ({ left }) { this.scrollLeft = Math.max(0, Math.min(left, this.scrollWidth - this.clientWidth)); this.dispatchEvent(new window.Event('scroll')); };
  window.HTMLElement.prototype.scrollBy = function ({ left }) { this.scrollTo({ left: this.scrollLeft + left }); };
  Object.defineProperty(window.navigator, 'clipboard', { value: { async writeText(value) { clipboard = value; } } });
  const wait = async () => new Promise(resolve => setTimeout(resolve, 45));
  const click = async element => { assert.ok(element, 'Element must exist'); element.click(); await wait(); };
  window.eval(await builtAppScript());
  await wait();
  try {
    await t.test('all sections, internal anchors, media and contact destinations exist', () => {
      for (const id of ['home', 'about', 'work', 'approach', 'games', 'contact']) assert.ok(document.getElementById(id));
      assert.ok(document.querySelector('.main-nav a[href="#games"]'));
      for (const a of document.querySelectorAll('a[href^="#"]')) assert.ok(document.querySelector(a.getAttribute('href')), a.getAttribute('href'));
      for (const el of document.querySelectorAll('img, video source')) assert.ok(existsSync(new URL(`../public${el.getAttribute('src')}`, import.meta.url)), el.getAttribute('src'));
      assert.equal(document.querySelector('.contact-email').getAttribute('href'), `mailto:${profile.email}`);
      const socialLinks = document.querySelectorAll('#contact .social-links a');
      assert.equal(socialLinks[0].getAttribute('href'), 'https://www.artstation.com/wanwansama');
      assert.equal(socialLinks[1].getAttribute('href'), 'https://josiez.itch.io/');
      assert.match(socialLinks[2].textContent, /哔哩哔哩（中国的主流视频网站）/);
      assert.equal(document.querySelectorAll('.project-card').length, projects.length);
      assert.equal(projects.length, 13);
      assert.deepEqual(projects.map(project => project.number), projects.map((_, index) => String(index + 1).padStart(2, '0')));
      assert.doesNotMatch(document.querySelector('#work').textContent, /The Last Exhibition|Bounty Chase/);
      assert.equal(media.exhibition, undefined);
      assert.equal(media['bounty-chase'], undefined);
      assert.equal(document.querySelectorAll('.skill-card').length, 6);
      assert.equal(document.querySelector('video'), null);
      assert.equal(document.querySelector('#about .personal-photo').getAttribute('src'), profile.portrait);
      assert.equal(document.querySelector('#about .photo-placeholder'), null);
      assert.ok(document.querySelector('#about .about-grid .experience-list'));
      assert.doesNotMatch(document.body.textContent, /STUDENT|学生|Xihe/);
      assert.match(document.querySelector('#about').textContent, /毕业/);
      assert.equal(document.querySelectorAll('.experience-row').length, 2);
      assert.equal(document.querySelector('.edit-projects'), null, 'Production build hides the editor');
      for (const skill of skills) for (const tool of skill.tools) assert.ok(document.querySelector('.skills-grid').textContent.includes(translateTerm(tool, zh => zh)), tool);
      assert.deepEqual([...document.querySelectorAll('[data-skill="design"] .skill-tools > span')].map(tag => tag.textContent), ['关卡设计', '游戏机制', '叙事设计', '原型开发']);
      assert.deepEqual([...document.querySelectorAll('[data-skill="code"] .skill-tools > span')].map(tag => tag.textContent), ['Python', 'C++']);
      for (const [section, count] of Object.entries({ art: 5, engine: 2, media: 2, language: 3 })) {
        const card = document.querySelector(`[data-skill="${section}"]`);
        assert.equal(card.querySelectorAll('.skill-software-icons img').length, count);
        assert.equal(card.querySelector('.skill-tools'), null, 'Software names are shown as icon tooltips');
        for (const icon of card.querySelectorAll('.project-tool-icon')) {
          assert.equal(icon.tabIndex, 0);
          assert.equal(icon.getAttribute('aria-label'), icon.nextElementSibling.textContent);
        }
      }
    });
    await t.test('favorite games are all visible in compact groups on the portfolio page', () => {
      const groups = {
        competitive: ['cs2', 'valorant', 'apex', 'rainbow-six'],
        cooperative: ['it-takes-two', 'split-fiction', 'portal-2', 'we-were-here'],
        social: ['dread-hunger', 'among-us', 'overcooked-2', 'fall-guys'],
        narrative: ['detroit', 'undertale', 'ace-attorney', 'yangtze-river', 'journey'],
        action: ['black-myth-wukong', 'phantom-blade-zero', 'hades-2', 'titanfall-2'],
        cards: ['balatro', 'tft'],
        sandbox: ['minecraft', 'roco-world', 'yimeng-jianghu'],
      };
      assert.equal(document.querySelectorAll('#games [data-game-id]').length, 26);
      assert.equal(document.querySelectorAll('#games [data-game-group]').length, 7);
      assert.equal(document.querySelectorAll('#games button').length, 0, 'Groups need no filter controls');
      for (const [category, ids] of Object.entries(groups)) {
        const group = document.querySelector(`[data-game-group="${category}"]`);
        assert.deepEqual([...group.querySelectorAll('[data-game-id]')].map(card => card.dataset.gameId), ids);
      }
      for (const card of document.querySelectorAll('#games [data-game-id]')) {
        assert.equal(card.querySelector('img').getAttribute('src'), `/media/games/${card.dataset.gameId}-thumb.webp`);
        assert.ok(card.querySelector('h4').textContent);
        assert.equal(new URL(card.href).protocol, 'https:');
      }
      assert.match(readFileSync(new URL('../dist/games.html', import.meta.url), 'utf8'), /url=\/#games/);
    });
    await t.test('project categories filter and restore the cards', async () => {
      assert.equal(document.querySelectorAll('.filter-list button').length, 7);
      const expectedByCategory = {
        all: ['one-more-move', 'neon-alley', 'potion-shop-sign', 'sci-fi-blaster', 'stylized-props', 'time-puzzle', 'infiltration', 'cs2-valorant', 'valorant-mobile', 'character-animation', 'character-rigging', 'elemental-magic', 'water-fire-monsters'],
        modeling: ['one-more-move', 'neon-alley', 'potion-shop-sign', 'sci-fi-blaster', 'stylized-props'],
        animation: ['character-animation', 'character-rigging'],
        level: ['one-more-move', 'time-puzzle', 'infiltration'],
        sketch: ['water-fire-monsters'],
        game: ['elemental-magic'],
        analysis: ['cs2-valorant', 'valorant-mobile'],
      };
      assert.match(document.querySelector('[data-category="game"]').textContent, /^卡牌游戏/);
      for (const category of categories) {
        await click(document.querySelector(`[data-category="${category.id}"]`));
        const expected = expectedByCategory[category.id];
        assert.deepEqual([...document.querySelectorAll('.project-card')].map(card => card.dataset.projectId), expected, category.id);
        assert.equal(document.querySelector(`[data-category="${category.id}"] .mono`).textContent, String(expected.length).padStart(2, '0'), category.id);
      }
      assert.match(document.querySelector('.project-track').textContent, /游戏怪物设计/);
      await click(document.querySelector('[data-category="all"]'));
      assert.equal(document.querySelectorAll('.project-card').length, 13);
    });
    await t.test('arrows, scroll bar, and keyboard move through projects and reset on filter', async () => {
      await click(document.querySelector('[data-category="modeling"]'));
      let track = document.querySelector('.project-track');
      assert.equal(document.querySelector('.gallery-arrow').disabled, true);
      await click(document.querySelectorAll('.gallery-arrow')[1]);
      assert.ok(track.scrollLeft > 0);
      await click(document.querySelector('.gallery-arrow'));
      const previousLeft = track.scrollLeft;
      track.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await wait();
      assert.ok(track.scrollLeft > previousLeft);
      const slider = document.querySelector('.gallery-scrollbar input');
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(slider, '1000');
      slider.dispatchEvent(new window.Event('input', { bubbles: true }));
      slider.dispatchEvent(new window.Event('change', { bubbles: true }));
      await wait();
      assert.equal(track.scrollLeft, track.scrollWidth - track.clientWidth);
      assert.equal(document.querySelectorAll('.gallery-arrow')[1].disabled, true);
      await click(document.querySelector('[data-category="analysis"]'));
      track = document.querySelector('.project-track');
      assert.equal(track.scrollLeft, 0);
      assert.equal(document.querySelector('.gallery-scrollbar input').disabled, true);
      await click(document.querySelector('[data-category="all"]'));
    });
    await t.test('project details open, use the updated title, and close', async () => {
      const levelCard = document.querySelector('[data-project-id="infiltration"]');
      levelCard.focus();
      await click(levelCard);
      assert.ok(document.querySelector('dialog[open]'));
      assert.equal(document.querySelector('#dialog-title').textContent, '潜入与逃脱关卡');
      assert.match(document.querySelector('dialog').textContent, /垂直动线/);
      assert.equal(document.body.style.overflow, 'hidden');
      await click(document.querySelector('dialog .icon-button'));
      assert.equal(document.querySelector('dialog'), null);
      assert.equal(document.body.style.overflow, '');
      assert.equal(document.activeElement, levelCard);
      await click(document.querySelector('[data-project-id="one-more-move"]'));
      assert.deepEqual([...document.querySelectorAll('dialog .project-tool-icon')].map(icon => icon.getAttribute('aria-label')), ['虚幻引擎', 'Blender', 'Adobe Substance 3D Painter', 'Adobe Photoshop', 'Figma', 'Procreate']);
      assert.equal(document.querySelectorAll('.dialog-gallery img').length, 3);
      assert.equal(document.querySelector('.dialog-actions a').getAttribute('href'), projects[0].link);
      document.querySelector('dialog').dispatchEvent(new window.Event('cancel', { cancelable: true }));
      await wait();
      assert.equal(document.querySelector('dialog'), null);
    });
    await t.test('language switches the interface and persists the choice', async () => {
      await click(document.querySelector('.language-switch'));
      assert.equal(document.documentElement.lang, 'en');
      assert.equal(window.localStorage.getItem('qz-language'), 'en');
      assert.match(document.querySelector('.hero-intro').textContent, /QIAOXI ZHOU/);
      assert.match(document.querySelector('#about').textContent, /competitive games/);
      assert.equal(document.querySelector('[data-game-id="valorant"] h4').textContent, 'VALORANT');
      await click(document.querySelector('.language-switch'));
      assert.equal(document.documentElement.lang, 'zh-CN');
      assert.match(document.querySelector('#about').textContent, /竞技游戏/);
      assert.equal(document.querySelector('[data-game-id="valorant"] h4').textContent, '无畏契约');
    });
    await t.test('all headings, project details, tags, game names and metadata follow the selected language', async () => {
      const expectedHeadings = {
        'hero-title': ['游戏设计与开发。', 'GAMEDESIGN&DEVELOPMENT.'],
        'work-title': ['精选作品。', 'SELECTEDWORK.'],
        'approach-title': ['我的技能。', 'MYTOOLBOX.'],
        'games-title': ['喜欢的游戏。', 'GAMESILOVE.'],
        'contact-title': ['保持联系。✳', 'LET’SCONNECT.✳'],
      };
      for (const [index, language] of ['zh', 'en'].entries()) {
        if (window.localStorage.getItem('qz-language') !== language) await click(document.querySelector('.language-switch'));
        assert.equal(document.documentElement.lang, language === 'zh' ? 'zh-CN' : 'en');
        for (const [id, text] of Object.entries(expectedHeadings)) assert.equal(document.getElementById(id).textContent.replace(/\s/g, ''), text[index], id);
        assert.equal(document.title, index ? 'Qiaoxi Zhou — Game Design & Development' : '周巧兮 — 游戏设计与开发');
        assert.ok(document.querySelector('meta[name="description"]').content.includes(index ? 'game design' : '游戏设计'));
        for (const game of favoriteGames) assert.equal(document.querySelector(`[data-game-id="${game.id}"] h4`).textContent, game.title[index]);
        for (const project of projects) {
          assert.ok(projectTitlesZh[project.id], `${project.id} needs a Chinese title`);
          const card = document.querySelector(`[data-project-id="${project.id}"]`);
          const title = index ? project.title : projectTitlesZh[project.id];
          assert.equal(card.querySelector('h3').textContent, title);
          assert.deepEqual([...card.querySelectorAll('.project-tags span')].map(tag => tag.textContent), project.tags.map(tag => translateTerm(tag, (zh, en) => index ? en : zh)));
          await click(card);
          assert.equal(document.querySelector('#dialog-title').textContent, title);
          assert.equal(document.querySelector('.dialog-meta > div > .mono').textContent, index ? 'ROLE' : '负责内容');
          const toolLabels = [...document.querySelectorAll('.project-tools-meta > .mono')].map(label => label.textContent);
          assert.ok(toolLabels.every(label => (index ? ['TOOLS', 'FOCUS'] : ['制作工具', '研究方向']).includes(label)));
          if (index) assert.doesNotMatch(document.querySelector('dialog').textContent, /[\u3400-\u9fff]/);
          else assert.doesNotMatch(document.querySelector('dialog').textContent, /\b(?:ROLE|TOOLS|FOCUS|IN-ENGINE)\b/);
          await click(document.querySelector('dialog .icon-button'));
        }
        if (index) {
          assert.doesNotMatch(document.querySelector('main').textContent, /[\u3400-\u9fff]/);
          for (const element of document.querySelectorAll('main [aria-label], main [alt]')) assert.doesNotMatch(element.getAttribute('aria-label') || element.getAttribute('alt'), /[\u3400-\u9fff]/);
        } else {
          assert.doesNotMatch(document.querySelector('main').textContent, /SELECTED WORK|GAMES I LOVE|SCROLL TO EXPLORE|EDUCATION & EXPERIENCE|KEEP LEARNING/);
        }
      }
      await click(document.querySelector('.language-switch'));
      await click(document.querySelector('[data-project-id="infiltration"]'));
      document.querySelector('.dialog-cover img').dispatchEvent(new window.Event('error')); await wait();
      assert.equal(document.querySelector('.dialog-cover .project-placeholder .mono').textContent, '关卡设计');
      await click(document.querySelector('.language-switch'));
      assert.equal(document.querySelector('#dialog-title').textContent, 'Infiltrate & Escape Level');
      assert.equal(document.querySelector('.dialog-cover .project-placeholder .mono').textContent, 'LEVEL DESIGN');
      await click(document.querySelector('.language-switch'));
      await click(document.querySelector('dialog .icon-button'));
    });
    await t.test('cropped covers open complete images and their project links', async () => {
      for (const [id, item] of Object.entries(media).filter(([, item]) => item.thumbnail)) {
        const card = document.querySelector(`[data-project-id="${id}"]`);
        assert.equal(card.querySelector('.project-image img').getAttribute('src'), item.thumbnail, id);
        await click(card);
        assert.equal(document.querySelector('.dialog-cover img').getAttribute('src'), item.image, id);
        const primaryLink = document.querySelector('.dialog-actions .button-accent');
        if (item.link) assert.equal(primaryLink.getAttribute('href'), item.link, id);
        else assert.equal(primaryLink, null, id);
        await click(document.querySelector('dialog .icon-button'));
      }
    });
    await t.test('email copying gives accurate feedback', async () => {
      await click(document.querySelector('.copy-button'));
      assert.equal(clipboard, profile.email);
      assert.equal(document.querySelector('[role="status"]').textContent, '邮箱已复制');
    });
    await t.test('mobile menu opens and closes', async () => {
      await click(document.querySelector('.mobile-menu'));
      assert.equal(document.querySelector('.mobile-menu').getAttribute('aria-expanded'), 'true');
      window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
      await wait();
      assert.equal(document.querySelector('.mobile-menu').getAttribute('aria-expanded'), 'false');
    });
    assert.deepEqual(errors, []);
  } finally { dom.window.close(); }
});
