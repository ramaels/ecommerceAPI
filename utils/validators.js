// utils/validators.js
const { body, validationResult } = require('express-validator');
const { ValidationError } = require('./errors'); // Import custom ValidationError

const validateUserRegistration = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').notEmpty().withMessage('Email is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Combine error messages into a single response
      const errorMessage = errors.array().map(err => err.msg).join(', ');
      // return res.status(400).json({ message: errorMessage });
      return next(new ValidationError(errorMessage));  // Pass error to the handler
    }
    next();
  }
];

const validateUserLogin = [
  body('email').notEmpty().withMessage('Email is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessage = errors.array().map(err => err.msg).join(', ');
      // return res.status(400).json({ message: errorMessage });
      return next(new ValidationError(errorMessage));  // Pass error to the handler
    }
    next();
  }
];

// Validation for creating and updating categories
const validateCategoryCreation = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').notEmpty().withMessage('Category description is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessage = errors.array().map(err => err.msg).join(', ');
      return next(new ValidationError(errorMessage));  // Pass error to the handler
    }
    next();
  }
];

const validateCategoryUpdate = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').notEmpty().withMessage('Category description is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessage = errors.array().map(err => err.msg).join(', ');
      return next(new ValidationError(errorMessage));  // Pass error to the handler
    }
    next();
  }
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateCategoryCreation,
  validateCategoryUpdate,
};
