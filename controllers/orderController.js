// controllers/orderController.js
const orderService = require('../services/orderService');
const cartService = require('../services/cartService');
const { ValidationError, NotFoundError, DatabaseError } = require('../utils/errors');

const checkout = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // Initiate checkout process via the order service
    const order = await orderService.checkout(userId);

    // If no order could be created, send an error
    if (!order) {
      return next(new ValidationError('Checkout failed, your cart may be empty.'));
    }

    // update the cart status
    const cart = await cartService.updateCartStatus(order.cart_id, 'completed');
    // if no cart found, send an error
    if (!cart) return next(new NotFoundError('Cart update failed, your cart does not exist.'));

    // Respond with success
    return res.status(201).json({ message: 'Checkout successful', order });
  } catch (err) {
    console.error('Error during checkout:', err);
    return next(new DatabaseError('Server error during checkout'));
  }
};

// Create a new order
// const createOrder = async (req, res, next) => {
//   const { cart_id, total } = req.body;
//   const userId = req.user.id;

//   try {
//     if (!cart_id || !total) {
//       return next(new ValidationError('Cart ID and total amount are required'));
//     }

//     const order = await orderService.createOrder(userId, cart_id, total);
//     if (!order) {
//       return next(new NotFoundError('Cart is empty, cannot create order'));
//     }

//     return res.status(201).json({ message: 'Order placed', order });
//   } catch (err) {
//     return next(new DatabaseError('Server error creating order'));
//   }
// };

// Get order by ID
const getOrderById = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const order = await orderService.getOrderById(userId, id);
    if (!order) {
      return next(new NotFoundError('Order not found'));
    }

    return res.status(200).json({ order });
  } catch (err) {
    return next(new DatabaseError('Server error fetching order by ID from user'));
  }
};

// Get all orders for the logged-in user
const getUserOrders = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const orders = await orderService.getUserOrders(userId);
    if (!orders) {
      return next(new NotFoundError('No orders found'));
    }

    return res.status(200).json({ orders });
  } catch (err) {
    return next(new DatabaseError('Server error fetching all orders from user'));
  }
};

// Cancel an order
const cancelOrder = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const canceledOrder = await orderService.cancelOrder(userId, id);
    if (!canceledOrder) {
      return next(new NotFoundError('Order not found'));
    }

    // update the cart status
    const cart = await cartService.updateCartStatus(canceledOrder.cart_id, 'abandoned');
    // if no cart found, send an error
    if (!cart) return next(new NotFoundError('Cart update failed, your cart does not exist.'));

    return res.status(200).json({ message: 'Order canceled', canceledOrder });
  } catch (err) {
    return next(new DatabaseError('Server error cancelling order by ID from user'));
  }
};

module.exports = {
  checkout,
  getOrderById,
  getUserOrders,
  cancelOrder,
};
