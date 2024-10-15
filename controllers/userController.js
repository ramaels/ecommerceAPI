// controllers/userController.js
const userService = require('../services/userService');
const { NotFoundError, ValidationError } = require('../utils/errors');

const findUserById = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const profile = await userService.findUserById(userId);
    if (!profile) return next(new NotFoundError('user not found'));

    res.status(200).json(profile);
  } catch (err) {
    return next(err);
  }
};

// Update user profile
const updateUserProfile = async (req, res, next) => {
  const userId = req.user.id;
  const fields = req.body;

  try {
    const user = await userService.findUserById(userId);
    if (!user) {
      return next(new NotFoundError('User not found'));
    }
      const updatedUser = await userService.updateUserProfile(userId, fields);
    res.status(200).json(updatedUser);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  updateUserProfile,
  findUserById,
};