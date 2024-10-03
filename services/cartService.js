// services/cartService.js
const cartModel = require('../models/cartModel');

const addItemToCart = async (userId, productId, quantity) => {
  // Get the cart associated with the user
  let cart = await cartModel.getCartItems(userId);

  // If no active cart, create a new one
  if (!cart || cart.length === 0) {
    cart = await cartModel.createCart(userId);
  }

  // Add or update the item in the cart
  const cartItem = await cartModel.addItemToCart(cart.id, productId, quantity);
  return cartItem; // Return the added cart item
};

const updateCartItem = async (userId, productId, quantity) => {
  const cartItems = await cartModel.getCartItems(userId);

  // If no active cart, return null
  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  // Update cart item and return the result
  const cartItem = await cartModel.updateCartItem(cartItems[0].cart_id, productId, quantity);
  return cartItem;
};

const getCartItems = async (userId) => {
  const cartItems = await cartModel.getCartItems(userId);

  // Return cart items or null if not found
  return cartItems || null;
};

const removeCartItem = async (userId, productId) => {
  const cartItems = await cartModel.getCartItems(userId);

  // If no cart items, return null
  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  // Remove item from cart and return the result
  const removedItem = await cartModel.removeCartItem(cartItems[0].cart_id, productId);
  return removedItem;
};

module.exports = {
  addItemToCart,
  updateCartItem,
  getCartItems,
  removeCartItem,
};
