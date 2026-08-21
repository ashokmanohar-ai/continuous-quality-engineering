import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { AuthenticatedUser } from '../domain.js';
import { AppError } from '../errors.js';

type Session = { user: AuthenticatedUser; expiresAt: number };

const DEMO_USER = {
  id: 'user-1001',
  email: 'customer@acme.test',
  name: 'Acme Customer',
  password: 'Order123!',
};

export class AuthService {
  private readonly sessions = new Map<string, Session>();
  private readonly salt = 'acme-order-service-demo-user';
  private readonly passwordHash = scryptSync(DEMO_USER.password, this.salt, 64);

  constructor(
    private readonly ttlMinutes = 60,
    private readonly now: () => number = Date.now,
  ) {}

  login(email: string, password: string): { token: string; user: AuthenticatedUser; expiresIn: number } {
    const suppliedHash = scryptSync(password, this.salt, 64);
    const emailMatches = email.trim().toLowerCase() === DEMO_USER.email;
    const passwordMatches = timingSafeEqual(suppliedHash, this.passwordHash);
    if (!emailMatches || !passwordMatches) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    }

    const user = { id: DEMO_USER.id, email: DEMO_USER.email, name: DEMO_USER.name };
    const token = randomBytes(32).toString('base64url');
    const expiresIn = this.ttlMinutes * 60;
    this.sessions.set(token, { user, expiresAt: this.now() + expiresIn * 1_000 });
    return { token, user, expiresIn };
  }

  authenticate(authorization: string | undefined): AuthenticatedUser {
    const [scheme, token] = authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) {
      throw new AppError(401, 'UNAUTHORIZED', 'A Bearer token is required.');
    }
    const session = this.sessions.get(token);
    if (!session || session.expiresAt <= this.now()) {
      if (session) this.sessions.delete(token);
      throw new AppError(401, 'UNAUTHORIZED', 'The session is invalid or expired.');
    }
    return session.user;
  }

  activeSessionCount(): number {
    return this.sessions.size;
  }
}
