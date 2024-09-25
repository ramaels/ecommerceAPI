// middlewares/authMiddleware.js
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const userService = require('../services/userService');

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