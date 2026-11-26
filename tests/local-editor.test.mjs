import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import localEditor from '../tools/local-editor.js';

test('Local editor saves safely and persistently', async t => {
  const prefix = path.join(tmpdir(), 'qiaoxi-editor-test-');
  const root = await mkdtemp(prefix);
  const configuration = path.join(root, 'public/content/project-media.json');
  await mkdir(path.dirname(configuration), { recursive: true });
  const initial = { 'neon-alley': { image: '', link: '' }, 'cs2-valorant': { image: '', link: '' } };
  await writeFile(configuration, JSON.stringify(initial));
  const middleware = [];
  localEditor().configureServer({ config: { root, logger: { error: message => { throw new Error(message); } } }, middlewares: { use(route, handler) { middleware.push({ route, handler }); } } });
  const server = createServer((request, response) => {
    const entry = middleware.find(({ route }) => request.url.startsWith(route));
    const next = () => { response.statusCode = 404; response.end(); };
    if (!entry) return next();
    request.url = request.url.slice(entry.route.length) || '/';
    entry.handler(request, response, next);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const post = (input, extra = {}) => fetch(`${origin}/__portfolio/project-media`, { method: 'POST', headers: { Origin: origin, 'X-Portfolio-Editor': '1', 'Content-Type': 'application/json', ...extra }, body: JSON.stringify(input) });
  try {
    await t.test('rejects cross-origin writes, unknown IDs, unsafe URLs and invalid images', async () => {
      assert.equal((await post({ id: 'neon-alley', link: '' }, { Origin: 'https://example.com' })).status, 403);
      assert.equal((await post({ id: '../outside', link: '' })).status, 400);
      assert.equal((await post({ id: 'neon-alley', link: 'javascript:alert(1)' })).status, 400);
      assert.equal((await post({ id: 'neon-alley', link: '', imageData: 'data:image/webp;base64,bm90YW5pbWFnZQ==' })).status, 400);
      assert.deepEqual(JSON.parse(await readFile(configuration, 'utf8')), initial);
    });
    await t.test('persists cover uploads and links to the website files', async () => {
      const previous = JSON.parse(await readFile(configuration, 'utf8'));
      previous['neon-alley'].thumbnail = '/media/previous-crop.webp';
      await writeFile(configuration, JSON.stringify(previous));
      const bytes = await readFile(new URL('../public/media/portrait.webp', import.meta.url));
      const response = await post({ id: 'neon-alley', link: 'https://example.com/artwork/test', imageData: `data:image/webp;base64,${bytes.toString('base64')}` });
      assert.equal(response.status, 200);
      const result = await response.json();
      const stored = JSON.parse(await readFile(configuration, 'utf8'));
      assert.deepEqual(result.media, stored);
      assert.equal(stored['neon-alley'].thumbnail, undefined, 'A replacement image clears the previous crop');
      assert.match(stored['neon-alley'].image, /^\/media\/projects\/neon-alley-[a-z0-9-]+\.webp$/);
      assert.deepEqual(await readFile(path.join(root, 'public', stored['neon-alley'].image)), bytes);
      const imageResponse = await fetch(origin + stored['neon-alley'].image);
      assert.equal(imageResponse.status, 200, 'Images added after startup are immediately served');
      assert.equal(imageResponse.headers.get('content-type'), 'image/webp');
      assert.deepEqual(Buffer.from(await imageResponse.arrayBuffer()), bytes);
    });
    await t.test('parallel saves preserve both projects and blank links remain blank', async () => {
      const previous = JSON.parse(await readFile(configuration, 'utf8'));
      previous['neon-alley'].thumbnail = '/media/curated-crop.webp';
      await writeFile(configuration, JSON.stringify(previous));
      const results = await Promise.all([
        post({ id: 'neon-alley', link: 'https://example.com/revised' }),
        post({ id: 'cs2-valorant', link: 'https://example.com/analysis' }),
      ]);
      assert.ok(results.every(response => response.status === 200));
      let stored = JSON.parse(await readFile(configuration, 'utf8'));
      assert.equal(stored['neon-alley'].link, 'https://example.com/revised');
      assert.equal(stored['cs2-valorant'].link, 'https://example.com/analysis');
      assert.equal(stored['neon-alley'].thumbnail, '/media/curated-crop.webp', 'Changing only a link keeps the crop');
      assert.equal((await post({ id: 'neon-alley', link: '', removeImage: true })).status, 200);
      stored = JSON.parse(await readFile(configuration, 'utf8'));
      assert.deepEqual(stored['neon-alley'], { image: '', link: '' });
    });
  } finally {
    await new Promise(resolve => server.close(resolve));
    // Verify the exact disposable directory remains within its named temp prefix.
    assert.ok(path.resolve(root).startsWith(path.resolve(prefix)) && path.dirname(root) === path.resolve(tmpdir()));
    await rm(root, { recursive: true, force: true });
  }
});
