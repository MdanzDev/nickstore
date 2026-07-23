import { describe, it, expect, beforeEach } from 'vitest';
import { E2ETestClient } from './helpers/test-client';

describe('Admin Management E2E Tests', () => {
  const client = new E2ETestClient();

  beforeEach(async () => {
    await client.clearDatabase();
    client.setToken(null);
  });

  async function setupAdmin() {
    await client.expressPost('/auth/signup', {
      email: 'admin@orion.com',
      password: 'adminpassword',
      username: 'adminuser'
    });
    const login = await client.expressPost('/auth/login', {
      email: 'admin@orion.com',
      password: 'adminpassword'
    });
    const body = await login.json() as any;
    client.setToken(body.token);
    
    const userId = body.user.id;
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === userId);
    if (userRow) {
      userRow.role = 'admin';
    }
    
    return userId;
  }

  async function setupCustomer(email = 'customer@example.com') {
    const signup = await client.expressPost('/auth/signup', {
      email,
      password: 'customerpassword',
      username: email.split('@')[0],
      telegram_id: 'tg-' + email.split('@')[0]
    });
    const bodySignup = await signup.json() as any;
    const customerId = bodySignup.user?.id;

    // Login as customer to simulate their calls if needed
    const login = await client.expressPost('/auth/login', {
      email,
      password: 'customerpassword'
    });
    const body = await login.json() as any;
    return { customerId, token: body.token };
  }

  // --- Hono tRPC Proxy Admin Tests ---

  it('1. should list all users successfully via tRPC users.list (as admin)', async () => {
    await setupAdmin();
    // Setup a customer too
    await setupCustomer();

    const users = await client.trpcQuery('users.list', {});
    expect(users.data.length).toBeGreaterThan(0);
    const customer = users.data.find((u: any) => u.email === 'customer@example.com');
    expect(customer).toBeDefined();
    expect(customer.roles).toContain('customer');
  });

  it('2. should reject listing users via tRPC users.list if user is NOT admin', async () => {
    const { token } = await setupCustomer();
    client.setToken(token);

    await expect(client.trpcQuery('users.list', {})).rejects.toThrow();
  });

  it('3. should update user role via tRPC users.update', async () => {
    await setupAdmin();
    const { customerId } = await setupCustomer('customer-update@example.com');

    // Admin updates user role to business
    await setupAdmin(); // Log back in as admin
    const updatedUser = await client.trpcMutation('users.update', {
      id: customerId,
      data: { role: 'business' }
    });

    expect(updatedUser.roles).toContain('business');

    // Verify database update
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === customerId);
    expect(userRow.role).toBe('business');
  });

  it('4. should allow admin to update order status via tRPC orders.updateStatus', async () => {
    await setupAdmin();
    const { customerId, token: customerToken } = await setupCustomer();

    // Place an order as customer
    client.setToken(customerToken);
    
    // Give customer balance and telegram_id
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === customerId);
    userRow.balance_myr = 100.00;
    userRow.telegram_id = 'tg-customer';

    const orderRes = await client.expressPost('/orders', {
      service_id: 'srv-1',
      game_id: '12345',
      zone_id: '6789'
    });
    const orderBody = await orderRes.json() as any;
    const orderId = orderBody.order.order_id;

    // Log back in as admin to update order status
    await setupAdmin();
    const updateRes = await client.trpcMutation('orders.updateStatus', {
      id: orderId,
      status: 'confirmed'
    });

    expect(updateRes.success).toBe(true);

    // Verify order status in DB
    const orders = await client.getTableData('orders');
    const orderRow = orders.find((o: any) => o.id === orderId);
    expect(orderRow.status).toBe('confirmed');
  });

  it('5. should reject updating order status via tRPC orders.updateStatus if NOT admin', async () => {
    await setupAdmin();
    const { customerId, token: customerToken } = await setupCustomer();

    // Place an order
    client.setToken(customerToken);
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === customerId);
    userRow.balance_myr = 100.00;
    userRow.telegram_id = 'tg-customer';

    const orderRes = await client.expressPost('/orders', {
      service_id: 'srv-1',
      game_id: '12345',
      zone_id: '6789'
    });
    const orderBody = await orderRes.json() as any;
    const orderId = orderBody.order.order_id;

    // Call updateStatus as customer (not admin)
    await expect(
      client.trpcMutation('orders.updateStatus', {
        id: orderId,
        status: 'confirmed'
      })
    ).rejects.toThrow();
  });

  it('6. should allow admin to delete user via tRPC users.delete', async () => {
    await setupAdmin();
    const { customerId } = await setupCustomer('delete-me@example.com');

    // Log back as admin
    await setupAdmin();
    const deleteRes = await client.trpcMutation('users.delete', { id: customerId });
    expect(deleteRes.message).toBeDefined();

    // Verify user deleted in db
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === customerId);
    expect(userRow).toBeUndefined();
  });

  // --- Direct Express REST API Admin Tests ---

  it('7. should list all admin orders via Express REST API', async () => {
    await setupAdmin();
    const res = await client.expressGet('/admin/orders');
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.orders).toBeDefined();
  });

  it('8. should update order status via Express REST API', async () => {
    await setupAdmin();
    const { customerId, token: customerToken } = await setupCustomer();
    
    // Place order
    client.setToken(customerToken);
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === customerId);
    userRow.balance_myr = 100.00;
    userRow.telegram_id = 'tg-customer';

    const orderRes = await client.expressPost('/orders', {
      service_id: 'srv-1',
      game_id: '12345',
      zone_id: '6789'
    });
    const orderBody = await orderRes.json() as any;
    const orderId = orderBody.order.order_id;

    // Update via admin Express API
    await setupAdmin();
    const res = await client.expressPut(`/admin/orders/${orderId}/status`, {
      status: 'delivered',
      note: 'Fulfillment done'
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('delivered');
  });

  it('9. should list all users via Express REST API', async () => {
    await setupAdmin();
    const res = await client.expressGet('/admin/users');
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.users.length).toBeGreaterThan(0);
  });

  it('10. should adjust user balance via Express REST API', async () => {
    await setupAdmin();
    const { customerId } = await setupCustomer();

    await setupAdmin();
    const res = await client.expressPost(`/admin/users/${customerId}/balance`, {
      amount: 45.50,
      reason: 'Referral credit'
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.new_balance).toBe(45.50);

    // Verify balance in DB
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === customerId);
    expect(userRow.balance_myr).toBe(45.50);
  });

  it('11. should update user role via Express REST API', async () => {
    await setupAdmin();
    const { customerId } = await setupCustomer();

    await setupAdmin();
    const res = await client.expressPut(`/admin/users/${customerId}/role`, {
      role: 'gold'
    });

    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);

    // Verify role in DB
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === customerId);
    expect(userRow.role).toBe('gold');
  });

  it('12. should refresh services cache via Express REST API', async () => {
    await setupAdmin();
    const res = await client.expressPost('/admin/services/refresh', {});
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
  });

  it('13. should clear cache via Express REST API', async () => {
    await setupAdmin();
    const res = await client.expressPost('/admin/cache/clear', {});
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
  });
});
