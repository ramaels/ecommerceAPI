const express = require('express');
const passport = require('passport');
require('./middlewares/authMiddleware'); // Initialize Passport middleware

const authRoutes = require('./routes/authRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();

// Serve Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Initialize Passport
app.use(passport.initialize());

// Middleware
app.use(express.json());

// Routes
app.use(authRoutes);

// Default route
app.get('/', (req, res) => {
  res.status(200).send('API is running...');
});

// Export app for testing
module.exports = app;

// Start the server (optional, depending on your setup)
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
