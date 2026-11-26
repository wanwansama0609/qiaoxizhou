import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import localEditor from './tools/local-editor.js';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const savedMedia = {
  name: 'saved-portfolio-media',
  resolveId(id) { if (id === 'virtual:portfolio-media') return '\0virtual:portfolio-media'; },
  load(id) {
    if (id !== '\0virtual:portfolio-media') return;
    const path = fileURLToPath(new URL('./public/content/project-media.json', import.meta.url));
    this.addWatchFile(path);
    return `export default ${readFileSync(path, 'utf8')};`;
  },
};

export default defineConfig({
  plugins: [react(), savedMedia, localEditor()],
  build: { rollupOptions: { input: { main: fileURLToPath(new URL('./index.html', import.meta.url)), games: fileURLToPath(new URL('./games.html', import.meta.url)) } } },
  server: { port: 5173, strictPort: true, watch: { ignored: ['**/public/content/project-media.json', '**/public/media/projects/**'] } },
  preview: { port: 4173, strictPort: true },
});
