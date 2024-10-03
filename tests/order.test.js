const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const productService = require('../services/productService');

let server;
let userAccessToken, invalidToken, orderId, cartId;

beforeAll(async () => {
  server = app.listen(5200); // Start the server

  // Truncate users, products, and refresh_tokens tables to ensure a clean state
  await db.query('TRUNCATE users, refresh_tokens, orders, carts, cart_items, order_items RESTART IDENTITY CASCADE');

  // Create a test user and generate a valid token
  const testUser = await userService.registerUser('testuser', 'testuser@example.com', 'testpassword');
  userAccessToken = `Bearer ${jwt.sign({ id: testUser.id, email: testUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;

  // Generate an invalid/expired token
  invalidToken = 'Bearer invalidtoken';

  // Create a test product for the cart
  await productService.createProduct('Test Product', 'A product for testing', 50.00, 1); // Assuming category_id is 1
});

afterAll(async () => {
  await db.pool.end(); // Close the database connection
  server.close(); // Close the server
});

describe('Order Routes - Token Verification', () => {
  beforeAll(async () => {
    // Add product to cart and create the cart and order
    const addCartResponse = await request(app)
      .post('/cart')
      .set('Authorization', userAccessToken)
      .send({ product_id: 1, quantity: 2 });

    cartId = addCartResponse.body.cartItem.cart_id;

    // Place the order
    const total = 100.00;
    const orderResponse = await request(app)
      .post('/orders')
      .set('Authorization', userAccessToken)
      .send({ cart_id: cartId, total });

    orderId = orderResponse.body.order.id; // Store order ID for further tests
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).post('/orders').send({ cart_id: 1, total: 50.00 });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Header is required');
  });

  it('should return 403 if an invalid token is provided', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', invalidToken)
      .send({ cart_id: 1, total: 50.00 });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should allow placing an order with a valid token', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', userAccessToken)
      .send({ cart_id: cartId, total: 100.00 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('order');
    expect(parseFloat(res.body.order.total)).toBe(100.00);
  });

  it('should return 200 when fetching order by ID with a valid token', async () => {
    const res = await request(app)
      .get(`/orders/${orderId}`)
      .set('Authorization', userAccessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('order');
    expect(res.body.order.id).toBe(orderId);
  });

  it('should allow canceling an order with a valid token', async () => {
    const res = await request(app)
      .delete(`/orders/${orderId}`)
      .set('Authorization', userAccessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Order canceled');
  });
});