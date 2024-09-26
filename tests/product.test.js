const request = require('supertest');
const app = require('../app'); // Assuming this is your app's entry point
const tokenService = require('../services/tokenService');
const userService = require('../services/userService'); // Assuming users are needed for token generation

describe('Product Routes - Token Verification', () => {
  let accessToken;
  let refreshToken;

  beforeAll(async () => {
    // Create a test user and generate tokens for testing
    const testUser = await userService.registerUser('testuser', 'testuser@example.com', 'testpassword');
    refreshToken = await tokenService.generateRefreshToken(testUser.id);
    accessToken = `Bearer ${jwt.sign({ id: testUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
  });

  afterAll(async () => {
    // Clean up test data if necessary
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Token is required');
  });

  it('should return 403 if token is invalid', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should allow access with a valid token', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', accessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('products'); // Assuming products are returned
  });

  it('should revoke old refresh token and issue a new one if necessary', async () => {
    jest.spyOn(tokenService, 'verifyRefreshToken').mockImplementation(() => {
      throw new Error('Invalid or expired refresh token');
    });

    const res = await request(app)
      .get('/products')
      .set('Authorization', refreshToken); // Simulate token close to expiration

    expect(res.statusCode).toBe(403); // Expected behavior when token is invalid
    expect(tokenService.revokeRefreshToken).toHaveBeenCalled();
    expect(tokenService.generateRefreshToken).toHaveBeenCalled();
  });
});