import { test } from 'node:test';
import assert from 'node:assert/strict';
import { editorErrorMessage } from '../src/localization.js';

test('editor notices choose one language and never expose raw browser errors', () => {
  const fallback = ['无法保存，请重试。', 'Unable to save. Please retry.'];
  assert.deepEqual(editorErrorMessage('image-type', fallback), ['请选择 JPG、PNG 或 WebP 图片。', 'Choose a JPG, PNG, or WebP image.']);
  assert.deepEqual(editorErrorMessage('无效的项目或链接。 / Invalid project or URL.', fallback), ['无效的项目或链接。', 'Invalid project or URL.']);
  assert.deepEqual(editorErrorMessage('Failed to fetch', fallback), fallback);
});
