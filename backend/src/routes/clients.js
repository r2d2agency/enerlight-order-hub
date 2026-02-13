const express = require('express');
const { pool } = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/clients
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// POST /api/clients
router.post('/', async (req, res) => {
  try {
    const { name, cnpj, address, neighborhood, city, state, phone, email } = req.body;
    if (!name) return res.status(400).json({ message: 'Nome é obrigatório' });
    const result = await pool.query(
      `INSERT INTO clients (name, cnpj, address, neighborhood, city, state, phone, email)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, cnpj || '', address || '', neighborhood || '', city || '', state || '', phone || '', email || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar cliente:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// PUT /api/clients/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cnpj, address, neighborhood, city, state, phone, email } = req.body;
    const result = await pool.query(
      `UPDATE clients SET name=COALESCE($1,name), cnpj=COALESCE($2,cnpj), address=COALESCE($3,address),
       neighborhood=COALESCE($4,neighborhood), city=COALESCE($5,city), state=COALESCE($6,state),
       phone=COALESCE($7,phone), email=COALESCE($8,email), updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [name, cnpj, address, neighborhood, city, state, phone, email, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clients WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Cliente não encontrado' });
    res.json({ message: 'Cliente removido' });
  } catch (err) {
    console.error('Erro ao remover cliente:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

module.exports = router;
