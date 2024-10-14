// routes/orderRoutes.js
const express = require('express');
const { checkout, getOrderById, getUserOrders, cancelOrder } = require('../controllers/orderController');
const { verifyAccessToken, isAdmin } = require('../middlewares/authMiddleware');
const { createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const router = express.Router();

// Apply token verification to all routes in this router
router.use(verifyAccessToken);

// Order Routes
router.post('/checkout', checkout); // checkout route
router.get('/orders/:id', getOrderById); // Get order by ID
router.get('/orders', getUserOrders); // Get all orders for the user
router.delete('/orders/:id', cancelOrder); // Cancel an order

// Coupon Management Routes (Admin only)
router.post('/coupons', isAdmin, createCoupon); // Create a coupon
router.put('/coupons/:id', isAdmin, updateCoupon); // Update a coupon
router.delete('/coupons/:id', isAdmin, deleteCoupon); // Delete a coupon

module.exports = router;