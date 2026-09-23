/**
 * Camada de comunicação com o back-end.
 *
 * Quando o servidor estiver disponível, defina EXPO_PUBLIC_API_URL no arquivo
 * .env, por exemplo: EXPO_PUBLIC_API_URL=https://api.seudominio.com/api
 *
 * Contratos esperados:
 * POST /auth/login              { email, password } -> { token, user }
 * GET  /products?search=&category= -> Product[]
 * GET  /products/:id            -> Product
 * GET  /cart                    -> CartItem[]
 * POST /cart                    { productId, quantity } -> CartItem[]
 * PATCH /cart/:productId        { quantity } -> CartItem[]
 * DELETE /cart/:productId       -> CartItem[]
 * POST /orders                  { items, address, paymentMethod } -> Order
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function request(path, options = {}) {
  if (!API_URL) return null;

  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Não foi possível concluir a solicitação.');
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getProducts: (search = '', category = '') => request(`/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`),
  getProduct: (id) => request(`/products/${id}`),
  getCart: () => request('/cart'),
  addToCart: (productId, quantity) => request('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCart: (productId, quantity) => request(`/cart/${productId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  removeFromCart: (productId) => request(`/cart/${productId}`, { method: 'DELETE' }),
  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
};
