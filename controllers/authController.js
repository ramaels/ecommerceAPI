// controllers/authController.js
const userService = require('../services/userService');
const tokenService = require('../services/tokenService');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('dotenv').config(); // Load environment variables from .env

// Register a new user
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user if the email is not registered
    const newUser = await userService.registerUser(username, email, password);
    return res.status(201).json(newUser);
  } catch (err) {
    console.error('Error during user registration:', err);  // Add logging for error tracking
    return res.status(500).json({ message: 'Server error' });
  }
};

// Log in user and generate tokens
const loginUser = (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (!user) {
      console.error('Error during authentication:', info.message);
      return res.status(401).json({ message: info.message });
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
      return res.status(500).json({ message: 'Token generation failed' });
    }
  })(req, res, next);  // Call authenticate as a middleware here
};

// Refresh token functionality
const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const decoded = await tokenService.verifyRefreshToken(token);
    const user = await userService.findUserById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optionally, revoke the old refresh token
    await tokenService.revokeRefreshToken(token);

    // Generate a new access token
    const newAccessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Optionally, generate a new refresh token
    const newRefreshToken = await tokenService.generateRefreshToken(user.id);

    return res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('Error during token refresh:', err);
    return res.status(403).json({ message: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
};
