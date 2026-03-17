/* ─────────────────────────────────────────────
   CODRIUM — server.js
   Express API connecting to MySQL via mysql2.

   SETUP:
     1. Run schema.sql against your MySQL instance first.
     2. Install dependencies:
          npm install
     3. Create a .env file (copy .env.example and fill in values).
     4. Start the server:
          node server.js
        or with auto-restart:
          npx nodemon server.js

   MIGRATION NOTE:
   When moving to Ubuntu Server, copy this file
   as-is. Only the .env values change (host, user,
   password). No code changes required.

   API endpoints:
     GET    /api/products        — all products
     GET    /api/products/:id    — single product
     POST   /api/products        — create product
     PUT    /api/products/:id    — update product
     DELETE /api/products/:id    — delete product
     GET    /api/health          — DB health check
───────────────────────────────────────────── */

require('dotenv').config();
const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ── */
app.use(cors({
  origin: [
    'http://localhost',
    'http://127.0.0.1',
    'http://localhost:5500',    // VS Code Live Server
    'http://127.0.0.1:5500',
    'null',                     // file:// origin
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

/* ── MySQL connection pool ── */
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'codrium',
  waitForConnections: true,
  connectionLimit:    10,
  charset: 'utf8mb4',
});

/* ── Helper: generate a short unique id ── */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ── Helper: parse a product row from mysql2 ── */
function parseProduct(row) {
  return {
    id:          row.id,
    name:        row.name,
    description: row.description || '',
    features:    Array.isArray(row.features)
                   ? row.features
                   : (row.features ? JSON.parse(row.features) : []),
    status:      row.status,
    createdAt:   row.created_at,
  };
}

/* ──────────────────────────────────────────
   GET /api/health
────────────────────────────────────────── */
app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/* ──────────────────────────────────────────
   GET /api/products
────────────────────────────────────────── */
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    res.json(rows.map(parseProduct));
  } catch (err) {
    console.error('GET /api/products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

/* ──────────────────────────────────────────
   GET /api/products/:id
────────────────────────────────────────── */
app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(parseProduct(rows[0]));
  } catch (err) {
    console.error('GET /api/products/:id:', err.message);
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
});

/* ──────────────────────────────────────────
   POST /api/products
────────────────────────────────────────── */
app.post('/api/products', async (req, res) => {
  const { name, description = '', features = [], status = 'active' } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Product name is required.' });
  }

  const validStatuses = ['active', 'beta', 'coming-soon', 'deprecated'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`,
    });
  }

  try {
    const id = genId();
    await pool.execute(
      'INSERT INTO products (id, name, description, features, status) VALUES (?, ?, ?, ?, ?)',
      [id, name.trim(), description.trim(), JSON.stringify(features), status]
    );
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ?', [id]
    );
    res.status(201).json(parseProduct(rows[0]));
  } catch (err) {
    console.error('POST /api/products:', err.message);
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

/* ──────────────────────────────────────────
   PUT /api/products/:id
────────────────────────────────────────── */
app.put('/api/products/:id', async (req, res) => {
  const { name, description, features, status } = req.body;

  if (name !== undefined && !name.trim()) {
    return res.status(400).json({ error: 'Product name cannot be empty.' });
  }

  try {
    const [existing] = await pool.execute(
      'SELECT * FROM products WHERE id = ?', [req.params.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const current = parseProduct(existing[0]);
    await pool.execute(
      `UPDATE products
       SET name = ?, description = ?, features = ?, status = ?
       WHERE id = ?`,
      [
        (name        ?? current.name).trim(),
        (description ?? current.description).trim(),
        JSON.stringify(features ?? current.features),
        status ?? current.status,
        req.params.id,
      ]
    );

    const [updated] = await pool.execute(
      'SELECT * FROM products WHERE id = ?', [req.params.id]
    );
    res.json(parseProduct(updated[0]));
  } catch (err) {
    console.error('PUT /api/products/:id:', err.message);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

/* ──────────────────────────────────────────
   DELETE /api/products/:id
────────────────────────────────────────── */
app.delete('/api/products/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM products WHERE id = ?', [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/products/:id:', err.message);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

/* ── Start ── */
app.listen(PORT, () => {
  console.log(`\n  Codrium API running → http://localhost:${PORT}`);
  console.log(`  Health check       → http://localhost:${PORT}/api/health\n`);
});
