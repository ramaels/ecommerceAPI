// controllers/productController.js
const productService = require('../services/productService');

// Get all products with optional search and category filters
const getProducts = async (req, res) => {
  const { search, category, page = 1, size = 10 } = req.query;

  try {
    const products = await productService.getAllProducts(search, category, page, size);
    return res.status(200).json({ products });
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific product by ID
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ product });
  } catch (err) {
    console.error('Error fetching product:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Create a new product (admin only)
const createProduct = async (req, res) => {
  const { name, description, price, category_id } = req.body;

  try {
    const newProduct = await productService.createProduct(name, description, price, category_id);
    return res.status(201).json({ product: newProduct });
  } catch (err) {
    console.error('Error creating product:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update an existing product (admin only)
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id } = req.body;

  try {
    const updatedProduct = await productService.updateProduct(id, name, description, price, category_id);
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ product: updatedProduct });
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete a product (admin only)
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await productService.deleteProduct(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
