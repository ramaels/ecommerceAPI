const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const userService = require('../services/userService');
const productService = require('../services/productService'); // Assuming products exist in your system
const jwt = require('jsonwebtoken');

let server, userAccessToken, userId;

beforeAll(async () => {
  server = app.listen(5200);  // Start server for testing

  // Truncate users, products, and refresh_tokens tables to ensure a clean state
  await db.query('TRUNCATE users, products, refresh_tokens RESTART IDENTITY CASCADE');

  // Create test user and generate token
  const testUser = await userService.registerUser('testuser', 'testuser@example.com', 'testpassword');
  userId = testUser.id;
  userAccessToken = `Bearer ${jwt.sign({ id: userId, email: testUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;

  // Clean up test data before running tests
  await db.query('TRUNCATE carts, cart_items, orders, order_items RESTART IDENTITY CASCADE');

  // Insert a test product (required for the cart)
  await productService.createProduct('Test Product', 'Test description', 100.00, 1); // Assuming category_id is 1
});

afterAll(async () => {
  await db.pool.end();
  server.close();
});

describe('Cart Logic', () => {
  let cartId;

  it('should allow user to add an item to the cart', async () => {
    // Add product to cart
    const res = await request(app)
      .post('/cart')
      .set('Authorization', userAccessToken)
      .send({ product_id: 1, quantity: 2 }); // Assuming the product ID is 1

    expect(res.statusCode).toBe(201);
    expect(res.body.cartItem).toHaveProperty('id');
    cartId = res.body.cartItem.cart_id; // Capture cart_id for further tests
  });

  it('should allow user to update item quantity in cart', async () => {
    const res = await request(app)
      .put(`/cart/${cartId}`)
      .set('Authorization', userAccessToken)
      .send({ product_id: 1, quantity: 3 });

    expect(res.statusCode).toBe(200);
    expect(res.body.cartItem.quantity).toBe(3);
  });

  it('should allow user to view their cart', async () => {
    const res = await request(app)
      .get(`/cart`)
      .set('Authorization', userAccessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.cartItems).toHaveLength(1); // Expect 1 item in the cart
  });

  it('should allow user to remove an item from the cart', async () => {
    const res = await request(app)
      .delete(`/cart/${cartId}`)
      .set('Authorization', userAccessToken)
      .send({ product_id: 1, quantity_to_remove: 3 }); // Provide the product_id, quantity_to_remove for removal

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Item removed from cart');
  });
});

describe('Order Logic', () => {
  let orderId, cartId;

  it('should allow user to place an order', async () => {
    // First, add product to cart to create a cart
    await request(app)
      .post('/cart')
      .set('Authorization', userAccessToken)
      .send({ product_id: 1, quantity: 2 });

    // Get cart items to retrieve the cart ID
    const cartResponse = await request(app)
      .get('/cart')
      .set('Authorization', userAccessToken);
    cartId = cartResponse.body.cartItems[0].cart_id;

    const res = await request(app)
      .post('/checkout')
      .set('Authorization', userAccessToken)
      .send({ cart_id: cartId });

    expect(res.statusCode).toBe(201);
    expect(res.body.order).toHaveProperty('id');
    orderId = res.body.order.id; // Capture order ID for further tests
  });

  it('should allow user to view their order', async () => {
    const res = await request(app)
      .get(`/orders/${orderId}`)
      .set('Authorization', userAccessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.order.id).toBe(orderId);
  });

  it('should allow user to cancel an order', async () => {
    const res = await request(app)
      .delete(`/orders/${orderId}`)
      .set('Authorization', userAccessToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Order canceled');
  });
});
