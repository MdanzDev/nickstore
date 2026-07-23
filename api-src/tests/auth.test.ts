import { describe, it, expect, beforeEach } from 'vitest';
import { E2ETestClient } from './helpers/test-client';

describe('Authentication E2E Tests', () => {
  const client = new E2ETestClient();

  beforeEach(async () => {
    // Reset database state before each test
    await client.clearDatabase();
    client.setToken(null);
  });

  // --- Hono tRPC Proxy Auth Tests ---

  it('1. should register a new customer user successfully via tRPC', async () => {
    const result = await client.trpcMutation('auth.register', {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '1234567890'
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('john@example.com');
    expect(result.user.name).toBe('John Doe');
    expect(result.user.roles).toContain('customer');
    expect(result.token).toBeDefined();
  });

  it('2. should fail to register user with already existing email via tRPC', async () => {
    // First registration
    await client.trpcMutation('auth.register', {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });

    // Second registration with same email
    await expect(
      client.trpcMutation('auth.register', {
        name: 'Another John',
        email: 'john@example.com',
        password: 'password999'
      })
    ).rejects.toThrow();
  });

  it('3. should log in successfully with valid credentials via tRPC', async () => {
    await client.trpcMutation('auth.register', {
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: 'securepassword'
    });

    client.setToken(null); // Clear auth token from client to simulate fresh state

    const loginRes = await client.trpcMutation('auth.login', {
      email: 'alice@example.com',
      password: 'securepassword'
    });

    expect(loginRes.token).toBeDefined();
    expect(loginRes.user.email).toBe('alice@example.com');
  });

  it('4. should fail to log in with incorrect password via tRPC', async () => {
    await client.trpcMutation('auth.register', {
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: 'securepassword'
    });

    client.setToken(null);

    await expect(
      client.trpcMutation('auth.login', {
        email: 'alice@example.com',
        password: 'wrongpassword'
      })
    ).rejects.toThrow();
  });

  it('5. should fetch logged-in user profile (me) successfully via tRPC', async () => {
    await client.trpcMutation('auth.register', {
      name: 'Bob Jones',
      email: 'bob@example.com',
      password: 'bobpassword'
    });

    // Token is set in client automatically after register/login
    const me = await client.trpcQuery('auth.me');
    expect(me.email).toBe('bob@example.com');
    expect(me.name).toBe('Bob Jones');
  });

  it('6. should fail to fetch profile when unauthenticated via tRPC', async () => {
    client.setToken(null);
    await expect(client.trpcQuery('auth.me')).rejects.toThrow();
  });

  it('7. should refresh authentication token via tRPC', async () => {
    await client.trpcMutation('auth.register', {
      name: 'Bob Jones',
      email: 'bob@example.com',
      password: 'bobpassword'
    });

    const refreshRes = await client.trpcMutation('auth.refresh');
    expect(refreshRes.token).toBeDefined();
    expect(refreshRes.expiresIn).toBe(86400);
  });

  it('8. should fail to refresh token when unauthenticated via tRPC', async () => {
    client.setToken(null);
    await expect(client.trpcMutation('auth.refresh')).rejects.toThrow();
  });

  it('9. should logout successfully and clear cookie via tRPC', async () => {
    await client.trpcMutation('auth.register', {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: 'charliepassword'
    });

    const logoutRes = await client.trpcMutation('auth.logout');
    expect(logoutRes.success).toBe(true);

    // Profile retrieval should now fail
    await expect(client.trpcQuery('auth.me')).rejects.toThrow();
  });

  // --- Express REST Native Auth Tests ---

  it('10. should register a user via Express REST API directly', async () => {
    const res = await client.expressPost('/auth/signup', {
      email: 'direct@example.com',
      password: 'directpassword',
      username: 'directuser',
      telegram_id: '11223344'
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.user.email).toBe('direct@example.com');
  });

  it('11. should login and obtain token via Express REST API directly', async () => {
    // Setup user
    await client.expressPost('/auth/signup', {
      email: 'direct@example.com',
      password: 'directpassword',
      username: 'directuser'
    });

    const res = await client.expressPost('/auth/login', {
      email: 'direct@example.com',
      password: 'directpassword'
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.token).toBeDefined();
    expect(body.user.email).toBe('direct@example.com');
  });

  it('12. should fetch session details via Express REST API directly', async () => {
    await client.expressPost('/auth/signup', {
      email: 'direct@example.com',
      password: 'directpassword',
      username: 'directuser'
    });

    const loginRes = await client.expressPost('/auth/login', {
      email: 'direct@example.com',
      password: 'directpassword'
    });
    const loginBody = await loginRes.json() as any;
    client.setToken(loginBody.token);

    const sessionRes = await client.expressGet('/auth/session');
    expect(sessionRes.status).toBe(200);
    const sessionBody = await sessionRes.json() as any;
    expect(sessionBody.success).toBe(true);
    expect(sessionBody.user.email).toBe('direct@example.com');
    expect(sessionBody.user.username).toBe('directuser');
  });
});
