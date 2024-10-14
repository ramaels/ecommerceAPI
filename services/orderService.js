// services/orderService.js
const orderModel = require('../models/orderModel');
const cartService = require('./cartService');

const checkout = async (userId) => {
  // Get the user's active cart
  const cartItems = await cartService.getCartItems(userId);

  // If cart is empty, return null
  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  // Calculate the total price for the order
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Create the order
  const cartId = cartItems[0].cart_id; // Assuming all items are in the same cart
  const order = await orderModel.createOrder(userId, cartId, total);

  return order;
};

const createOrder = async (cartId, total) => {
  // const cartItems = await cartService.getCartItems(userId);

  // // If no items in cart, return null
  // if (!cartItems || cartItems.length === 0) {
  //   return null;
  // }

  // Create order and return the result
  const order = await orderModel.createOrder(cartId, total);
  return order;
};

const getOrderById = async (userId, orderId) => {
  const order = await orderModel.getOrderById(orderId);
  console.log('order: ', order);
  // Check if the order belongs to the user
  if (!order) {
    return null;
  }

  return order;
};

const getUserOrders = async (userId) => {
  const orders = await orderModel.getUserOrders(userId);
  console.log('orders: ',orders);
  // Return user orders or null if none found
  return orders || null;
};

const cancelOrder = async (userId, orderId) => {
  const order = await orderModel.getOrderById(orderId);

  // Check if the order exists and belongs to the user
  if (!order) {
    return null;
  }

  // Cancel the order and return the result
  const canceledOrder = await orderModel.cancelOrder(orderId);
  return canceledOrder;
};

module.exports = {
  checkout,
  createOrder,
  getOrderById,
  getUserOrders,
  cancelOrder,
};
