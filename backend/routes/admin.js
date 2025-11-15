const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin', 'cashier'));

// Get dashboard stats
router.get('/dashboard', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = $1) as today_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'in_progress') as in_progress_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'ready') as ready_orders,
        (SELECT COALESCE(SUM(final_amount), 0) FROM orders WHERE DATE(created_at) = $1 AND payment_status = 'paid') as today_revenue,
        (SELECT COALESCE(SUM(final_amount), 0) FROM orders WHERE payment_status = 'paid') as total_revenue
    `, [today]);

    res.json({ stats: stats.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get all users
router.get('/users', async (req, res, next) => {
  try {
    const { role, search, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      params.push(role);
    }

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR phone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json({ users: result.rows });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/users/:id', [
  body('role').optional().isIn(['customer', 'staff', 'cashier', 'admin']),
  body('is_active').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role, is_active } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 0;

    if (role !== undefined) {
      paramCount++;
      updates.push(`role = $${paramCount}`);
      values.push(role);
    }

    if (is_active !== undefined) {
      paramCount++;
      updates.push(`is_active = $${paramCount}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    paramCount++;
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING id, name, email, phone, role, is_active, created_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await auditLog(req, 'USER_UPDATE', 'users', req.params.id, req.body);

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get settings
router.get('/settings', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM settings ORDER BY key');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json({ settings });
  } catch (error) {
    next(error);
  }
});

// Update settings
router.put('/settings/:key', [
  body('value').notEmpty().withMessage('Value is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { key } = req.params;
    const { value, description } = req.body;

    const result = await pool.query(
      `INSERT INTO settings (key, value, description, updated_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key) DO UPDATE
       SET value = $2, description = COALESCE($3, settings.description), updated_by = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, JSON.stringify({ value }), description || null, req.user.id]
    );

    await auditLog(req, 'SETTINGS_UPDATE', 'settings', key, { value });

    res.json({ setting: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Manual order creation (admin)
router.post('/orders', [
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('customer_phone').trim().notEmpty().withMessage('Phone required'),
  body('payment_method').isIn(['online', 'cash', 'pay_later'])
], async (req, res, next) => {
  try {
    // Similar to public order creation but with admin privileges
    // Reuse order creation logic from orders route
    res.json({ message: 'Manual order creation - implement similar to POST /api/orders' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

