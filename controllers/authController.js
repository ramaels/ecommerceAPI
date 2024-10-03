// controllers/authController.js
const userService = require('../services/userService');
const tokenService = require('../services/tokenService');
const { NotFoundError, ValidationError, DatabaseError, ForbiddenError, UnauthorizedError} = require('../utils/errors'); // Custom errors
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('dotenv').config(); // Load environment variables from .env

// Register a new user
const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      next(new ValidationError('User already exists')); // Pass error to centralized handler
    }

    // Create a new user if the email is not registered
    const newUser = await userService.registerUser(username, email, password);
    return res.status(201).json(newUser);
  } catch (err) {
    console.error('Error during user registration:', err);  // Add logging for error tracking
    next(new DatabaseError('Server error')); // Pass error to centralized handler
  }
};

// Log in user and generate tokens
const loginUser = (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err) {
      console.error('Error during login:', err);
      return next(new DatabaseError('Server error')); // Pass error to centralized handler
    }
    if (!user) {
      console.error('Error during authenticate:', info.message);
      return next(new UnauthorizedError(info.message)); // Pass error to centralized handler
    }

    try {
      // Generate access and refresh tokens
      const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const refreshToken = await tokenService.generateRefreshToken(user.id);

      // Send success response with the token
      return res.status(200).json({
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error('Error generating tokens:', err);
      return next(new DatabaseError('Token generation failed'));
    }
  })(req, res, next);  // Call authenticate as a middleware here
};

// Refresh token functionality
const refreshToken = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new ValidationError('Refresh token is required'));
  }

  try {
    const decoded = await tokenService.verifyRefreshToken(token);
    const user = await userService.findUserById(decoded.id);

    // Optionally, revoke the old refresh token
    await tokenService.revokeRefreshToken(token);

    // Generate a new access token
    const newAccessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Optionally, generate a new refresh token
    const newRefreshToken = await tokenService.generateRefreshToken(user.id);

    return res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('Error during token refresh:', err);
    return next(new ForbiddenError('Invalid or expired refresh token'));
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
};
