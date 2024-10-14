// controllers/orderController.js
const orderService = require('../services/orderService');
const cartService = require('../services/cartService');
const couponService = require('../services/couponService');
const { ValidationError, NotFoundError, DatabaseError } = require('../utils/errors');

const checkout = async (req, res, next) => {
  const { cart_id, coupon_code, cart_total } = req.body;
  const userId = req.user.id;

  try {
    // Fetch cart and validate
    const cartItems = await cartService.getCartItems(userId);
    if (!cartItems || cartItems.length === 0) {
      return next(new ValidationError('Cart is empty'));
    }

    let discount = 0;
    // Apply coupon if provided
    if (coupon_code) {
      const coupon = await couponService.applyCouponToCart(cart_id, coupon_code, cart_total);
      // console.log('coupon:', coupon, 'cartItems: ', cartItems);
      if (coupon.discount_type === 'percentage') {
        discount = (coupon.discount_value / 100) * cart_total;
      } else if (coupon.discount_type === 'fixed') {
        discount = coupon.discount_value;
      } else if (coupon.discount_type === 'free_shipping') {
        discount = 0;  // Free shipping logic would be applied separately
      }
    }

    const total = cart_total - discount;

    // Proceed with order creation
    const order = await orderService.createOrder(cart_id, total);
    if (!order) {
      return next(new ValidationError('Checkout failed, your cart may be empty.'));
    }

    // update the cart status
    const cart = await cartService.updateCartStatus(order.cart_id, 'completed');
    if (!cart) return next(new NotFoundError('Cart update failed, your cart does not exist.'));

    // Respond with success
    return res.status(201).json({ message: 'Checkout successful', total, order });
  } catch (err) {
    console.error('Error during checkout:', err);
    return next(err);
  }
};

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
