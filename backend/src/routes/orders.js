const express = require('express');
const { pool } = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const ordersResult = await pool.query(`
      SELECT o.*, c.name as client_name, c.cnpj as client_cnpj, c.address as client_address,
             c.neighborhood as client_neighborhood, c.city as client_city, c.state as client_state,
             c.phone as client_phone, c.email as client_email
      FROM orders o
      LEFT JOIN clients c ON o.client_id = c.id
      ORDER BY o.created_at DESC
    `);

    const orders = [];
    for (const row of ordersResult.rows) {
      const itemsResult = await pool.query(`
        SELECT oi.*, p.code as product_code, p.name as product_name, p.unit as product_unit,
               p.cost_price as product_cost_price, p.sale_price as product_sale_price,
               p.convention_price as product_convention_price, p.image_url as product_image_url
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [row.id]);

      orders.push({
        id: row.id,
        number: row.number,
        date: row.date,
        client: {
          id: row.client_id,
          name: row.client_name || '',
          cnpj: row.client_cnpj || '',
          address: row.client_address || '',
          neighborhood: row.client_neighborhood || '',
          city: row.client_city || '',
          state: row.client_state || '',
          phone: row.client_phone || '',
          email: row.client_email || '',
        },
        items: itemsResult.rows.map(i => ({
          id: i.id,
          productId: i.product_id,
          product: {
            id: i.product_id,
            code: i.product_code || '',
            name: i.product_name || '',
            unit: i.product_unit || 'PC',
            costPrice: parseFloat(i.product_cost_price || 0),
            salePrice: parseFloat(i.product_sale_price || 0),
            conventionPrice: parseFloat(i.product_convention_price || 0),
            imageUrl: i.product_image_url || '',
            description: '',
            active: true,
          },
          quantity: parseFloat(i.quantity),
          unitPrice: parseFloat(i.unit_price),
          discount: parseFloat(i.discount),
          total: parseFloat(i.total),
        })),
        subtotal: parseFloat(row.subtotal),
        freight: parseFloat(row.freight),
        taxSubstitution: parseFloat(row.tax_substitution),
        totalDiscount: parseFloat(row.total_discount),
        total: parseFloat(row.total),
        validityDays: row.validity_days,
        paymentCondition: row.payment_condition,
        paymentMethod: row.payment_method,
        deliveryDeadline: row.delivery_deadline,
        observations: row.observations,
        seller: row.seller,
        status: row.status,
      });
    }

    res.json(orders);
  } catch (err) {
    console.error('Erro ao listar pedidos:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

// POST /api/orders
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      date, clientId, items, subtotal, freight, taxSubstitution,
      totalDiscount, total, validityDays, paymentCondition,
      paymentMethod, deliveryDeadline, observations, seller, status
    } = req.body;

    const orderResult = await client.query(
      `INSERT INTO orders (date, client_id, subtotal, freight, tax_substitution, total_discount, total,
       validity_days, payment_condition, payment_method, delivery_deadline, observations, seller, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [
        date || new Date().toISOString().split('T')[0],
        clientId, subtotal || 0, freight || 0, taxSubstitution || 0,
        totalDiscount || 0, total || 0, validityDays || 7,
        paymentCondition || 'A VISTA', paymentMethod || 'DEPOSITO',
        deliveryDeadline || '', observations || '', seller || '', status || 'rascunho'
      ]
    );

    const order = orderResult.rows[0];

    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, discount, total)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [order.id, item.productId, item.quantity, item.unitPrice, item.discount || 0, item.total]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ ...order, number: order.number });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar pedido:', err);
    res.status(500).json({ message: 'Erro interno' });
  } finally {
    client.release();
  }
});

// PUT /api/orders/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observations } = req.body;
    const result = await pool.query(
      `UPDATE orders SET status=COALESCE($1,status), observations=COALESCE($2,observations), updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [status, observations, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Pedido não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar pedido:', err);
    res.status(500).json({ message: 'Erro interno' });
  }
});

module.exports = router;
