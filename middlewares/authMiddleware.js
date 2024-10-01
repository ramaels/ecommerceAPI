// middlewares/authMiddleware.js
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
require('dotenv').config(); // Load environment variables from .env

// Setup Passport local strategy for login
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await userService.findUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        const isMatch = await userService.comparePasswords(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        return done(null, user);
      } catch (err) {
        console.error('Error during authentication:', err); // Logs the error
        return done(err); // Pass the error to be handled
      }
    }
  )
);

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if the Authorization header is present
  if (!authHeader) {
    // return res.status(401).json({ message: 'Token is required' });
    return next(new UnauthorizedError('Header is required'));
  }

  // The token should be in the format "Bearer <token>"
  const token = authHeader.split(' ')[1];
  console.log('token: ', token);
  if (!token) {
    // return res.status(401).json({ message: 'Token is required' });
    return next(new UnauthorizedError('Token is required'));
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // return res.status(403).json({ message: 'Invalid or expired token' });
      return next(new ForbiddenError('Invalid or expired token'));
    }

    // Attach user information to the request object
    req.user = user;
    next();
  });
};

// Middleware to check if the user has admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    // return res.status(403).json({ message: 'Admin access required' });
    return next(new ForbiddenError('Admin access required'));
  }
  next();
};

module.exports = { verifyAccessToken, isAdmin };