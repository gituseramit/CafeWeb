const express = require('express');
const { body, validationResult, query } = require('express-validator');
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

const router = express.Router();

// Get all services (public)
router.get('/', [
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('active').optional().isBoolean()
], async (req, res, next) => {
  try {
    const { category, search, active } = req.query;
    let query = 'SELECT * FROM services WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (active !== undefined) {
      paramCount++;
      query += ` AND active = $${paramCount}`;
      params.push(active === 'true');
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY category, name';

    const result = await pool.query(query, params);
    res.json({ services: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get service by ID
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ service: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Create service (admin only)
router.post('/', authenticate, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('base_price').isFloat({ min: 0 }).withMessage('Valid base price required'),
  body('unit').optional().isString(),
  body('description').optional().isString()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, base_price, min_price, max_price, unit, default_options, category, active } = req.body;

    const result = await pool.query(
      `INSERT INTO services (name, description, base_price, min_price, max_price, unit, default_options, category, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, description || null, base_price, min_price || null, max_price || null, unit || 'per page', 
       JSON.stringify(default_options || {}), category || null, active !== false]
    );

    await auditLog(req, 'SERVICE_CREATE', 'services', result.rows[0].id, req.body);

    res.status(201).json({ service: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Update service (admin only)
router.put('/:id', authenticate, authorize('admin'), [
  body('name').optional().trim().notEmpty(),
  body('base_price').optional().isFloat({ min: 0 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    const allowedFields = ['name', 'description', 'base_price', 'min_price', 'max_price', 'unit', 'default_options', 'category', 'active'];
    
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        paramCount++;
        if (field === 'default_options') {
          updateFields.push(`${field} = $${paramCount}`);
          values.push(JSON.stringify(updates[field]));
        } else {
          updateFields.push(`${field} = $${paramCount}`);
          values.push(updates[field]);
        }
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    paramCount++;
    values.push(id);

    const result = await pool.query(
      `UPDATE services SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    await auditLog(req, 'SERVICE_UPDATE', 'services', id, updates);

    res.json({ service: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Delete service (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    await auditLog(req, 'SERVICE_DELETE', 'services', req.params.id);

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

