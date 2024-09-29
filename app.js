const express = require('express');
const passport = require('passport');
require('./middlewares/authMiddleware'); // Initialize Passport middleware

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();

// Serve Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Initialize Passport
app.use(passport.initialize());

// Middleware
app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.status(200).send('API is running...');
});

// Routes
app.use(authRoutes);

// Use product routes
app.use(productRoutes);

// Use category routes
app.use(categoryRoutes);

// Export app for testing
module.exports = app;