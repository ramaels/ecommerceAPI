// middlewares/errorMiddleware.js
require('dotenv').config();  // Load environment variables from .env file

const errorHandler = (err, req, res, next) => {
  console.error(`Error: ${err.message}, status: ${err.statusCode}`);  // Log error message

  // Determine status code based on error type
  let statusCode;
  if (err.name) {
    statusCode = err.statusCode;
  } else if (res.statusCode === 200) {
    statusCode = 500;  // Default to 500 if no status code is set
  } else {
    statusCode = res.statusCode;
  }

  // Respond with error message and stack trace if in development
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = {
  errorHandler,
};
