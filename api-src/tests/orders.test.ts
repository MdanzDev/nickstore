import { describe, it, expect, beforeEach } from 'vitest';
import { E2ETestClient } from './helpers/test-client';

describe('Orders Placing & Balance E2E Tests', () => {
  const client = new E2ETestClient();

  beforeEach(async () => {
    await client.clearDatabase();
    client.setToken(null);
  });

  async function setupUserWithBalance(email: string, balance: number, telegramId: string = 'tg-user-123') {
    // 1. Sign up via Express direct API with telegram_id
    const signupRes = await client.expressPost('/auth/signup', {
      email,
      password: 'password123',
      username: email.split('@')[0],
      telegram_id: telegramId
    });
    expect(signupRes.status).toBe(200);

    // 2. Login to get token
    const loginRes = await client.expressPost('/auth/login', {
      email,
      password: 'password123'
    });
    expect(loginRes.status).toBe(200);
    const loginBody = await loginRes.json() as any;
    const token = loginBody.token;
    client.setToken(token);

    // 3. Obtain user profile id
    const meRes = await client.expressGet('/users/me');
    const meBody = await meRes.json() as any;
    const userId = meBody.user.id;

    // 4. Update balance in database via backdoor
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === userId);
    if (userRow) {
      userRow.balance_myr = balance;
      userRow.balance_idr = balance * 4111;
      userRow.telegram_id = telegramId;
    }

    return { userId, token };
  }

  // --- Orders placing and balance tests ---

  it('1. should fail to place order if balance is insufficient via tRPC', async () => {
    // 10 MYR balance, but service srv-2 costs 50 MYR (without markup)
    await setupUserWithBalance('user1@example.com', 10.00);

    await expect(
      client.trpcMutation('orders.create', {
        items: [{ productId: 'srv-2', quantity: 1 }],
        notes: 'User ID: 8888, Zone ID: 9999, DenominationId: srv-2'
      })
    ).rejects.toThrow(/Insufficient balance/);
  });

  it('2. should place order successfully when balance is sufficient via tRPC', async () => {
    // 100 MYR balance, service srv-2 is 50 MYR. With customer markup of 20%, it costs 60 MYR.
    const { userId } = await setupUserWithBalance('user2@example.com', 100.00);

    const result = await client.trpcMutation('orders.create', {
      items: [{ productId: 'srv-2', quantity: 1 }],
      notes: 'User ID: 12345, Zone ID: 6789, DenominationId: srv-2'
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
    expect(result.amount_myr).toBe(60.00); // 50 * 1.2 = 60
    expect(result.status).toBe('Sukses'); // mocked provider returns Sukses

    // Verify balance deduction
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === userId);
    expect(userRow.balance_myr).toBe(40.00); // 100 - 60 = 40
  });

  it('3. should verify transaction history was created in user profile', async () => {
    await setupUserWithBalance('user3@example.com', 100.00);

    await client.trpcMutation('orders.create', {
      items: [{ productId: 'srv-2', quantity: 1 }],
      notes: 'User ID: 12345, Zone ID: 6789, DenominationId: srv-2'
    });

    const txs = await client.trpcQuery('transactions.list');
    expect(txs.length).toBe(1);
    expect(txs[0].type).toBe('debit');
    expect(txs[0].description).toContain('Order ORION-');
  });

  it('4. should retrieve orders list via tRPC orders.list', async () => {
    await setupUserWithBalance('user4@example.com', 100.00);

    await client.trpcMutation('orders.create', {
      items: [{ productId: 'srv-2', quantity: 1 }],
      notes: 'User ID: 12345, Zone ID: 6789, DenominationId: srv-2'
    });

    const ordersList = await client.trpcQuery('orders.list');
    expect(ordersList.data.length).toBe(1);
    expect(ordersList.data[0].notes).toContain('1000 Tokens (12345 | 6789)'); // srv-2 category is Mobile Legends? Wait, let's see. srv-2 category is Mobile Legends. But wait, mapped notes: notes: `${o.service_name} (${o.game_user_id...
  });

  it('5. should retrieve specific order details by ID via tRPC orders.getById', async () => {
    await setupUserWithBalance('user5@example.com', 100.00);

    const orderRes = await client.trpcMutation('orders.create', {
      items: [{ productId: 'srv-2', quantity: 1 }],
      notes: 'User ID: 12345, Zone ID: 6789, DenominationId: srv-2'
    });

    const orderId = orderRes.id;
    const orderDetails = await client.trpcQuery('orders.getById', { id: orderId });
    expect(orderDetails.id).toBe(orderId);
    expect(orderDetails.status).toBe('delivered'); // 'Sukses' maps to 'delivered' in client.ts
  });

  it('6. should place order via Direct Express API', async () => {
    const { userId } = await setupUserWithBalance('user6@example.com', 100.00);

    const res = await client.expressPost('/orders', {
      service_id: 'srv-2',
      game_id: '12345',
      zone_id: '6789'
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.order.amount_myr).toBe(60.00);

    // Verify balance deduction
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === userId);
    expect(userRow.balance_myr).toBe(40.00);
  });

  it('7. should retrieve user orders via Direct Express API orders/my', async () => {
    await setupUserWithBalance('user7@example.com', 100.00);

    await client.expressPost('/orders', {
      service_id: 'srv-2',
      game_id: '12345',
      zone_id: '6789'
    });

    const res = await client.expressGet('/orders/my');
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.orders.length).toBe(1);
    expect(body.orders[0].amount_myr).toBe(60.00);
  });

  it('8. should check order status via Direct Express API', async () => {
    await setupUserWithBalance('user8@example.com', 100.00);

    const orderRes = await client.expressPost('/orders', {
      service_id: 'srv-2',
      game_id: '12345',
      zone_id: '6789'
    });
    const orderBody = await orderRes.json() as any;
    const orderId = orderBody.order.order_id;

    const res = await client.expressGet(`/orders/${orderId}/status`);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.status).toBe('Sukses');
  });

  it('9. should retrieve single order details via Direct Express API', async () => {
    await setupUserWithBalance('user9@example.com', 100.00);

    const orderRes = await client.expressPost('/orders', {
      service_id: 'srv-2',
      game_id: '12345',
      zone_id: '6789'
    });
    const orderBody = await orderRes.json() as any;
    const orderId = orderBody.order.order_id;

    const res = await client.expressGet(`/orders/${orderId}`);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.order.order_id).toBe(orderId);
    expect(body.order.amount_myr).toBe(60.00);
  });

  it('10. should fail to check status for non-existent order', async () => {
    await setupUserWithBalance('user10@example.com', 100.00);

    const res = await client.expressGet('/orders/non-existent-order-id/status');
    expect(res.status).toBe(404);
  });
});
