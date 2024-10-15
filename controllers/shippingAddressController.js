// controllers/shippingAddressController.js
const shippingAddressService = require('../services/shippingAddressService');
const { NotFoundError, ValidationError } = require('../utils/errors');

// Add a new shipping address
const addShippingAddress = async (req, res, next) => {
  const userId = req.user.id;
  const address = req.body;

  try {
    const newAddress = await shippingAddressService.addShippingAddress(userId, address);
    res.status(201).json(newAddress);
  } catch (err) {
    return next(err);
  }
};

// Get all shipping addresses for a user
const getShippingAddressesByUser = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const addresses = await shippingAddressService.getShippingAddressesByUser(userId);
    if (!addresses || addresses.length === 0) {
      return next(new NotFoundError('No shipping addresses found'));
    }
    res.status(200).json(addresses);
  } catch (err) {
    return next(err);
  }
};

// Update a shipping address
const updateShippingAddress = async (req, res, next) => {
  const addressId = req.params.id;
  const userId = req.user.id;
  const address = req.body;

  console.log('addressId: ', addressId);
  try {
    const existingAddress = await shippingAddressService.getShippingAddressesByUser(userId);
    if (!existingAddress) {
      return next(new NotFoundError('Shipping address not found'));
    }
    const updatedAddress = await shippingAddressService.updateShippingAddress(addressId, userId, address);
    res.status(200).json(updatedAddress);
  } catch (err) {
    return next(err);
  }
};

// Delete a shipping address
const deleteShippingAddress = async (req, res, next) => {
  const addressId = req.params.id;
  const userId = req.user.id;

  try {
    const existingAddress = await shippingAddressService.getShippingAddressesByUser(userId);
    if (!existingAddress) {
      return next(new NotFoundError('Shipping address not found'));
    }
    await shippingAddressService.deleteShippingAddress(addressId, userId);
    res.status(200).json({ message: 'Shipping address deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addShippingAddress,
  getShippingAddressesByUser,
  updateShippingAddress,
  deleteShippingAddress,
};