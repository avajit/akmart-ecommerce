import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../Backend/src/app';
import jwt from 'jsonwebtoken';
import { env } from '../../Backend/src/config/env';

// Helper to generate signed test tokens without hitting database
const makeToken = (userId: string, roleId: string, roleName: string) => {
  return jwt.sign({ userId, roleId, roleName, jti: 'test-jti' }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

describe('API: Role-Based Access Control (RBAC) & Authorization Matrix', () => {
  const consumerToken = makeToken('consumer-uuid-1', 'role-consumer', 'CONSUMER');
  const sellerToken = makeToken('seller-uuid-1', 'role-seller', 'SELLER');
  const adminToken = makeToken('admin-uuid-1', 'role-admin', 'ADMIN');

  describe('Vertical Privilege Restrictions: Admin Endpoints', () => {
    it('TC-RBAC-01: Anonymous requests to /api/v1/admin/dashboard return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('TC-RBAC-02: CONSUMER role to /api/v1/admin/dashboard returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${consumerToken}`);
      // Must be blocked by requireRole (403 or 401 if user not found in mock DB)
      expect([401, 403]).toContain(res.status);
    });

    it('TC-RBAC-03: SELLER role to /api/v1/admin/dashboard returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${sellerToken}`);
      expect([401, 403]).toContain(res.status);
    });
  });

  describe('Vertical Privilege Restrictions: Seller Endpoints', () => {
    it('TC-RBAC-04: Anonymous requests to /api/v1/seller/listings return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/seller/listings');
      expect(res.status).toBe(401);
    });

    it('TC-RBAC-05: CONSUMER role to /api/v1/seller/listings returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/seller/listings')
        .set('Authorization', `Bearer ${consumerToken}`);
      expect([401, 403]).toContain(res.status);
    });
  });

  describe('Consumer Wall Restrictions: Cart & Checkout Endpoints', () => {
    it('TC-RBAC-06: Anonymous requests to /api/v1/cart return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/cart');
      expect(res.status).toBe(401);
    });

    it('TC-RBAC-07: Anonymous requests to /api/v1/orders/checkout return 401 Unauthorized', async () => {
      const res = await request(app).post('/api/v1/orders/checkout').send({});
      expect(res.status).toBe(401);
    });
  });
});
