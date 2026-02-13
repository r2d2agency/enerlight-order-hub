const express = require('express');
const { pool } = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, code, name, description, cost_price as "costPrice", sale_price as "salePrice", convention_price as "conventionPrice", unit, image_url as "imageUrl", active FROM products ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar produtos:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { code, name, description, costPrice, salePrice, conventionPrice, unit, imageUrl } = req.body;
    if (!code || !name) {
      return res.status(400).json({ message: 'Código e nome são obrigatórios' });
    }
    const result = await pool.query(
      `INSERT INTO products (code, name, description, cost_price, sale_price, convention_price, unit, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, code, name, description, cost_price as "costPrice", sale_price as "salePrice", convention_price as "conventionPrice", unit, image_url as "imageUrl", active`,
      [code, name, description || '', costPrice || 0, salePrice || 0, conventionPrice || 0, unit || 'PC', imageUrl || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Código já existe' });
    }
    console.error('Erro ao criar produto:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, costPrice, salePrice, conventionPrice, unit, imageUrl, active } = req.body;
    const result = await pool.query(
      `UPDATE products SET code = COALESCE($1, code), name = COALESCE($2, name), description = COALESCE($3, description),
       cost_price = COALESCE($4, cost_price), sale_price = COALESCE($5, sale_price), convention_price = COALESCE($6, convention_price),
       unit = COALESCE($7, unit), image_url = COALESCE($8, image_url), active = COALESCE($9, active), updated_at = NOW()
       WHERE id = $10
       RETURNING id, code, name, description, cost_price as "costPrice", sale_price as "salePrice", convention_price as "conventionPrice", unit, image_url as "imageUrl", active`,
      [code, name, description, costPrice, salePrice, conventionPrice, unit, imageUrl, active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json({ message: 'Produto removido' });
  } catch (err) {
    console.error('Erro ao remover produto:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

module.exports = router;
