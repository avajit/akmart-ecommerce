import { describe, it, expect } from 'vitest';

describe('Unit: Order Calculation & Business Logic', () => {
  const FREE_SHIPPING_THRESHOLD = 2500;
  const STANDARD_DELIVERY_FEE = 100;

  const calculateDeliveryFee = (subtotal: number): number => {
    return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_DELIVERY_FEE;
  };

  const calculateTotal = (subtotal: number, deliveryFee: number, discountAmount: number): number => {
    return Math.max(0, subtotal + deliveryFee - discountAmount);
  };

  it('TC-U19: should grant free shipping when subtotal is equal to threshold (2,500)', () => {
    expect(calculateDeliveryFee(2500)).toBe(0);
  });

  it('TC-U20: should grant free shipping when subtotal exceeds threshold', () => {
    expect(calculateDeliveryFee(2501)).toBe(0);
    expect(calculateDeliveryFee(10000)).toBe(0);
  });

  it('TC-U21: should charge standard delivery fee (100) when subtotal is below threshold', () => {
    expect(calculateDeliveryFee(2499)).toBe(100);
    expect(calculateDeliveryFee(500)).toBe(100);
    expect(calculateDeliveryFee(1)).toBe(100);
  });

  it('TC-U22: should calculate total correctly and never return a negative total', () => {
    // Normal order: 3000 subtotal, 0 delivery, 500 discount = 2500
    expect(calculateTotal(3000, 0, 500)).toBe(2500);

    // Order with fee: 1000 subtotal, 100 delivery, 200 discount = 900
    expect(calculateTotal(1000, 100, 200)).toBe(900);

    // Giant discount exceeding total: should floor at 0, never negative
    expect(calculateTotal(100, 0, 500)).toBe(0);
    expect(calculateTotal(0, 0, 50)).toBe(0);
  });

  it('TC-U23: should filter only selectedItemIds when selective checkout is provided', () => {
    const cartItems = [
      { id: 'item-1', name: 'Product A', price: 1000, quantity: 2 },
      { id: 'item-2', name: 'Product B', price: 500, quantity: 1 },
      { id: 'item-3', name: 'Product C', price: 1500, quantity: 1 },
    ];

    const selectedItemIds = ['item-1', 'item-3'];

    const itemsToCheckout = selectedItemIds && selectedItemIds.length > 0
      ? cartItems.filter((i) => selectedItemIds.includes(i.id))
      : cartItems;

    expect(itemsToCheckout.length).toBe(2);
    expect(itemsToCheckout.map((i) => i.id)).toEqual(['item-1', 'item-3']);

    const subtotal = itemsToCheckout.reduce((acc, i) => acc + i.price * i.quantity, 0);
    // (1000 * 2) + (1500 * 1) = 3500
    expect(subtotal).toBe(3500);
  });
});
