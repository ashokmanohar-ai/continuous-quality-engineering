import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { OrderRepository } from '../../src/repositories/order-repository.js';
import { OrderService } from '../../src/services/order-service.js';
import { ProductService } from '../../src/services/product-service.js';

describe('ProductService', () => {
  const repository = new OrderRepository(':memory:');
  const service = new ProductService(repository);

  it('lists the product catalogue', () => expect(service.list()).toHaveLength(3));
  it('gets an existing product', () => expect(service.get('mouse-ergo').priceCents).toBe(4999));
  it('rejects an unknown product', () => expect(() => service.get('not-real')).toThrow('not found'));
});

describe('OrderService', () => {
  let repository: OrderRepository;
  let service: OrderService;

  beforeEach(() => {
    repository = new OrderRepository(':memory:');
    service = new OrderService(
      repository,
      () => 'order-fixed',
      () => new Date('2026-08-21T10:00:00.000Z'),
    );
  });
  afterEach(() => repository.close());

  it('creates a priced order with deterministic metadata', () => {
    expect(service.create('user-1', [{ productId: 'keyboard-pro', quantity: 2 }])).toEqual({
      id: 'order-fixed',
      userId: 'user-1',
      items: [
        {
          productId: 'keyboard-pro',
          name: 'Acme Pro Keyboard',
          quantity: 2,
          unitPriceCents: 8999,
          lineTotalCents: 17998,
        },
      ],
      totalCents: 17998,
      status: 'CREATED',
      createdAt: '2026-08-21T10:00:00.000Z',
    });
  });

  it('calculates totals across different products', () => {
    const order = service.create('user-1', [
      { productId: 'keyboard-pro', quantity: 1 },
      { productId: 'mouse-ergo', quantity: 2 },
    ]);
    expect(order.totalCents).toBe(18_997);
  });

  it('retrieves a persisted order for its owner', () => {
    service.create('user-1', [{ productId: 'mouse-ergo', quantity: 1 }]);
    expect(service.get('user-1', 'order-fixed').status).toBe('CREATED');
  });

  it('blocks cross-user order access', () => {
    service.create('user-1', [{ productId: 'mouse-ergo', quantity: 1 }]);
    expect(() => service.get('user-2', 'order-fixed')).toThrow('another user');
  });

  it('rejects an unknown order', () => expect(() => service.get('user-1', 'missing')).toThrow('not found'));
  it('rejects an empty order', () => expect(() => service.create('user-1', [])).toThrow('At least one'));

  it.each([0, -1, 11, 1.5])('rejects quantity %s', (quantity) => {
    expect(() => service.create('user-1', [{ productId: 'mouse-ergo', quantity }])).toThrow('Quantity');
  });

  it('rejects an unknown product', () => {
    expect(() => service.create('user-1', [{ productId: 'missing', quantity: 1 }])).toThrow('does not exist');
  });

  it('rejects duplicate products', () => {
    expect(() =>
      service.create('user-1', [
        { productId: 'mouse-ergo', quantity: 1 },
        { productId: 'mouse-ergo', quantity: 2 },
      ]),
    ).toThrow('only once');
  });

  it('rejects more than twenty order lines', () => {
    expect(() =>
      service.create(
        'user-1',
        Array.from({ length: 21 }, (_, index) => ({ productId: `product-${index}`, quantity: 1 })),
      ),
    ).toThrow('at most 20');
  });
});
