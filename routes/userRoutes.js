const express = require('express');
const userController = require('../controllers/userController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply token verification middleware
router.use(verifyAccessToken);

// Get all shipping addresses for a user
router.get('/profile', userController.findUserById);

// Update a shipping address
router.put('/profile', userController.updateUserProfile);

module.exports = router;