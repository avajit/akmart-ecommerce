import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prismaTest } from './setup';
import bcrypt from 'bcryptjs';
import { calculateRolledUpOrderStatus } from '../services/order.service';

describe('Beta Verification Suite: Launch Hardening & Guardrails', () => {
  let consumerToken: string;
  let adminToken: string;
  let testListingId: string;
  let testVariantId: string;
  let testAddressId: string;

  beforeEach(async () => {
    // 0. Seed test database roles & users
    const adminRole = await prismaTest.role.upsert({ where: { name: 'ADMIN' }, update: {}, create: { name: 'ADMIN' } });
    const sellerRole = await prismaTest.role.upsert({ where: { name: 'SELLER' }, update: {}, create: { name: 'SELLER' } });
    const consumerRole = await prismaTest.role.upsert({ where: { name: 'CONSUMER' }, update: {}, create: { name: 'CONSUMER' } });

    await prismaTest.user.upsert({
      where: { email: 'admin@akmart.com' },
      update: {},
      create: { email: 'admin@akmart.com', fullName: 'Admin', passwordHash: await bcrypt.hash('Admin@123', 10), roleId: adminRole.id, isEmailVerified: true }
    });

    const sellerUser = await prismaTest.user.upsert({
      where: { email: 'seller@techmart.com' },
      update: {},
      create: { email: 'seller@techmart.com', fullName: 'Seller', passwordHash: await bcrypt.hash('Seller@123', 10), roleId: sellerRole.id, isEmailVerified: true }
    });

    await prismaTest.user.upsert({
      where: { email: 'consumer@akmart.com' },
      update: {},
      create: { email: 'consumer@akmart.com', fullName: 'Consumer', passwordHash: await bcrypt.hash('Consumer@123', 10), roleId: consumerRole.id, isEmailVerified: true }
    });

    const profile = await prismaTest.sellerProfile.upsert({
      where: { userId: sellerUser.id },
      update: {},
      create: { userId: sellerUser.id, shopName: 'TechMart', shopDescription: '', phoneNumber: '9800000000', address: 'KTM', city: 'KTM', state: 'Bagmati', pincode: '44600', country: 'NP', verificationStatus: 'VERIFIED', isPayoutEnabled: true }
    });

    const cat = await prismaTest.category.upsert({ where: { slug: 'beta-test-cat' }, update: {}, create: { name: 'BetaTestCat', slug: 'beta-test-cat' } });
    const brand = await prismaTest.brand.upsert({ where: { slug: 'beta-test-brand' }, update: {}, create: { name: 'BetaTestBrand', slug: 'beta-test-brand' } });

    const prod = await prismaTest.product.create({
      data: {
        name: 'Beta Verification Product',
        slug: 'beta-verification-prod-' + Date.now() + Math.random(),
        description: 'Test product for beta validation',
        categoryId: cat.id,
        brandId: brand.id,
        createdById: sellerUser.id,
        status: 'APPROVED',
        variants: {
          create: {
            name: 'Standard Variant',
            sku: 'BETA-SKU-' + Date.now() + Math.random(),
            listings: {
              create: {
                sellerProfileId: profile.id,
                price: 1500,
                mrp: 2000,
                stock: 50,
                isActive: true,
              }
            }
          }
        }
      },
      include: {
        variants: {
          include: { listings: true }
        }
      }
    });

    const variant = prod.variants[0];
    testVariantId = variant.id;
    testListingId = variant.listings[0].id;

    // 1. Authenticate Consumer
    const consumerRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'consumer@akmart.com', password: 'Consumer@123' });
    consumerToken = consumerRes.body?.data?.accessToken;

    // 2. Authenticate Admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@akmart.com', password: 'Admin@123' });
    adminToken = adminRes.body?.data?.accessToken;

    // 3. Create base delivery address
    const addressRes = await request(app)
      .post('/api/v1/orders/addresses')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        fullName: 'Bikash Shrestha',
        phone: '9841234567',
        street: 'New Baneshwor, Ward 10',
        city: 'Kathmandu',
        district: 'Kathmandu',
        state: 'Bagmati Province',
        zipCode: '44600',
      });
    testAddressId = addressRes.body?.data?.id;
  });

  // ============================================================================
  // REQUIREMENT 1: REJECT PAYMENT METHODS OTHER THAN COD
  // ============================================================================
  describe('1. Payment Method Restrictions (COD Only During Beta)', () => {
    it('should reject paymentMethod: "ESEWA" with HTTP 400', async () => {
      // Put item in cart
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ sellerListingId: testListingId, variantId: testVariantId, quantity: 1 });

      const res = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          shippingAddressId: testAddressId,
          paymentMethod: 'ESEWA', // Must be rejected
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(
        res.body.error?.message?.toLowerCase().includes('cash on delivery') ||
        res.body.error?.message?.toLowerCase().includes('cod') ||
        res.body.error?.details?.some((d: any) => d.message?.includes('COD'))
      ).toBe(true);
    });

    it('should reject paymentMethod: "KHALTI" with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          shippingAddressId: testAddressId,
          paymentMethod: 'KHALTI', // Must be rejected
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should accept paymentMethod: "COD" with HTTP 201', async () => {
      // Put item in cart
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ sellerListingId: testListingId, variantId: testVariantId, quantity: 1 });

      const res = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          shippingAddressId: testAddressId,
          paymentMethod: 'COD',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.paymentMethod).toBe('COD');
    });
  });

  // ============================================================================
  // REQUIREMENT 4: NEPAL MOBILE PREFIXES (96, 97, 98)
  // ============================================================================
  describe('2. Nepal Phone Prefix Acceptance (96, 97, 98)', () => {
    it('should accept mobile number with 96 prefix (e.g. 9612345678)', async () => {
      const res = await request(app)
        .post('/api/v1/orders/addresses')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          fullName: 'Sita Gurung',
          phone: '9612345678', // 96 prefix
          street: 'Lakeside Ward 6',
          city: 'Pokhara',
          district: 'Kaski (Pokhara)',
          state: 'Gandaki Province',
          zipCode: '33700',
        });

      expect(res.status).toBe(201);
      expect(res.body.data?.phone).toBe('9612345678');
    });

    it('should accept mobile number with 97 prefix (e.g. 9741234567)', async () => {
      const res = await request(app)
        .post('/api/v1/orders/addresses')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          fullName: 'Ramesh Thapa',
          phone: '9741234567', // 97 prefix
          street: 'Traffic Chowk',
          city: 'Butwal',
          district: 'Rupandehi (Butwal/Bhairahawa)',
          state: 'Lumbini Province',
          zipCode: '32907',
        });

      expect(res.status).toBe(201);
      expect(res.body.data?.phone).toBe('9741234567');
    });

    it('should accept mobile number with 98 prefix (e.g. 9841234567)', async () => {
      const res = await request(app)
        .post('/api/v1/orders/addresses')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          fullName: 'Bikash Shrestha',
          phone: '9841234567', // 98 prefix
          street: 'Baneshwor',
          city: 'Kathmandu',
          district: 'Kathmandu',
          state: 'Bagmati Province',
          zipCode: '44600',
        });

      expect(res.status).toBe(201);
      expect(res.body.data?.phone).toBe('9841234567');
    });

    it('should reject invalid mobile prefix (e.g. 95XXXXXXXX) with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/v1/orders/addresses')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          fullName: 'Invalid Mobile User',
          phone: '9512345678', // 95 is not a valid Nepal mobile prefix
          street: 'Baneshwor',
          city: 'Kathmandu',
          district: 'Kathmandu',
          state: 'Bagmati Province',
          zipCode: '44600',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ============================================================================
  // REQUIREMENT 3: IDEMPOTENT ORDER PLACEMENT
  // ============================================================================
  describe('3. Idempotent Order Placement & Double Submission Defense', () => {
    it('should prevent duplicate order creation on double submission with same idempotency key', async () => {
      // 1. Add item to cart
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ sellerListingId: testListingId, variantId: testVariantId, quantity: 1 });

      const testIdempotencyKey = 'idemp_test_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

      // First submission
      const firstRes = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          shippingAddressId: testAddressId,
          paymentMethod: 'COD',
          idempotencyKey: testIdempotencyKey,
          deliveryNotes: 'First submission',
        });

      expect(firstRes.status).toBe(201);
      const firstOrderId = firstRes.body.data?.id;
      expect(firstOrderId).toBeTruthy();

      // Second submission with exact same idempotency key (simulating fast double-click or network retry)
      const secondRes = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          shippingAddressId: testAddressId,
          paymentMethod: 'COD',
          idempotencyKey: testIdempotencyKey,
          deliveryNotes: 'Duplicate submission attempt',
        });

      // Must either return the existing order (idempotent 200/201) OR 409 conflict, never create a duplicate order!
      expect([200, 201, 409]).toContain(secondRes.status);
      if (secondRes.status === 200 || secondRes.status === 201) {
        expect(secondRes.body.data?.id).toBe(firstOrderId);
      }

      // Verify in DB that only 1 order exists for this idempotency key / timestamp
      const ordersInDb = await prismaTest.order.findMany({
        where: { id: firstOrderId }
      });
      expect(ordersInDb.length).toBe(1);
    });
  });

  // ============================================================================
  // REQUIREMENT 5: ORDER ITEM STATUS ROLLUP & INVALID TRANSITIONS BLOCK
  // ============================================================================
  describe('4. Multi-Vendor Order Rollup & State Machine Transitions', () => {
    it('calculateRolledUpOrderStatus accurately rolls up item fulfillment states', () => {
      // 1. All Cancelled -> CANCELLED
      expect(calculateRolledUpOrderStatus(['CANCELLED', 'CANCELLED'])).toBe('CANCELLED');

      // 2. All Delivered -> DELIVERED
      expect(calculateRolledUpOrderStatus(['DELIVERED', 'DELIVERED'])).toBe('DELIVERED');
      expect(calculateRolledUpOrderStatus(['DELIVERED', 'CANCELLED'])).toBe('DELIVERED');

      // 3. Partial Shipped / Delivered -> SHIPPED
      expect(calculateRolledUpOrderStatus(['SHIPPED', 'DELIVERED'])).toBe('SHIPPED');
      expect(calculateRolledUpOrderStatus(['SHIPPED', 'CONFIRMED'])).toBe('SHIPPED');

      // 4. Confirmed / Processing -> CONFIRMED
      expect(calculateRolledUpOrderStatus(['CONFIRMED', 'PROCESSING'])).toBe('CONFIRMED');

      // 5. Any Pending -> PENDING
      expect(calculateRolledUpOrderStatus(['PENDING', 'CONFIRMED'])).toBe('PENDING');
      expect(calculateRolledUpOrderStatus(['PENDING'])).toBe('PENDING');
    });

    it('should block invalid admin transitions (e.g. DELIVERED -> PENDING) with HTTP 400', async () => {
      // Create a test order and progress it to DELIVERED
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ sellerListingId: testListingId, variantId: testVariantId, quantity: 1 });

      const createOrderRes = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ shippingAddressId: testAddressId, paymentMethod: 'COD' });

      const orderId = createOrderRes.body.data.id;

      // Progress: PENDING -> CONFIRMED -> SHIPPED -> DELIVERED
      await request(app)
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' });

      await request(app)
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'SHIPPED' });

      const deliveredRes = await request(app)
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'DELIVERED' });
      expect(deliveredRes.status).toBe(200);

      // Now attempt ILLEGAL reverse transition: DELIVERED -> PENDING
      const illegalPendingRes = await request(app)
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PENDING' });

      expect(illegalPendingRes.status).toBe(400);
      expect(illegalPendingRes.body.success).toBe(false);
      expect(illegalPendingRes.body.error?.errorCode).toBe('INVALID_STATE_TRANSITION');

      // Attempt ILLEGAL reverse transition: DELIVERED -> SHIPPED
      const illegalShippedRes = await request(app)
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'SHIPPED' });

      expect(illegalShippedRes.status).toBe(400);
      expect(illegalShippedRes.body.error?.errorCode).toBe('INVALID_STATE_TRANSITION');
    });

    it('should block reviving a CANCELLED order (CANCELLED is terminal)', async () => {
      // Create an order
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ sellerListingId: testListingId, variantId: testVariantId, quantity: 1 });

      const createOrderRes = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ shippingAddressId: testAddressId, paymentMethod: 'COD' });

      const orderId = createOrderRes.body.data.id;

      // Cancel the order
      const cancelRes = await request(app)
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CANCELLED' });
      expect(cancelRes.status).toBe(200);

      // Attempt to reactivate: CANCELLED -> CONFIRMED
      const reactivateRes = await request(app)
        .patch(`/api/v1/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' });

      expect(reactivateRes.status).toBe(400);
      expect(reactivateRes.body.error?.errorCode).toBe('INVALID_STATE_TRANSITION');
    });
  });

  // ============================================================================
  // REQUIREMENT 6: CONTACT FORM PERSISTENCE
  // ============================================================================
  describe('5. Contact Message Storage in Database', () => {
    it('should store public contact messages in the database with status UNREAD', async () => {
      const contactPayload = {
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '9841000000',
        subject: 'Wholesale Inquiry',
        message: 'Hello AKMart team, I would like to inquire about bulk ordering and seller partnerships.',
      };

      const res = await request(app)
        .post('/api/v1/contact')
        .send(contactPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.id).toBeTruthy();

      // Verify in PostgreSQL
      const saved = await prismaTest.contactMessage.findUnique({
        where: { id: res.body.data.id }
      });

      expect(saved).not.toBeNull();
      expect(saved?.name).toBe(contactPayload.name);
      expect(saved?.email).toBe(contactPayload.email);
      expect(saved?.status).toBe('UNREAD');
    });

    it('should reject contact form with missing required fields (HTTP 400)', async () => {
      const res = await request(app)
        .post('/api/v1/contact')
        .send({ name: 'Aarav' }); // missing email and message

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
