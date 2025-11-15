const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { generateReceipt } = require('../utils/receipt');

const router = express.Router();

// Generate receipt PDF
router.get('/:orderId', authenticate, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const isAdmin = ['admin', 'cashier', 'staff'].includes(req.user.role);

    let query = `
      SELECT o.*,
             json_agg(DISTINCT jsonb_build_object(
               'id', oi.id, 'service_id', oi.service_id, 'service_name', s.name,
               'quantity', oi.quantity, 'unit_rate', oi.unit_rate, 'subtotal', oi.subtotal
             )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN services s ON oi.service_id = s.id
      WHERE o.id = $1
      GROUP BY o.id
    `;

    if (!isAdmin) {
      query += ` AND (o.user_id = $2 OR o.customer_phone = $3)`;
      const result = await pool.query(query, [orderId, req.user.id, req.user.phone]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      const order = result.rows[0];
      const pdfBytes = await generateReceipt(order);
      res.contentType('application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${order.ticket_number}.pdf"`);
      res.send(pdfBytes);
    } else {
      const result = await pool.query(query, [orderId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      const order = result.rows[0];
      const pdfBytes = await generateReceipt(order);
      res.contentType('application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${order.ticket_number}.pdf"`);
      res.send(pdfBytes);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

