import type { APIRequestContext } from '@playwright/test';

export async function login(request: APIRequestContext): Promise<string> {
  const response = await request.post('/api/login', {
    data: { email: 'customer@acme.test', password: 'Order123!' },
  });
  if (!response.ok()) throw new Error(`Login failed with HTTP ${response.status()}`);
  const body = (await response.json()) as { token: string };
  return body.token;
}

export function authHeaders(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}` };
}
