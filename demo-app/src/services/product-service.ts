import type { Product } from '../domain.js';
import type { OrderRepository } from '../repositories/order-repository.js';
import { AppError } from '../errors.js';

export class ProductService {
  constructor(private readonly repository: OrderRepository) {}

  list(): Product[] {
    return this.repository.listProducts();
  }

  get(id: string): Product {
    const product = this.repository.findProduct(id);
    if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', `Product '${id}' was not found.`);
    return product;
  }
}
