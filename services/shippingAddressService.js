// services/shippingAddressService.js
const shippingAddressModel = require('../models/shippingAddressModel');
// const { NotFoundError, ValidationError } = require('../utils/errors');

// Add a new shipping address
const addShippingAddress = async (userId, address) => {
  return shippingAddressModel.addShippingAddress(userId, address);
};

// Get all shipping addresses for a user
const getShippingAddressesByUser = async (userId) => {
  const addresses = await shippingAddressModel.getShippingAddressesByUser(userId);
  // if (!addresses || addresses.length === 0) {
  //   throw new NotFoundError('No shipping addresses found');
  // }
  return addresses;
};

// Update a shipping address
const updateShippingAddress = async (addressId, userId, address) => {
  // const existingAddress = await shippingAddressModel.getShippingAddressesByUser(userId);
  // if (!existingAddress) {
  //   throw new NotFoundError('Shipping address not found');
  // }
  return shippingAddressModel.updateShippingAddress(addressId, address);
};

// Delete a shipping address
const deleteShippingAddress = async (addressId, userId) => {
  // const existingAddress = await shippingAddressModel.getShippingAddressesByUser(userId);
  // if (!existingAddress) {
  //   throw new NotFoundError('Shipping address not found');
  // }
  return shippingAddressModel.deleteShippingAddress(addressId);
};

module.exports = {
  addShippingAddress,
  getShippingAddressesByUser,
  updateShippingAddress,
  deleteShippingAddress,
};
