// routes/orderRoutes.js
const express = require('express');
const { checkout, getOrderById, getUserOrders, cancelOrder } = require('../controllers/orderController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply token verification to all routes in this router
router.use(verifyAccessToken);

// checkout route
router.post('/checkout', checkout);

// Get order by ID
router.get('/orders/:id', getOrderById);

// Get all orders for the user
router.get('/orders', getUserOrders);

// Cancel an order
router.delete('/orders/:id', cancelOrder);

module.exports = router;