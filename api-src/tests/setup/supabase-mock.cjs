const Module = require('module');
const originalLoad = Module._load;
const http = require('http');

let auth_users = [];
const auth_sessions = new Map();

const db = {
  users: [],
  orders: [],
  deposits: [],
  settings: [
    {
      id: 1,
      admin_emails: ['admin@orion.com'],
      provider_api_key: 'dev-secret-key',
      provider_secret_key: 'dev-secret-key',
      markups: { customer: 20, gold: 15, platinum: 10, business: 5 },
      role_settings: { minimumSpend: { gold: 500, platinum: 2000, business: 10000 }, autoUpgrade: true },
      vouchers: []
    }
  ],
  services: [
    {
      id: 'srv-1',
      srv_id: 'srv-1',
      nama: '100 Diamonds',
      name: '100 Diamonds',
      category: 'Mobile Legends',
      price_myr: 10.00,
      price_idr: 41110,
      price: 10.00,
      status: 'Aktif'
    },
    {
      id: 'srv-2',
      srv_id: 'srv-2',
      nama: '500 Diamonds',
      name: '500 Diamonds',
      category: 'Mobile Legends',
      price_myr: 50.00,
      price_idr: 205550,
      price: 50.00,
      status: 'Aktif'
    },
    {
      id: 'srv-3',
      srv_id: 'srv-3',
      nama: '1000 Tokens',
      name: '1000 Tokens',
      category: 'Honor of Kings',
      price_myr: 90.00,
      price_idr: 369990,
      price: 90.00,
      status: 'Aktif'
    }
  ],
  service_cache: []
};

class QueryBuilder {
  constructor(table, dbRef) {
    this.table = table;
    this.dbRef = dbRef;
    this.filters = [];
    this.orderByField = null;
    this.orderByAsc = true;
    this.limitCount = null;
    this.action = 'select';
    this.actionData = null;
    this.shouldReturnSingle = false;
    this.shouldReturnMaybeSingle = false;
  }

  select(fields) {
    if (this.action !== 'insert' && this.action !== 'update' && this.action !== 'delete') {
      this.action = 'select';
    }
    return this;
  }

  eq(field, value) {
    this.filters.push({ type: 'eq', field, value });
    return this;
  }

  neq(field, value) {
    this.filters.push({ type: 'neq', field, value });
    return this;
  }

  in(field, values) {
    this.filters.push({ type: 'in', field, values });
    return this;
  }

  order(field, options = {}) {
    this.orderByField = field;
    this.orderByAsc = options.ascending !== false;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.shouldReturnSingle = true;
    return this;
  }

  maybeSingle() {
    this.shouldReturnMaybeSingle = true;
    return this;
  }

  insert(data) {
    this.action = 'insert';
    this.actionData = data;
    return this;
  }

