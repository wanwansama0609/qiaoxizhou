import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { projects } from '../src/content.js';

// This endpoint exists only in Vite's loopback development server.
// Fixed project IDs and paths prevent filenames supplied by the browser from
// accessing anything outside the portfolio's media directory.
export default function localEditor() {
  const ids = new Set(projects.map(project => project.id));
  return {
    name: 'portfolio-local-editor', apply: 'serve',
    configureServer(server) {
      const publicRoot = path.join(server.config.root, 'public');
      const mediaPath = path.join(publicRoot, 'content', 'project-media.json');
      // Media writes are excluded from HMR to keep an open editor intact.
      // Serve this folder directly so files added after Vite starts do not
      // depend on Vite's initial public-file inventory.
      server.middlewares.use('/media/projects/', async (request, response, next) => {
        if (!['GET', 'HEAD'].includes(request.method)) return next();
        let filename;
        try { filename = decodeURIComponent(request.url.split('?')[0]).replace(/^\//, ''); }
        catch { response.statusCode = 400; response.end('Invalid image path'); return; }
        if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(webp|png|jpe?g|gif|avif)$/i.test(filename)) {
          response.statusCode = 404; response.end('Image not found'); return;
        }
        try {
          const bytes = await readFile(path.join(publicRoot, 'media', 'projects', filename));
          const extension = filename.split('.').pop().toLowerCase();
          response.setHeader('Content-Type', `image/${['jpg', 'jpeg'].includes(extension) ? 'jpeg' : extension}`);
          response.setHeader('Content-Length', bytes.length);
          response.setHeader('Cache-Control', 'no-cache');
          response.setHeader('X-Content-Type-Options', 'nosniff');
          response.end(request.method === 'HEAD' ? undefined : bytes);
        } catch (error) {
          response.statusCode = error.code === 'ENOENT' ? 404 : 500;
          response.end('Image unavailable');
        }
      });
      let queue = Promise.resolve();
      server.middlewares.use('/__portfolio/project-media', (request, response, next) => {
        if (request.method !== 'POST') return next();
        const reply = (status, data) => { response.statusCode = status; response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.setHeader('Cache-Control', 'no-store'); response.end(JSON.stringify(data)); };
        const host = request.headers.host;
        if (!/^(127\.0\.0\.1|localhost):\d+$/.test(host || '') || request.headers.origin !== `http://${host}` || request.headers['x-portfolio-editor'] !== '1' || !request.headers['content-type']?.startsWith('application/json')) {
          reply(403, { error: '仅允许从本地网站编辑。 / Use the local website editor.' }); return;
        }
        const processRequest = async () => {
          try {
            let size = 0;
            const chunks = [];
            for await (const chunk of request) {
              size += chunk.length;
              if (size > 6 * 1024 * 1024) { reply(413, { error: '图片过大，请选择较小的文件。 / Image too large.' }); return; }
              chunks.push(chunk);
            }
            let input;
            try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { reply(400, { error: '无效的数据。 / Invalid request.' }); return; }
            if (!input || !ids.has(input.id) || typeof input.link !== 'string' || input.link.length > 2048) { reply(400, { error: '无效的项目或链接。 / Invalid project or URL.' }); return; }
            const link = input.link.trim();
            if (link) {
              let valid = false;
              try { const url = new URL(link); valid = ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password; } catch { /* Invalid URL. */ }
              if (!valid) { reply(400, { error: '请填写完整的 http 或 https 作品链接。 / Enter a full http or https URL.' }); return; }
            }
            let imageBytes;
            if (input.imageData) {
              if (typeof input.imageData !== 'string' || !/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(input.imageData)) { reply(400, { error: '图片格式不正确。 / Invalid image format.' }); return; }
              imageBytes = Buffer.from(input.imageData.split(',')[1], 'base64');
              if (imageBytes.length > 4 * 1024 * 1024 || imageBytes.length < 12 || imageBytes.toString('ascii', 0, 4) !== 'RIFF' || imageBytes.toString('ascii', 8, 12) !== 'WEBP') { reply(400, { error: '图片无效或过大。 / Invalid or oversized image.' }); return; }
            }
            // Serialize file updates so saving different projects cannot drop an earlier edit.
            const save = async () => {
              const media = JSON.parse(await readFile(mediaPath, 'utf8'));
              let image = input.removeImage === true ? '' : media[input.id]?.image || '';
              if (imageBytes) {
                const name = `${input.id}-${randomUUID()}.webp`;
                await mkdir(path.join(publicRoot, 'media', 'projects'), { recursive: true });
                await writeFile(path.join(publicRoot, 'media', 'projects', name), imageBytes, { flag: 'wx' });
                image = `/media/projects/${name}`;
              }
              media[input.id] = { ...media[input.id], image, link };
              // Keep a curated cover when only the URL changes. A new image
              // or an empty image space must not retain an unrelated old cover.
              if (imageBytes || input.removeImage === true) delete media[input.id].thumbnail;
              const temporary = `${mediaPath}.${randomUUID()}.tmp`;
              await writeFile(temporary, JSON.stringify(media, null, 2) + '\n', 'utf8');
              await rename(temporary, mediaPath);
              return media;
            };
            const operation = queue.then(save);
            queue = operation.catch(() => {});
            reply(200, { media: await operation });
          } catch (error) {
            server.config.logger.error(`Portfolio editor: ${error.message}`);
            if (!response.headersSent) reply(500, { error: '保存失败，请确认本地预览服务正在运行。 / Save failed. Check the local preview server.' });
          }
        };
        void processRequest();
      });
    },
  };
}
