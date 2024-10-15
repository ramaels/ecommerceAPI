const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

let userAccessToken, userId;

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

describe('User Profile Management', () => {
  // Test fetching the user profile
  it('should allow user to fetch their profile data', async () => {
    const res = await request(app)
      .get('/profile')
      .set('Authorization', userAccessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('testuser');
    expect(res.body.email).toBe('testuser@example.com');
  });

  // Test updating the user profile
  it('should allow user to update their profile', async () => {
    const res = await request(app)
      .put('/profile')
      .set('Authorization', userAccessToken)
      .send({
        username: 'newusername',
        email: 'newemail@example.com',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe('newusername');
    expect(res.body.email).toBe('newemail@example.com');
  });
});