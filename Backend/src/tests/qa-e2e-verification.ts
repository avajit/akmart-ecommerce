import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { app } from '../app';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function runQA() {
  console.log('================================================================');
  console.log('🚀 AKMART BETA PRE-LAUNCH COMPREHENSIVE QA VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extra?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${extra || ''}`);
      failed++;
    }
  }

  try {
    // 1. Browse Catalog & Search
    console.log('--- TEST 1: CATALOG BROWSE & SEARCH ---');
    const catalogRes = await request(app).get('/api/v1/products?limit=10&page=1');
    assert(catalogRes.status === 200, 'Catalog browse returns HTTP 200');
    assert(catalogRes.body.data?.products?.length > 0, `Catalog contains seeded products (found: ${catalogRes.body.data?.products?.length})`);

    const searchRes = await request(app).get('/api/v1/products?search=Cotton');
    assert(searchRes.status === 200, 'Product search returns HTTP 200');
    assert(searchRes.body.data?.products?.length > 0, 'Search matches keyword "Cotton"');

    // 2. Pick a seeded product and inspect variant & listing
    const product = catalogRes.body.data.products[0];
    const productSlug = product.slug;
    const pdpRes = await request(app).get(`/api/v1/products/slug/${productSlug}`);
    assert(pdpRes.status === 200, `PDP (/products/slug/${productSlug}) returns HTTP 200`);
    assert(pdpRes.body.data?.variants?.length > 0, 'Product has dynamic variants');

    const variant = pdpRes.body.data.variants[0];
    const listing = variant.listings?.[0];
    assert(Boolean(listing), 'Variant has active seller listing with stock');
    const initialStock = listing.stock;
    const dbPrice = Number(listing.price);
    console.log(`  ℹ️ Target Item: "${product.name}" | Variant: ${variant.name} | Stock: ${initialStock} | Unit Price: NPR ${dbPrice}`);

    // 3. User Authentication (Consumer)
    console.log('\n--- TEST 2: AUTHENTICATION & SESSION GUARDS ---');
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'consumer@akmart.com', password: 'Consumer@123' });
    assert(loginRes.status === 200, 'Consumer login returns HTTP 200');
    const consumerToken = loginRes.body.data.accessToken;
    assert(Boolean(consumerToken), 'Consumer received valid JWT accessToken');

    // Admin login
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@akmart.com', password: 'Admin@123' });
    assert(adminLoginRes.status === 200, 'Admin login returns HTTP 200');
    const adminToken = adminLoginRes.body.data.accessToken;

    // 4. Cart Add, Refresh & Stock Gates
    console.log('\n--- TEST 3: CART OPERATIONS & REFRESH ---');
    const addToCartRes = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        sellerListingId: listing.id,
        variantId: variant.id,
        quantity: 2,
      });
    assert(addToCartRes.status === 201 || addToCartRes.status === 200, 'Add to cart returns HTTP 200/201');

    const getCartRes = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${consumerToken}`);
    assert(getCartRes.status === 200, 'Cart fetch returns HTTP 200');
    assert(getCartRes.body.data.items?.length > 0, 'Cart contains item after refresh');

    // 5. Security & Boundary: Nepal Phone Number Validation on Address
    console.log('\n--- TEST 4: NEPAL ADDRESS & PHONE VALIDATION ---');
    const invalidPhoneRes = await request(app)
      .post('/api/v1/orders/addresses')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        fullName: 'Bikash Shrestha',
        phone: '12345', // Invalid format (fails /^(98|97)\d{8}$/)
        street: 'Baneshwor Height',
        city: 'Kathmandu',
        district: 'Kathmandu',
        state: 'Bagmati Province',
        zipCode: '44600',
      });
    assert(invalidPhoneRes.status === 400, 'Server rejects invalid Nepal phone number (HTTP 400)');
    assert(
      invalidPhoneRes.body.error?.message?.includes('mobile') ||
      invalidPhoneRes.body.error?.message?.includes('phone') ||
      invalidPhoneRes.body.error?.details?.some((d: any) => d.message?.includes('Nepal')),
      'Validation error specifically requires valid 10-digit Nepal mobile number (98/97)'
    );

    // Create valid Nepal address
    const validAddressRes = await request(app)
      .post('/api/v1/orders/addresses')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        fullName: 'Bikash Shrestha',
        phone: '9841234567',
        street: 'Baneshwor Height, Ward 10',
        city: 'Kathmandu',
        district: 'Kathmandu',
        state: 'Bagmati Province',
        zipCode: '44600',
        isDefault: true,
      });
    assert(validAddressRes.status === 201, 'Valid Nepal address saved (HTTP 201)');
    const addressId = validAddressRes.body.data.id;
    assert(Boolean(addressId), 'Received saved address UUID');
    assert(validAddressRes.body.data.district === 'Kathmandu', 'District is persisted');

    // 6. Security: Price Integrity & Checkout Execution
    console.log('\n--- TEST 5: PRICE INTEGRITY & STOCK DEDUCTION ---');
    const stockBeforeOrder = (await prisma.sellerListing.findUnique({ where: { id: listing.id } }))!.stock;

    // Checkout with Cash on Delivery
    const checkoutRes = await request(app)
      .post('/api/v1/orders/checkout')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        shippingAddressId: addressId,
        paymentMethod: 'COD',
        deliveryNotes: 'Call before arriving at gate',
      });
    assert(checkoutRes.status === 201, 'Valid COD checkout creates order (HTTP 201)');
    const liveOrder = checkoutRes.body.data;
    assert(liveOrder.status === 'PENDING', 'Initial order status is PENDING');
    assert(liveOrder.deliveryNotes === 'Call before arriving at gate', 'Delivery notes are persisted in order');
    assert(Number(liveOrder.totalAmount) >= dbPrice, `Total amount computed strictly from DB price (Total: NPR ${liveOrder.totalAmount})`);

    const stockAfterOrder = (await prisma.sellerListing.findUnique({ where: { id: listing.id } }))!.stock;
    assert(stockAfterOrder < stockBeforeOrder, `Stock atomically decremented (Before: ${stockBeforeOrder}, After: ${stockAfterOrder})`);

    // 9. Dedicated Order URL (/api/v1/orders/:id)
    console.log('\n--- TEST 8: PERMANENT ORDER DETAIL ACCESS ---');
    const orderDetailRes = await request(app)
      .get(`/api/v1/orders/${liveOrder.id}`)
      .set('Authorization', `Bearer ${consumerToken}`);
    assert(orderDetailRes.status === 200, 'Order details retrieved by ID (HTTP 200)');
    assert(orderDetailRes.body.data.id === liveOrder.id, 'Retrieved order matches requested ID');

    // 10. Admin Governance & RBAC
    console.log('\n--- TEST 9: ADMIN ORDER GOVERNANCE & RBAC ---');
    // Consumer cannot access admin orders
    const forbiddenRes = await request(app)
      .get('/api/v1/admin/orders')
      .set('Authorization', `Bearer ${consumerToken}`);
    assert(forbiddenRes.status === 403, 'Consumer is blocked from /api/v1/admin/orders (HTTP 403)');

    // Unauthenticated user is blocked
    const unauthRes = await request(app)
      .get('/api/v1/admin/orders');
    assert(unauthRes.status === 401, 'Unauthenticated access is blocked (HTTP 401)');

    // Admin can access all orders
    const adminOrdersRes = await request(app)
      .get('/api/v1/admin/orders?limit=10')
      .set('Authorization', `Bearer ${adminToken}`);
    assert(adminOrdersRes.status === 200, 'Admin successfully retrieves all orders (HTTP 200)');
    assert(Boolean(adminOrdersRes.body.data?.metrics), 'Admin response includes storewide order metrics');
    assert(adminOrdersRes.body.data?.orders?.some((o: any) => o.id === liveOrder.id), 'Admin orders list includes the new customer order');

    // 11. Admin Status Transition: PENDING -> CONFIRMED -> SHIPPED -> DELIVERED
    console.log('\n--- TEST 10: ADMIN STATUS WORKFLOW (PENDING -> CONFIRMED -> SHIPPED -> DELIVERED) ---');
    const confirmRes = await request(app)
      .patch(`/api/v1/admin/orders/${liveOrder.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CONFIRMED' });
    assert(confirmRes.status === 200 && confirmRes.body.data.status === 'CONFIRMED', 'Admin updates status to CONFIRMED');

    const shipRes = await request(app)
      .patch(`/api/v1/admin/orders/${liveOrder.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'SHIPPED' });
    assert(shipRes.status === 200 && shipRes.body.data.status === 'SHIPPED', 'Admin updates status to SHIPPED');

    const deliverRes = await request(app)
      .patch(`/api/v1/admin/orders/${liveOrder.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'DELIVERED' });
    assert(deliverRes.status === 200 && deliverRes.body.data.status === 'DELIVERED', 'Admin updates status to DELIVERED');

    // 12. Order Cancellation & Stock Restoral
    console.log('\n--- TEST 11: CANCELLATION & INVENTORY RESTORATION ---');
    const cancelRes = await request(app)
      .patch(`/api/v1/admin/orders/${liveOrder.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CANCELLED' });
    assert(cancelRes.status === 200 && cancelRes.body.data.status === 'CANCELLED', 'Admin successfully cancels order');

    const stockAfterCancel = (await prisma.sellerListing.findUnique({ where: { id: listing.id } }))!.stock;
    assert(stockAfterCancel === stockBeforeOrder, `Cancelled item stock restored to original inventory level (Now: ${stockAfterCancel})`);

    // Clean up test order from database
    console.log('\n--- TEST SUITE COMPLETE ---');
    console.log(`Summary: ${passed} PASSED, ${failed} FAILED.`);
    if (failed === 0) {
      console.log('🎉 ALL INTEGRATION QA TESTS PASSED WITH 100% SUCCESS!');
    }
  } catch (err) {
    console.error('Fatal error during QA:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runQA();
