const request = require('supertest');
const app = require('../app'); // Assume app.js is the entry point
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

let userAccessToken, userId, shippingAddressId;

beforeAll(async () => {
  // Start the server
  server = app.listen(5200);

  // Truncate all tested tables to ensure a clean state
  await db.query('TRUNCATE users, refresh_tokens, products, orders, carts, cart_items, cart_coupons, shipping_addresses, order_items RESTART IDENTITY CASCADE');

  // Create a test user and generate a valid token
  const testUser = await userService.registerUser('testuser', 'testuser@example.com', 'testpassword');
  userId = testUser.id;
  userAccessToken = `Bearer ${jwt.sign({ id: userId, email: testUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
});

afterAll(async () => {
  await db.pool.end(); // Close the database connection
  server.close(); // Close the server
});

describe('Shipping Address Management', () => {
  // Test adding a new shipping address
  it('should allow user to add a new shipping address', async () => {
    const res = await request(app)
      .post('/shipping-addresses')
      .set('Authorization', userAccessToken)
      .send({
        address_line_1: '123 Main St',
        address_line_2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'USA',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    shippingAddressId = res.body.id;
  });

  // Test fetching all shipping addresses for a user
  it('should allow user to view all shipping addresses', async () => {
    const res = await request(app)
      .get('/shipping-addresses')
      .set('Authorization', userAccessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test updating a shipping address
  it('should allow user to update a shipping address', async () => {
    const res = await request(app)
      .put(`/shipping-addresses/${shippingAddressId}`)
      .set('Authorization', userAccessToken)
      .send({
        address_line_1: '456 Elm St',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94102',
        country: 'USA',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.address_line_1).toBe('456 Elm St');
  });

  // Test deleting a shipping address
  it('should allow user to delete a shipping address', async () => {
    const res = await request(app)
      .delete(`/shipping-addresses/${shippingAddressId}`)
      .set('Authorization', userAccessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Shipping address deleted successfully');
  });
});