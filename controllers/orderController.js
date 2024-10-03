// controllers/orderController.js
const orderService = require('../services/orderService');
const { ValidationError, NotFoundError, DatabaseError } = require('../utils/errors');

// Create a new order
const createOrder = async (req, res, next) => {
  const { cart_id, total } = req.body;
  const userId = req.user.id;

  try {
    if (!cart_id || !total) {
      throw new ValidationError('Cart ID and total amount are required');
    }

    const order = await orderService.createOrder(userId, cart_id, total);
    if (!order) {
      throw new NotFoundError('Cart is empty, cannot create order');
    }

    return res.status(201).json({ message: 'Order placed', order });
  } catch (err) {
    next(err);
  }
};

// Get order by ID
const getOrderById = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const order = await orderService.getOrderById(userId, id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return res.status(200).json({ order });
  } catch (err) {
    next(err);
  }
};

// Get all orders for the logged-in user
const getUserOrders = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const orders = await orderService.getUserOrders(userId);
    if (!orders) {
      throw new NotFoundError('No orders found');
    }

    return res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
};

// Cancel an order
const cancelOrder = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const canceledOrder = await orderService.cancelOrder(userId, id);
    if (!canceledOrder) {
      throw new NotFoundError('Order not found');
    }

    return res.status(200).json({ message: 'Order canceled', canceledOrder });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  cancelOrder,
};