  update(data) {
    this.action = 'update';
    this.actionData = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  execute() {
    let list = this.dbRef[this.table] || [];

    // Filter
    if (this.action === 'select' || this.action === 'update' || this.action === 'delete') {
      list = list.filter(row => {
        for (const f of this.filters) {
          if (f.type === 'eq') {
            if (row[f.field] !== f.value) return false;
          } else if (f.type === 'neq') {
            if (row[f.field] === f.value) return false;
          } else if (f.type === 'in') {
            if (!f.values.includes(row[f.field])) return false;
          }
        }
        return true;
      });
    }

    if (this.action === 'select') {
      if (this.orderByField) {
        list = [...list].sort((a, b) => {
          const valA = a[this.orderByField];
          const valB = b[this.orderByField];
          if (valA < valB) return this.orderByAsc ? -1 : 1;
          if (valA > valB) return this.orderByAsc ? 1 : -1;
          return 0;
        });
      }
      if (this.limitCount !== null) {
        list = list.slice(0, this.limitCount);
      }
      if (this.shouldReturnSingle) {
        if (list.length === 0) {
          return { data: null, error: { message: 'Row not found', code: 'PGRST116' } };
        }
        return { data: list[0], error: null };
      }
      if (this.shouldReturnMaybeSingle) {
        return { data: list[0] || null, error: null };
      }
      return { data: list, error: null };
    }

    if (this.action === 'insert') {
      const rowsToInsert = Array.isArray(this.actionData) ? this.actionData : [this.actionData];
      const inserted = [];
      for (const r of rowsToInsert) {
        const newRow = { ...r };
        if (this.table === 'users') {
          newRow.balance_myr = newRow.balance_myr || 0;
          newRow.balance_idr = newRow.balance_idr || 0;
          newRow.total_spent = newRow.total_spent || 0;
          newRow.total_orders = newRow.total_orders || 0;
          const is_admin = newRow.google_email && (
            newRow.google_email.includes('admin') || 
            newRow.google_email === 'admin@orion.com'
          );
          newRow.role = is_admin ? 'admin' : (newRow.role || 'customer');
          newRow.created_at = newRow.created_at || new Date().toISOString();
        } else if (this.table === 'orders') {
          newRow.status = newRow.status || 'Pending';
          newRow.created_at = newRow.created_at || new Date().toISOString();
        } else if (this.table === 'deposits') {
          newRow.status = newRow.status || 'Pending';
          newRow.created_at = newRow.created_at || new Date().toISOString();
        }
        this.dbRef[this.table].push(newRow);
        inserted.push(newRow);
      }
      const dataResult = Array.isArray(this.actionData) ? inserted : inserted[0];
      if (this.shouldReturnSingle) {
        return { data: inserted[0], error: null };
      }
      return { data: dataResult, error: null };
    }

    if (this.action === 'update') {
      const updated = [];
      this.dbRef[this.table] = this.dbRef[this.table].map(row => {
        let match = true;
        for (const f of this.filters) {
          if (f.type === 'eq') {
            if (row[f.field] !== f.value) match = false;
          }
        }
        if (match) {
          const updatedRow = { ...row, ...this.actionData };
          updated.push(updatedRow);
          return updatedRow;
        }
        return row;
      });
      const dataResult = updated[0] || null;
      if (this.shouldReturnSingle) {
        return { data: dataResult, error: null };
      }
      return { data: updated, error: null };
    }

    if (this.action === 'delete') {
      const remaining = [];
      const deleted = [];
      for (const row of this.dbRef[this.table]) {
        let match = true;
        for (const f of this.filters) {
          if (f.type === 'eq') {
            if (row[f.field] !== f.value) match = false;
          }
        }
        if (match) {
          deleted.push(row);
        } else {
          remaining.push(row);
        }
      }
      this.dbRef[this.table] = remaining;
      return { data: deleted, error: null };
    }

    return { data: null, error: null };
  }

  then(onfulfilled, onrejected) {
    try {
      const res = this.execute();
      return Promise.resolve(res).then(onfulfilled, onrejected);
    } catch (err) {
      return Promise.reject(err).then(onfulfilled, onrejected);
    }
  }
}

const mockSupabase = {
  createClient: (url, key) => {
    return {
      auth: {
        signUp: async ({ email, password, options }) => {
          console.log(`[MOCK AUTH] Sign Up: ${email} with password: ${password}`);
          const existing = auth_users.find(u => u.email === email);
          if (existing) {
            console.log(`[MOCK AUTH] Sign Up Failed: User already exists`);
            return { data: { user: null }, error: new Error('User already registered') };
          }
          const id = 'auth-id-' + Math.random().toString(36).substring(2, 12);
          const user = {
            id,
            email,
            user_metadata: options?.data || {}
          };
          auth_users.push({ ...user, password });
          console.log(`[MOCK AUTH] Registered: ${email}. Total users: ${auth_users.length}`);
          return { data: { user }, error: null };
        },
        signInWithPassword: async ({ email, password }) => {
          console.log(`[MOCK AUTH] Sign In Attempt: ${email} with password: ${password}`);
          console.log(`[MOCK AUTH] Registered Users list:`, auth_users.map(u => ({ email: u.email, pwd: u.password })));
          const user = auth_users.find(u => u.email === email && u.password === password);
          if (!user) {
            console.log(`[MOCK AUTH] Sign In Failed: User not found or password mismatch`);
            return { data: { user: null, session: null }, error: new Error('Invalid login credentials') };
          }
          const token = 'token-' + user.id + '-' + Math.random().toString(36).substring(2, 10);
          auth_sessions.set(token, user.id);
          return {
            data: {
              user: { id: user.id, email: user.email, user_metadata: user.user_metadata },
              session: { access_token: token, refresh_token: 'refresh-' + token }
            },
            error: null
          };
        },
        getUser: async (token) => {
          const userId = auth_sessions.get(token);
          if (!userId) {
            return { data: { user: null }, error: new Error('Invalid token') };
          }
          const user = auth_users.find(u => u.id === userId);
          if (!user) {
            return { data: { user: null }, error: new Error('User not found') };
          }
          return {
            data: {
              user: { id: user.id, email: user.email, user_metadata: user.user_metadata }
            },
            error: null
          };
        },
        admin: {
          signOut: async (token) => {
            auth_sessions.delete(token);
            return { error: null };
          }
        },
        resetPasswordForEmail: async (email, options) => {
          return { data: {}, error: null };
        },
        updateUser: async (data, options) => {
          const authHeader = options?.headers?.Authorization;
          const token = authHeader?.split(' ')[1];
          const userId = auth_sessions.get(token);
          if (!userId) return { data: null, error: new Error('Unauthorized') };
          const user = auth_users.find(u => u.id === userId);
          if (user && data.password) {
            user.password = data.password;
          }
          return { data: { user }, error: null };
        }
      },
      from: (table) => {
        return new QueryBuilder(table, db);
      }
    };
  }
};

const mockAxios = {
  post: async (url, data, config) => {
    if (url.includes('/order')) {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      if (parsedData && parsedData.code === 'fail-service') {
        return {
          status: 200,
          data: {
            status: false,
            code: 400,
            message: 'Provider out of stock'
          }
        };
      }
      return {
        status: 200,
        data: {
          status: true,
          code: 200,
          data: {
            invoice_number: 'INV-MOCK-' + Date.now(),
            status: 'Sukses',
            ServiceName: '100 Diamonds',
            price: 10.00
          }
        }
      };
    }
    if (url.includes('/check-status')) {
      return {
        status: 200,
        data: {
          status: true,
          code: 200,
          data: {
            transaction_status: 'Sukses',
            serial_number: 'SN-MOCK-999',
            note: 'Top-up completed'
          }
        }
      };
    }
    if (url.includes('/product')) {
      return {
        status: 200,
        data: {
          status: true,
          code: 200,
          data: []
        }
      };
    }
    return { status: 404, data: { status: false, message: 'Not found' } };
  },
  get: async (url, config) => {
    return { status: 200, data: {} };
  },
  create: () => mockAxios
};

// Intercept loading
Module._load = function(request, parent, isMain) {
  if (request === '@supabase/supabase-js') {
    return mockSupabase;
  }
  if (request === 'axios') {
    return mockAxios;
  }
  if (request === 'express-rate-limit') {
    return () => (req, res, next) => next();
  }
  return originalLoad.apply(this, arguments);
};

// Create test HTTP bridge server
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const url = new URL(req.url, 'http://localhost');
  
