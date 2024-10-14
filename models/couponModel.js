// models/couponModel.js
const db = require('../config/db');

// Create a new coupon
const createCoupon = async (code, discountType, discountValue, expirationDate, minimumOrderValue = null, usageLimit = null) => {
  const query = `
    INSERT INTO coupons (code, discount_type, discount_value, expiration_date, minimum_order_value, usage_limit)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [code, discountType, discountValue, expirationDate, minimumOrderValue, usageLimit];
  const result = await db.query(query, values);
  return result.rows[0];
};

// Get a coupon by ID
// const getCouponById = async (id) => {
//   const query = 'SELECT * FROM coupons WHERE id = $1;';
//   const result = await db.query(query, [id]);
//   return result.rows[0];
// };

// Get a coupon by code
const getCouponByCode = async (code) => {
  const query = 'SELECT * FROM coupons WHERE code = $1;';
  const result = await db.query(query, [code]);
  return result.rows[0];
};

// Update a coupon by ID
const updateCoupon = async (id, fields) => {
  const setFields = Object.keys(fields)
    .map((field, index) => `${field} = $${index + 2}`)
    .join(', ');

  const query = `
    UPDATE coupons
    SET ${setFields}
    WHERE id = $1
    RETURNING *;
  `;
  const values = [id, ...Object.values(fields)];
  const result = await db.query(query, values);
  return result.rows[0];
};

// Delete a coupon by ID
const deleteCoupon = async (id) => {
  const query = 'DELETE FROM coupons WHERE id = $1 RETURNING *;';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

// Check if coupon is expired
const isCouponExpired = async (id) => {
  const query = 'SELECT expiration_date FROM coupons WHERE id = $1;';
  const result = await db.query(query, [id]);
  const expirationDate = result.rows[0].expiration_date;
  return new Date(expirationDate) < new Date();
};

// Increment coupon usage
const incrementCouponUsage = async (id) => {
  const query = `
    UPDATE coupons
    SET times_used = times_used + 1
    WHERE id = $1
    RETURNING *;
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

// Add coupon to cart
const applyCouponToCart = async (cartId, couponId) => {
  const query = `
    INSERT INTO cart_coupons (cart_id, coupon_id)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const result = await db.query(query, [cartId, couponId]);
  return result.rows[0];
};

module.exports = {
  createCoupon,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  isCouponExpired,
  incrementCouponUsage,
  applyCouponToCart,
};
