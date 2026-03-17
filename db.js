/* ─────────────────────────────────────────────
   CODRIUM  —  db.js
   Data layer — fetches from the local Express
   API which connects to MySQL.

   When you move to your Ubuntu server, change
   API_BASE to your server's URL, e.g.:
     const API_BASE = 'https://api.codrium.com';
   Nothing else in this file or the UI files
   needs to change.
───────────────────────────────────────────── */

const API_BASE = 'http://localhost:3000/api';

/* ──────────────────────────────────────────
   GET all products
   MySQL: SELECT * FROM products ORDER BY created_at DESC
────────────────────────────────────────── */
async function getProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Failed to fetch products.');
  return res.json();
}

/* ──────────────────────────────────────────
   GET single product by id
   MySQL: SELECT * FROM products WHERE id = ?
────────────────────────────────────────── */
async function getProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch product.');
  return res.json();
}

/* ──────────────────────────────────────────
   POST — create a new product
   MySQL: INSERT INTO products (id, name, description, features, status) VALUES (...)
   Body: { name, description, features, status }
────────────────────────────────────────── */
async function addProduct(product) {
  const res = await fetch(`${API_BASE}/products`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create product.');
  }
  return res.json();
}

/* ──────────────────────────────────────────
   PUT — update an existing product
   MySQL: UPDATE products SET ... WHERE id = ?
   Body: { name, description, features, status }
────────────────────────────────────────── */
async function updateProduct(id, updates) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update product.');
  }
  return res.json();
}

/* ──────────────────────────────────────────
   DELETE — remove a product
   MySQL: DELETE FROM products WHERE id = ?
────────────────────────────────────────── */
async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete product.');
  }
  return res.json();
}
