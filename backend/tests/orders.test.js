const request = require('supertest');
const app = require('../server');
const pool = require('../config/database');

describe('Orders API', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    // Create test user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        phone: '9999999999',
        password: 'test123456'
      });
    
    authToken = registerResponse.body.token;
    testUserId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await pool.query('DELETE FROM orders WHERE customer_phone = $1', ['9999999999']);
    await pool.query('DELETE FROM users WHERE phone = $1', ['9999999999']);
    await pool.end();
  });

  describe('POST /api/orders', () => {
    it('should create an order successfully', async () => {
      // First, get a service ID
      const servicesResponse = await request(app)
        .get('/api/services');
      
      const serviceId = servicesResponse.body.services[0].id;

      const orderData = {
        items: JSON.stringify([{
          service_id: serviceId,
          quantity: 5
        }]),
        customer_name: 'Test Customer',
        customer_phone: '9999999999',
        payment_method: 'cash'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .field('items', orderData.items)
        .field('customer_name', orderData.customer_name)
        .field('customer_phone', orderData.customer_phone)
        .field('payment_method', orderData.payment_method)
        .expect(201);

      expect(response.body.order).toHaveProperty('id');
      expect(response.body.order).toHaveProperty('ticket_number');
      expect(response.body.order.payment_method).toBe('cash');
    });

    it('should require customer phone', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: []
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/orders', () => {
    it('should get user orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.orders).toBeInstanceOf(Array);
    });
  });
});

