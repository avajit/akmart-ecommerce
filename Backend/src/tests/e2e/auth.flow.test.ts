import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { redis } from '../../app';

describe('E2E: User Authentication Journey', () => {
  const e2eUser = {
    fullName: 'E2E Journey User',
    email: 'e2e@akmart.com',
    password: 'SecurePassword123!',
    phoneNumber: '9800000000'
  };

  it('should complete the entire user journey from registration to token refresh', async () => {
    // 1. User registers successfully (but is unverified)
    const registerRes = await request(app).post('/api/v1/auth/register').send(e2eUser);
    expect(registerRes.status).toBe(201);

    // 2. User attempts to login immediately and is blocked (UNVERIFIED_ACCOUNT)
    const loginRes1 = await request(app).post('/api/v1/auth/login').send({
      email: e2eUser.email,
      password: e2eUser.password
    });
    expect(loginRes1.status).toBe(403);
    expect(loginRes1.body.error.errorCode).toBe('UNVERIFIED_ACCOUNT');

    // 3. User fetches their OTP from Redis (simulating checking email)
    const userEmail = e2eUser.email;
    const keys = await redis.keys('otp:EMAIL_VERIFY:*');
    let verificationToken = '';
    for (const key of keys) {
      const val = await redis.get(key);
      if (val === userEmail) {
        verificationToken = key.split(':').pop() || '';
        break;
      }
    }
    expect(verificationToken).toBeDefined();

    const verifyRes = await request(app).post('/api/v1/auth/verify-account').send({
      identifier: e2eUser.email,
      token: verificationToken
    });
    expect(verifyRes.status).toBe(200);

    // 4. User logs in successfully and receives tokens
    const loginRes2 = await request(app).post('/api/v1/auth/login').send({
      email: e2eUser.email,
      password: e2eUser.password
    });
    expect(loginRes2.status).toBe(200);
    
    const accessToken = loginRes2.body.data.accessToken;
    const cookies = loginRes2.headers['set-cookie'];
    const cookieHeader = cookies[0].split(';')[0]; // "refreshToken=ey..."
    
    expect(accessToken).toBeDefined();
    expect(cookies).toBeDefined();

    // 5. User safely refreshes their session using HttpOnly cookie
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh-token')
      .set('Cookie', cookieHeader);
      
    console.log("REFRESH RES BODY:", refreshRes.body);
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.accessToken).toBeDefined();
    expect(refreshRes.headers['set-cookie'][0]).toContain('refreshToken');
  });
});
