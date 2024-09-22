const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

beforeAll(async () => {
  // Optionally, you can truncate or reset the user table before each test run.
  await db.query('TRUNCATE users RESTART IDENTITY CASCADE');
});

describe('POST /register', () => {
  afterAll(() => {
    db.pool.end();  // Close the pool after all tests
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
    expect(res.body.message).toBe('Username, email, and password are required');
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
