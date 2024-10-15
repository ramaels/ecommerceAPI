const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
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

// Global rate limiter - limits to 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // Limit each IP to 100 requests per `window` (15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes.',
  headers: true,  // Include rate limit info in the response headers
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// Security best practices with Helmet
app.use(helmet());

// Enable CORS (for all domains or restrict it for specific domains)
app.use(cors());

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