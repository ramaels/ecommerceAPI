const request = require('supertest');  // Import supertest for HTTP assertions
const app = require('../app');         // Import the Express app

describe('GET /', () => {
  it('should return 200 OK with a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);                        // Assert that status code is 200
    expect(res.text).toBe('API is running...');              // Assert that the response text is as expected
  });
});
