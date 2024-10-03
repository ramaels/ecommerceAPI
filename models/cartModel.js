const db = require('../config/db');

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

const addItemToCart = async (cartId, productId, quantity) => {
  const query = `
    INSERT INTO cart_items (cart_id, product_id, quantity)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [cartId, productId, quantity];
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

module.exports = {
  createCart,
  addItemToCart,
  updateCartItem,
  getCartItems,
  removeCartItem,
};
