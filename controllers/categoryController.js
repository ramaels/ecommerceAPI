// controllers/categoryController.js
const categoryService = require('../services/categoryService');
const { NotFoundError, DatabaseError } = require('../utils/errors'); // Custom errors

const createCategory = async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const category = await categoryService.createCategory(name, description);
    return res.status(201).json({ category });
  } catch (err) {
    console.error('Error creating category:', err.message);
    return next(new DatabaseError('Failed to create category')); // Pass error to centralized handler
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json({ categories });
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    return next(new DatabaseError('Failed to fetch categories')); // Pass error to centralized handler
  }
};

const getCategoryById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      return next(new NotFoundError('Category not found')); // Throw 404 error
    }
    return res.status(200).json({ category });
  } catch (err) {
    console.error('Error fetching category:', err.message);
    return next(new DatabaseError('Failed to fetch category by ID')); // Pass error to centralized handler
  }
};

const updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updatedCategory = await categoryService.updateCategory(id, name, description);
    if (!updatedCategory) {
      return next(new NotFoundError('Category not found')); // Throw 404 error
    }
    return res.status(200).json({ category: updatedCategory });
  } catch (err) {
    console.error('Error updating category:', err.message);
    return next(new DatabaseError('Failed to update category'));  // Pass error to centralized handler
  }
};

const deleteCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedCategory = await categoryService.deleteCategory(id);
    if (!deletedCategory) {
      return next(new NotFoundError('Category not found')); // Throw 404 error
    }
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err.message);
    return next(new DatabaseError('Failed to delete category'));  // Pass error to centralized handler
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
