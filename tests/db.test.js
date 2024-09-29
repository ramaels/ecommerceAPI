const db = require('../config/db');
const app = require('../app');         // Import the Express app

let server;

beforeAll(() => {
  server = app.listen(5100);  // Start the server before running tests
});

afterAll(() => {
  db.pool.end();  // Close the pool after all tests
  server.close();  // Close the server after tests are done
});

describe('PostgreSQL connection', () => {
  it('should connect to the database successfully', async () => {
    const result = await db.query('SELECT 1 + 1 AS result');
    expect(result.rows[0].result).toBe(2);
  });
});
