// controllers/cartController.js
const cartService = require('../services/cartService');
const { DatabaseError, NotFoundError, ValidationError } = require('../utils/errors');

// Add item to cart
const addItemToCart = async (req, res, next) => {
  const { product_id, quantity } = req.body;
  const userId = req.user.id;

  try {
    if (!product_id || !quantity) {
      throw new ValidationError('Product ID and quantity are required');
    }

    const cartItem = await cartService.addItemToCart(userId, product_id, quantity);
    if (!cartItem) {
      throw new DatabaseError('Failed to add item to cart');
    }

    return res.status(201).json({ message: 'Item added to cart', cartItem });
  } catch (err) {
    next(err);
  }
};

// Update item in cart
const updateCartItem = async (req, res, next) => {
  const { product_id, quantity } = req.body;
  const userId = req.user.id;

  try {
    if (!product_id || !quantity) {
      throw new ValidationError('Product ID and quantity are required');
    }

    const cartItem = await cartService.updateCartItem(userId, product_id, quantity);
    if (!cartItem) {
      throw new NotFoundError('Cart item not found or could not be updated');
    }

    return res.status(200).json({ message: 'Cart item updated', cartItem });
  } catch (err) {
    next(err);
  }
};

// Get all items in the user's cart
const getCartItems = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const cartItems = await cartService.getCartItems(userId);
    if (!cartItems) {
      throw new NotFoundError('Cart is empty');
    }

    return res.status(200).json({ cartItems });
  } catch (err) {
    next(err);
  }
};

// Remove item from cart
const removeCartItem = async (req, res, next) => {
  const { product_id } = req.params;
  const userId = req.user.id;

  try {
    const cartItem = await cartService.removeCartItem(userId, product_id);
    if (!cartItem) {
      throw new NotFoundError('Cart item not found');
    }

    return res.status(200).json({ message: 'Item removed from cart', cartItem });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addItemToCart,
  updateCartItem,
  getCartItems,
  removeCartItem,
};
