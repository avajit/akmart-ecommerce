import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { env } from '../../config/env';

describe('Security: Brute-Force Protection', () => {
  
  beforeAll(() => {
    // Enable rate limiting for this specific test suite
    process.env.ENABLE_RATE_LIMIT_TEST = 'true';
  });

  afterAll(() => {
    delete process.env.ENABLE_RATE_LIMIT_TEST;
  });

  it('should trigger rate limiting after multiple failed login attempts', async () => {
    const loginData = {
      email: 'bruteforce@example.com',
      password: 'wrongpassword'
    };

    const maxAttempts = env.AUTH_RATE_LIMIT_MAX_REQUESTS;

    // We make maxAttempts requests which should all pass through (though fail authentication)
    for (let i = 0; i < maxAttempts; i++) {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);
      
      // Should be 401 Unauthorized, NOT 429
      expect(res.status).not.toBe(429);
    }

    // The next request should be blocked by rate limiter
    const limitedRes = await request(app)
      .post('/api/v1/auth/login')
      .send(loginData);

    expect(limitedRes.status).toBe(429);
    expect(limitedRes.body.error.message).toContain('Too many authentication attempts');
  }, 20000); // Increased timeout for multiple serial requests

  it('should protect OTP verification from brute-force', async () => {
    const verifyData = {
      identifier: 'bruteforce-otp@example.com',
      token: '123456'
    };

    const maxAttempts = env.AUTH_RATE_LIMIT_MAX_REQUESTS;

    for (let i = 0; i < maxAttempts; i++) {
      const res = await request(app)
        .post('/api/v1/auth/verify-account')
        .send(verifyData);
      
      expect(res.status).not.toBe(429);
    }

    const limitedRes = await request(app)
      .post('/api/v1/auth/verify-account')
      .send(verifyData);

    expect(limitedRes.status).toBe(429);
  }, 20000);

});
