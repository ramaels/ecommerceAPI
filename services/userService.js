// services/userService.js
const bcrypt = require('bcrypt');
const db = require('../models/userModel');

// Find user by email (checks if user already exists)
const findUserByEmail = async (email) => {
  return db.findUserByEmail(email);  // Calls the corresponding model function
};

// Register a new user
const registerUser = async (username, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return db.createUser(username, email, hashedPassword);
};

const comparePasswords = async (inputPassword, storedPassword) => {
  return bcrypt.compare(inputPassword, storedPassword);
};

const findUserById = async (userId) => {
    const user = await db.findUserById(userId);
    return user;
};

module.exports = {
  registerUser,
  findUserByEmail,
  comparePasswords,
  findUserById,
};