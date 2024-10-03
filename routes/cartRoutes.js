// routes/cartRoutes.js
const express = require('express');
const {
  addItemToCart,
  updateCartItem,
  getCartItems,
  removeCartItem,
} = require('../controllers/cartController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply token verification to all cart routes
router.use(verifyAccessToken);

// Route to add an item to the cart
router.post('/cart', addItemToCart);

// Route to update a cart item
router.put('/cart/:product_id', updateCartItem);

// Route to get all items in the user's cart
router.get('/cart', getCartItems);

// Route to remove an item from the cart
router.delete('/cart/:product_id', removeCartItem);

module.exports = router;
