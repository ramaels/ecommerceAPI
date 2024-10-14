// services/couponService.js
const couponModel = require('../models/couponModel');
const { ValidationError, NotFoundError, DatabaseError } = require('../utils/errors');

// Create a new coupon (Admin only)
const createCoupon = async ( code, discount_type, discount_value, expiration_date, minimum_order_value, usage_limit ) => {
  try {
    const coupon = await couponModel.createCoupon(code, discount_type, discount_value, expiration_date, minimum_order_value, usage_limit);
    return coupon;
  } catch (err) {
    throw new DatabaseError('Failed to create coupon');
  }
};

// Validate coupon before applying to cart
const validateCoupon = async (code, cartTotal) => {
  const coupon = await couponModel.getCouponByCode(code);
  console.log('coupon: ', coupon, 'code: ', code);

  if (!coupon) {
    throw new NotFoundError('Coupon not found');
  }

  if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
    throw new ValidationError('Coupon usage limit reached');
  }

  const isExpired = await couponModel.isCouponExpired(coupon.id);
  if (isExpired) {
    throw new ValidationError('Coupon has expired');
  }

  if (coupon.minimum_order_value && cartTotal < coupon.minimum_order_value) {
    throw new ValidationError(`Minimum order value of ${coupon.minimum_order_value} is required`);
  }

  return coupon;
};

// Apply coupon to cart
const applyCouponToCart = async (cartId, couponCode, cartTotal) => {
  const coupon = await validateCoupon(couponCode, cartTotal);
  await couponModel.applyCouponToCart(cartId, coupon.id);
  await couponModel.incrementCouponUsage(coupon.id);
  return coupon;
};

// Update a coupon (Admin only)
const updateCoupon = async (id, fields) => {
  try {
    const updatedCoupon = await couponModel.updateCoupon(id, fields);
    if (!updatedCoupon) {
      throw new NotFoundError('Coupon not found');
    }
    return updatedCoupon;
  } catch (err) {
    throw new DatabaseError('Failed to update coupon');
  }
};

// Delete a coupon (Admin only)
const deleteCoupon = async (id) => {
  try {
    const deletedCoupon = await couponModel.deleteCoupon(id);
    if (!deletedCoupon) {
      throw new NotFoundError('Coupon not found');
    }
    return deletedCoupon;
  } catch (err) {
    throw new DatabaseError('Failed to delete coupon');
  }
};

module.exports = {
  createCoupon,
  validateCoupon,
  applyCouponToCart,
  updateCoupon,
  deleteCoupon,
};
