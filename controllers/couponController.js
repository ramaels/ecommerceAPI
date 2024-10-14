// controllers/couponController.js
const couponService = require('../services/couponService');
const { ValidationError, NotFoundError, DatabaseError } = require('../utils/errors');

// Create a new coupon (Admin only)
const createCoupon = async (req, res, next) => {
  const { code, discount_type, discount_value, expiration_date, minimum_order_value, usage_limit } = req.body;

  try {
    if (!code || !discount_type || !discount_value || !expiration_date) {
      return next(new ValidationError('Code, type, value, expiration are required to create a coupon'));
    }

    const coupon = await couponService.createCoupon(code, discount_type, discount_value, expiration_date, minimum_order_value, usage_limit);

    return res.status(201).json({ message: 'Coupon created', coupon });
  } catch (err) {
    next(err);  // Pass errors to centralized handler
  }
};

// Validate a coupon (e.g., during checkout)
const validateCoupon = async (req, res, next) => {
  const { coupon_code } = req.body;

  try {
    if (!coupon_code) {
      return next(new ValidationError('Coupon code is required'));
    }

    const coupon = await couponService.validateCoupon(coupon_code);
    return res.status(200).json({ message: 'Coupon is valid', coupon });
  } catch (err) {
    next(err);  // Pass errors to centralized handler
  }
};

// Update a coupon (Admin only)
const updateCoupon = async (req, res, next) => {
  const { id } = req.params;
  const fields = req.body;

  try {
    const updatedCoupon = await couponService.updateCoupon(id, fields);
    return res.status(200).json({ message: 'Coupon updated', coupon: updatedCoupon });
  } catch (err) {
    next(err);  // Pass errors to centralized handler
  }
};

// Delete a coupon (Admin only)
const deleteCoupon = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedCoupon = await couponService.deleteCoupon(id);
    return res.status(200).json({ message: 'Coupon deleted', coupon: deletedCoupon });
  } catch (err) {
    next(err);  // Pass errors to centralized handler
  }
};

module.exports = {
  createCoupon,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
};
