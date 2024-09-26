// services/tokenService.js
const jwt = require('jsonwebtoken');
const tokenModel = require('../models/tokenModel');
require('dotenv').config(); // Load environment variables from .env

const generateRefreshToken = async (userId) => {
  const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  await tokenModel.createRefreshToken(userId, refreshToken);
  return refreshToken;
};

const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await tokenModel.findRefreshToken(token);
    if (!storedToken) throw new Error('Token not found');
    return decoded;
  } catch (err) {
    throw new Error('Invalid or expired refresh token');
  }
};

const revokeRefreshToken = async (token) => {
  await tokenModel.deleteRefreshToken(token);
};

module.exports = {
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
};
