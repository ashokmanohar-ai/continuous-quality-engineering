import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Order } from '../../src/domain.js';
import { OrderRepository } from '../../src/repositories/order-repository.js';

describe('OrderRepository', () => {
  let repository: OrderRepository;

  beforeEach(() => {
    repository = new OrderRepository(':memory:');
  });
  afterEach(() => repository.close());

  it('seeds three deterministic products', () => {
    expect(repository.listProducts()).toHaveLength(3);
  });

  it('sorts products by name', () => {
    expect(repository.listProducts().map((product) => product.name)).toEqual([
      'Acme Ergo Mouse',
      'Acme Pro Keyboard',
      'Acme USB-C Dock',
    ]);
  });

  it('finds a product by id', () => {
    expect(repository.findProduct('keyboard-pro')).toEqual({
      id: 'keyboard-pro',
      name: 'Acme Pro Keyboard',
      priceCents: 8999,
    });
  });

  it('returns undefined for an unknown product', () => {
    expect(repository.findProduct('missing')).toBeUndefined();
  });

  it('persists and retrieves an order', () => {
    const order: Order = {
      id: 'order-1',
      userId: 'user-1',
      items: [
        {
          productId: 'mouse-ergo',
          name: 'Acme Ergo Mouse',
          quantity: 2,
          unitPriceCents: 4999,
          lineTotalCents: 9998,
        },
      ],
      totalCents: 9998,
      status: 'CREATED',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    expect(repository.save(order)).toEqual(order);
    expect(repository.findById(order.id)).toEqual(order);
  });

  it('returns undefined for an unknown order', () => {
    expect(repository.findById('missing')).toBeUndefined();
  });

  it('tracks persisted order count', () => {
    expect(repository.countOrders()).toBe(0);
    repository.save({
      id: 'order-2',
      userId: 'user-1',
      items: [],
      totalCents: 0,
      status: 'CREATED',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(repository.countOrders()).toBe(1);
  });

  it('enforces unique order ids at the database boundary', () => {
    const order: Order = {
      id: 'duplicate',
      userId: 'user-1',
      items: [],
      totalCents: 0,
      status: 'CREATED',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    repository.save(order);
    expect(() => repository.save(order)).toThrow();
  });
});
