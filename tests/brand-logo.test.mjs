import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(projectRoot, 'App.js');
const logoPath = path.join(projectRoot, 'assets', 'brand', 'mccar-logo-tech.png');

test('a marca MCCAR usa o símbolo tecnológico automotivo local', () => {
  const app = readFileSync(appPath, 'utf8');

  assert.ok(existsSync(logoPath), 'o ativo de logo deve existir no projeto');
  assert.match(app, /require\('\.\/assets\/brand\/mccar-logo-tech\.png'\)/);
  assert.match(app, /logoImage:/);
});
