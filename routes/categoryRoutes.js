// routes/categoryRoutes.js
const express = require('express');
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { verifyAccessToken, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// POST /categories - Admin only
router.post('/categories', verifyAccessToken, isAdmin, createCategory);

// GET /categories - Public route to get all categories
router.get('/categories', verifyAccessToken, getAllCategories);

// GET /categories/:id - Public route to get a specific category
router.get('/categories/:id', verifyAccessToken, getCategoryById);

// PUT /categories/:id - Admin only
router.put('/categories/:id', verifyAccessToken, isAdmin, updateCategory);

// DELETE /categories/:id - Admin only
router.delete('/categories/:id', verifyAccessToken, isAdmin, deleteCategory);

module.exports = router;
