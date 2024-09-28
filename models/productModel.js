// models/productModel.js
const db = require('../config/db'); // Ensure db connection is correctly set up

const getAllProducts = async (search, category, limit, offset) => {
  let query = 'SELECT * FROM products';
  const values = [];
  const conditions = [];

  if (search) {
    conditions.push('(name ILIKE $' + (values.length + 1) + ' OR description ILIKE $' + (values.length + 1) + ')');
    values.push(`%${search}%`);
  }

  if (category) {
    conditions.push('category_id = $' + (values.length + 1));
    values.push(category);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY id LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
  values.push(limit, offset);

  const result = await db.query(query, values);
  return result.rows;
};

const getProductById = async (id) => {
  const query = 'SELECT * FROM products WHERE id = $1';
  const values = [id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const createProduct = async (name, description, price, category_id) => {
  const query = `
    INSERT INTO products (name, description, price, category_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [name, description, price, category_id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateProduct = async (id, name, description, price, category_id) => {
  const query = `
    UPDATE products
    SET name = $1, description = $2, price = $3, category_id = $4
    WHERE id = $5
    RETURNING *
  `;
  const values = [name, description, price, category_id, id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteProduct = async (id) => {
  const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
  const values = [id];
  const result = await db.query(query, values);
  return result.rows[0];
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};