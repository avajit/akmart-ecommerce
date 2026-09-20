import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

describe('Security: Injection & Validation Hardening', () => {
  const loginEndpoint = '/api/v1/auth/login';

  it('should block NoSQL/Object injection attempts in login fields', async () => {
    const maliciousPayload = {
      email: { "$gt": "" }, // Classic NoSQL injection attempt
      password: "password123"
    };

    const response = await request(app).post(loginEndpoint).send(maliciousPayload);
    
    // Zod should catch this immediately because email expects a string, not an object.
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.errorCode).toBe('VALIDATION_ERROR');
  });

  it('should block extremely large payload injections (DDoS protection)', async () => {
    // Generate a 20MB string payload
    const massiveString = 'A'.repeat(20 * 1024 * 1024);
    const maliciousPayload = {
      email: `test@${massiveString}.com`,
      password: "password"
    };

    const response = await request(app).post(loginEndpoint).send(maliciousPayload);

    // Express should block this via body-parser limit (usually 100kb), returning 413 Payload Too Large
    // Or Zod will catch it if body-parser limit is higher.
    expect(response.status).toBeGreaterThanOrEqual(400); 
  });
});
