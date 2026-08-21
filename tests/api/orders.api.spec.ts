import { expect, test } from '@playwright/test';
import { authHeaders, login } from '../support/api.js';

test('@api @smoke health endpoint is public', async ({ request }) => {
  const response = await request.get('/health');
  expect(response.status()).toBe(200);
  await expect(response).toBeOK();
  expect(await response.json()).toEqual({ status: 'ok', service: 'acme-order-service' });
});

test('@api @critical successful authentication returns a session', async ({ request }) => {
  const response = await request.post('/api/login', {
    data: { email: 'customer@acme.test', password: 'Order123!' },
  });
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({
    token: expect.any(String),
    expiresIn: 3600,
    user: { id: 'user-1001', email: 'customer@acme.test' },
  });
});

test('@api @regression invalid credentials are rejected', async ({ request }) => {
  const response = await request.post('/api/login', {
    data: { email: 'customer@acme.test', password: 'incorrect' },
  });
  expect(response.status()).toBe(401);
  expect(await response.json()).toMatchObject({ code: 'INVALID_CREDENTIALS' });
});

test('@api @regression malformed login is rejected', async ({ request }) => {
  const response = await request.post('/api/login', { data: { email: 'not-an-email' } });
  expect(response.status()).toBe(400);
  expect(await response.json()).toMatchObject({ code: 'VALIDATION_ERROR' });
});

test('@api @critical authenticated user can retrieve products', async ({ request }) => {
  const token = await login(request);
  const response = await request.get('/api/products', { headers: authHeaders(token) });
  expect(response.status()).toBe(200);
  const products = (await response.json()) as Array<Record<string, unknown>>;
  expect(products).toHaveLength(3);
  expect(products[0]).toEqual({
    id: expect.any(String),
    name: expect.any(String),
    priceCents: expect.any(Number),
  });
});

test('@api @regression catalogue requires authorization', async ({ request }) => {
  const response = await request.get('/api/products');
  expect(response.status()).toBe(401);
  expect(await response.json()).toMatchObject({ code: 'UNAUTHORIZED' });
});

test('@api @critical order can be created and retrieved', async ({ request }) => {
  const token = await login(request);
  const headers = authHeaders(token);
  const created = await request.post('/api/orders', {
    headers,
    data: { items: [{ productId: 'keyboard-pro', quantity: 2 }] },
  });
  expect(created.status()).toBe(201);
  const order = (await created.json()) as { id: string; totalCents: number };
  expect(order.totalCents).toBe(17_998);
  const retrieved = await request.get(`/api/orders/${order.id}`, { headers });
  expect(retrieved.status()).toBe(200);
  expect(await retrieved.json()).toMatchObject({ id: order.id, status: 'CREATED' });
});

test('@api @regression empty order is rejected', async ({ request }) => {
  const token = await login(request);
  const response = await request.post('/api/orders', { headers: authHeaders(token), data: { items: [] } });
  expect(response.status()).toBe(400);
  expect(await response.json()).toMatchObject({ code: 'EMPTY_ORDER' });
});

test('@api @regression invalid product is rejected', async ({ request }) => {
  const token = await login(request);
  const response = await request.post('/api/orders', {
    headers: authHeaders(token),
    data: { items: [{ productId: 'not-real', quantity: 1 }] },
  });
  expect(response.status()).toBe(400);
  expect(await response.json()).toMatchObject({ code: 'INVALID_PRODUCT' });
});

test('@api @regression invalid quantity is rejected', async ({ request }) => {
  const token = await login(request);
  const response = await request.post('/api/orders', {
    headers: authHeaders(token),
    data: { items: [{ productId: 'mouse-ergo', quantity: 11 }] },
  });
  expect(response.status()).toBe(400);
  expect(await response.json()).toMatchObject({ code: 'INVALID_QUANTITY' });
});

test('@api @regression duplicate product lines are rejected', async ({ request }) => {
  const token = await login(request);
  const response = await request.post('/api/orders', {
    headers: authHeaders(token),
    data: {
      items: [
        { productId: 'mouse-ergo', quantity: 1 },
        { productId: 'mouse-ergo', quantity: 2 },
      ],
    },
  });
  expect(response.status()).toBe(400);
  expect(await response.json()).toMatchObject({ code: 'DUPLICATE_PRODUCT' });
});

test('@api @regression unknown order returns 404', async ({ request }) => {
  const token = await login(request);
  const response = await request.get('/api/orders/not-real', { headers: authHeaders(token) });
  expect(response.status()).toBe(404);
  expect(await response.json()).toMatchObject({ code: 'ORDER_NOT_FOUND' });
});

test('@api @regression malformed Bearer token is rejected', async ({ request }) => {
  const response = await request.get('/api/products', { headers: { authorization: 'Bearer invalid' } });
  expect(response.status()).toBe(401);
});
