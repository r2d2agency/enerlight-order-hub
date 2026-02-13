const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../database/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.use(adminOnly);

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, active FROM users ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, active',
      [name, email, hash, role || 'vendedor']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Email já cadastrado' });
    console.error('Erro ao criar usuário:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, active, password } = req.body;

    let query, params;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query = `UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email), role=COALESCE($3,role),
               active=COALESCE($4,active), password_hash=$5, updated_at=NOW() WHERE id=$6
               RETURNING id, name, email, role, active`;
      params = [name, email, role, active, hash, id];
    } else {
      query = `UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email), role=COALESCE($3,role),
               active=COALESCE($4,active), updated_at=NOW() WHERE id=$5
               RETURNING id, name, email, role, active`;
      params = [name, email, role, active, id];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Você não pode remover a si mesmo' });
    }
    const result = await pool.query('DELETE FROM users WHERE id=$1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json({ message: 'Usuário removido' });
  } catch (err) {
    console.error('Erro ao remover usuário:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

module.exports = router;
