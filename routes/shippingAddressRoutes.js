//routes/shippingAddressRoutes.js
const express = require('express');
const shippingAddressController = require('../controllers/shippingAddressController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply token verification middleware
router.use(verifyAccessToken);

// Add a new shipping address
router.post('/shipping-addresses', shippingAddressController.addShippingAddress);

// Get all shipping addresses for a user
router.get('/shipping-addresses', shippingAddressController.getShippingAddressesByUser);

// Update a shipping address
router.put('/shipping-addresses/:id', shippingAddressController.updateShippingAddress);

// Delete a shipping address
router.delete('/shipping-addresses/:id', shippingAddressController.deleteShippingAddress);

module.exports = router;