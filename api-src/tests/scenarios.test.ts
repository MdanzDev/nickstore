import { describe, it, expect, beforeEach } from 'vitest';
import { E2ETestClient } from './helpers/test-client';

describe('Real-World Application Scenarios E2E', () => {
  const client = new E2ETestClient();

  beforeEach(async () => {
    await client.clearDatabase();
    client.setToken(null);
  });

  it('1. Scenario: Happy Path Customer Journey', async () => {
    // 1. User signs up
    const signupRes = await client.expressPost('/auth/signup', {
      email: 'customer@example.com',
      password: 'password123',
      username: 'john_doe',
      telegram_id: 'tg-john'
    });
    expect(signupRes.status).toBe(200);

    // 2. User logs in
    const loginRes = await client.expressPost('/auth/login', {
      email: 'customer@example.com',
      password: 'password123'
    });
    expect(loginRes.status).toBe(200);
    const loginBody = await loginRes.json() as any;
    const token = loginBody.token;
    client.setToken(token);

    // 3. User deposits 100 MYR via QRIS
    const depRes = await client.expressPost('/rams/deposit', {
      amount: 100.00,
      method: 'qris'
    });
    expect(depRes.status).toBe(200);
    const depBody = await depRes.json() as any;
    const depositId = depBody.data.depositId;

    // Simulate deposit confirmation
    const deposits = await client.getTableData('deposits');
    const depositRow = deposits.find((d: any) => d.invoice === depositId);
    depositRow.status = 'Success';
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.google_email === 'customer@example.com');
    userRow.balance_myr = 100.00;
    userRow.balance_idr = 100.00 * 4111;

    // 4. User views public games list and selects Honor of Kings
    const gamesRes = await client.expressGet('/public/games');
    expect(gamesRes.status).toBe(200);
    const gamesBody = await gamesRes.json() as any;
    expect(gamesBody.games.length).toBeGreaterThan(0);
    
    const hokDetailsRes = await client.expressGet('/public/games/honor-of-kings');
    expect(hokDetailsRes.status).toBe(200);
    const hokDetails = await hokDetailsRes.json() as any;
    expect(hokDetails.game.services_by_type.Standard.length).toBeGreaterThan(0);
    const serviceId = hokDetails.game.services_by_type.Standard[0].id; // srv-3 (1000 Tokens, 90.00 price)

    // With customer markup 20%, price is 108.00. Wait, 100.00 balance < 108.00 price, order will fail!
    // Let's add 50.00 more to balance via bridge
    userRow.balance_myr = 150.00;

    // 5. User places an order
    const orderRes = await client.expressPost('/orders', {
      service_id: serviceId,
      game_id: '554433',
      zone_id: '1'
    });
    expect(orderRes.status).toBe(200);
    const orderBody = await orderRes.json() as any;
    expect(orderBody.success).toBe(true);
    const orderId = orderBody.order.order_id;

    // 6. User checks their order status
    const statusRes = await client.expressGet(`/orders/${orderId}/status`);
    expect(statusRes.status).toBe(200);
    const statusBody = await statusRes.json() as any;
    expect(statusBody.status).toBe('Sukses');

    // 7. User views profile and transactions
    const meRes = await client.expressGet('/users/me');
    expect(meRes.status).toBe(200);
    const meBody = await meRes.json() as any;
    expect(meBody.user.balance_myr).toBe(42.00); // 150 - 108 = 42
    expect(meBody.user.transactions.length).toBe(1);

    // 8. User logs out
    const logoutRes = await client.expressPost('/auth/logout', {});
    expect(logoutRes.status).toBe(200);

    // 9. Profile should now fail
    const meResFail = await client.expressGet('/users/me');
    expect(meResFail.status).toBe(403);
  });

  it('2. Scenario: Password Reset and Login Flow', async () => {
    // 1. User signs up
    await client.expressPost('/auth/signup', {
      email: 'reset@example.com',
      password: 'oldpassword',
      username: 'reset_user'
    });

    // 2. Request password reset
    const resetRes = await client.expressPost('/auth/reset-password', {
      email: 'reset@example.com'
    });
    expect(resetRes.status).toBe(200);

    // 3. Login to get a token to perform update password
    const loginOldRes = await client.expressPost('/auth/login', {
      email: 'reset@example.com',
      password: 'oldpassword'
    });
    expect(loginOldRes.status).toBe(200);
    const loginOldBody = await loginOldRes.json() as any;
    client.setToken(loginOldBody.token);

    // 4. Update password
    const updateRes = await client.expressPost('/auth/update-password', {
      newPassword: 'newpassword123'
    });
    expect(updateRes.status).toBe(200);

    // 5. Try login with old password -> fails
    client.setToken(null);
    const loginOldFail = await client.expressPost('/auth/login', {
      email: 'reset@example.com',
      password: 'oldpassword'
    });
    expect(loginOldFail.status).toBe(401);

    // 6. Login with new password -> succeeds
    const loginNewRes = await client.expressPost('/auth/login', {
      email: 'reset@example.com',
      password: 'newpassword123'
    });
    expect(loginNewRes.status).toBe(200);
    const loginNewBody = await loginNewRes.json() as any;
    expect(loginNewBody.token).toBeDefined();
  });

  it('3. Scenario: Multi-Session Token Persistence', async () => {
    // 1. Sign up
    await client.expressPost('/auth/signup', {
      email: 'session@example.com',
      password: 'password123',
      username: 'session_user'
    });

    // 2. Login on device 1
    const d1Res = await client.expressPost('/auth/login', {
      email: 'session@example.com',
      password: 'password123'
    });
    const d1Body = await d1Res.json() as any;
    const token1 = d1Body.token;

    // 3. Login on device 2
    const d2Res = await client.expressPost('/auth/login', {
      email: 'session@example.com',
      password: 'password123'
    });
    const d2Body = await d2Res.json() as any;
    const token2 = d2Body.token;

    // Verify both tokens are valid
    client.setToken(token1);
    const me1 = await client.expressGet('/users/me');
    expect(me1.status).toBe(200);

    client.setToken(token2);
    const me2 = await client.expressGet('/users/me');
    expect(me2.status).toBe(200);

    // Logout session 2
    await client.expressPost('/auth/logout', {});

    // Token 2 is now invalid
    const me2Fail = await client.expressGet('/users/me');
    expect(me2Fail.status).toBe(403);

    // Token 1 is still active
    client.setToken(token1);
    const me1StillActive = await client.expressGet('/users/me');
    expect(me1StillActive.status).toBe(200);
  });

  it('4. Scenario: Voucher Lifecycle (Admin Create -> User Validate -> Admin Expiry -> Admin Delete)', async () => {
    // Setup Admin
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

    // 1. Admin creates voucher "SAVE50"
    const createRes = await client.expressPost('/vouchers', {
      code: 'SAVE50',
      type: 'fixed',
      value: 50,
      minOrder: 100,
      expiryDate: new Date(Date.now() + 86400000).toISOString(),
      usageLimit: 1
    });
    expect(createRes.status).toBe(200);

    // 2. Customer validates the voucher code
    client.setToken(null); // Unauthenticated is fine for validation
    const valRes1 = await client.expressPost('/vouchers/validate', {
      code: 'SAVE50',
      orderAmount: 120
    });
    expect(valRes1.status).toBe(200);
    const valBody1 = await valRes1.json() as any;
    expect(valBody1.success).toBe(true);

    // 3. Admin updates the voucher to be used/expired
    client.setToken(adminBody.token);
    const updateRes = await client.expressPatch('/vouchers/SAVE50', {
      is_used: true
    });
    expect(updateRes.status).toBe(200);

    // 4. Customer tries to validate again -> fails
    client.setToken(null);
    const valRes2 = await client.expressPost('/vouchers/validate', {
      code: 'SAVE50',
      orderAmount: 120
    });
    expect(valRes2.status).toBe(400); // fails validation

    // 5. Admin deletes the voucher
    client.setToken(adminBody.token);
    const delRes = await client.expressDelete('/vouchers/SAVE50');
    expect(delRes.status).toBe(200);

    // 6. Voucher not found check
    const valRes3 = await client.expressPost('/vouchers/validate', {
      code: 'SAVE50',
      orderAmount: 120
    });
    expect(valRes3.status).toBe(400);
  });

  it('5. Scenario: Service Cache Out-Of-Sync and Refreshes', async () => {
    // 1. Initial price check for srv-1
    const p1Res = await client.expressGet('/public/services/srv-1');
    const p1Body = await p1Res.json() as any;
    expect(p1Body.service.price_myr).toBe('10.00');

    // 2. Admin directly updates service price in the database table (bypass cache)
    const services = await client.getTableData('services');
    const srv1 = services.find((s: any) => s.id === 'srv-1');
    srv1.price_myr = 15.00;
    srv1.price_idr = 15.00 * 4111;
    srv1.price = 15.00;

    // 3. Public GET public/services/srv-1 still returns 10.00 because of cachedServices
    const p2Res = await client.expressGet('/public/services/srv-1');
    const p2Body = await p2Res.json() as any;
    expect(p2Body.service.price_myr).toBe('10.00');

    // 4. Admin triggers cache refresh
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

    const refreshRes = await client.expressPost('/admin/services/refresh', {});
    expect(refreshRes.status).toBe(200);

    // 5. Public GET public/services/srv-1 now returns the new price 15.00!
    client.setToken(null);
    const p3Res = await client.expressGet('/public/services/srv-1');
    const p3Body = await p3Res.json() as any;
    expect(p3Body.service.price_myr).toBe('15.00');
  });
});
