const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const couponModel = require('../models/couponModel');
const userService = require('../services/userService');
const couponService = require('../services/couponService');
const cartService = require('../services/cartService');

let adminAccessToken, userAccessToken, adminUser, testUser;

beforeAll(async () => {
  // Start the server
  server = app.listen(5200);

  // Clean the tables
  await db.query('TRUNCATE users, refresh_tokens, carts, coupons, cart_coupons RESTART IDENTITY CASCADE');

  // Create test admin and user and generate access tokens
  adminUser = await userService.registerUser('adminuser', 'admin@example.com', 'testpassword', 'admin');
  testUser = await userService.registerUser('testuser', 'testuser@example.com', 'testpassword', 'user');

  adminAccessToken = `Bearer ${jwt.sign({ id: adminUser.id, email: adminUser.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
  userAccessToken = `Bearer ${jwt.sign({ id: testUser.id, email: testUser.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
});

afterAll(async () => {
  await db.pool.end();
  server.close();
});

// Admin creates coupons
describe('Coupon Creation - Admin', () => {
  it('should allow admin to create a percentage coupon', async () => {
    const res = await request(app)
      .post('/coupons')
      .set('Authorization', adminAccessToken)
      .send({
        code: 'SAVE10',
        discount_type: 'percentage',
        discount_value: 10,
        minimum_order_value: 50,
        expiration_date: '2024-12-31',
        usage_limit: 100
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.coupon.code).toBe('SAVE10');
    expect(res.body.coupon.discount_type).toBe('percentage');
  });

  it('should allow admin to create a fixed discount coupon', async () => {
    const res = await request(app)
      .post('/coupons')
      .set('Authorization', adminAccessToken)
      .send({
        code: 'SAVE20',
        discount_type: 'fixed',
        discount_value: 20,
        minimum_order_value: 50,
        expiration_date: '2024-12-31',
        usage_limit: 50
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.coupon.code).toBe('SAVE20');
    expect(res.body.coupon.discount_type).toBe('fixed');
  });
});

// User applies coupon
describe('Coupon Application - User Checkout', () => {
  let cartId, cart, productId;

  beforeAll(async () => {
    const newProduct = {
      name: 'Tablet1',
      description: 'A lightweight tablet.',
      price: 299.99,
      category_id: 1
    };

    const res = await request(app)
      .post('/products')
      .set('Authorization', adminAccessToken)
      .send(newProduct);
    // console.log(res.body);

    productId = res.body.product.id;
  });

  beforeEach(async () => {
    // User adds an item to cart
    const cartRes = await request(app)
      .post('/cart')
      .set('Authorization', userAccessToken)
      .send({ product_id: productId, quantity: 2 });
    console.log(cartRes.body);
    cartId = cartRes.body.cartItem.cart_id;

    //get cart data
    cart = await cartService.getCartUser(testUser.id);
    console.log('cartData: ', cart, 'testUser: ', testUser);
  });

  it('should apply a valid coupon during checkout', async () => {
    const res = await request(app)
      .post('/checkout')
      .set('Authorization', userAccessToken)
      .send({
        cart_id: cartId,
        coupon_code: 'SAVE10',
        cart_total: cart.total,
      });

    console.log('res.body.order: ', res.body.order);
    expect(res.statusCode).toBe(201);
    expect(parseFloat(res.body.order.total)).toBeLessThan(parseFloat(cart.total)); // Ensure discount is applied
    expect(res.body.message).toBe('Checkout successful');
  });

  it('should reject expired coupons during checkout', async () => {
    const { code, discount_type, discount_value, minimum_order_value, expiration_date, usage_limit } = {
      code: 'EXPIRED10',
      discount_type: 'percentage',
      discount_value: 10,
      minimum_order_value: 50,
      expiration_date: '2020-01-01',
      usage_limit: 1
    };
    // Create expired coupon
    const coupon = await couponService.createCoupon(code, discount_type, discount_value, expiration_date, minimum_order_value, usage_limit);
    console.log('expired coupon: ', coupon);

    const res = await request(app)
      .post('/checkout')
      .set('Authorization', userAccessToken)
      .send({
        cart_id: cartId,
        coupon_code: 'EXPIRED10'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Coupon has expired');
  });

  it('should reject overused coupons during checkout', async () => {
    const { code, discount_type, discount_value, minimum_order_value, expiration_date, usage_limit } = {
      code: 'LIMITED10',
      discount_type: 'percentage',
      discount_value: 10,
      minimum_order_value: 50,
      expiration_date: '2024-12-31',
      usage_limit: 1
    };
    // Create a coupon with usage limit
    await couponService.createCoupon(code, discount_type, discount_value, expiration_date, minimum_order_value, usage_limit);

    // First usage (valid)
    await request(app)
      .post('/checkout')
      .set('Authorization', userAccessToken)
      .send({
        cart_id: cartId,
        coupon_code: 'LIMITED10'
      });

    // User adds an item to cart
    const cartRes = await request(app)
      .post('/cart')
      .set('Authorization', userAccessToken)
      .send({ product_id: productId, quantity: 2 });
    console.log(cartRes.body);
    cartId = cartRes.body.cartItem.cart_id;

    //get cart data
    cart = await cartService.getCartUser(testUser.id);
    console.log('cartData: ', cart, 'testUser: ', testUser);

    // Second usage (should fail)
    const res = await request(app)
      .post('/checkout')
      .set('Authorization', userAccessToken)
      .send({
        cart_id: cartId,
        coupon_code: 'LIMITED10'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Coupon usage limit reached');
  });
});

// Admin updates deletes coupons
describe('coupon update, deletion - Admin', () => {
  it('should allow admin to update a coupon', async () => {
    const coupon = await couponModel.getCouponByCode('EXPIRED10');
    const res = await request(app)
      .put(`/coupons/${coupon.id}`)
      .set('Authorization', adminAccessToken)
      .send({ code: 'EXPIRED20' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Coupon updated');
    expect(res.body.coupon.code).toBe('EXPIRED20');
  });

  it('should allow admin to delete a coupon', async () => {
    const coupon = await couponModel.getCouponByCode('EXPIRED20');
    const res = await request(app)
      .delete(`/coupons/${coupon.id}`)
      .set('Authorization', adminAccessToken);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Coupon deleted');
    expect(res.body.coupon.code).toBe('EXPIRED20');
  });
});