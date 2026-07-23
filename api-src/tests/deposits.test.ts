import { describe, it, expect, beforeEach } from 'vitest';
import { E2ETestClient } from './helpers/test-client';

describe('Deposits & QRIS E2E Tests', () => {
  const client = new E2ETestClient();

  beforeEach(async () => {
    await client.clearDatabase();
    client.setToken(null);
  });

  async function setupUser(email: string, telegramId: string = 'tg-depositer') {
    await client.expressPost('/auth/signup', {
      email,
      password: 'password123',
      username: email.split('@')[0],
      telegram_id: telegramId
    });

    const loginRes = await client.expressPost('/auth/login', {
      email,
      password: 'password123'
    });
    const loginBody = await loginRes.json() as any;
    client.setToken(loginBody.token);
    return loginBody.token;
  }

  // --- Hono tRPC Proxy RAMS/Deposit Tests ---

  it('1. should retrieve RAMS balance successfully via tRPC', async () => {
    await setupUser('dep1@example.com');
    const res = await client.trpcQuery('rams.balance');
    expect(res.success).toBe(true);
    expect(res.data.ramsBalance).toBeDefined();
    expect(res.data.localBalance).toBe(0);
  });

  it('2. should reject balance query when unauthenticated via tRPC', async () => {
    client.setToken(null);
    await expect(client.trpcQuery('rams.balance')).rejects.toThrow();
  });

  it('3. should generate QRIS deposit successfully via tRPC', async () => {
    await setupUser('dep2@example.com');
    const deposit = await client.trpcMutation('rams.deposit', {
      amount: 150, // 150 MYR / IDR depending on currency config
      method: 'qris'
    });

    expect(deposit.success).toBe(true);
    expect(deposit.data.depositId).toBeDefined();
    expect(deposit.data.qrImage).toBeDefined();
    expect(deposit.data.qrString).toBeDefined();
    expect(deposit.data.status).toBe('Pending');
  });

  it('4. should reject deposit generation if amount is below minimum (100) via tRPC Zod schema', async () => {
    await setupUser('dep3@example.com');
    await expect(
      client.trpcMutation('rams.deposit', {
        amount: 50, // Less than Zod min 100
        method: 'qris'
      })
    ).rejects.toThrow();
  });

  it('5. should fetch deposit status via tRPC', async () => {
    await setupUser('dep4@example.com');
    const deposit = await client.trpcMutation('rams.deposit', {
      amount: 200,
      method: 'qris'
    });

    const status = await client.trpcQuery('rams.depositStatus', {
      depositId: deposit.data.depositId
    });

    expect(status.success).toBe(true);
    expect(status.data.depositId).toBe(deposit.data.depositId);
    expect(status.data.status).toBe('Pending');
  });

  it('6. should fetch deposit QR details via tRPC', async () => {
    await setupUser('dep5@example.com');
    const deposit = await client.trpcMutation('rams.deposit', {
      amount: 300,
      method: 'qris'
    });

    const qrDetails = await client.trpcQuery('rams.depositQR', {
      depositId: deposit.data.depositId
    });

    expect(qrDetails.success).toBe(true);
    expect(qrDetails.data.depositId).toBe(deposit.data.depositId);
    expect(qrDetails.data.qrImage).toBeDefined();
    expect(qrDetails.data.qrString).toBeDefined();
  });

  it('7. should retrieve history via tRPC containing the local deposits', async () => {
    await setupUser('dep6@example.com', 'tg-dep6');
    const deposit = await client.trpcMutation('rams.deposit', {
      amount: 120,
      method: 'qris'
    });

    const history = await client.trpcQuery('rams.history');
    expect(history.success).toBe(true);
    expect(history.data.localDeposits.length).toBe(1);
    expect(history.data.localDeposits[0].depositId).toBe(deposit.data.depositId);
    expect(history.data.localDeposits[0].amount).toBe(120);
  });

  // --- Direct Express REST API RAMS/Deposit Tests ---

  it('8. should generate QRIS deposit via Express REST API', async () => {
    await setupUser('dep7@example.com');
    const res = await client.expressPost('/rams/deposit', {
      amount: 250,
      method: 'qris'
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.depositId).toBeDefined();
  });

  it('9. should fetch deposit status via Express REST API', async () => {
    await setupUser('dep8@example.com');
    const depRes = await client.expressPost('/rams/deposit', {
      amount: 250,
      method: 'qris'
    });
    const depBody = await depRes.json() as any;
    const depId = depBody.data.depositId;

    const res = await client.expressGet(`/rams/deposit/${depId}/status`);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('Pending');
  });

  it('10. should fetch deposit history via Express REST API', async () => {
    await setupUser('dep9@example.com', 'tg-dep9');
    await client.expressPost('/rams/deposit', {
      amount: 350,
      method: 'qris'
    });

    const res = await client.expressGet('/rams/history');
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.localDeposits.length).toBe(1);
  });

  it('11. should return 404 for status check on non-existent deposit', async () => {
    await setupUser('dep10@example.com');
    const res = await client.expressGet('/rams/deposit/DEP-NONEXISTENT/status');
    expect(res.status).toBe(404);
  });
});
