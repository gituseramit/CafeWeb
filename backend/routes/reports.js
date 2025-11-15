const express = require('express');
const { query, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin', 'cashier'));

// Daily sales report
router.get('/daily', [
  query('date').optional().isISO8601().withMessage('Valid date required (YYYY-MM-DD)')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reportDate = req.query.date || new Date().toISOString().split('T')[0];

    const result = await pool.query(`
      SELECT 
        o.id, o.ticket_number, o.created_at, o.status, o.payment_status,
        o.total_amount, o.tax_amount, o.service_charge, o.final_amount,
        o.customer_name, o.customer_phone, o.payment_method,
        json_agg(jsonb_build_object(
          'service_name', s.name,
          'quantity', oi.quantity,
          'unit_rate', oi.unit_rate,
          'subtotal', oi.subtotal
        )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN services s ON oi.service_id = s.id
      WHERE DATE(o.created_at) = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [reportDate]);

    res.json({
      date: reportDate,
      total_orders: result.rows.length,
      total_revenue: result.rows
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + parseFloat(o.final_amount), 0),
      orders: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// Export daily report as CSV
router.get('/daily/export', [
  query('date').optional().isISO8601()
], async (req, res, next) => {
  try {
    const reportDate = req.query.date || new Date().toISOString().split('T')[0];

    const result = await pool.query(`
      SELECT 
        o.ticket_number, o.created_at, o.status, o.payment_status,
        o.final_amount, o.customer_name, o.customer_phone, o.payment_method,
        string_agg(s.name || ' (x' || oi.quantity || ')', ', ') as services
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN services s ON oi.service_id = s.id
      WHERE DATE(o.created_at) = $1
      GROUP BY o.id, o.ticket_number, o.created_at, o.status, o.payment_status, o.final_amount, o.customer_name, o.customer_phone, o.payment_method
      ORDER BY o.created_at DESC
    `, [reportDate]);

    const csvPath = path.join(__dirname, '../temp', `report-${reportDate}.csv`);
    const csvDir = path.dirname(csvPath);
    if (!fs.existsSync(csvDir)) {
      fs.mkdirSync(csvDir, { recursive: true });
    }

    const csvWriter = createCsvWriter({
      path: csvPath,
      header: [
        { id: 'ticket_number', title: 'Ticket Number' },
        { id: 'created_at', title: 'Date' },
        { id: 'customer_name', title: 'Customer Name' },
        { id: 'customer_phone', title: 'Phone' },
        { id: 'services', title: 'Services' },
        { id: 'final_amount', title: 'Amount (₹)' },
        { id: 'payment_method', title: 'Payment Method' },
        { id: 'payment_status', title: 'Payment Status' },
        { id: 'status', title: 'Order Status' }
      ]
    });

    await csvWriter.writeRecords(result.rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at).toLocaleString('en-IN'),
      final_amount: `₹${parseFloat(row.final_amount).toFixed(2)}`
    })));

    res.download(csvPath, `daily-report-${reportDate}.csv`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        if (fs.existsSync(csvPath)) {
          fs.unlinkSync(csvPath);
        }
      }, 5000);
    });
  } catch (error) {
    next(error);
  }
});

// Service-wise sales report
router.get('/services', [
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601()
], async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    let query = `
      SELECT 
        s.id, s.name, s.category,
        COUNT(oi.id) as total_orders,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.subtotal) as total_revenue
      FROM services s
      LEFT JOIN order_items oi ON s.id = oi.service_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (start_date) {
      paramCount++;
      query += ` AND DATE(o.created_at) >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND DATE(o.created_at) <= $${paramCount}`;
      params.push(end_date);
    }

    query += ` GROUP BY s.id, s.name, s.category ORDER BY total_revenue DESC`;

    const result = await pool.query(query, params);
    res.json({ services: result.rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

