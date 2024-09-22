// controllers/authController.js
const userService = require('../services/userService');

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

module.exports = {
  registerUser,
};
