const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment order
router.post('/create', authenticate, [
  body('order_id').isUUID().withMessage('Valid order ID required'),
  body('amount').isFloat({ min: 1 }).withMessage('Valid amount required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { order_id, amount } = req.body;

    // Verify order exists and amount matches
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Check if user owns the order or is admin
    if (order.user_id !== req.user.id && !['admin', 'cashier'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (parseFloat(amount) !== parseFloat(order.final_amount)) {
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: order.ticket_number,
      notes: {
        order_id: order.id,
        ticket_number: order.ticket_number
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create transaction record
    const transactionResult = await pool.query(
      `INSERT INTO transactions (order_id, amount, method, status, provider, provider_txn_id, provider_response)
       VALUES ($1, $2, 'online', 'pending', 'razorpay', $3, $4)
       RETURNING *`,
      [order_id, amount, razorpayOrder.id, JSON.stringify(razorpayOrder)]
    );

    await auditLog(req, 'PAYMENT_CREATE', 'transactions', transactionResult.rows[0].id);

    res.json({
      transaction: transactionResult.rows[0],
      razorpay_order_id: razorpayOrder.id,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    next(error);
  }
});

// Verify payment (webhook)
router.post('/verify', [
  body('razorpay_order_id').notEmpty(),
  body('razorpay_payment_id').notEmpty(),
  body('razorpay_signature').notEmpty()
], async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Update transaction
    const transactionResult = await pool.query(
      `UPDATE transactions 
       SET status = 'success', provider_txn_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE provider_txn_id = $2 AND status = 'pending'
       RETURNING *`,
      [razorpay_payment_id, razorpay_order_id]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = transactionResult.rows[0];

    // Update order payment status
    await pool.query(
      `UPDATE orders SET payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [transaction.order_id]
    );

    await auditLog(req, 'PAYMENT_VERIFY', 'transactions', transaction.id, { payment_id: razorpay_payment_id });

    res.json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
});

// Razorpay webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      
      await pool.query(
        `UPDATE transactions 
         SET status = 'success', provider_txn_id = $1, updated_at = CURRENT_TIMESTAMP
         WHERE provider_txn_id = $2 AND status = 'pending'
         RETURNING *`,
        [payment.id, payment.order_id]
      );

      const transactionResult = await pool.query(
        'SELECT order_id FROM transactions WHERE provider_txn_id = $1',
        [payment.id]
      );

      if (transactionResult.rows.length > 0) {
        await pool.query(
          `UPDATE orders SET payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [transactionResult.rows[0].order_id]
        );
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Mark cash payment
router.post('/cash', authenticate, authorize('admin', 'cashier'), [
  body('order_id').isUUID().withMessage('Valid order ID required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { order_id } = req.body;

    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Create cash transaction
    const transactionResult = await pool.query(
      `INSERT INTO transactions (order_id, amount, method, status, provider)
       VALUES ($1, $2, 'cash', 'success', 'manual')
       RETURNING *`,
      [order_id, order.final_amount]
    );

    // Update order
    await pool.query(
      `UPDATE orders SET payment_status = 'paid', payment_method = 'cash', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [order_id]
    );

    await auditLog(req, 'PAYMENT_CASH', 'transactions', transactionResult.rows[0].id);

    res.json({ transaction: transactionResult.rows[0], order: { ...order, payment_status: 'paid' } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

