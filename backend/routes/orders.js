const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../utils/fileUpload');
const { generateTicketNumber } = require('../utils/ticketGenerator');
const { calculateOrderTotal, applyCharges } = require('../utils/pricing');
const auditLog = require('../middleware/audit');

const router = express.Router();

// Create order
router.post('/', upload.array('files', 10), [
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.service_id').isUUID().withMessage('Valid service ID required'),
  body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Valid quantity required'),
  body('customer_name').optional().trim().notEmpty(),
  body('customer_phone').trim().notEmpty().withMessage('Phone number required'),
  body('customer_email').optional().isEmail(),
  body('payment_method').isIn(['online', 'cash', 'pay_later']).withMessage('Valid payment method required')
], async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, customer_name, customer_phone, customer_email, payment_method, pickup_time, delivery_address, notes } = req.body;
    const userId = req.user?.id || null;

    // Calculate pricing
    const { subtotal, items: calculatedItems } = await calculateOrderTotal(items);
    const charges = await applyCharges(subtotal);

    // Generate ticket number
    let ticketNumber;
    let isUnique = false;
    while (!isUnique) {
      ticketNumber = generateTicketNumber();
      const check = await client.query('SELECT id FROM orders WHERE ticket_number = $1', [ticketNumber]);
      isUnique = check.rows.length === 0;
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (
        user_id, ticket_number, status, payment_status, total_amount, tax_amount,
        service_charge, discount_amount, final_amount, payment_method, pickup_time,
        delivery_address, customer_name, customer_phone, customer_email, notes
      ) VALUES ($1, $2, 'pending', 'pending', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        userId, ticketNumber, charges.subtotal, charges.tax_amount, charges.service_charge,
        0, charges.total, payment_method, pickup_time || null, delivery_address || null,
        customer_name || null, customer_phone, customer_email || null, notes || null
      ]
    );

    const order = orderResult.rows[0];

    // Create order items
    const orderItems = [];
    for (const item of calculatedItems) {
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, service_id, quantity, unit_rate, subtotal, options)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [order.id, item.service_id, item.quantity, item.unit_rate, item.subtotal, JSON.stringify(item.options || {})]
      );
      orderItems.push(itemResult.rows[0]);
    }

    // Handle file uploads
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileResult = await client.query(
          `INSERT INTO files (order_id, filename, original_filename, file_path, file_size, mime_type)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [order.id, file.filename, file.originalname, file.path, file.size, file.mimetype]
        );
        uploadedFiles.push(fileResult.rows[0]);
      }
    }

    await client.query('COMMIT');

    await auditLog(req, 'ORDER_CREATE', 'orders', order.id);

    // Fetch complete order with relations
    const completeOrder = await pool.query(
      `SELECT o.*, 
              json_agg(DISTINCT jsonb_build_object(
                'id', oi.id, 'service_id', oi.service_id, 'quantity', oi.quantity,
                'unit_rate', oi.unit_rate, 'subtotal', oi.subtotal, 'options', oi.options
              )) as items,
              json_agg(DISTINCT jsonb_build_object(
                'id', f.id, 'filename', f.filename, 'original_filename', f.original_filename,
                'file_path', f.file_path, 'mime_type', f.mime_type
              )) as files
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN files f ON o.id = f.order_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [order.id]
    );

    res.status(201).json({ order: completeOrder.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// Get orders (with filters)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, payment_status, user_id, limit = 50, offset = 0 } = req.query;
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
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (!isAdmin) {
      paramCount++;
      query += ` AND (o.user_id = $${paramCount} OR o.customer_phone = $${paramCount + 1})`;
      params.push(req.user.id, req.user.phone);
      paramCount++;
    } else if (user_id) {
      paramCount++;
      query += ` AND o.user_id = $${paramCount}`;
      params.push(user_id);
    }

    if (status) {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
    }

    if (payment_status) {
      paramCount++;
      query += ` AND o.payment_status = $${paramCount}`;
      params.push(payment_status);
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json({ orders: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get order by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const isAdmin = ['admin', 'cashier', 'staff'].includes(req.user.role);

    let query = `
      SELECT o.*,
             json_agg(DISTINCT jsonb_build_object(
               'id', oi.id, 'service_id', oi.service_id, 'service_name', s.name,
               'service_description', s.description, 'quantity', oi.quantity,
               'unit_rate', oi.unit_rate, 'subtotal', oi.subtotal, 'options', oi.options
             )) as items,
             json_agg(DISTINCT jsonb_build_object(
               'id', f.id, 'filename', f.filename, 'original_filename', f.original_filename,
               'file_path', f.file_path, 'file_size', f.file_size, 'mime_type', f.mime_type
             )) FILTER (WHERE f.id IS NOT NULL) as files
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN services s ON oi.service_id = s.id
      LEFT JOIN files f ON o.id = f.order_id
      WHERE o.id = $1
    `;

    if (!isAdmin) {
      query += ` AND (o.user_id = $2 OR o.customer_phone = $3)`;
      const result = await pool.query(query, [req.params.id, req.user.id, req.user.phone]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ order: result.rows[0] });
    } else {
      const result = await pool.query(query + ' GROUP BY o.id', [req.params.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ order: result.rows[0] });
    }
  } catch (error) {
    next(error);
  }
});

// Update order status (admin/staff)
router.put('/:id/status', authenticate, authorize('admin', 'cashier', 'staff'), [
  body('status').isIn(['pending', 'in_progress', 'ready', 'completed', 'cancelled']).withMessage('Valid status required'),
  body('assigned_to').optional().isUUID()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, assigned_to, notes } = req.body;
    const updates = { status };
    if (assigned_to) updates.assigned_to = assigned_to;
    if (notes !== undefined) updates.notes = notes;

    const result = await pool.query(
      `UPDATE orders SET status = $1, assigned_to = $2, notes = COALESCE($3, notes), updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [status, assigned_to || null, notes || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await auditLog(req, 'ORDER_STATUS_UPDATE', 'orders', req.params.id, updates);

    res.json({ order: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

