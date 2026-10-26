import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateCoupon } from '../../Backend/src/services/coupon.service';
import { prisma } from '../../Backend/src/app';

// Mock prisma for pure unit isolation
vi.mock('../../Backend/src/app', () => ({
  prisma: {
    coupon: {
      findUnique: vi.fn(),
    },
  },
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('Unit: Coupon Service (validateCoupon)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-U01: should throw error when coupon code is empty or whitespace', async () => {
    await expect(validateCoupon('', 1000)).rejects.toThrow('Coupon code is required');
    await expect(validateCoupon('   ', 1000)).rejects.toThrow('Coupon code is required');
  });

  it('TC-U02: should throw error when coupon does not exist or is inactive', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue(null);

    await expect(validateCoupon('NONEXISTENT', 1000)).rejects.toThrow(
      'Promo code "NONEXISTENT" is invalid or no longer active'
    );

    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      id: 'coupon-1',
      code: 'INACTIVE50',
      isActive: false,
    } as any);

    await expect(validateCoupon('INACTIVE50', 1000)).rejects.toThrow(
      'Promo code "INACTIVE50" is invalid or no longer active'
    );
  });

  it('TC-U03: should reject expired coupon', async () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      id: 'coupon-2',
      code: 'EXPIRED10',
      isActive: true,
      startDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
      endDate: pastDate,
      usageLimit: null,
      usedCount: 0,
    } as any);

    await expect(validateCoupon('EXPIRED10', 1000)).rejects.toThrow('This promo code has expired');
  });

  it('TC-U04: should reject coupon before its startDate', async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day in future
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      id: 'coupon-3',
      code: 'FUTURE10',
      isActive: true,
      startDate: futureDate,
      endDate: null,
      usageLimit: null,
      usedCount: 0,
    } as any);

    await expect(validateCoupon('FUTURE10', 1000)).rejects.toThrow('This promo code is not active yet');
  });

  it('TC-U05: should reject coupon that reached usage limit', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      id: 'coupon-4',
      code: 'MAXLIMIT',
      isActive: true,
      startDate: new Date(Date.now() - 1000),
      endDate: null,
      usageLimit: 100,
      usedCount: 100,
    } as any);

    await expect(validateCoupon('MAXLIMIT', 1000)).rejects.toThrow(
      'This promo code has reached its maximum redemption limit'
    );
  });

  it('TC-U06: should enforce minimum order amount', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      id: 'coupon-5',
      code: 'MIN1500',
      isActive: true,
      startDate: new Date(Date.now() - 1000),
      endDate: null,
      usageLimit: 10,
      usedCount: 0,
      minOrderAmount: 1500 as any,
    } as any);

    await expect(validateCoupon('MIN1500', 1000)).rejects.toThrow(
      'Minimum order of NPR 1,500 required for promo code "MIN1500"'
    );
  });

  it('TC-U07: should correctly calculate percentage discount with maxDiscount cap', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      id: 'coupon-6',
      code: 'MEGA20',
      description: '20% off up to NPR 500',
      isActive: true,
      startDate: new Date(Date.now() - 1000),
      endDate: null,
      usageLimit: null,
      usedCount: 0,
      discountType: 'PERCENTAGE',
      discountValue: 20 as any,
      maxDiscount: 500 as any,
      minOrderAmount: null,
    } as any);

    // Subtotal 4000: 20% of 4000 = 800, capped at 500
    const result = await validateCoupon('MEGA20', 4000);
    expect(result.valid).toBe(true);
    expect(result.coupon.discountAmount).toBe(500);

    // Subtotal 1000: 20% of 1000 = 200, below cap of 500
    const result2 = await validateCoupon('MEGA20', 1000);
    expect(result2.coupon.discountAmount).toBe(200);
  });

  it('TC-U08: should correctly calculate fixed discount not exceeding subtotal', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      id: 'coupon-7',
      code: 'FLAT300',
      description: 'Flat NPR 300 off',
      isActive: true,
      startDate: new Date(Date.now() - 1000),
      endDate: null,
      usageLimit: null,
      usedCount: 0,
      discountType: 'FIXED',
      discountValue: 300 as any,
      maxDiscount: null,
      minOrderAmount: null,
    } as any);

    const result = await validateCoupon('FLAT300', 1000);
    expect(result.valid).toBe(true);
    expect(result.coupon.discountAmount).toBe(300);

    // If subtotal is lower than fixed discount, discount equals subtotal
    const result2 = await validateCoupon('FLAT300', 250);
    expect(result2.coupon.discountAmount).toBe(250);
  });
});
