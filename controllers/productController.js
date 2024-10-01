// controllers/productController.js
const productService = require('../services/productService');
const { NotFoundError, DatabaseError } = require('../utils/errors'); // Custom errors

// Get all products with optional search and category filters
const getProducts = async (req, res, next) => {
  const { search, category, page = 1, size = 10 } = req.query;

  try {
    const products = await productService.getAllProducts(search, category, page, size);
    return res.status(200).json({ products });
  } catch (err) {
    console.error('Error fetching products:', err);
    return next(new DatabaseError('Server error fetching products')); // Pass error to centralized handler
  }
};

// Get a specific product by ID
const getProductById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await productService.getProductById(id);
    if (!product) {
      return next(new NotFoundError('Product not found'));  // Pass error to centralized handler
    }
    return res.status(200).json({ product });
  } catch (err) {
    console.error('Error fetching product:', err);
    return next(new DatabaseError('Server error fetching a specific product by ID')); // Pass error to centralized handler
  }
};

// Create a new product (admin only)
const createProduct = async (req, res, next) => {
  const { name, description, price, category_id } = req.body;

  try {
    const newProduct = await productService.createProduct(name, description, price, category_id);
    return res.status(201).json({ product: newProduct });
  } catch (err) {
    console.error('Error creating product:', err);
    return next(new DatabaseError('Server error creating product')); // Pass error to centralized handler
  }
};

// Update an existing product (admin only)
const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, category_id } = req.body;

  try {
    const updatedProduct = await productService.updateProduct(id, name, description, price, category_id);
    if (!updatedProduct) {
      return next(new NotFoundError('Product not found'));  // Pass error to centralized handler
    }
    return res.status(200).json({ product: updatedProduct });
  } catch (err) {
    console.error('Error updating product:', err);
    return next(new DatabaseError('Server error updating product')); // Pass error to centralized handler
  }
};

// Delete a product (admin only)
const deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedProduct = await productService.deleteProduct(id);
    if (!deletedProduct) {
      return next(new NotFoundError('Product not found'));  // Pass error to centralized handler
    }
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    return next(new DatabaseError('Server error deleting product')); // Pass error to centralized handler
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};