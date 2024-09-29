// controllers/categoryController.js
const categoryService = require('../services/categoryService');

const createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const category = await categoryService.createCategory(name, description);
    return res.status(201).json({ category });
  } catch (err) {
    console.error('Error creating category:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json({ categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.status(200).json({ category });
  } catch (err) {
    console.error('Error fetching category:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updatedCategory = await categoryService.updateCategory(id, name, description);
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.status(200).json({ category: updatedCategory });
  } catch (err) {
    console.error('Error updating category:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await categoryService.deleteCategory(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};