import request from 'supertest';
import app from '../server.js';

process.env.NODE_ENV = "test";

describe('Course API Testing', () => {
  it('should return health check successfully', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Backend is running');
  });
});