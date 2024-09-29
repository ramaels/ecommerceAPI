// services/categoryService.js
const categoryModel = require('../models/categoryModel');

const createCategory = async (name, description) => {
  return await categoryModel.createCategory(name, description);
};

const getAllCategories = async () => {
  return await categoryModel.getAllCategories();
};

const getCategoryById = async (id) => {
  const category = await categoryModel.getCategoryById(id);
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
};

const updateCategory = async (id, name, description) => {
  return await categoryModel.updateCategory(id, name, description);
};

const deleteCategory = async (id) => {
  return await categoryModel.deleteCategory(id);
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
