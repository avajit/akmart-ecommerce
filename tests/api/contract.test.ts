import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../Backend/src/app';

describe('API Contract & Integration Testing', () => {
  describe('GET /health (Infrastructure Contract)', () => {
    it('TC-INT-01: returns 200 OK with operational status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toMatch(/json/);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('message', 'All systems operational');
    });
  });

  describe('GET /api/v1/categories/tree (Public Catalog Contract)', () => {
    it('TC-INT-02: returns JSON array of category roots with correct response headers', async () => {
      const res = await request(app).get('/api/v1/categories/tree');
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toMatch(/json/);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/coupons (Public Discovery Contract)', () => {
    it('TC-INT-03: returns active coupons for cart discovery', async () => {
      const res = await request(app).get('/api/v1/coupons');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Contract Compliance on 404 Not Found', () => {
    it('TC-INT-04: unhandled routes return standardized 404 JSON structure', async () => {
      const res = await request(app).get('/api/v1/unknown-endpoint-path');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe(404);
    });
  });

  describe('Security Headers Verification (Helmet)', () => {
    it('TC-INT-05: verifies security headers injected on HTTP responses', async () => {
      const res = await request(app).get('/health');
      expect(res.header['x-dns-prefetch-control']).toBeDefined();
      expect(res.header['x-frame-options']).toBeDefined();
      expect(res.header['strict-transport-security']).toBeDefined();
      expect(res.header['x-download-options']).toBeDefined();
      expect(res.header['x-content-type-options']).toBe('nosniff');
    });
  });
});
