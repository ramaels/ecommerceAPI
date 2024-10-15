// models/userModel.js
const db = require('../config/db');

// Create a new user in the database
const createUser = async (username, email, hashedPassword) => {
  const result = await db.query(
    'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
    [username, email, hashedPassword]
  );
  return result.rows[0];
};

// Find a user by email
const findUserByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const findUserById = async (userId) => {
    const result = await db.query('SELECT id, username, email, role FROM users WHERE id = $1', [userId]);
    return result.rows[0];
};

const updateUserProfile = async (userId, fields) => {
  const setFields = Object.keys(fields)
    .map((field, index) => `${field} = $${index + 2}`)
    .join(', ');

  const query = `
    UPDATE users
    SET ${setFields}
    WHERE id = $1
    RETURNING id, username, email;
  `;
  const values = [userId, ...Object.values(fields)];
  const result = await db.query(query, values);
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
};
