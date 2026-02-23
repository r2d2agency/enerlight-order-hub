const express = require('express');
const router = express.Router();
const { pool } = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// ---- Templates (admin/projetista only) ----

function adminOrProjetista(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'projetista') {
    return res.status(403).json({ message: 'Acesso restrito a administradores e projetistas' });
  }
  next();
}

// List templates
router.get('/templates', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM project_templates ORDER BY name');
  res.json(rows.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    items: r.items || [],
    createdAt: r.created_at,
  })));
});

// Create template
router.post('/templates', adminOrProjetista, async (req, res) => {
  const { name, description, items } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO project_templates (name, description, items) VALUES ($1, $2, $3) RETURNING *',
    [name, description || '', JSON.stringify(items || [])]
  );
  const r = rows[0];
  res.status(201).json({ id: r.id, name: r.name, description: r.description, items: r.items });
});

// Update template
router.put('/templates/:id', adminOrProjetista, async (req, res) => {
  const { name, description, items } = req.body;
  await pool.query(
    'UPDATE project_templates SET name=$1, description=$2, items=$3, updated_at=NOW() WHERE id=$4',
    [name, description || '', JSON.stringify(items || []), req.params.id]
  );
  res.json({ message: 'Template atualizado' });
});

// Delete template
router.delete('/templates/:id', adminOrProjetista, async (req, res) => {
  await pool.query('DELETE FROM project_templates WHERE id=$1', [req.params.id]);
  res.json({ message: 'Template removido' });
});

// ---- Projects ----

// List projects
router.get('/', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT p.*, c.name as client_name, c.cnpj as client_cnpj, 
           pt.name as template_name, u.name as creator_name
    FROM projects p
    LEFT JOIN clients c ON p.client_id = c.id
    LEFT JOIN project_templates pt ON p.template_id = pt.id
    LEFT JOIN users u ON p.created_by = u.id
    ORDER BY p.created_at DESC
  `);
  res.json(rows.map(r => ({
    id: r.id,
    name: r.name,
    clientId: r.client_id,
    clientName: r.client_name,
    clientCnpj: r.client_cnpj,
    templateId: r.template_id,
    templateName: r.template_name,
    items: r.items || [],
    notes: r.notes,
    status: r.status,
    createdBy: r.created_by,
    creatorName: r.creator_name,
    createdAt: r.created_at,
  })));
});

// Create project
router.post('/', async (req, res) => {
  const { name, clientId, templateId, items, notes, status } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO projects (name, client_id, template_id, items, notes, status, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, clientId || null, templateId || null, JSON.stringify(items || []), notes || '', status || 'rascunho', req.user.id]
  );
  const r = rows[0];
  res.status(201).json({ id: r.id, name: r.name, status: r.status });
});

// Update project
router.put('/:id', async (req, res) => {
  const { name, clientId, templateId, items, notes, status } = req.body;
  await pool.query(
    `UPDATE projects SET name=$1, client_id=$2, template_id=$3, items=$4, notes=$5, status=$6, updated_at=NOW() WHERE id=$7`,
    [name, clientId || null, templateId || null, JSON.stringify(items || []), notes || '', status || 'rascunho', req.params.id]
  );
  res.json({ message: 'Projeto atualizado' });
});

// Delete project
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
  res.json({ message: 'Projeto removido' });
});

module.exports = router;
