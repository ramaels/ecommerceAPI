// models/categoryModel.js
const db = require('../config/db');

const createCategory = async (name, description) => {
  const query = `
    INSERT INTO categories (name, description)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [name, description];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getAllCategories = async () => {
  const result = await db.query('SELECT * FROM categories ORDER BY id');
  return result.rows;
};

const getCategoryById = async (id) => {
  const query = 'SELECT * FROM categories WHERE id = $1';
  const values = [id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateCategory = async (id, name, description) => {
  const query = `
    UPDATE categories
    SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *;
  `;
  const values = [name, description, id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteCategory = async (id) => {
  const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
  const values = [id];
  const result = await db.query(query, values);
  return result.rows[0];
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
