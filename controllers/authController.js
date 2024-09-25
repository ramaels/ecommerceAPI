// controllers/authController.js
const userService = require('../services/userService');
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

const loginUser = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (!user) {
      console.error('Error during authentication:', info.message);
      return res.status(401).json({ message: info.message || 'Invalid email or password' });
    }

    // User authenticated successfully, generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Send success response with the token
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  })(req, res, next);  // Call authenticate as a middleware here
};

module.exports = {
  registerUser,
  loginUser,
};
