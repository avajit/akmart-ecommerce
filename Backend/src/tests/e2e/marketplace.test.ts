import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { prismaTest } from '../setup';
import bcrypt from 'bcryptjs';

describe('E2E: Marketplace Lifecycle', () => {
  it('should complete the entire marketplace lifecycle (draft -> admin approve -> consumer cart)', async () => {
    // 0. Seed test database
    const adminRole = await prismaTest.role.upsert({ where: { name: 'ADMIN' }, update: {}, create: { name: 'ADMIN' } });
    const sellerRole = await prismaTest.role.upsert({ where: { name: 'SELLER' }, update: {}, create: { name: 'SELLER' } });
    const consumerRole = await prismaTest.role.upsert({ where: { name: 'CONSUMER' }, update: {}, create: { name: 'CONSUMER' } });

    await prismaTest.user.create({ data: { email: 'admin@akmart.com', fullName: 'Admin', passwordHash: await bcrypt.hash('Admin@123', 10), roleId: adminRole.id, isEmailVerified: true } });
    const sellerUser = await prismaTest.user.create({ data: { email: 'seller@techmart.com', fullName: 'Seller', passwordHash: await bcrypt.hash('Seller@123', 10), roleId: sellerRole.id, isEmailVerified: true } });
    await prismaTest.user.create({ data: { email: 'consumer@akmart.com', fullName: 'Consumer', passwordHash: await bcrypt.hash('Consumer@123', 10), roleId: consumerRole.id, isEmailVerified: true } });

    await prismaTest.sellerProfile.create({ data: { userId: sellerUser.id, shopName: 'TechMart', shopDescription: '', phoneNumber: '9800', address: 'KTM', city: 'KTM', state: 'Bagmati', pincode: '446', country: 'NP', verificationStatus: 'VERIFIED', isPayoutEnabled: true } });

    const cat = await prismaTest.category.upsert({ where: { slug: 'test-cat' }, update: {}, create: { name: 'TestCat', slug: 'test-cat' } });
    const brand = await prismaTest.brand.upsert({ where: { slug: 'test-brand' }, update: {}, create: { name: 'TestBrand', slug: 'test-brand' } });

    // 1. Get Auth Tokens
    const login = async (email: string) => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email,
        password: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) + '@123'
      });
      return res.body.data.accessToken;
    };
    const adminToken = await login('admin@akmart.com');
    const sellerToken = await login('seller@techmart.com');
    const consumerToken = await login('consumer@akmart.com');

    // 2. Seller creates draft
    let res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        name: 'Test E2E Product',
        description: 'Testing the lifecycle',
        categoryId: cat.id,
        brandId: brand.id,
        variants: [{ name: 'Default', sku: 'E2E-TEST-001', images: [{ url: 'http://test.com/img.jpg', isPrimary: true }] }]
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('DRAFT');
    const productId = res.body.data.id;
    const variantId = res.body.data.variants[0].id;

    // 3. Seller submits
    res = await request(app).patch(`/api/v1/products/${productId}/submit`).set('Authorization', `Bearer ${sellerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PENDING_REVIEW');

    // 4. Admin rejects
    res = await request(app).patch(`/api/v1/admin/products/${productId}/reject`).set('Authorization', `Bearer ${adminToken}`).send({ reason: 'Needs better images' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('REJECTED');

    // 5. Seller edits and resubmits
    res = await request(app).patch(`/api/v1/products/${productId}`).set('Authorization', `Bearer ${sellerToken}`).send({ description: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('DRAFT');
    res = await request(app).patch(`/api/v1/products/${productId}/submit`).set('Authorization', `Bearer ${sellerToken}`);
    expect(res.status).toBe(200);

    // 6. Admin approves
    res = await request(app).patch(`/api/v1/admin/products/${productId}/approve`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');

    // 7. Seller creates listing
    res = await request(app).post('/api/v1/seller/listings').set('Authorization', `Bearer ${sellerToken}`).send({
      variantId, price: 500, mrp: 600, stock: 10
    });
    expect(res.status).toBe(201);
    const sellerListingId = res.body.data.id;

    // 8. Consumer views and adds to cart
    res = await request(app).get('/api/v1/products');
    expect(res.body.data.products.find((p: any) => p.id === productId)).toBeDefined();

    res = await request(app).post('/api/v1/cart/items').set('Authorization', `Bearer ${consumerToken}`).send({
      sellerListingId, variantId, quantity: 2
    });
    expect(res.status).toBe(201);

    // 9. Concurrency Rule: reservedStock remains 0
    const listing = await prismaTest.sellerListing.findUnique({ where: { id: sellerListingId } });
    expect(listing?.stock).toBe(10);
    expect(listing?.reservedStock).toBe(0);
  });
});
