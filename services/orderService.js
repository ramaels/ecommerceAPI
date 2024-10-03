// services/orderService.js
const orderModel = require('../models/orderModel');
const cartService = require('./cartService');

const createOrder = async (userId, cartId, total) => {
  const cartItems = await cartService.getCartItems(userId);

  // If no items in cart, return null
  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  // Create order and return the result
  const order = await orderModel.createOrder(userId, cartId, total);
  return order;
};

const getOrderById = async (userId, orderId) => {
  const order = await orderModel.getOrderById(orderId);

  // Check if the order belongs to the user
  if (!order || order.user_id !== userId) {
    return null;
  }

  return order;
};

const getUserOrders = async (userId) => {
  const orders = await orderModel.getUserOrders(userId);

  // Return user orders or null if none found
  return orders || null;
};

const cancelOrder = async (userId, orderId) => {
  const order = await orderModel.getOrderById(orderId);

  // Check if the order exists and belongs to the user
  if (!order || order.user_id !== userId) {
    return null;
  }

  // Cancel the order and return the result
  const canceledOrder = await orderModel.cancelOrder(orderId);
  return canceledOrder;
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  cancelOrder,
};
