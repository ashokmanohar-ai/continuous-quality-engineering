import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';

describe('Fastify application boundary', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp();
  });
  afterEach(async () => app.close());

  it('returns service health', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', service: 'acme-order-service' });
  });

  it('returns semantic HTML', async () => {
    const response = await app.inject({ method: 'GET', url: '/' });
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.body).toContain('Sign in to create an order');
  });

  it('returns a controlled 404 payload', async () => {
    const response = await app.inject({ method: 'GET', url: '/not-real' });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: 'NOT_FOUND' });
  });

  it('validates login request shape', async () => {
    const response = await app.inject({ method: 'POST', url: '/api/login', payload: { email: 'invalid' } });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('protects the catalogue', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/products' });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ code: 'UNAUTHORIZED' });
  });
});
