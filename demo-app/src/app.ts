import Fastify, { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError } from './errors.js';
import { OrderRepository } from './repositories/order-repository.js';
import { AuthService } from './services/auth-service.js';
import { OrderService } from './services/order-service.js';
import { ProductService } from './services/product-service.js';
import { uiHtml } from './ui.js';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });
const orderSchema = z.object({
  items: z.array(z.object({ productId: z.string().min(1).max(100), quantity: z.number().int() })).max(20),
});

export type BuildAppOptions = { databasePath?: string; sessionTtlMinutes?: number; logger?: boolean };

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: options.logger ?? false });
  const repository = new OrderRepository(options.databasePath ?? ':memory:');
  const auth = new AuthService(options.sessionTtlMinutes ?? 60);
  const products = new ProductService(repository);
  const orders = new OrderService(repository);

  app.get('/', async (_request, reply) => reply.type('text/html; charset=utf-8').send(uiHtml));
  app.get('/health', async () => ({ status: 'ok', service: 'acme-order-service' }));

  app.post('/api/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success)
      throw new AppError(400, 'VALIDATION_ERROR', 'A valid email and password are required.');
    return reply.send(auth.login(parsed.data.email, parsed.data.password));
  });

  app.get('/api/products', async (request) => {
    auth.authenticate(request.headers.authorization);
    return products.list();
  });

  app.post('/api/orders', async (request, reply) => {
    const user = auth.authenticate(request.headers.authorization);
    const parsed = orderSchema.safeParse(request.body);
    if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Order items are invalid.');
    return reply.code(201).send(orders.create(user.id, parsed.data.items));
  });

  app.get<{ Params: { id: string } }>('/api/orders/:id', async (request) => {
    const user = auth.authenticate(request.headers.authorization);
    return orders.get(user.id, request.params.id);
  });

  app.setNotFoundHandler(async (_request, reply) =>
    reply.code(404).send({ code: 'NOT_FOUND', message: 'The requested resource was not found.' }),
  );

  app.setErrorHandler(async (error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({ code: error.code, message: error.message });
    }
    app.log.error(error);
    return reply.code(500).send({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
  });

  app.addHook('onClose', async () => repository.close());
  return app;
}
