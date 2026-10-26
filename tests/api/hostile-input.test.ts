import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../Backend/src/app';

describe('Black Box API: Hostile Input & Boundary Fuzzing', () => {
  const HOSTILE_STRINGS = [
    '<script>alert("XSS")</script>',
    '"><img src=x onerror=alert(1)>',
    "' OR '1'='1' --",
    '1; DROP TABLE "User"; --',
    '{"$gt": ""}',
    '../../../../etc/passwd',
    '..\\..\\..\\windows\\system32',
    '{{7*7}}',
    '${7*7}',
    'null',
    'undefined',
    'NaN',
    '0',
    '-1',
    'A'.repeat(255),
    'A'.repeat(1000),
    '🔥🚀✨🇳🇵',
    '\u202Ereversed\u202C', // Right-to-Left override
    '   leading and trailing spaces   ',
    '',
  ];

  describe('POST /api/v1/auth/login with Hostile Inputs', () => {
    HOSTILE_STRINGS.forEach((hostileValue, index) => {
      it(`TC-BB-H${String(index + 1).padStart(2, '0')}: handles hostile input safely without 500 error`, async () => {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: hostileValue,
            password: hostileValue,
          });

        // The application MUST reject invalid inputs gracefully (400 or 401 or 429), NEVER crash with 500
        expect([400, 401, 422, 429]).toContain(res.status);
        expect(res.status).not.toBe(500);
        expect(res.body.success).toBe(false);
      });
    });
  });

  describe('POST /api/v1/coupons/validate with Hostile Codes', () => {
    it('TC-BB-C01: handles SQL injection in coupon code without DB error leakage', async () => {
      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({
          code: "' OR 1=1 --",
          orderAmount: 1000,
        });

      expect([400, 404]).toContain(res.status);
      expect(res.status).not.toBe(500);
      expect(res.body.success).toBe(false);
    });

    it('TC-BB-C02: handles negative and NaN order amounts', async () => {
      const res1 = await request(app)
        .post('/api/v1/coupons/validate')
        .send({
          code: 'DISCOUNT10',
          orderAmount: -500,
        });
      expect([400, 422]).toContain(res1.status);

      const res2 = await request(app)
        .post('/api/v1/coupons/validate')
        .send({
          code: 'DISCOUNT10',
          orderAmount: 'not-a-number',
        });
      expect([400, 422]).toContain(res2.status);
    });
  });
});
