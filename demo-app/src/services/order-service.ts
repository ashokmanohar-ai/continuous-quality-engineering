import { randomUUID } from 'node:crypto';
import type { Order, OrderItemInput } from '../domain.js';
import { AppError } from '../errors.js';
import type { OrderRepository } from '../repositories/order-repository.js';

export class OrderService {
  constructor(
    private readonly repository: OrderRepository,
    private readonly idFactory: () => string = randomUUID,
    private readonly now: () => Date = () => new Date(),
  ) {}

  create(userId: string, items: OrderItemInput[]): Order {
    if (items.length === 0) throw new AppError(400, 'EMPTY_ORDER', 'At least one item is required.');
    if (items.length > 20) throw new AppError(400, 'TOO_MANY_ITEMS', 'An order supports at most 20 items.');

    const seen = new Set<string>();
    const detailedItems = items.map((item) => {
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
        throw new AppError(400, 'INVALID_QUANTITY', 'Quantity must be an integer between 1 and 10.');
      }
      if (seen.has(item.productId)) {
        throw new AppError(400, 'DUPLICATE_PRODUCT', 'Each product may appear only once per order.');
      }
      seen.add(item.productId);
      const product = this.repository.findProduct(item.productId);
      if (!product) {
        throw new AppError(400, 'INVALID_PRODUCT', `Product '${item.productId}' does not exist.`);
      }
      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPriceCents: product.priceCents,
        lineTotalCents: product.priceCents * item.quantity,
      };
    });

    const order: Order = {
      id: this.idFactory(),
      userId,
      items: detailedItems,
      totalCents: detailedItems.reduce((sum, item) => sum + item.lineTotalCents, 0),
      status: 'CREATED',
      createdAt: this.now().toISOString(),
    };
    return this.repository.save(order);
  }

  get(userId: string, orderId: string): Order {
    const order = this.repository.findById(orderId);
    if (!order) throw new AppError(404, 'ORDER_NOT_FOUND', `Order '${orderId}' was not found.`);
    if (order.userId !== userId) throw new AppError(403, 'FORBIDDEN', 'This order belongs to another user.');
    return order;
  }
}
