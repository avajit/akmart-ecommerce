import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { Readable } from 'stream';
import { app, prisma } from '../../app';
import { s3Client } from '../../lib/storage';
import {
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

describe('Storage Integration Flow: presign -> upload -> save key -> read URL -> delete', () => {
  let authToken: string;
  let testUserId: string;

  beforeEach(async () => {
    // Clear test tables
    await prisma.reviewImage.deleteMany();
    await prisma.review.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    // Ensure role exists
    const consumerRole = await prisma.role.upsert({
      where: { name: 'CONSUMER' },
      update: {},
      create: { name: 'CONSUMER', description: 'Consumer user' },
    });

    // Create a verified test consumer
    const user = await prisma.user.create({
      data: {
        email: `storage-test-${Date.now()}@example.com`,
        fullName: 'Storage QA User',
        isEmailVerified: true,
        isActive: true,
        roleId: consumerRole.id,
      },
    });
    testUserId = user.id;

    // Generate JWT access token for authentication
    const { generateTokens } = await import('../../utils/jwt');
    const tokens = generateTokens(user.id, consumerRole.id, 'CONSUMER');
    authToken = tokens.accessToken;
  });

  it('Step 1: POST /api/v1/uploads/presign validates parameters and generates unguessable UUID key', async () => {
    // Attempt with invalid MIME
    const badMimeRes = await request(app)
      .post('/api/v1/uploads/presign')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        filename: 'malicious.exe',
        contentType: 'application/x-msdownload',
        size: 1024,
        purpose: 'avatar',
      });
    expect(badMimeRes.status).toBe(400);

    // Attempt with excessive size (>5MB)
    const badSizeRes = await request(app)
      .post('/api/v1/uploads/presign')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        filename: 'huge.png',
        contentType: 'image/png',
        size: 10 * 1024 * 1024, // 10MB
        purpose: 'avatar',
      });
    expect(badSizeRes.status).toBe(400);

    // Valid presign request
    const res = await request(app)
      .post('/api/v1/uploads/presign')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        filename: 'my_avatar.png',
        contentType: 'image/png',
        size: 1024 * 50,
        purpose: 'avatar',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('uploadUrl');
    expect(res.body.data).toHaveProperty('key');
    expect(res.body.data.key.startsWith(`users/${testUserId}/avatar/`)).toBe(true);
    expect(res.body.data.key.endsWith('.png')).toBe(true);
  });

  it('Step 2 & 3: Save avatar key in DB, verify only key is stored, and resolve URL dynamically at read time', async () => {
    // Mock S3 client commands so the integration test runs reliably without external network dependencies
    const deletedKeys: string[] = [];

    vi.spyOn(s3Client, 'send').mockImplementation(async (command: any) => {
      if (command instanceof HeadObjectCommand) {
        // Mock object exists in storage
        return {
          $metadata: { httpStatusCode: 200 },
          ContentLength: 1024,
          ContentType: 'image/png',
          ETag: '"mock-etag-123"',
        } as any;
      }
      if (command instanceof GetObjectCommand) {
        const stream = new Readable();
        stream.push(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
        stream.push(null);
        return {
          Body: stream,
          ContentType: 'image/png',
          ContentLength: 8,
          ETag: '"mock-etag-123"',
          LastModified: new Date(),
        } as any;
      }
      if (command instanceof DeleteObjectCommand) {
        deletedKeys.push(command.input.Key as string);
        return { $metadata: { httpStatusCode: 204 } } as any;
      }
      return {} as any;
    });

    // 1. Presign an avatar key
    const presignRes = await request(app)
      .post('/api/v1/uploads/presign')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        filename: 'avatar1.png',
        contentType: 'image/png',
        size: 2048,
        purpose: 'avatar',
      });

    const key1 = presignRes.body.data.key;
    expect(key1).toBeTruthy();

    // 2. Attach key1 to user profile via PUT /api/v1/auth/me
    const updateRes = await request(app)
      .put('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ avatarKey: key1 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.avatarKey).toBe(key1);
    expect(updateRes.body.data.avatarUrl).toContain(key1);

    // 3. CRITICAL CORE REQUIREMENT: Check DB directly — only the key is stored, NEVER a full URL!
    const dbUser = await prisma.user.findUnique({ where: { id: testUserId } });
    expect(dbUser?.avatarKey).toBe(key1);
    expect(dbUser?.avatarKey?.startsWith('http')).toBe(false);

    // 4. Read profile via GET /api/v1/auth/me — URL is generated dynamically at read time
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.avatarKey).toBe(key1);
    expect(meRes.body.data.avatarUrl).toContain(key1);

    // 5. Test Streaming Endpoint GET /api/v1/files/:key
    const fileRes = await request(app).get(`/api/v1/files/${key1}`);
    expect(fileRes.status).toBe(200);
    expect(fileRes.headers['content-type']).toBe('image/png');
    expect(fileRes.headers['cache-control']).toContain('immutable');
    expect(fileRes.headers['etag']).toBe('"mock-etag-123"');

    // 6. Replace avatar with a new key and confirm lifecycle: old object is deleted from storage
    const presignRes2 = await request(app)
      .post('/api/v1/uploads/presign')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        filename: 'avatar2.webp',
        contentType: 'image/webp',
        size: 3000,
        purpose: 'avatar',
      });
    const key2 = presignRes2.body.data.key;

    const updateRes2 = await request(app)
      .put('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ avatarKey: key2 });

    expect(updateRes2.status).toBe(200);
    expect(updateRes2.body.data.avatarKey).toBe(key2);
    // Confirm old key1 was passed to deleteObject
    expect(deletedKeys).toContain(key1);
  });

  it('Step 4: Customer Review Photo Attachment integration test', async () => {
    // 1. Presign review photo
    const presignRes = await request(app)
      .post('/api/v1/uploads/presign')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        filename: 'product_photo.jpg',
        contentType: 'image/jpeg',
        size: 4096,
        purpose: 'review-photo',
      });

    expect(presignRes.status).toBe(200);
    const reviewKey = presignRes.body.data.key;
    expect(reviewKey.startsWith(`reviews/${testUserId}/`)).toBe(true);
    expect(reviewKey.endsWith('.jpeg')).toBe(true);

    // Mock S3 headObject to confirm key exists
    vi.spyOn(s3Client, 'send').mockResolvedValue({
      $metadata: { httpStatusCode: 200 },
    } as any);

    // Create a product to review
    const category = await prisma.category.create({
      data: { name: 'Electronics', slug: `elec-${Date.now()}` },
    });
    const product = await prisma.product.create({
      data: {
        name: 'Smart Test Device',
        slug: `smart-device-${Date.now()}`,
        description: 'Test product for reviews',
        categoryId: category.id,
        createdById: testUserId,
        status: 'APPROVED',
      },
    });

    // 2. Submit customer review with attached imageKeys
    const reviewRes = await request(app)
      .post(`/api/v1/products/${product.id}/reviews`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        rating: 5,
        title: 'Outstanding Quality!',
        body: 'Here is a photo of the item I received.',
        imageKeys: [reviewKey],
      });

    expect(reviewRes.status).toBe(201);
    expect(reviewRes.body.data.images).toHaveLength(1);
    expect(reviewRes.body.data.images[0].key).toBe(reviewKey);
    expect(reviewRes.body.data.images[0].url).toContain(reviewKey);

    // 3. Verify in database directly
    const dbReviewImage = await prisma.reviewImage.findFirst({
      where: { key: reviewKey },
    });
    expect(dbReviewImage).toBeTruthy();
    expect(dbReviewImage?.key).toBe(reviewKey);

    // 4. Fetch reviews via public GET /api/v1/products/:id/reviews
    const getReviewsRes = await request(app).get(`/api/v1/products/${product.id}/reviews`);
    expect(getReviewsRes.status).toBe(200);
    expect(getReviewsRes.body.data.reviews).toHaveLength(1);
    expect(getReviewsRes.body.data.reviews[0].images).toHaveLength(1);
    expect(getReviewsRes.body.data.reviews[0].images[0].url).toContain(reviewKey);
  });

  it('Step 5: Customer Multiple Review Photo Attachments (up to 3 images) integration test', async () => {
    const reviewKey1 = `reviews/${testUserId}/photo-1.jpeg`;
    const reviewKey2 = `reviews/${testUserId}/photo-2.jpeg`;
    const reviewKey3 = `reviews/${testUserId}/photo-3.jpeg`;

    vi.spyOn(s3Client, 'send').mockResolvedValue({
      $metadata: { httpStatusCode: 200 },
    } as any);

    const category = await prisma.category.create({
      data: { name: 'MultiPhoto Electronics', slug: `multi-elec-${Date.now()}` },
    });
    const product = await prisma.product.create({
      data: {
        name: 'Multi Photo Test Device',
        slug: `multi-device-${Date.now()}`,
        description: 'Test product for multiple review photos',
        categoryId: category.id,
        createdById: testUserId,
        status: 'APPROVED',
      },
    });

    const reviewRes = await request(app)
      .post(`/api/v1/products/${product.id}/reviews`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        rating: 4,
        title: 'Great item with multiple pictures!',
        body: 'Here are three different angles of the product.',
        imageKeys: [reviewKey1, reviewKey2, reviewKey3],
      });

    expect(reviewRes.status).toBe(201);
    expect(reviewRes.body.data.images).toHaveLength(3);
    expect(reviewRes.body.data.images.map((img: any) => img.key)).toEqual([
      reviewKey1,
      reviewKey2,
      reviewKey3,
    ]);

    const dbImages = await prisma.reviewImage.findMany({
      where: { reviewId: reviewRes.body.data.id },
    });
    expect(dbImages).toHaveLength(3);
  });
});
