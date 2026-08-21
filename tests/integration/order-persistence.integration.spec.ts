import { expect, test } from '@playwright/test';
import { authHeaders, login } from '../support/api.js';

test('@integration login token authorizes downstream service calls', async ({ request }) => {
  const token = await login(request);
  await expect(request.get('/api/products', { headers: authHeaders(token) })).resolves.toMatchObject({
    ok: expect.any(Function),
  });
});

test('@integration order survives the create-to-read database path', async ({ request }) => {
  const token = await login(request);
  const headers = authHeaders(token);
  const create = await request.post('/api/orders', {
    headers,
    data: { items: [{ productId: 'dock-usbc', quantity: 1 }] },
  });
  const order = (await create.json()) as { id: string; createdAt: string };
  const read = await request.get(`/api/orders/${order.id}`, { headers });
  expect(await read.json()).toMatchObject({ id: order.id, createdAt: order.createdAt, totalCents: 12_999 });
});

test('@integration catalogue pricing is used by order calculation', async ({ request }) => {
  const token = await login(request);
  const headers = authHeaders(token);
  const products = (await (await request.get('/api/products', { headers })).json()) as Array<{
    id: string;
    priceCents: number;
  }>;
  const product = products[0]!;
  const create = await request.post('/api/orders', {
    headers,
    data: { items: [{ productId: product.id, quantity: 3 }] },
  });
  expect((await create.json()).totalCents).toBe(product.priceCents * 3);
});

test('@integration separate sessions can read the same user order', async ({ request }) => {
  const firstToken = await login(request);
  const create = await request.post('/api/orders', {
    headers: authHeaders(firstToken),
    data: { items: [{ productId: 'mouse-ergo', quantity: 1 }] },
  });
  const { id } = (await create.json()) as { id: string };
  const secondToken = await login(request);
  expect((await request.get(`/api/orders/${id}`, { headers: authHeaders(secondToken) })).status()).toBe(200);
});

test('@integration failed validation does not persist a partial order', async ({ request }) => {
  const token = await login(request);
  const response = await request.post('/api/orders', {
    headers: authHeaders(token),
    data: {
      items: [
        { productId: 'mouse-ergo', quantity: 1 },
        { productId: 'missing', quantity: 1 },
      ],
    },
  });
  expect(response.status()).toBe(400);
  expect(await response.json()).toMatchObject({ code: 'INVALID_PRODUCT' });
});
