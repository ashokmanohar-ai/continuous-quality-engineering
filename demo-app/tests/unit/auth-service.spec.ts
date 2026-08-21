import { describe, expect, it } from 'vitest';
import { AuthService } from '../../src/services/auth-service.js';

describe('AuthService', () => {
  it('authenticates the documented demo user', () => {
    const result = new AuthService().login('customer@acme.test', 'Order123!');
    expect(result.user).toMatchObject({ id: 'user-1001', email: 'customer@acme.test' });
    expect(result.token.length).toBeGreaterThan(30);
    expect(result.expiresIn).toBe(3600);
  });

  it('normalizes email case and whitespace', () => {
    expect(new AuthService().login(' Customer@Acme.Test ', 'Order123!').user.id).toBe('user-1001');
  });

  it('rejects an unknown email', () => {
    expect(() => new AuthService().login('attacker@acme.test', 'Order123!')).toThrow('incorrect');
  });

  it('rejects an invalid password', () => {
    expect(() => new AuthService().login('customer@acme.test', 'wrong')).toThrow('incorrect');
  });

  it('accepts a valid Bearer session', () => {
    const service = new AuthService();
    const session = service.login('customer@acme.test', 'Order123!');
    expect(service.authenticate(`Bearer ${session.token}`).email).toBe('customer@acme.test');
  });

  it.each([undefined, '', 'Basic abc', 'Bearer'])('rejects malformed authorization %s', (header) => {
    expect(() => new AuthService().authenticate(header)).toThrow('Bearer token');
  });

  it('rejects an unknown token', () => {
    expect(() => new AuthService().authenticate('Bearer not-a-session')).toThrow('invalid or expired');
  });

  it('expires a session deterministically', () => {
    let now = 1_000;
    const service = new AuthService(1, () => now);
    const { token } = service.login('customer@acme.test', 'Order123!');
    now += 60_001;
    expect(() => service.authenticate(`Bearer ${token}`)).toThrow('expired');
    expect(service.activeSessionCount()).toBe(0);
  });

  it('creates independent random sessions', () => {
    const service = new AuthService();
    const first = service.login('customer@acme.test', 'Order123!');
    const second = service.login('customer@acme.test', 'Order123!');
    expect(first.token).not.toBe(second.token);
    expect(service.activeSessionCount()).toBe(2);
  });
});
