import { readFileSync } from 'node:fs';
import { transformWithEsbuild } from 'vite';

let prepared;
export function builtAppScript() {
  // jsdom's eval is not a module loader. Convert only the production entry's
  // module format; GPU-only lazy chunks are not exercised by DOM tests.
  prepared ??= (async () => {
    const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
    const path = html.match(/src="(\/assets\/[^\"]+\.js)"/)[1];
    const source = readFileSync(new URL(`../dist${path}`, import.meta.url), 'utf8');
    const result = await transformWithEsbuild(source, 'built-app.js', { loader: 'js', format: 'iife', target: 'es2022', logLevel: 'silent' });
    return result.code;
  })();
  return prepared;
}
