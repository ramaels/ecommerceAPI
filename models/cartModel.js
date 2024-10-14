const db = require('../config/db');
const productModel = require('./productModel');

const createCart = async (userId) => {
  const query = `
    INSERT INTO carts (user_id)
    VALUES ($1)
    RETURNING *;
  `;
  const values = [userId];
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateCartStatus = async (cartId, newStatus) => {
  const query = `
    UPDATE carts
    SET status = $1
    WHERE id = $2
    RETURNING *;
  `;
  const values = [newStatus, cartId];
  const result = await db.query(query, values);
  return result.rows[0];
};

const addItemToCart = async (cartId, productId, quantity, price) => {

  const query = `
    INSERT INTO cart_items (cart_id, product_id, quantity, price_at_addition)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [cartId, productId, quantity, price];
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateCartItem = async (cartId, productId, quantity) => {
  const query = `
    UPDATE cart_items
    SET quantity = $1
    WHERE cart_id = $2 AND product_id = $3
    RETURNING *;
  `;
  const values = [quantity, cartId, productId];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getCartItems = async (userId) => {
  const query = `
    SELECT ci.*, p.name, p.price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    JOIN carts c ON ci.cart_id = c.id
    WHERE c.user_id = $1 AND c.status = 'active';
  `;
  const values = [userId];
  const result = await db.query(query, values);
  return result.rows;
};

const getCartUser = async (userId) => {
  const query = `
    SELECT id, user_id, status, total
    FROM carts
    WHERE user_id = $1 AND status = 'active';
  `;
  const values = [userId];
  const result = await db.query(query, values);
  return result.rows[0];
};

// const removeCartItem = async (cartId, productId, quantityToRemove) => {
//   // Step 1: Check the current quantity
//   const checkQuantityQuery = `
//       SELECT quantity
//       FROM cart_items
//       WHERE cart_id = $1 AND product_id = $2;
//     `;
//   const checkQuantityValues = [cartId, productId];
//   const checkResult = await db.query(checkQuantityQuery, checkQuantityValues);

//   const currentQuantity = checkResult.rows[0].quantity;

//   // Step 2: If the new quantity would be zero or less, delete the item
//   if (currentQuantity <= quantityToRemove) {
//     const deleteQuery = `
//       DELETE FROM cart_items
//       WHERE cart_id = $1 AND product_id = $2
//       RETURNING *;
//     `;
//     const deleteValues = [cartId, productId];
//     const deleteResult = await db.query(deleteQuery, deleteValues);

//     return deleteResult.rows[0]; // Return the deleted item
//   }

//   // Step 3: Otherwise, decrement the quantity by the given amount
//   const updateQuantityQuery = `
//     UPDATE cart_items
//     SET quantity = quantity - $3
//     WHERE cart_id = $1 AND product_id = $2
//     RETURNING *;
//   `;
//   const updateQuantityValues = [cartId, productId, quantityToRemove];
//   const updateResult = await db.query(updateQuantityQuery, updateQuantityValues);

//   return updateResult.rows[0]; // Return the updated item
// };

const removeCartItem = async (cartId, productId) => {
  const query = `
    DELETE FROM cart_items
    WHERE cart_id = $1 AND product_id = $2
    RETURNING *;
  `;
  const values = [cartId, productId];
  const result = await db.query(query, values);
  return result.rows[0];
};

// Update total when an item is added or removed
const updateCartTotal = async (cartId) => {
  const query = `
    SELECT SUM(p.price * ci.quantity) AS total
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = $1;
  `;
  const values = [cartId];
  const result = await db.query(query, values);
  const total = result.rows[0].total || 0;

  const updateQuery = `UPDATE carts SET total = $1 WHERE id = $2`;
  await db.query(updateQuery, [total, cartId]);

  return total;
};

module.exports = {
  createCart,
  updateCartStatus,
  addItemToCart,
  updateCartItem,
  getCartUser,
  getCartItems,
  updateCartTotal,
  removeCartItem,
};
