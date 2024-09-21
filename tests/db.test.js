const db = require('../config/db');

describe('PostgreSQL connection', () => {
  afterAll(() => {
    db.pool.end();  // Close the pool after all tests
  });

  it('should connect to the database successfully', async () => {
    const result = await db.query('SELECT 1 + 1 AS result');
    expect(result.rows[0].result).toBe(2);
  });
});
