const express = require('express');
const app = express();
const usersRoute = require('./routes/users');

// Middleware
app.use(express.json());

// Routes
app.use(usersRoute);

// Default route
app.get('/', (req, res) => {
  res.status(200).send('API is running...');
});

// Export app for testing
module.exports = app;

// Start the server (optional, depending on your setup)
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
