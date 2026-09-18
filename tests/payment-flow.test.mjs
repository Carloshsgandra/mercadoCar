import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(path.join(projectRoot, 'App.js'), 'utf8');

test('checkout encaminha o pagamento para uma tela dedicada', () => {
  const checkout = app.match(/function Checkout[\s\S]*?\n}\nfunction CheckoutOption/)[0];

  assert.match(checkout, /go\('payment',\s*\{\s*paymentMethod: method\s*}\)/);
  assert.doesNotMatch(checkout, /api\.createOrder/);
});

test('pagamento suporta cartão, Pix e boleto antes de confirmar', () => {
  assert.match(app, /function Payment\(/);
  assert.match(app, /\['Cartão', 'Pix', 'Boleto'\]/);
  assert.match(app, /api\.createOrder\(\{items:cart,address,paymentMethod:method}\)/);
});

test('sucesso navega para confirmação e falha preserva o carrinho', () => {
  assert.match(app, /go\('confirmation',\s*\{\s*order:/);
  assert.match(app, /clearCart\(\);/);
  assert.match(app, /catch \(error\) \{\s*Alert\.alert\('Não foi possível confirmar o pagamento'/);
  assert.match(app, /screen === 'payment' \? <Payment/);
  assert.match(app, /screen === 'confirmation' \? <Confirmation/);
});
