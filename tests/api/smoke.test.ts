import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../Backend/src/app';

describe('Smoke Suite: Rapid Deployment & Health Gatekeeper (< 30 seconds)', () => {
  it('SMK-01: Backend API Health check probe returns 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('SMK-02: Public category tree returns 200 OK with array data', async () => {
    const res = await request(app).get('/api/v1/categories/tree');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('SMK-03: Public catalog browse returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('SMK-04: Public promotional coupons endpoint returns 200 OK', async () => {
    const res = await request(app).get('/api/v1/coupons');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('SMK-05: Unauthenticated Cart access is guarded (HTTP 401)', async () => {
    const res = await request(app).get('/api/v1/cart');
    expect(res.status).toBe(401);
  });

  it('SMK-06: Unauthenticated Checkout is guarded (HTTP 401)', async () => {
    const res = await request(app).post('/api/v1/orders/checkout').send({});
    expect(res.status).toBe(401);
  });

  it('SMK-07: Unauthenticated Admin dashboard access is guarded (HTTP 401)', async () => {
    const res = await request(app).get('/api/v1/admin/dashboard');
    expect(res.status).toBe(401);
  });

  it('SMK-08: Unauthenticated Seller listings access is guarded (HTTP 401)', async () => {
    const res = await request(app).get('/api/v1/seller/listings');
    expect(res.status).toBe(401);
  });

  it('SMK-09: Nonexistent route returns structured JSON 404', async () => {
    const res = await request(app).get('/api/v1/nonexistent-route-smoke');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('SMK-10: Ingress security headers are present', async () => {
    const res = await request(app).get('/health');
    expect(res.header['x-content-type-options']).toBe('nosniff');
    expect(res.header['x-frame-options']).toBeDefined();
  });
});
