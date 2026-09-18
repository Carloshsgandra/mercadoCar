# MCCAR Payment Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the last stage of checkout into the Pagamento and Confirmação screens from the supplied MCCAR design, while retaining the existing cart and mock-backend behavior.

**Architecture:** Keep local-screen navigation in `App.js`. Checkout only prepares the purchase and navigates to a stateful `Payment` screen; Payment performs `api.createOrder`, normalizes the response and transitions to `Confirmation`. Both screens reuse the existing `Header`, `PrimaryButton`, `Totals`, `ScreenShell`, `BRL`, and color system.

**Tech Stack:** Expo 57, React 19, React Native 0.86, `@expo/vector-icons`, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-18-mccar-figma-merge-design.md`

## Global Constraints

- Keep the existing local navigation state in `App.js`; do not add a navigation package.
- Do not add gateway, Pix QR, boleto generation, or order-tracking integrations.
- Continue to use only local product assets from `assets/products`.
- Use `#18181A` as ink and the current MCCAR yellow token for visual emphasis.
- An order API failure must retain the cart and keep the user on Payment; absence of `EXPO_PUBLIC_API_URL` remains a successful demo flow.

---

## File Structure

- `App.js`: checkout handoff, `Payment` and `Confirmation` screen components, local navigation branch, and their styles.
- `tests/payment-flow.test.mjs`: static regression tests for the new screen routes, supported payment methods, and safe success/failure behavior.

### Task 1: Lock the purchase-flow contract with regression tests

**Files:**

- Create: `tests/payment-flow.test.mjs`
- Modify: none
- Test: `tests/payment-flow.test.mjs`

**Interfaces:**

- Consumes: `App.js` text and `api.createOrder(payload)`.
- Produces: checks that prevent Checkout from directly creating an order, require `payment` and `confirmation` navigation branches, and require the three designed payment methods.

- [ ] **Step 1: Write the failing test**

Create `tests/payment-flow.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(path.join(root, 'App.js'), 'utf8');

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/payment-flow.test.mjs`

Expected: FAIL because `Payment` and `Confirmation` do not exist and Checkout calls `api.createOrder` directly.

- [ ] **Step 3: Commit the failing test**

```powershell
git add tests/payment-flow.test.mjs
git commit -m "test: cobre fluxo de pagamento MCCAR"
```

### Task 2: Separate checkout from payment and build the two reference screens

**Files:**

- Create: none
- Modify: `App.js:172-203` and the `StyleSheet` declaration
- Test: `tests/payment-flow.test.mjs`

**Interfaces:**

- Consumes: `cart: Array<Product & { quantity: number }>`, `go(next, params)`, `clearCart()`, `api.createOrder(payload)`, and `params.paymentMethod`.
- Produces: `Payment({ go, cart, clearCart, cartCount, openCart, initialMethod })` and `Confirmation({ go, order, cartCount, openCart })`.

- [ ] **Step 1: Replace Checkout’s direct submission with the Payment handoff**

Remove the local `pay` function from `Checkout`. Keep payment choice and totals visible, but make its footer action:

```jsx
<PrimaryButton
  label={`Continuar para pagamento · ${BRL.format(total)}`}
  onPress={() => go('payment', { paymentMethod: method })}
/>
```

- [ ] **Step 2: Add the stateful `Payment` component immediately after `CheckoutOption`**

Use this state and totals contract:

```jsx
const paymentMethods = ['Cartão', 'Pix', 'Boleto'];
const address = 'Rua das Oficinas, 120 · Santo André, SP';
const delivery = cart.length ? 24.9 : 0;
const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
const total = subtotal + delivery;
const [method, setMethod] = useState(initialMethod || 'Cartão');
const [card, setCard] = useState({ number: '', name: 'CARLOS ANDRADE', expiry: '', cvv: '' });
const [saving, setSaving] = useState(false);
```

Render an accessible segmented selector with `paymentMethods`. For Cartão, render controlled `TextInput` fields for number, cardholder, expiry, and CVV. For Pix, render a bordered instruction that the copy-and-paste code will be available after confirmation. For Boleto, render a bordered instruction that the document will be available after confirmation. In all modes, render `Totals` and a bottom shield-icon action labelled `Confirmar pagamento`.

- [ ] **Step 3: Implement safe submission and normalized confirmation data**

Implement the action:

