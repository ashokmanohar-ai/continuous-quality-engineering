import { Matchers, PactV4 } from '@pact-foundation/pact';
import { describe, expect, it } from 'vitest';

const provider = new PactV4({
  consumer: 'Acme Web Client',
  provider: 'Acme Order API',
  port: 0,
  dir: 'contracts/pacts',
  logLevel: 'error',
});

describe('Acme Web Client contract', () => {
  it('defines the health contract', async () => {
    await provider
      .addInteraction()
      .given('the service is healthy')
      .uponReceiving('a health request')
      .withRequest('GET', '/health')
      .willRespondWith(200, (response) =>
        response
          .headers({ 'Content-Type': 'application/json; charset=utf-8' })
          .jsonBody({ status: 'ok', service: 'acme-order-service' }),
      )
      .executeTest(async (mockServer) => {
        const response = await fetch(`${mockServer.url}/health`);
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ status: 'ok' });
      });
  });

  it('defines the product-list contract', async () => {
    await provider
      .addInteraction()
      .given('products exist and a valid session is supplied')
      .uponReceiving('an authenticated product-list request')
      .withRequest('GET', '/api/products', (request) =>
        request.headers({ Authorization: Matchers.regex('^Bearer .+', 'Bearer contract-token') }),
      )
      .willRespondWith(200, (response) =>
        response.headers({ 'Content-Type': 'application/json; charset=utf-8' }).jsonBody(
          Matchers.eachLike({
            id: Matchers.string('keyboard-pro'),
            name: Matchers.string('Acme Pro Keyboard'),
            priceCents: Matchers.integer(8999),
          }),
        ),
      )
      .executeTest(async (mockServer) => {
        const response = await fetch(`${mockServer.url}/api/products`, {
          headers: { Authorization: 'Bearer contract-token' },
        });
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(
          expect.arrayContaining([expect.objectContaining({ id: expect.any(String) })]),
        );
      });
  });

  it('defines the unauthorized contract', async () => {
    await provider
      .addInteraction()
      .given('no session is supplied')
      .uponReceiving('an unauthenticated product-list request')
      .withRequest('GET', '/api/products')
      .willRespondWith(401, (response) =>
        response.headers({ 'Content-Type': 'application/json; charset=utf-8' }).jsonBody({
          code: 'UNAUTHORIZED',
          message: Matchers.string('A Bearer token is required.'),
        }),
      )
      .executeTest(async (mockServer) => {
        const response = await fetch(`${mockServer.url}/api/products`);
        expect(response.status).toBe(401);
      });
  });
});
