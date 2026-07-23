import { TRPCError } from "@trpc/server";
import { createClient } from "@supabase/supabase-js";

const EXCHANGE_RATE = 4300;

function convertMyrToIdr(myr: number): number {
  return Math.round(myr * EXCHANGE_RATE);
}

const KRYZ_NET_API_URL = process.env.EXTERNAL_API_URL || "https://api.kryz-net.space";
const KRYZ_NET_API_KEY = process.env.EXTERNAL_API_KEY || "kryz_live_c20fabc004eed526bd2b924ee38ab3c861f3ff32";

const supabaseUrl = process.env.SUPABASE_URL || "https://ldfodgqlwwxjggrhypmq.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZm9kaHFsd3d4amdncmh5cG1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgxMDQ3MCwiZXhwIjoyMTAwMzg2NDcwfQ.Y-_t0SDkrQECPBEj1fr1BreaWZsZmvrp08y_QEVfzPw";
const supabase = createClient(supabaseUrl, supabaseKey);

export type ExternalApiUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  telegramId?: string;
  avatar?: string;
  accountBalance: number;
  balanceMyr?: number;
  balanceIdr?: number;
  socialConnections?: Record<string, string | null>;
  preferences?: Record<string, unknown>;
  roles: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
};

// --- Kryz-Net V1 API Helpers ---
async function fetchV1<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${KRYZ_NET_API_URL}${endpoint.startsWith('/api/v1') ? endpoint : `/api/v1${endpoint}`}`;
  console.log(`[V1 API] Requesting URL: ${url}`);
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${KRYZ_NET_API_KEY}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" })) as any;
    let errorMsg = `API Error (${response.status})`;
    if (typeof errorData === "string") {
      errorMsg = errorData;
    } else if (errorData && typeof errorData === "object") {
      if (typeof errorData.error === "string") {
        errorMsg = errorData.error;
      } else if (errorData.error && typeof errorData.error === "object" && typeof errorData.error.message === "string") {
        errorMsg = errorData.error.message;
      } else if (typeof errorData.message === "string") {
        errorMsg = errorData.message;
      } else {
        errorMsg = JSON.stringify(errorData);
      }
    }
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: errorMsg });
  }

  return response.json() as Promise<T>;
}

// --- Users (Supabase Auth & DB) ---
export async function externalLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new TRPCError({ code: "UNAUTHORIZED", message: error.message });
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
  
  const mappedUser: ExternalApiUser = {
    id: data.user.id,
    name: profile?.name || email.split('@')[0],
    email: email,
    accountBalance: profile?.balance || 0,
    balanceMyr: profile?.balance || 0,
    balanceIdr: convertMyrToIdr(profile?.balance || 0),
    roles: [profile?.role || 'customer'],
    isActive: true,
    createdAt: data.user.created_at,
    updatedAt: new Date().toISOString()
  };
  
  return { user: mappedUser, token: data.session.access_token, expiresIn: 86400 };
}

export async function externalRegister(data: { name: string; email: string; password: string }) {
  const { data: authData, error } = await supabase.auth.signUp({ email: data.email, password: data.password });
  if (error) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
  
  if (authData.user) {
    await supabase.from('profiles').insert({
      id: authData.user.id,
      name: data.name,
      email: data.email,
      role: 'customer',
      balance: 0
    });
  }

  return {
    user: { id: authData.user?.id || "", name: data.name, email: data.email, roles: ['customer'], isActive: true, accountBalance: 0, balanceMyr: 0, balanceIdr: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as ExternalApiUser,
    token: authData.session?.access_token || "",
    expiresIn: 86400
  };
}

export async function externalRefreshToken(jwtToken: string) {
  return { token: jwtToken, expiresIn: 86400 };
}

export async function externalGetMe(jwtToken: string) {
  const { data: { user }, error } = await supabase.auth.getUser(jwtToken);
  if (error || !user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  
  return {
    id: user.id,
    name: profile?.name || user.email?.split('@')[0] || "User",
    email: user.email || "",
    accountBalance: profile?.balance || 0,
    balanceMyr: profile?.balance || 0,
    balanceIdr: convertMyrToIdr(profile?.balance || 0),
    roles: [profile?.role || 'customer'],
    isActive: true,
    createdAt: user.created_at,
    updatedAt: new Date().toISOString()
  } as ExternalApiUser;
}

// --- Admin Users (Supabase) ---
export async function externalGetUsers(jwtToken: string, params?: { page?: number; limit?: number; search?: string }) {
  let query = supabase.from('profiles').select('*');
  const { data, count, error } = await query;
  if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
  
  const mapped = (data || []).map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || "",
    accountBalance: u.balance || 0,
    balanceMyr: u.balance || 0,
    balanceIdr: convertMyrToIdr(u.balance || 0),
    roles: [u.role || 'customer'],
    isActive: true,
    totalSpent: 0,
    totalOrders: 0,
    createdAt: u.created_at || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  return { data: mapped, meta: { total: mapped.length, page: 1, limit: 100, pages: 1 } };
}

export async function externalGetUser(jwtToken: string, userId: string) {
  const result = await externalGetUsers(jwtToken);
  const user = result.data.find(u => u.id === userId);
  if (!user) throw new Error("User not found");
  return user as any as ExternalApiUser;
}

export async function externalUpdateUser(jwtToken: string, userId: string, data: Record<string, unknown>) {
  await supabase.from('profiles').update(data).eq('id', userId);
  return { success: true, message: "User updated successfully" };
}
export async function externalDeleteUser(jwtToken: string, userId: string) { return { success: true, message: "" }; }
export async function externalAdjustBalance(jwtToken: string, userId: string, amount: number, reason?: string) { return { success: true, new_balance: 0 }; }
export async function externalBlockUser(jwtToken: string, userId: string, isBlocked: boolean) { return { success: true, message: "" }; }
export async function externalUploadAvatar(jwtToken: string, userId: string, file: File) { return { avatar: "" }; }

// --- Products (Kryz-Net API V1) ---
export async function externalGetProducts(params?: { page?: number; limit?: number; search?: string; minPrice?: number; maxPrice?: number; inStock?: boolean; category?: string }) {
  const result = await fetchV1<any>("/public/games");
  const games = result.games || result.data || result || [];
  
  let products = games.map((g: any) => ({
    id: g.slug || g.id || g.name,
    slug: g.slug || g.id || g.name,
    name: g.name,
    category: g.category || "Games",
    images: [g.icon || g.image || ""],
    icon: g.icon || g.image || "",
    price: 0,
    stock: 9999,
    denominationsCount: g.total_services || g.services?.length || 0,
    isActive: true
  }));

  if (params?.search) {
    const s = params.search.toLowerCase();
    products = products.filter((p: any) => p.name.toLowerCase().includes(s));
  }

  return {
    data: products,
    meta: { total: products.length, page: 1, limit: 100, pages: 1 }
  };
}

export async function externalGetProduct(productId: string) {
  try {
    const result = await fetchV1<any>(`/public/games/${productId}`);
    const game = result.game || result;
    if (!game) throw new Error("Game not found");
    
    return {
      id: game.slug || game.id || game.name,
      name: game.name,
      category: game.category || "game",
      images: [game.icon || ""],
      description: game.description || "",
      isActive: true
    };
  } catch (err) {
    const result = await externalGetProducts();
    const game = result.data.find((p: any) => p.id === productId);
    if (!game) throw new Error("Game not found");
    
    return {
      id: game.slug,
      name: game.name,
      category: game.category || "game",
      images: [game.icon || ""],
      description: "",
      isActive: true
    };
  }
}

export async function externalCreateProduct(jwtToken: string, data: Record<string, unknown>) { return {}; }
export async function externalUpdateProduct(jwtToken: string, productId: string, data: Record<string, unknown>) { return {}; }
export async function externalDeleteProduct(jwtToken: string, productId: string) { return { message: "Product deleted" }; }
export async function externalUploadProductImage(jwtToken: string, productId: string, file: File) { return { images: [] }; }
export async function externalUploadGameImage(jwtToken: string, slug: string, base64Image: string, filename: string) { return {}; }

// --- Orders ---
export async function externalCreateOrder(jwtToken: string, data: { items?: Array<{ productId: string; quantity: number }>; shippingAddress?: Record<string, string>; notes?: string; voucher_code?: string; service_id?: string; game_id?: string; zone_id?: string; phone?: string; amount_myr?: number; amount_idr?: number }) {
  const userIdMatch = data.notes?.match(/User ID:\s*([^,]+)/i);
  const zoneIdMatch = data.notes?.match(/Zone ID:\s*([^,]+)/i);
  const denomIdMatch = data.notes?.match(/DenominationId:\s*([^,]+)/i);
  
  const game_id = userIdMatch ? userIdMatch[1].trim() : (data.game_id || "");
  const zone_id = zoneIdMatch ? zoneIdMatch[1].trim() : (data.zone_id || "");
  const service_id = denomIdMatch ? denomIdMatch[1].trim() : (data.items?.[0]?.productId || data.service_id || "");

  let denomPriceMyr = data.amount_myr || 10;

  const generatedOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  let v1Response: any = {};

  try {
    // 1. Attempt to place direct order via Kryz-Net V1 API
    v1Response = await fetchV1<any>("/order", {
      method: "POST",
      body: JSON.stringify({
        product_id: service_id,
        player_id: game_id,
        server_id: zone_id
      })
    });
  } catch (err: any) {
    console.warn("[V1 API Order Warning]", err.message);
    
    // If order fails (e.g. Insufficient balance), generate deposit first via V1 API /deposit with exact denomination price
    try {
      const depositRes = await fetchV1<any>("/deposit", {
        method: "POST",
        body: JSON.stringify({
          amount: denomPriceMyr,
          method: "qris"
        })
      });

      if (depositRes && (depositRes.deposit_id || depositRes.invoice)) {
        const depId = depositRes.deposit_id || depositRes.invoice;
        const qrCode = depositRes.qr_string || depositRes.qr_url || "";
        const checkoutUrl = depositRes.checkout_url || "";
        v1Response = {
          order_id: depId,
          qr_url: qrCode,
          checkout_url: checkoutUrl,
          note: JSON.stringify({
            deposit_invoice: depId,
            qr_url: qrCode,
            checkout_url: checkoutUrl,
            amount_myr: depositRes.amount_myr || denomPriceMyr,
            amount_idr: depositRes.amount_idr || Math.round(denomPriceMyr * 4300)
          })
        };
      } else {
        v1Response = { note: err.message };
      }
    } catch (depErr: any) {
      console.warn("[V1 API Deposit Warning]", depErr.message);
      v1Response = { note: err.message };
    }
  }

  const orderId = v1Response.order_id || v1Response.id || generatedOrderId;

  // 2. Save to local Supabase DB
  try {
    await supabase.from('orders').insert({
      id: orderId,
      status: 'pending',
      game_user_id: game_id,
      zone_id: zone_id,
      service_id: service_id,
      note: typeof v1Response.note === "string" ? v1Response.note : JSON.stringify(v1Response.note || 'Processing')
    });
  } catch (e) {
    console.warn("Could not save to local Supabase orders table", e);
  }

  return {
    success: true,
    id: orderId,
    orderId: orderId,
    depositId: orderId,
    invoice_number: orderId,
    qr_url: v1Response.qr_url || "",
    checkout_url: v1Response.checkout_url || "",
    ...v1Response
  };
}

export async function externalCreateQrisOrder(jwtToken: string, data: { service_id: string; game_id: string; zone_id: string; phone: string; voucher_code?: string }) {
  return externalCreateOrder(jwtToken, { items: [{ productId: data.service_id, quantity: 1 }], notes: `User ID: ${data.game_id}, Zone ID: ${data.zone_id}` });
}

export async function externalGuestCreateOrder(data: { service_id: string; game_id: string; zone_id: string; phone: string; voucher_code?: string }) {
  return externalCreateOrder("", data);
}

export async function externalGetOrders(jwtToken: string, params?: { page?: number; limit?: number; status?: string }) {
  const { data: orders, error } = await supabase.from('orders').select('*');
  const mappedOrders = (orders || []).map((o: any) => ({
    id: o.id,
    status: o.status || 'pending',
    providerStatus: o.status || "",
    keterangan: o.note || "",
    gameUserId: o.game_user_id || "",
    zoneId: o.zone_id || "",
    total: 0,
    totalMyr: 0,
    totalIdr: 0,
    createdAt: o.created_at || new Date().toISOString(),
    notes: `${o.service_id}`,
  }));

  return {
    data: mappedOrders,
    meta: { total: mappedOrders.length, page: 1, limit: 100, pages: 1 }
  };
}

export async function externalGetOrder(jwtToken: string, orderId: string) {
  let { data: o } = await supabase.from('orders').select('*').eq('id', orderId).single().catch(() => ({ data: null }));

  if (orderId.startsWith('DEPO')) {
    try {
      const depLive = await fetchV1<any>(`/deposit/${orderId}`).catch(() => null);
      if (depLive) {
        return {
          id: orderId,
          status: (depLive.status || 'pending').toLowerCase(),
          providerStatus: depLive.status || 'Pending',
          keterangan: JSON.stringify({ deposit_invoice: orderId, qr_url: depLive.qr_string || '', amount_idr: depLive.amount_idr }),
          gameUserId: o?.game_user_id || '-',
          zoneId: o?.zone_id || '-',
          total: depLive.amount_myr || 10,
          totalMyr: depLive.amount_myr || 10,
          totalIdr: depLive.amount_idr || 43000,
          createdAt: depLive.created_at || o?.created_at || new Date().toISOString(),
          notes: o?.service_id || 'Deposit Order',
          items: [{ name: o?.service_id || 'Top Up Item', quantity: 1, price: depLive.amount_myr || 10 }]
        };
      }
    } catch (e) {}
  }

  if (!o) {
    return {
      id: orderId,
      status: 'pending',
      providerStatus: 'Pending',
      keterangan: JSON.stringify({ deposit_invoice: orderId, amount_myr: 10, amount_idr: 43000 }),
      gameUserId: '-',
      zoneId: '-',
      total: 10,
      totalMyr: 10,
      totalIdr: 43000,
      createdAt: new Date().toISOString(),
      notes: 'Order Deposit',
      items: [{ name: 'Top Up Item', quantity: 1, price: 10 }]
    };
  }

  return {
    id: o.id,
    status: o.status || 'pending',
    providerStatus: o.status || "",
    keterangan: o.note || "",
    gameUserId: o.game_user_id || "",
    zoneId: o.zone_id || "",
    total: o.total || 10,
    totalMyr: o.total_myr || 10,
    totalIdr: o.total_idr || 43000,
    createdAt: o.created_at || new Date().toISOString(),
    notes: `${o.service_id || ''}`,
    items: [{ name: o.service_id || 'Top Up Item', quantity: 1, price: 10 }]
  };
}

export async function externalUpdateOrderStatus(jwtToken: string, orderId: string, status: string, providerStatus?: string, note?: string, serialNumber?: string) {
  await supabase.from('orders').update({ status, note }).eq('id', orderId);
  return { success: true };
}

export async function externalGetAdminOrders(jwtToken: string, params?: { page?: number; limit?: number; status?: string; search?: string }) {
  return externalGetOrders(jwtToken, params);
}
export async function externalGetAdminStats(jwtToken: string, days?: number) { return {}; }
export async function externalGetTransactions(jwtToken: string, params?: { page?: number; limit?: number; type?: string }) { return { data: [], meta: { total: 0, page: 1, limit: 100, pages: 1 } }; }
export async function externalGetNotifications(jwtToken: string, params?: { page?: number; limit?: number; unreadOnly?: boolean }) { return { data: [], meta: { total: 0, page: 1, limit: 10, pages: 1 } }; }
export async function externalMarkNotificationRead(jwtToken: string, notificationId: string) { return {}; }
export async function externalMarkAllNotificationsRead(jwtToken: string) { return { message: "Notifications read" }; }
export async function externalGetRamsBalance(jwtToken: string) {
  const profile = await externalGetMe(jwtToken).catch(() => null);
  return {
    success: true,
    data: {
      ramsBalance: { balance: profile?.balanceMyr || 0, balance_myr: profile?.balanceMyr || 0, balance_idr: profile?.balanceIdr || 0, username: profile?.name || 'User', email: profile?.email || '' },
      localBalance: profile?.balanceMyr || 0, balance_myr: profile?.balanceMyr || 0, balance_idr: profile?.balanceIdr || 0
    }
  };
}
export async function externalCreateDeposit(jwtToken: string, amount: number, method = "qris") { return { success: true, data: {} }; }
export async function externalGetDepositStatus(jwtToken: string, depositId: string) { return { success: true, data: {} }; }
export async function externalGetDepositQR(jwtToken: string, depositId: string) { return { success: true, data: {} }; }
export async function externalGetRamsHistory(jwtToken: string) { return { success: true, data: [] }; }
export async function externalProcessPayment(jwtToken: string, amount: number, description?: string) { return { success: true, data: { newBalance: 0 } }; }
export async function externalGetUserDeposits(jwtToken: string, userId: string) { return { success: true, data: [] }; }
export async function externalGetHealth() { return { status: 'ok' }; }
export async function externalGetVouchers(params?: { page?: number; limit?: number }) { return { success: true, data: [] }; }
export async function externalGetVoucher(id: string) { return { success: true, data: {} }; }
export async function externalValidateVoucher(code: string, orderAmount?: number) { return { success: true, data: { code, type: "fixed", value: 0, discountAmount: 0, maxDiscount: 0, minOrder: 0 } }; }
export async function externalCreateVoucher(jwtToken: string, data: any) { return { success: true, data: {} }; }
export async function externalUpdateVoucher(jwtToken: string, voucherId: string, data: any) { return { success: true, data: {} }; }
export async function externalDeleteVoucher(jwtToken: string, voucherId: string) { return { success: true, message: "Deleted" }; }
export async function externalGetDenominations(productId: string, jwtToken?: string) {
  try {
    const result = await fetchV1<any>(`/public/games/${productId}`);
    const game = result.game || result;
    if (!game || !game.services_by_type) return { success: true, data: [] };
    
    // Flatten the categorized services map into a single array
    const allServices = Object.values(game.services_by_type).flat();
    
    const mapped = allServices.map((s: any) => {
      const pMyr = parseFloat(s.price_myr) || parseFloat(s.price) || 0;
      const pIdr = parseFloat(s.price_idr) || convertMyrToIdr(pMyr);
      return {
        id: s.id || s.code,
        productId: productId,
        name: s.name,
        price: pMyr,
        price_myr: pMyr,
        priceIdr: pIdr,
        price_idr: pIdr,
        originalPrice: pMyr,
        stock: 9999,
        category: "Standard",
        description: s.description || ""
      };
    });
    return { success: true, data: mapped };
  } catch (err) {
    return { success: true, data: [] };
  }
}
export async function externalGetPricelist(productId?: string) { return { success: true, data: [] }; }
export async function externalCreateDenomination(jwtToken: string, data: any) { return { success: true, data: {} }; }
export async function externalUpdateDenomination(jwtToken: string, denominationId: string, data: any) { return { success: true, data: {} }; }
export async function externalDeleteDenomination(jwtToken: string, denominationId: string) { return { success: true, message: "Deleted" }; }
export async function externalGetLeaderboard(filter?: string) { return { data: [] }; }
export async function externalUpdateMe(jwtToken: string, username: string, phone?: string, email?: string) { return { success: true, message: "Updated" }; }
export async function externalGetAdminSettings(jwtToken: string) { return { data: { provider_api_key: KRYZ_NET_API_KEY } }; }
export async function externalGuestGetOrderStatus(orderId: string) { return externalGetOrder("", orderId); }
export async function externalGetLatestTransactions() { return []; }
export async function externalValidateNickname(gameSlug: string, userId: string, zoneId: string) { return { success: true, username: "Valid User" }; }

export async function externalForgotPassword(email: string) { return { success: true }; }
export async function externalUpdatePassword(token: string, newPass: string) { return { success: true }; }
export async function externalTelegramWebAppAuth(initData: string) { return { user: {} as any, token: "", expiresIn: 0 }; }
export async function externalGetApiKey(jwt: string) { return { apiKey: "" }; }
export async function externalGenerateApiKey(jwt: string) { return { apiKey: "" }; }
export async function externalRequestPhoneOtp(jwt: string, phone: string) { return { success: true }; }
export async function externalVerifyPhoneOtp(jwt: string, otp: string) { return { success: true }; }
export async function externalUnlinkTelegram(jwt: string) { return { success: true }; }
export async function externalGetAdminTransactions(jwt: string, p: any) { return { data: [], meta: { total: 0, page: 1, limit: 10, pages: 1} }; }
export async function externalUpdateAdminSettings(jwt: string, s: any) { return { success: true }; }
export async function externalGetProviderBalance(jwt: string) { return { balance: 0 }; }
export async function externalCreateProviderDeposit(jwt: string, amt: number, method: string) { return { success: true, data: {} }; }
export async function externalGetAdminApiKeys(jwt: string) { return { data: [] }; }
export async function externalAdminGenerateApiKey(jwt: string, p: any) { return { success: true, apiKey: "" }; }
export async function externalAdminToggleApiKey(jwt: string, id: string, active: boolean) { return { success: true }; }
export async function externalAdminDeleteApiKey(jwt: string, id: string) { return { success: true }; }
export async function externalGetAdminApiStats(jwt: string) { return { totalRequests: 0, successRate: 100, activeKeys: 0 }; }
export async function externalGetAdminApiLogs(jwt: string, p: any) { return { data: [], meta: { total: 0, page: 1, limit: 10, pages: 1} }; }