```jsx
const submitPayment = async () => {
  if (!cart.length || saving) return;
  if (method === 'Cartão' && (!card.number.trim() || !card.name.trim() || !card.expiry.trim() || !card.cvv.trim())) {
    Alert.alert('Dados incompletos', 'Preencha os dados do cartão para continuar.');
    return;
  }

  setSaving(true);
  try {
    const response = await api.createOrder({items:cart,address,paymentMethod:method});
    const reference = response?.orderNumber || response?.code || response?.id || 'MC-30523';
    clearCart();
    go('confirmation', { order: { reference, address, method, total, deliveryDays: '4 a 6 dias úteis' } });
  } catch (error) {
    Alert.alert('Não foi possível confirmar o pagamento', error.message || 'Tente novamente em alguns instantes.');
  } finally {
    setSaving(false);
  }
};
```

The cart must not be cleared in the `catch` path. A `null` response in demo mode uses the fallback reference.

- [ ] **Step 4: Add `Confirmation` after `Payment`**

Render the success icon, title `Pedido confirmado`, a bordered `InfoRows` card for reference, delivery time, address, and payment. Resolve the display method as `Visa •••• 1234` for Cartão and the selected method otherwise. Add:

```jsx
<PrimaryButton label="Acompanhar pedido" onPress={() => Alert.alert('Acompanhamento', 'O rastreio será disponibilizado quando o back-end de pedidos estiver integrado.')} />
<PrimaryButton label="Voltar ao início" outline onPress={() => go('home')} />
```

Use `order?.reference`, `order?.address`, `order?.deliveryDays`, and `order?.total` with the same fallback values used in Payment, so direct rendering cannot crash.

- [ ] **Step 5: Wire new routes in `App`**

Add the screen branches after Checkout:

```jsx
screen === 'payment' ? <Payment {...common} cart={cart} clearCart={() => setCart([])} initialMethod={params.paymentMethod} /> :
screen === 'confirmation' ? <Confirmation {...common} order={params.order} /> :
<Profile {...common}/>
```

- [ ] **Step 6: Add focused styles to the existing StyleSheet**

Add `paymentField`, `paymentLabel`, `paymentInput`, `paymentRow`, `paymentHint`, `paymentHintTitle`, `paymentHintText`, `paymentFooter`, `confirmationContent`, `successIcon`, `confirmationTitle`, `confirmationText`, `confirmationCard`, and `secondaryAction`. Reuse existing checkout, information-card, and empty-cart color/spacing values. Payment scroll content needs 108 px bottom padding; Confirmation must not render bottom tabs.

- [ ] **Step 7: Run focused tests to verify the implementation**

Run: `node --test tests/payment-flow.test.mjs`

Expected: PASS with all three flow-contract tests passing.

- [ ] **Step 8: Commit the implementation**

```powershell
git add App.js
git commit -m "feat: adiciona pagamento e confirmação MCCAR"
```

### Task 3: Run regression and device-level verification

**Files:**

- Create: none
- Modify: none unless a verified regression needs correction
- Test: `tests/product-images.test.mjs`, `tests/payment-flow.test.mjs`

**Interfaces:**

- Consumes: completed application and both test files.
- Produces: verified navigation and a clean working tree after any committed correction.

- [ ] **Step 1: Run the complete automated test suite**

Run: `node --test tests/*.test.mjs`

Expected: PASS; the six catalog image mappings and the three payment-flow checks all succeed.

- [ ] **Step 2: Run Expo static validation**

Run: `npx expo export --platform web --output-dir .expo-verify-web`

Expected: build completes without JSX, import, or bundling errors. Inspect the command output only; do not commit `.expo-verify-web`.

- [ ] **Step 3: Manually validate the design flow**

Launch `npm run web` or `npm run android`, then verify:

1. A populated cart’s Checkout action opens Payment without clearing cart items.
2. Cartão rejects blank fields and accepts a fully populated form.
3. Pix and Boleto switch their instructional content and can finish a demo order.
4. Confirming in demo mode opens the designed confirmation screen with the total and clears the cart.
5. “Voltar ao início” reaches Home; “Acompanhar pedido” retains the confirmation screen.
6. With an intentionally failing configured API URL, Confirmation does not open and cart items remain available.

- [ ] **Step 4: Remove the disposable web export after inspecting it**

Run: `Remove-Item -LiteralPath '.expo-verify-web' -Recurse -Force`

Expected: only the temporary export is removed; source and test files remain unchanged.

- [ ] **Step 5: Commit any correction required by the verification**

```powershell
git status --short
git add App.js tests/payment-flow.test.mjs
git commit -m "fix: corrige fluxo final de compra"
```

Skip the commit if `git status --short` is empty.

