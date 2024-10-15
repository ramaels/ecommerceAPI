const express = require('express');
const passport = require('passport');
require('./middlewares/authMiddleware'); // Initialize Passport middleware

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const userRoutes = require('./routes/userRoutes');
const shippingAddressRoutes = require('./routes/shippingAddressRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');
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
app.use(productRoutes);
app.use(categoryRoutes);
app.use(cartRoutes);
app.use(orderRoutes);
app.use(userRoutes);
app.use(shippingAddressRoutes);

app.use(errorHandler);

// Export app for testing
module.exports = app;