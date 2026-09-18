import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = path.join(projectRoot, 'data', 'products.js');
const expectedImages = {
  'fl-2034': 'brake-pads.png',
  'bo-60ah': 'battery-60ah.png',
  'co-128': 'rear-shock-absorber.png',
  'ngk-740': 'spark-plugs.png',
  'ma-432': 'oil-filter.png',
  'sa-303': 'clutch-kit.png',
};

test('o catálogo referencia imagens locais correspondentes a cada produto', () => {
  const catalog = readFileSync(catalogPath, 'utf8');

  assert.doesNotMatch(catalog, /https?:\/\//, 'o catálogo não deve depender de imagens externas');

  for (const [productId, imageName] of Object.entries(expectedImages)) {
    assert.match(catalog, new RegExp(`id: '${productId}'[\\s\\S]*?image: require\\('\\.\\./assets/products/${imageName}'\\)`));
    assert.ok(existsSync(path.join(projectRoot, 'assets', 'products', imageName)), `asset ausente: ${imageName}`);
  }
});
