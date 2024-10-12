const db = require('../config/db');

const createOrder = async (cartId, total) => {
  const query = `
    INSERT INTO orders (cart_id, total)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [cartId, total];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getOrderById = async (orderId) => {
  const query = `
    SELECT o.*, u.username, c.status AS cart_status
    FROM orders o
    JOIN carts c ON o.cart_id = c.id
    JOIN users u ON c.user_id = u.id
    WHERE o.id = $1;
  `;
  const values = [orderId];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getUserOrders = async (userId) => {
  const query = `
    SELECT o.*, c.status AS cart_status
    FROM orders o
    JOIN carts c ON o.cart_id = c.id
    WHERE c.user_id = $1
    ORDER BY o.created_at DESC;
  `;
  const values = [userId];
  const result = await db.query(query, values);
  return result.rows;
};

const cancelOrder = async (orderId) => {
  const query = `
    UPDATE orders
    SET status = 'cancelled'
    WHERE id = $1
    RETURNING *;
  `;
  const values = [orderId];
  const result = await db.query(query, values);
  return result.rows[0];
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  cancelOrder,
};
