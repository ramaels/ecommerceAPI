// routes/productRoutes.js
const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { verifyAccessToken, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply verifyAccessToken middleware to all product routes
router.use(verifyAccessToken);

// GET /products - Get all products with optional search and category filters
router.get('/products', getProducts);

// GET /products/:id - Get a specific product by ID
router.get('/products/:id', getProductById);

// POST /products - Create a new product (admin only)
router.post('/products', isAdmin, createProduct);

// PUT /products/:id - Update an existing product (admin only)
router.put('/products/:id', isAdmin, updateProduct);

// DELETE /products/:id - Delete a product (admin only)
router.delete('/products/:id', isAdmin, deleteProduct);

module.exports = router;
