import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

test('o repositório não rastreia assets binários que o importador do Snack tenta enviar', () => {
  const trackedFiles = execFileSync('git', ['ls-files'], { encoding: 'utf8' });

  assert.doesNotMatch(
    trackedFiles,
    /\.(?:png|jpe?g|webp|svg|ttf|otf)$/im,
    'o importador do Snack classifica esses arquivos como assets e tenta enviá-los'
  );
});