  if (req.method === 'POST' && url.pathname === '/test-db/clear') {
    auth_users = [];
    auth_sessions.clear();
    db.users = [];
    db.orders = [];
    db.deposits = [];
    db.settings = [
      {
        id: 1,
        admin_emails: ['admin@orion.com'],
        provider_api_key: 'dev-secret-key',
        provider_secret_key: 'dev-secret-key',
        markups: { customer: 20, gold: 15, platinum: 10, business: 5 },
        role_settings: { minimumSpend: { gold: 500, platinum: 2000, business: 10000 }, autoUpgrade: true },
        vouchers: []
      }
    ];
    db.services = [
      {
        id: 'srv-1',
        srv_id: 'srv-1',
        nama: '100 Diamonds',
        name: '100 Diamonds',
        category: 'Mobile Legends',
        price_myr: 10.00,
        price_idr: 41110,
        price: 10.00,
        status: 'Aktif'
      },
      {
        id: 'srv-2',
        srv_id: 'srv-2',
        nama: '500 Diamonds',
        name: '500 Diamonds',
        category: 'Mobile Legends',
        price_myr: 50.00,
        price_idr: 205550,
        price: 50.00,
        status: 'Aktif'
      },
      {
        id: 'srv-3',
        srv_id: 'srv-3',
        nama: '1000 Tokens',
        name: '1000 Tokens',
        category: 'Honor of Kings',
        price_myr: 90.00,
        price_idr: 369990,
        price: 90.00,
        status: 'Aktif'
      }
    ];
    db.service_cache = [];
    res.end(JSON.stringify({ success: true }));
  } else if (req.method === 'POST' && url.pathname === '/test-db/insert') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { table, data } = payload;
        const rows = Array.isArray(data) ? data : [data];
        if (table === 'auth_users') {
          for (const row of rows) {
            auth_users.push(row);
          }
        } else if (db[table]) {
          for (const row of rows) {
            db[table].push(row);
          }
        } else {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: 'Table not found: ' + table }));
        }
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
  } else if (req.method === 'POST' && url.pathname === '/test-db/update') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { table, id, data } = payload;
        if (table === 'auth_users') {
          const idx = auth_users.findIndex(u => u.id === id);
          if (idx !== -1) {
            auth_users[idx] = { ...auth_users[idx], ...data };
          } else {
            res.statusCode = 404;
            return res.end(JSON.stringify({ success: false, error: 'User not found in auth_users' }));
          }
        } else if (db[table]) {
          const idx = db[table].findIndex(row => row.id === id);
          if (idx !== -1) {
            db[table][idx] = { ...db[table][idx], ...data };
          } else {
            res.statusCode = 404;
            return res.end(JSON.stringify({ success: false, error: 'Row not found in ' + table }));
          }
        } else {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: 'Table not found: ' + table }));
        }
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
  } else if (req.method === 'GET' && url.pathname === '/test-db/get') {
    const table = url.searchParams.get('table');
    if (table === 'auth_users') {
      res.end(JSON.stringify({ success: true, data: auth_users }));
    } else if (db[table]) {
      res.end(JSON.stringify({ success: true, data: db[table] }));
    } else {
      res.statusCode = 400;
      res.end(JSON.stringify({ success: false, error: 'Table not found' }));
    }
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(5001, '127.0.0.1', () => {
  console.log('Test DB bridge listening on http://127.0.0.1:5001');
});
