import { describe, it, expect, beforeEach } from 'vitest';
import { E2ETestClient } from './helpers/test-client';

describe('Cross-Feature E2E Integration Tests', () => {
  const client = new E2ETestClient();

  beforeEach(async () => {
    await client.clearDatabase();
    client.setToken(null);
  });

  async function setupUser(email: string, balance: number, telegramId: string = 'tg-cross-user') {
    // 1. Sign up user
    await client.expressPost('/auth/signup', {
      email,
      password: 'password123',
      username: email.split('@')[0],
      telegram_id: telegramId
    });

    // 2. Login user
    const loginRes = await client.expressPost('/auth/login', {
      email,
      password: 'password123'
    });
    const loginBody = await loginRes.json() as any;
    client.setToken(loginBody.token);

    const userId = loginBody.user.id;

    // 3. Inject balance via backdoor
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === userId);
    if (userRow) {
      userRow.balance_myr = balance;
      userRow.balance_idr = balance * 4111;
      userRow.telegram_id = telegramId;
    }

    return { userId, token: loginBody.token };
  }

  it('1. should adjust order price dynamically based on user role upgrades', async () => {
    // Start with 50 MYR balance
    const { userId } = await setupUser('upgrade@example.com', 50.00, 'tg-upgrade');

    // Default Customer markup is 20%. srv-1 costs 10 MYR. User price = 12 MYR.
    const orderRes1 = await client.expressPost('/orders', {
      service_id: 'srv-1',
      game_id: '12345',
      zone_id: '6789'
    });
    expect(orderRes1.status).toBe(200);
    const orderBody1 = await orderRes1.json() as any;
    expect(orderBody1.order.amount_myr).toBe(12.00); // 10 * 1.20 = 12

    // Now, admin upgrades this user's role to platinum (10% markup)
    // First setup admin
    await client.expressPost('/auth/signup', {
      email: 'admin@orion.com',
      password: 'adminpassword',
      username: 'admin'
    });
    const adminLogin = await client.expressPost('/auth/login', {
      email: 'admin@orion.com',
      password: 'adminpassword'
    });
    const adminBody = await adminLogin.json() as any;
    client.setToken(adminBody.token);

    // Update role
    const roleRes = await client.expressPut(`/admin/users/${userId}/role`, { role: 'platinum' });
    expect(roleRes.status).toBe(200);

    // Log back in as the customer
    const custLogin = await client.expressPost('/auth/login', {
      email: 'upgrade@example.com',
      password: 'password123'
    });
    const custBody = await custLogin.json() as any;
    client.setToken(custBody.token);

    // Place another order for srv-1. Price should now be 11 MYR (10 * 1.10)
    const orderRes2 = await client.expressPost('/orders', {
      service_id: 'srv-1',
      game_id: '12345',
      zone_id: '6789'
    });
    expect(orderRes2.status).toBe(200);
    const orderBody2 = await orderRes2.json() as any;
    expect(orderBody2.order.amount_myr).toBe(11.00); // 10 * 1.10 = 11

    // Verify total balance remaining: 50.00 - 12.00 (customer) - 11.00 (platinum) = 27.00
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === userId);
    expect(userRow.balance_myr).toBe(27.00);
  });

  it('2. should automatically refund the user balance when the provider API order placement fails', async () => {
    // 50 MYR balance
    const { userId } = await setupUser('refund@example.com', 50.00, 'tg-refund');

    // Create a service in the database with ID 'fail-service' so it triggers provider failure in our mock Axios
    // Login as admin to add the service
    await client.expressPost('/auth/signup', {
      email: 'admin@orion.com',
      password: 'adminpassword',
      username: 'admin'
    });
    const adminLogin = await client.expressPost('/auth/login', {
      email: 'admin@orion.com',
      password: 'adminpassword'
    });
    const adminBody = await adminLogin.json() as any;
    client.setToken(adminBody.token);

    await client.expressPost('/denominations', {
      productId: 'mobile-legends',
      name: 'Broken Service',
      price: 41110 // 10 MYR
    });

    // Update the service id to 'fail-service' in the database directly
    const services = await client.getTableData('services');
    const brokenSrv = services.find((s: any) => s.name === 'Broken Service');
    if (brokenSrv) {
      brokenSrv.id = 'fail-service';
      brokenSrv.srv_id = 'fail-service';
    }

    // Log back in as customer
    const custLogin = await client.expressPost('/auth/login', {
      email: 'refund@example.com',
      password: 'password123'
    });
    const custBody = await custLogin.json() as any;
    client.setToken(custBody.token);

    // Place order. It should fail due to provider out of stock and refund the customer.
    const orderRes = await client.expressPost('/orders', {
      service_id: 'fail-service',
      game_id: '12345',
      zone_id: '6789'
    });

    expect(orderRes.status).toBe(400); // Bad Request
    const orderBody = await orderRes.json() as any;
    expect(orderBody.error).toContain('Provider order failed');

    // Verify balance is STILL 50.00 (refunded!)
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === userId);
    expect(userRow.balance_myr).toBe(50.00);

    // Check transaction history has both debit and credit
    const txs = userRow.transactions || [];
    expect(txs.length).toBe(2);
    expect(txs[0].type).toBe('credit'); // refund
    expect(txs[0].reason).toContain('Refund: Provider order placement failed');
    expect(txs[1].type).toBe('debit'); // original charge
  });

  it('3. should complete a full Deposit-to-Order fulfillment cycle', async () => {
    // 0 MYR balance
    const { userId } = await setupUser('cycle@example.com', 0.00, 'tg-cycle');

    // 1. Try placing order (fails due to insufficient balance)
    const orderFail = await client.expressPost('/orders', {
      service_id: 'srv-1',
      game_id: '12345',
      zone_id: '6789'
    });
    expect(orderFail.status).toBe(400);

    // 2. Request a QRIS deposit of 50 MYR
    const depRes = await client.expressPost('/rams/deposit', {
      amount: 50.00,
      method: 'qris'
    });
    expect(depRes.status).toBe(200);
    const depBody = await depRes.json() as any;
    const depositId = depBody.data.depositId;

    // 3. Simulate deposit payment success (Admin updates deposit to Success and credits user balance)
    const deposits = await client.getTableData('deposits');
    const depositRow = deposits.find((d: any) => d.invoice === depositId);
    expect(depositRow).toBeDefined();
    depositRow.status = 'Success';

    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === userId);
    userRow.balance_myr = 50.00;
    userRow.balance_idr = 50.00 * 4111;

    // 4. Verify deposit status is now complete
    const statusRes = await client.expressGet(`/rams/deposit/${depositId}/status`);
    const statusBody = await statusRes.json() as any;
    expect(statusBody.data.completed).toBe(true);

    // 5. Place order now (succeeds!)
    const orderSuccess = await client.expressPost('/orders', {
      service_id: 'srv-1',
      game_id: '12345',
      zone_id: '6789'
    });
    expect(orderSuccess.status).toBe(200);
    const successBody = await orderSuccess.json() as any;
    expect(successBody.success).toBe(true);

    // 6. Verify final balance (50.00 - 12.00 = 38.00)
    const finalUsers = await client.getTableData('users');
    const finalUserRow = finalUsers.find((u: any) => u.id === userId);
    expect(finalUserRow.balance_myr).toBe(38.00);
  });

  it('4. should validate voucher codes against purchase totals', async () => {
    await setupUser('voucher@example.com', 100.00, 'tg-voucher');

    // Login as admin to create voucher
    await client.expressPost('/auth/signup', {
      email: 'admin@orion.com',
      password: 'adminpassword',
      username: 'admin'
    });
    const adminLogin = await client.expressPost('/auth/login', {
      email: 'admin@orion.com',
      password: 'adminpassword'
    });
    const adminBody = await adminLogin.json() as any;
    client.setToken(adminBody.token);

    // Create a voucher code "SAVE10" requiring minimum purchase of 30 MYR
    const vRes = await client.expressPost('/vouchers', {
      code: 'SAVE10',
      type: 'fixed',
      value: 10,
      minOrder: 30,
      expiryDate: new Date(Date.now() + 86400000).toISOString(),
      usageLimit: 1
    });
    expect(vRes.status).toBe(200);

    // Log back in as customer
    const custLogin = await client.expressPost('/auth/login', {
      email: 'voucher@example.com',
      password: 'password123'
    });
    const custBody = await custLogin.json() as any;
    client.setToken(custBody.token);

    // Try to validate SAVE10 for a 12 MYR order (below min 30 MYR) -> fails
    const valRes1 = await client.expressPost('/vouchers/validate', {
      code: 'SAVE10',
      orderAmount: 12.00
    });
    expect(valRes1.status).toBe(400);

    // Validate SAVE10 for a 50 MYR order (above min 30 MYR) -> succeeds
    const valRes2 = await client.expressPost('/vouchers/validate', {
      code: 'SAVE10',
      orderAmount: 50.00
    });
    expect(valRes2.status).toBe(200);
    const valBody2 = await valRes2.json() as any;
    expect(valBody2.success).toBe(true);
    expect(valBody2.data.discountAmount).toBe(10);
  });

  it('5. should support multi-buy order sequences until balance is exhausted', async () => {
    // Start with exactly 25 MYR balance
    const { userId } = await setupUser('multibuy@example.com', 25.00, 'tg-multibuy');

    // Purchase 1 (costs 12 MYR) -> succeeds
    const o1 = await client.expressPost('/orders', {
      service_id: 'srv-1',
      game_id: '12345',
      zone_id: '6789'
    });
    expect(o1.status).toBe(200);

    // Purchase 2 (costs 12 MYR) -> succeeds
    const o2 = await client.expressPost('/orders', {
      service_id: 'srv-1',
      game_id: '12345',
      zone_id: '6789'
    });
    expect(o2.status).toBe(200);

    // Purchase 3 (costs 12 MYR) -> fails (1 MYR remaining)
    const o3 = await client.expressPost('/orders', {
      service_id: 'srv-1',
      game_id: '12345',
      zone_id: '6789'
    });
    expect(o3.status).toBe(400);

    // Verify final state
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === userId);
    expect(userRow.balance_myr).toBe(1.00);

    const orders = await client.getTableData('orders');
    const userOrders = orders.filter((o: any) => o.telegram_id === 'tg-multibuy');
    expect(userOrders.length).toBe(2);
  });
});
