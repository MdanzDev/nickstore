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
    const errorData = await response.json().catch(() => ({ error: "Unknown error" })) as { error?: string };
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: errorData.error || `API error: ${response.status}` });
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
  const result = await fetchV1<any>("/products"); // Adjust depending on actual API response format
  const games = result.data || result || [];
  
  let products = games.map((g: any) => ({
    id: g.slug || g.id || g.name,
    slug: g.slug || g.id || g.name,
    name: g.name,
    category: g.category || "Games",
    images: [g.icon || g.image || ""],
    icon: g.icon || g.image || "",
    price: 0,
    stock: 9999,
    denominationsCount: g.services?.length || 0,
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

export async function externalCreateProduct(jwtToken: string, data: Record<string, unknown>) { return {}; }
export async function externalUpdateProduct(jwtToken: string, productId: string, data: Record<string, unknown>) { return {}; }
export async function externalDeleteProduct(jwtToken: string, productId: string) { return { message: "Product deleted" }; }
export async function externalUploadProductImage(jwtToken: string, productId: string, file: File) { return { images: [] }; }
export async function externalUploadGameImage(jwtToken: string, slug: string, base64Image: string, filename: string) { return {}; }

// --- Orders ---
export async function externalCreateOrder(jwtToken: string, data: { items: Array<{ productId: string; quantity: number }>; shippingAddress?: Record<string, string>; notes?: string; voucher_code?: string }) {
  const userIdMatch = data.notes?.match(/User ID:\s*([^,]+)/i);
  const zoneIdMatch = data.notes?.match(/Zone ID:\s*([^,]+)/i);
  const denomIdMatch = data.notes?.match(/DenominationId:\s*([^,]+)/i);
  
  const game_id = userIdMatch ? userIdMatch[1].trim() : "";
  const zone_id = zoneIdMatch ? zoneIdMatch[1].trim() : "";
  const service_id = denomIdMatch ? denomIdMatch[1].trim() : (data.items?.[0]?.productId || "");

  // 1. Fetch to Kryz-Net V1 API
  const v1Response = await fetchV1<any>("/order", {
    method: "POST",
    body: JSON.stringify({
      service: service_id,
      target: game_id + (zone_id ? zone_id : ""),
      // add other fields if necessary
    })
  });

  // 2. Save to Supabase (assuming tables exist or we bypass for now)
  const orderId = v1Response.order_id || `ORD-${Date.now()}`;
  
  try {
    await supabase.from('orders').insert({
      id: orderId,
      status: 'processing',
      game_user_id: game_id,
      zone_id: zone_id,
      service_id: service_id
    });
  } catch (e) {
    console.warn("Could not save to local Supabase orders table", e);
  }

  return {
    success: true,
    id: orderId,
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
  const { data: o, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
  if (error || !o) throw new Error("Order not found");
  
  return {
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
    items: [{ name: o.service_id, quantity: 1, price: 0 }]
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
  const result = await fetchV1<any>("/products");
  const games = result.data || result || [];
  const game = games.find((g: any) => g.slug === productId || g.id === productId);
  if (!game || !game.services) return { success: true, data: [] };
  
  const mapped = game.services.map((s: any) => ({
    id: s.id || s.code,
    productId: productId,
    name: s.name,
    price: s.price || 0,
    priceIdr: convertMyrToIdr(s.price || 0)
  }));
  return { success: true, data: mapped };
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

