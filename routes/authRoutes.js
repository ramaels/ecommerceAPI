// routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { validateUserRegistration, validateUserLogin } = require('../utils/validators');

const router = express.Router();

// Route for user registration
router.post('/register', validateUserRegistration, registerUser);

router.post('/login', validateUserLogin, loginUser);

module.exports = router;
