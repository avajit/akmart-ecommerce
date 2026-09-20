import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, redis } from '../app';
import { prismaTest } from './setup';

describe('Authentication API', () => {
  
  const testUser = {
    fullName: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    phoneNumber: '9876543210'
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully with an email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: testUser.fullName,
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBeDefined();

      // Verify in test DB
      const dbUser = await prismaTest.user.findUnique({ where: { email: testUser.email }});
      expect(dbUser).toBeDefined();
    });

    it('should fail if email is already registered', async () => {
      // First registration
      await request(app).post('/api/v1/auth/register').send(testUser);

      // Second registration (Duplicate)
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.errorCode).toBe('EMAIL_EXISTS');
    });

    it('should fail if validation fails (short password)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...testUser, password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Password must be at least 8 characters');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should block login if account is not verified', async () => {
      // Setup user (unverified by default)
      await request(app).post('/api/v1/auth/register').send(testUser);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.errorCode).toBe('UNVERIFIED_ACCOUNT');
    });

    it('should login successfully and return strict DTOs without leaking passwordHash if verified', async () => {
      // Re-register the user for this specific isolated test
      await request(app).post('/api/v1/auth/register').send(testUser);

      // Manually verify the user in the database to test the successful login flow
      await prismaTest.user.update({
        where: { email: testUser.email },
        data: { isEmailVerified: true }
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Ensure HTTP-Only cookie was set
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('refreshToken');
      expect(response.headers['set-cookie'][0]).toContain('HttpOnly');

      // Verify Response DTO does not leak sensitive data
      const data = response.body.data;
      expect(data.accessToken).toBeDefined();
      expect(data.user.passwordHash).toBeUndefined(); // Crucial security check
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.role).toBe('CONSUMER');
    });

    it('should fail login with invalid password', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.errorCode).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/v1/auth/verify-account', () => {
    it('should successfully verify an account with the correct OTP', async () => {
      const userEmail = 'verify@example.com';
      await request(app).post('/api/v1/auth/register').send({
        ...testUser,
        email: userEmail
      });

      // Fetch the OTP generated in Redis by the register route
      const keys = await redis.keys('otp:EMAIL_VERIFY:*');
      let foundToken = '';
      for (const key of keys) {
        const val = await redis.get(key);
        if (val === userEmail) {
          foundToken = key.split(':').pop() || '';
          break;
        }
      }

      expect(foundToken).toBeDefined();
      expect(foundToken).not.toBe('');

      const response = await request(app)
        .post('/api/v1/auth/verify-account')
        .send({
          identifier: userEmail,
          token: foundToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail to verify with an invalid OTP', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-account')
        .send({
          identifier: testUser.email, // Exists from earlier tests
          token: '000000' // Fake token
        });

      expect(response.status).toBe(400);
      expect(response.body.error.errorCode).toBe('EXPIRED_OTP');
    });

  });
});
