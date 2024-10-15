// models/shippingAddressModel.js 
const db = require('../config/db');

// Add a new shipping address
const addShippingAddress = async (userId, address) => {
  const { address_line_1, address_line_2, city, state, postal_code, country } = address;
  const query = `
    INSERT INTO shipping_addresses (user_id, address_line_1, address_line_2, city, state, postal_code, country)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const result = await db.query(query, [userId, address_line_1, address_line_2, city, state, postal_code, country]);
  return result.rows[0];
};

// Get all shipping addresses for a user
const getShippingAddressesByUser = async (userId) => {
  const result = await db.query('SELECT * FROM shipping_addresses WHERE user_id = $1', [userId]);
  return result.rows;
};

// Update a shipping address
const updateShippingAddress = async (addressId, address) => {
  const { address_line_1, address_line_2, city, state, postal_code, country } = address;
  const query = `
    UPDATE shipping_addresses
    SET address_line_1 = $1, address_line_2 = $2, city = $3, state = $4, postal_code = $5, country = $6
    WHERE id = $7
    RETURNING *;
  `;
  const result = await db.query(query, [address_line_1, address_line_2, city, state, postal_code, country, addressId]);
  return result.rows[0];
};

// Delete a shipping address
const deleteShippingAddress = async (addressId) => {
  const result = await db.query('DELETE FROM shipping_addresses WHERE id = $1 RETURNING *', [addressId]);
  return result.rows[0];
};

module.exports = {
  addShippingAddress,
  getShippingAddressesByUser,
  updateShippingAddress,
  deleteShippingAddress,
};
