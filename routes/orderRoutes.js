// routes/orderRoutes.js
const express = require('express');
const { createOrder, getOrderById, getUserOrders, cancelOrder } = require('../controllers/orderController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply token verification to all routes in this router
router.use(verifyAccessToken);

// Place an order
router.post('/orders', createOrder);

// Get order by ID
router.get('/orders/:id', getOrderById);

// Get all orders for the user
router.get('/orders', getUserOrders);

// Cancel an order
router.delete('/orders/:id', cancelOrder);

module.exports = router;