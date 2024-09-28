const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

let server, adminAccessToken, userAccessToken;

beforeAll(async () => {
  server = app.listen(5200);  // Start the server for testing

  // Truncate tables to ensure clean state
  await db.query('TRUNCATE users, categories RESTART IDENTITY CASCADE');

  // Create admin user and regular user
  const adminUser = await userService.registerUser('adminuser', 'admin@example.com', 'adminpassword', 'admin');
  const regularUser = await userService.registerUser('testuser', 'user@example.com', 'userpassword', 'user');

  // Generate tokens
  adminAccessToken = `Bearer ${jwt.sign({ id: adminUser.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
  userAccessToken = `Bearer ${jwt.sign({ id: regularUser.id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
});

afterAll(async () => {
  await db.pool.end();
  server.close();
});

describe('Category Management (CRUD) - Admin Only', () => {
  let createdCategoryId;

  it('should allow admin to create a category', async () => {
    const res = await request(app)
      .post('/categories')
      .set('Authorization', adminAccessToken)
      .send({
        name: 'Electronics',
        description: 'Devices and gadgets',
      });
      
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('category');
    expect(res.body.category.name).toBe('Electronics');
    expect(res.body.category.description).toBe('Devices and gadgets');
    createdCategoryId = res.body.category.id;  // Store the created category ID
  });

  it('should forbid non-admin user from creating a category', async () => {
    const res = await request(app)
      .post('/categories')
      .set('Authorization', userAccessToken)
      .send({
        name: 'Accessories',
        description: 'Various accessories',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Admin access required');
  });

  it('should allow admin to fetch all categories', async () => {
    const res = await request(app)
      .get('/categories')
      .set('Authorization', adminAccessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('categories');
    expect(Array.isArray(res.body.categories)).toBe(true);
  });

  it('should allow admin to fetch a specific category by ID', async () => {
    const res = await request(app)
      .get(`/categories/${createdCategoryId}`)
      .set('Authorization', adminAccessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('category');
    expect(res.body.category.id).toBe(createdCategoryId);
  });

  it('should allow admin to update a category', async () => {
    const updatedCategory = {
      name: 'Home Electronics',
      description: 'Devices for home use',
    };

    const res = await request(app)
      .put(`/categories/${createdCategoryId}`)
      .set('Authorization', adminAccessToken)
      .send(updatedCategory);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('category');
    expect(res.body.category.name).toBe(updatedCategory.name);
    expect(res.body.category.description).toBe(updatedCategory.description);
  });

  it('should forbid non-admin user from updating a category', async () => {
    const updatedCategory = {
      name: 'Home Electronics',
      description: 'Devices for home use',
    };

    const res = await request(app)
      .put(`/categories/${createdCategoryId}`)
      .set('Authorization', userAccessToken)
      .send(updatedCategory);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Admin access required');
  });

  it('should allow admin to delete a category', async () => {
    const res = await request(app)
      .delete(`/categories/${createdCategoryId}`)
      .set('Authorization', adminAccessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Category deleted successfully');
  });

  it('should forbid non-admin user from deleting a category', async () => {
    const res = await request(app)
      .delete(`/categories/${createdCategoryId}`)
      .set('Authorization', userAccessToken);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Admin access required');
  });
});
