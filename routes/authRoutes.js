// routes/authRoutes.js
const express = require('express');
const { registerUser } = require('../controllers/authController');
const { validateUserRegistration } = require('../utils/validators');

const router = express.Router();

// Route for user registration
router.post('/register', validateUserRegistration, registerUser);

module.exports = router;
