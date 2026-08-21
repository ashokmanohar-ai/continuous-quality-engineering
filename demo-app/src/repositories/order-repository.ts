import { DatabaseSync } from 'node:sqlite';
import type { Order, OrderItem, OrderStatus, Product } from '../domain.js';

type OrderRow = {
  id: string;
  user_id: string;
  items_json: string;
  total_cents: number;
  status: OrderStatus;
  created_at: string;
};

export class OrderRepository {
  private readonly database: DatabaseSync;

  constructor(filename = ':memory:') {
    this.database = new DatabaseSync(filename);
    this.database.exec('PRAGMA journal_mode = WAL');
    this.migrate();
    this.seedProducts();
  }

  private migrate(): void {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price_cents INTEGER NOT NULL CHECK(price_cents >= 0)
      );
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        items_json TEXT NOT NULL,
        total_cents INTEGER NOT NULL CHECK(total_cents >= 0),
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  private seedProducts(): void {
    const insert = this.database.prepare(
      'INSERT OR IGNORE INTO products (id, name, price_cents) VALUES (?, ?, ?)',
    );
    const products: Product[] = [
      { id: 'keyboard-pro', name: 'Acme Pro Keyboard', priceCents: 8_999 },
      { id: 'mouse-ergo', name: 'Acme Ergo Mouse', priceCents: 4_999 },
      { id: 'dock-usbc', name: 'Acme USB-C Dock', priceCents: 12_999 },
    ];
    this.database.exec('BEGIN');
    try {
      for (const product of products) insert.run(product.id, product.name, product.priceCents);
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  listProducts(): Product[] {
    const rows = this.database
      .prepare('SELECT id, name, price_cents FROM products ORDER BY name')
      .all() as unknown as Array<{ id: string; name: string; price_cents: number }>;
    return rows.map((row) => ({ id: row.id, name: row.name, priceCents: row.price_cents }));
  }

  findProduct(id: string): Product | undefined {
    const row = this.database
      .prepare('SELECT id, name, price_cents FROM products WHERE id = ?')
      .get(id) as unknown as { id: string; name: string; price_cents: number } | undefined;
    return row ? { id: row.id, name: row.name, priceCents: row.price_cents } : undefined;
  }

  save(order: Order): Order {
    this.database
      .prepare(
        `INSERT INTO orders (id, user_id, items_json, total_cents, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        order.id,
        order.userId,
        JSON.stringify(order.items),
        order.totalCents,
        order.status,
        order.createdAt,
      );
    return order;
  }

  findById(id: string): Order | undefined {
    const row = this.database.prepare('SELECT * FROM orders WHERE id = ?').get(id) as unknown as
      OrderRow | undefined;
    return row ? this.toOrder(row) : undefined;
  }

  countOrders(): number {
    const row = this.database.prepare('SELECT COUNT(*) AS count FROM orders').get() as unknown as {
      count: number;
    };
    return row.count;
  }

  close(): void {
    this.database.close();
  }

  private toOrder(row: OrderRow): Order {
    return {
      id: row.id,
      userId: row.user_id,
      items: JSON.parse(row.items_json) as OrderItem[],
      totalCents: row.total_cents,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}
