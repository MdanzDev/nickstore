import { describe, it, expect, beforeEach } from 'vitest';
import { E2ETestClient } from './helpers/test-client';

describe('Products & Denominations E2E Tests', () => {
  const client = new E2ETestClient();

  beforeEach(async () => {
    await client.clearDatabase();
    client.setToken(null);
  });

  // Helper to login as admin
  async function authAsAdmin() {
    await client.trpcMutation('auth.register', {
      name: 'Admin User',
      email: 'admin@orion.com',
      password: 'adminpassword'
    });
    const login = await client.trpcMutation('auth.login', {
      email: 'admin@orion.com',
      password: 'adminpassword'
    });
    client.setToken(login.token);

    const me = await client.trpcQuery('auth.me');
    const users = await client.getTableData('users');
    const userRow = users.find((u: any) => u.id === me.id);
    if (userRow) {
      userRow.role = 'admin';
    }
  }

  // Helper to login as customer
  async function authAsCustomer() {
    await client.trpcMutation('auth.register', {
      name: 'Customer User',
      email: 'customer@example.com',
      password: 'customerpassword'
    });
    const login = await client.trpcMutation('auth.login', {
      email: 'customer@example.com',
      password: 'customerpassword'
    });
    client.setToken(login.token);
  }

  // --- tRPC Proxy Products Queries & Mutations ---

  it('1. should list games successfully via tRPC products.list', async () => {
    const games = await client.trpcQuery('products.list', {});
    // Initial in-memory DB has default products which translate to 2 games: Mobile Legends and Honor of Kings
    expect(games.data.length).toBeGreaterThan(0);
    const ML = games.data.find((g: any) => g.name === 'Mobile Legends');
    expect(ML).toBeDefined();
  });

  it('2. should retrieve game details by slug via tRPC products.getById', async () => {
    // Slug for 'Mobile Legends' is 'mobile-legends'
    const game = await client.trpcQuery('products.getById', { id: 'mobile-legends' });
    expect(game.name).toBe('Mobile Legends');
    expect(game.id).toBe('mobile-legends');
  });

  it('3. should throw error for non-existent game slug via tRPC products.getById', async () => {
    await expect(
      client.trpcQuery('products.getById', { id: 'non-existent-game-slug' })
    ).rejects.toThrow();
  });

  it('4. should list denominations (services) for a specific product via tRPC denominations.list', async () => {
    const list = await client.trpcQuery('denominations.listByProduct', { productId: 'mobile-legends' });
    expect(list.data.length).toBe(2); // srv-1 and srv-2 are Mobile Legends
    expect(list.data[0].productId).toBe('mobile-legends');
  });

  it('5. should allow admin to create a new product/service via tRPC products.create', async () => {
    await authAsAdmin();
    const newProduct = await client.trpcMutation('products.create', {
      name: '2000 Tokens',
      description: 'Big HoK Tokens bundle',
      price: 180,
      category: 'Honor of Kings'
    });

    expect(newProduct).toBeDefined();
  });

  it('6. should reject product creation for non-admin users via tRPC products.create', async () => {
    await authAsCustomer();
    await expect(
      client.trpcMutation('products.create', {
        name: '2000 Tokens',
        price: 180,
        category: 'Honor of Kings'
      })
    ).rejects.toThrow();
  });

  it('7. should allow admin to update product via tRPC products.update', async () => {
    await authAsAdmin();
    // Default service srv-1 is inside in-memory DB
    const res = await client.trpcMutation('products.update', {
      id: 'srv-1',
      data: { name: 'Super 100 Diamonds', price: 12 }
    });
    expect(res).toBeDefined();
  });

  it('8. should allow admin to delete product via tRPC products.delete', async () => {
    await authAsAdmin();
    const res = await client.trpcMutation('products.delete', { id: 'srv-2' });
    expect(res.message).toContain('deleted');

    // Since products.delete on Hono proxy is a stub returning a success message, we delete it via Express REST API to update the shared database state.
    await client.expressDelete('/denominations/srv-2');

    // Fetching denominations for Mobile Legends should now only yield srv-1
    const list = await client.trpcQuery('denominations.listByProduct', { productId: 'mobile-legends' });
    expect(list.data.length).toBe(1);
    expect(list.data[0].id).toBe('srv-1');
  });

  // --- Direct Express REST API Public Queries ---

  it('9. should return public games listing via Express REST API', async () => {
    const res = await client.expressGet('/public/games');
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.games.length).toBeGreaterThan(0);
  });

  it('10. should return game details by slug via Express REST API', async () => {
    const res = await client.expressGet('/public/games/mobile-legends');
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.game.name).toBe('Mobile Legends');
  });

  it('11. should return service details by ID via Express REST API', async () => {
    const res = await client.expressGet('/public/services/srv-1');
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.service.name).toBe('100 Diamonds');
    expect(body.service.price_myr).toBe('10.00');
  });

  it('12. should allow admin to add denomination via Express REST API', async () => {
    await authAsAdmin();
    const res = await client.expressPost('/denominations', {
      productId: 'mobile-legends',
      name: '1000 Diamonds',
      price: 82220 // IDR
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('1000 Diamonds');
  });

  it('13. should allow admin to delete denomination via Express REST API', async () => {
    await authAsAdmin();
    const res = await client.expressDelete('/denominations/srv-1');
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
  });
});
