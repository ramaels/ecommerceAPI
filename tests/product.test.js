// tests/product.test.js
const request = require('supertest');
const app = require('../app'); // Your Express app
const db = require('../config/db'); // Your DB configuration
const jwt = require('jsonwebtoken');
const tokenService = require('../services/tokenService');
const userService = require('../services/userService');
const productService = require('../services/productService');

let server;

beforeAll(() => {
  server = app.listen(5100);  // Start the server before running tests
});

afterAll(async () => {
  await db.pool.end();  // Close the pool after all tests
  server.close();       // Close the server after tests are done
});

describe('Product Routes - Token Verification and Admin Operations', () => {
  let userAccessToken;
  let adminAccessToken;
  let accessToken, refreshToken;
  let createdProductId;

  beforeAll(async () => {
    // Truncate users, products, and refresh_tokens tables to ensure a clean state
    await db.query('TRUNCATE users, products, refresh_tokens RESTART IDENTITY CASCADE');

    // Create a test user (non-admin)
    const testUser = await userService.registerUser('testuser', 'testuser@example.com', 'testpassword');
    refreshToken = await tokenService.generateRefreshToken(testUser.id);
    userAccessToken = `Bearer ${jwt.sign({ id: testUser.id, email: testUser.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;

    // Create an admin user
    const adminUser = await userService.registerUser('adminuser', 'admin@example.com', 'adminpassword', 'admin');
    const adminRefreshToken = await tokenService.generateRefreshToken(adminUser.id);
    adminAccessToken = `Bearer ${jwt.sign({ id: adminUser.id, email: adminUser.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;

    // Insert sample products for testing
    const insertProductsQuery = `
      INSERT INTO products (name, description, price, category_id)
      VALUES 
        ('Laptop', 'A high-performance laptop.', 999.99, 1),
        ('Smartphone', 'Latest model smartphone.', 699.99, 1),
        ('Headphones', 'Noise-cancelling headphones.', 199.99, 2)
      RETURNING id;
    `;
    const res = await db.query(insertProductsQuery);
    createdProductId = res.rows[0].id; // Store the ID of the first inserted product
  });

  afterEach(() => {
    // Reset all mocks after each test
    jest.clearAllMocks();
  });
  
  it('should return 401 if no header is provided', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Header is required');
  });

  it('should return 401 if no Token is provided', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer');
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

  it('should allow access with a valid user token', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', userAccessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('should return 200 and new tokens when using a valid refresh token', async () => {
    const res = await request(app)
      .post('/refresh-token')
      .send({ token: refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  // it('should return 404 when refreshing with a valid refresh token but no user were found', async () => {
  //   jest.spyOn(userService, 'findUserById').mockImplementation(() => {
  //     return false;
  //   });

  //   const res = await request(app)
  //     .post('/refresh-token')
  //     .set('Authorization', userAccessToken)
  //     .send({ token: refreshToken });

  //   expect(res.statusCode).toBe(404);
  //   expect(res.body.message).toBe('User not found');
  // });

  it('should return 403 if refresh token is used as access token', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', `Bearer ${refreshToken}`); // Simulate using refresh token

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should return 403 when refreshing with an invalid refresh token', async () => {
    const res = await request(app)
      .post('/refresh-token')
      .send({ token: 'invalidrefreshtoken' });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Invalid or expired refresh token');
  });

  it('should return 400 when refreshing with a missing refresh token', async () => {
    const res = await request(app)
      .post('/refresh-token');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Refresh token is required');
  });

  it('should return 500 if an error occurs while fetching products', async () => {
    jest.spyOn(productService, 'getAllProducts').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .get('/products')
      .set('Authorization', userAccessToken);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Server error fetching products');
  });

  it('should fetch a specific product by ID', async () => {
    const res = await request(app)
      .get('/products/2')
      .set('Authorization', userAccessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('product');
    expect(res.body.product.name).toBe('Smartphone');
  });

  it('should return 404 when fetching a specific product with a non-existing ID', async () => {
    const res = await request(app)
      .get('/products/999')
      .set('Authorization', userAccessToken);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Product not found');
  });

  it('should return 500 if an error occurs while fetching a specific product by ID', async () => {
    jest.spyOn(productService, 'getProductById').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .get('/products/2')
      .set('Authorization', userAccessToken);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Server error fetching a specific product by ID');
  });

  // Admin Operations Tests
  describe('Admin Operations on Product Routes', () => {
    it('should allow access with a valid admin token', async () => {
      const res = await request(app)
        .get('/products')
        .set('Authorization', adminAccessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);
    });

    it('should allow admin to create a new product', async () => {
      const newProduct = {
        name: 'Tablet',
        description: 'A lightweight tablet.',
        price: 299.99,
        category_id: 1
      };

      const res = await request(app)
        .post('/products')
        .set('Authorization', adminAccessToken)
        .send(newProduct);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('product');
      expect(res.body.product.name).toBe(newProduct.name);
      expect(res.body.product.description).toBe(newProduct.description);
      expect(res.body.product.price).toBe(newProduct.price.toString()); // Depending on how decimals are handled
      expect(res.body.product.category_id).toBe(newProduct.category_id);
    });

    it('should return 500 if an error occurs while creating a new product', async () => {
      jest.spyOn(productService, 'createProduct').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
        const newProduct = {
        name: 'Tablet',
        description: 'A lightweight tablet.',
        price: 299.99,
        category_id: 1
      };

      const res = await request(app)
        .post('/products')
        .set('Authorization', adminAccessToken)
        .send(newProduct);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Server error creating product');
    });

    it('should forbid non-admin user from creating a new product', async () => {
      const newProduct = {
        name: 'Tablet',
        description: 'A lightweight tablet.',
        price: 299.99,
        category_id: 1
      };

      const res = await request(app)
        .post('/products')
        .set('Authorization', userAccessToken)
        .send(newProduct);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Admin access required');
    });

    it('should allow admin to update an existing product', async () => {
      const updatedProduct = {
        name: 'Gaming Laptop',
        description: 'A high-performance gaming laptop.',
        price: 1299.99,
        category_id: 1
      };

      const res = await request(app)
        .put(`/products/${createdProductId}`)
        .set('Authorization', adminAccessToken)
        .send(updatedProduct);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('product');
      expect(res.body.product.name).toBe(updatedProduct.name);
      expect(res.body.product.description).toBe(updatedProduct.description);
      expect(res.body.product.price).toBe(updatedProduct.price.toString());
      expect(res.body.product.category_id).toBe(updatedProduct.category_id);
    });

    it('should forbid non-admin user from updating a product', async () => {
      const updatedProduct = {
        name: 'Gaming Laptop',
        description: 'A high-performance gaming laptop.',
        price: 1299.99,
        category_id: 1
      };

      const res = await request(app)
        .put(`/products/${createdProductId}`)
        .set('Authorization', userAccessToken)
        .send(updatedProduct);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Admin access required');
    });

    it('should return 404 when admin tries to update a non-existent product', async () => {
      const updatedProduct = {
        name: 'Non-existent Product',
        description: 'This product does not exist.',
        price: 0.00,
        category_id: 1
      };

      const res = await request(app)
        .put('/products/9999') // Assuming this ID does not exist
        .set('Authorization', adminAccessToken)
        .send(updatedProduct);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Product not found');
    });

    it('should return 500 if an error occurs while updating an existing product', async () => {
      jest.spyOn(productService, 'updateProduct').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const updatedProduct = {
        name: 'Gaming Laptop',
        description: 'A high-performance gaming laptop.',
        price: 1299.99,
        category_id: 1
      };

      const res = await request(app)
        .put(`/products/${createdProductId}`)
        .set('Authorization', adminAccessToken)
        .send(updatedProduct);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Server error updating product');
    });

    it('should return 500 if an error occurs while admin is deleting a product', async () => {
      jest.spyOn(productService, 'deleteProduct').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .delete(`/products/${createdProductId}`)
        .set('Authorization', adminAccessToken);

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Server error deleting product');
    });

    it('should allow admin to delete a product', async () => {
      const res = await request(app)
        .delete(`/products/${createdProductId}`)
        .set('Authorization', adminAccessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Product deleted successfully');
    });

    it('should forbid non-admin user from deleting a product', async () => {
      // First, create a product to attempt deletion
      const newProduct = {
        name: 'Speaker',
        description: 'High-quality speaker.',
        price: 149.99,
        category_id: 2
      };

      const createRes = await request(app)
        .post('/products')
        .set('Authorization', adminAccessToken)
        .send(newProduct);

      const productId = createRes.body.product.id;

      const res = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', userAccessToken);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Admin access required');
    });

    it('should return 404 when admin tries to delete a non-existent product', async () => {
      const res = await request(app)
        .delete('/products/9999') // Assuming this ID does not exist
        .set('Authorization', adminAccessToken);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Product not found');
    });
  });

  describe('GET /products with pagination', () => {
    beforeAll(async () => {
      // Optionally insert some products into the database
      await db.query(`
      INSERT INTO products (name, description, price, category_id)
      VALUES
        ('Product1', 'Description1', 100, 1),
        ('Product2', 'Description2', 200, 1),
        ('Product3', 'Description3', 300, 1),
        ('Product4', 'Description4', 400, 1),
        ('Product5', 'Description5', 500, 1)
    `);
    });

    it('should fetch the products containing "product" in their name', async () => {
      const res = await request(app)
        .get('/products?search=product')
        .set('Authorization', userAccessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(res.body.products.length).toBe(5);  // Expecting 5 products
    });

    it('should fetch the products containing "description" in their description', async () => {
      const res = await request(app)
        .get('/products?search=description')
        .set('Authorization', userAccessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(res.body.products.length).toBe(5);  // Expecting 5 products
    });

    it('should fetch the products containing "d" in their name or description', async () => {
      const res = await request(app)
        .get('/products?search=d')
        .set('Authorization', userAccessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(res.body.products.length).toBe(7);  // Expecting 5 products
    });

    it('should fetch the products containing "d" in their name or description and "e" in their category', async () => {
      const res = await request(app)
        .get('/products?search=d&category=e')
        .set('Authorization', userAccessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(res.body.products.length).toBe(7);  // Expecting 5 products
    });

    it('should fetch the first page of products', async () => {
      const res = await request(app)
        .get('/products?page=1&size=2')
        .set('Authorization', userAccessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(res.body.products.length).toBe(2);  // Expecting 2 products
    });

    it('should fetch the second page of products with 2 items', async () => {
      const res = await request(app)
        .get('/products?page=2&size=2')
        .set('Authorization', userAccessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(res.body.products.length).toBe(2);  // Expecting 2 products on the second page
    });

    it('should return an empty array if page exceeds total number of products', async () => {
      const res = await request(app)
        .get('/products?page=10&size=2')
        .set('Authorization', userAccessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBe(0);  // No products on page 10
    });
  });
});

