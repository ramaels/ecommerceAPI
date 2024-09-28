// services/productService.js
const productModel = require('../models/productModel');

const getAllProducts = async (search, category, page, size) => {
  const limit = size || 10;  // Default size 10
  const offset = (page - 1) * limit;

  return await productModel.getAllProducts(search, category, limit, offset);
};

const getProductById = async (id) => {
  return await productModel.getProductById(id);
};

const createProduct = async (name, description, price, category_id) => {
  // Add any business logic or validations here
  return await productModel.createProduct(name, description, price, category_id);
};

const updateProduct = async (id, name, description, price, category_id) => {
  // Add any business logic or validations here
  return await productModel.updateProduct(id, name, description, price, category_id);
};

const deleteProduct = async (id) => {
  return await productModel.deleteProduct(id);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
