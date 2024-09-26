// models/tokenModel.js
const db = require('../config/db'); // Assuming you have a database connection set up

const createRefreshToken = async (userId, refreshToken) => {
  const query = 'INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2) RETURNING *';
  const values = [userId, refreshToken];
  const result = await db.query(query, values);
  return result.rows[0];
};

const findRefreshToken = async (refreshToken) => {
  const query = 'SELECT * FROM refresh_tokens WHERE token = $1';
  const values = [refreshToken];
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteRefreshToken = async (refreshToken) => {
  const query = 'DELETE FROM refresh_tokens WHERE token = $1';
  const values = [refreshToken];
  await db.query(query, values);
};

module.exports = {
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
};
