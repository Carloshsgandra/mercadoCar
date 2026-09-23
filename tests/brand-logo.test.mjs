import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(projectRoot, 'App.js');
test('a marca MCCAR é renderizada sem asset binário local', () => {
  const app = readFileSync(appPath, 'utf8');

  assert.match(app, /<View style=\{styles\.logoMark\}\/>/);
  assert.doesNotMatch(app, /require\('\.\/assets\//);
});
