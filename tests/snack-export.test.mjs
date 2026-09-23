import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const snackRoot = path.join(root, 'snack');
const sourceFiles = ['App.js', 'data/products.js', 'services/api.js'];

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  });
}

test('a variante Snack é autocontida e não envia assets locais', () => {
  for (const relativePath of [...sourceFiles, 'package.json', 'app.json']) {
    assert.ok(existsSync(path.join(snackRoot, relativePath)), `arquivo obrigatório ausente: snack/${relativePath}`);
  }

  const packageJson = JSON.parse(readFileSync(path.join(snackRoot, 'package.json'), 'utf8'));
  const appJson = JSON.parse(readFileSync(path.join(snackRoot, 'app.json'), 'utf8'));
  assert.deepEqual(Object.keys(packageJson.dependencies).sort(), [
    '@expo/vector-icons', 'expo', 'react', 'react-native', 'react-native-safe-area-context',
  ].sort());
  assert.equal(appJson.expo.slug, 'mercadocar-snack');
  assert.deepEqual(Object.keys(appJson.expo).sort(), ['name', 'slug']);

  const productSource = readFileSync(path.join(snackRoot, 'data/products.js'), 'utf8');
  assert.equal((productSource.match(/image:\s*['"]https:\/\//g) || []).length, 6, 'cada produto deve usar uma URI HTTPS');

  for (const relativePath of sourceFiles) {
    const source = readFileSync(path.join(snackRoot, relativePath), 'utf8');
    assert.doesNotMatch(source, /require\s*\(/, `require local encontrado em ${relativePath}`);
    assert.doesNotMatch(source, /from\s+['"]\.\.\//, `import externo encontrado em ${relativePath}`);
    assert.doesNotMatch(source, /(?:from\s+|require\s*\()['"](?:\.\/)?assets\//, `referência de asset local encontrada em ${relativePath}`);
  }

  for (const filePath of listFiles(snackRoot)) {
    assert.ok(!/\.(?:png|jpe?g|webp|svg|ttf|otf)$/i.test(filePath), `asset binário encontrado: ${path.relative(root, filePath)}`);
    assert.notEqual(path.basename(filePath), 'package-lock.json', 'lockfile não deve existir em /snack');
    assert.notEqual(path.basename(filePath), 'node_modules', 'node_modules não deve existir em /snack');
    assert.ok(statSync(filePath).isFile());
  }
});
