require('dotenv').config();  // Load environment variables from .env file
const { Pool } = require('pg');

// Create a pool instance using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,  // Export the pool instance so it can be closed later
};
