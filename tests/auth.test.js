// tests/auth.test.js
const request = require('supertest');
const app = require('../app');
const db = require('../config/db');
const userService = require('../services/userService');
const tokenService = require('../services/tokenService');
const jwt = require('jsonwebtoken');

let server;

beforeAll(() => {
  server = app.listen(5100);  // Start the server before running tests
});

afterAll(() => {
  db.pool.end();  // Close the pool after all tests
});

afterAll((done) => {
  server.close(done);  // Close the server after tests are done
});

describe('POST /register', () => {
  beforeAll(async () => {
    // Optionally, you can truncate or reset the user table before each test run.
    await db.query('TRUNCATE users RESTART IDENTITY CASCADE');
  });

  afterEach(() => {
    // Reset all mocks after each test
    jest.clearAllMocks();
  });
  
  it('should register a new user successfully', async () => {
    const newUser = {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123'
    };

    const res = await request(app)
      .post('/register')
      .send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.username).toBe('testuser');
    expect(res.body.email).toBe('testuser@example.com');
  });

  it('should return a 400 status if the user already exists', async () => {
    const existingUser = {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123'
    };

    const res = await request(app)
      .post('/register')
      .send(existingUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  it('should return a 400 status if the email is missing', async () => {
    const newUser = {
      username: 'testuser',
      password: 'password123'
    };

    const res = await request(app)
      .post('/register')
      .send(newUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email is required, Valid email is required');
  });

  it('should return a 500 status if a server error occurs', async () => {
    // Mock the database query to throw an error
    jest.spyOn(db, 'query').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const newUser = {
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: 'password123'
    };

    const res = await request(app)
      .post('/register')
      .send(newUser);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Server error');
  });
});

describe('POST /login', () => {
  beforeAll(async () => {
    // Find the user ID for 'testuser'
    const user = await userService.findUserByEmail('testuser@example.com');
    if (user) {
      // Delete all rows related to this user's ID from the refresh_tokens table
      await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [user.id]);
    }
  });

  afterEach(() => {
    // Reset all mocks after each test
    jest.clearAllMocks();
  });
  
  it('should log in successfully with correct credentials', async () => {
    const userCredentials = {
      email: 'testuser@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/login')
      .send(userCredentials);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user).toHaveProperty('username', 'testuser');
  });

  it('should return 400 if email is missing', async () => {
    const res = await request(app)
      .post('/login')
      .send({ password: 'password123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email is required, Valid email is required');
  });

  it('should return 400 if password is missing', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'testuser@example.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Password is required');
  });

  it('should return 401 if credentials are incorrect', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'wronguser@example.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should return 401 if the password is incorrect', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'testuser@example.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should return 401 if no user is found during login', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'wronguser@example.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should return 500 if an error occurs during token generation', async () => {
    // Simulate an error in token generation
    jest.spyOn(jwt, 'sign').mockImplementation(() => {
      throw new Error('Token generation error');
    });

    const res = await request(app)
      .post('/login')
      .send({ email: 'testuser@example.com', password: 'password123' });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Token generation failed');
  });

  it('should return 500 if an error occurs during authentication', async () => {
    // Simulate an error in userService.findUserByEmail
    jest.spyOn(userService, 'findUserByEmail').mockImplementation(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .post('/login')
      .send({ email: 'testuser@example.com', password: 'password123' });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Server error');
  });

});