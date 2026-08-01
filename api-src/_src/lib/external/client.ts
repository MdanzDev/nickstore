import { TRPCError } from "@trpc/server";
import { createClient } from "@supabase/supabase-js";

const EXCHANGE_RATE = 4300;

function convertMyrToIdr(myr: number): number {
  return Math.round(myr * EXCHANGE_RATE);
}

const getKryzNetApiUrl = () => process.env.EXTERNAL_API_URL || "https://api.kryz-net.space";
const getKryzNetApiKey = () => process.env.EXTERNAL_API_KEY || "";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
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

// --- Kryz-Net V2 API Helpers ---
async function fetchV2<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const apiKey = getKryzNetApiKey();
  if (!apiKey) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "EXTERNAL_API_KEY not configured" });
  }
  const url = `${getKryzNetApiUrl()}${endpoint.startsWith("/api/v2") ? endpoint : `/api/v2${endpoint}`}`;
  const headers = new Headers(options.headers || {});
  headers.set("X-API-KEY", apiKey);
  headers.set("Content-Type", "application/json");

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null) as any;
    let errorMsg = `API Error (${response.status})`;
    if (errorData?.error?.message) {
      errorMsg = errorData.error.message;
    } else if (errorData?.error) {
      errorMsg = typeof errorData.error === "string" ? errorData.error : JSON.stringify(errorData.error);
    } else if (typeof errorData === "string") {
      errorMsg = errorData;
    }
    const trpcCode = response.status === 402 ? "PAYMENT_REQUIRED" : "INTERNAL_SERVER_ERROR";
    throw new TRPCError({ code: trpcCode as any, message: errorMsg });
  }

  return response.json() as Promise<T>;
}

// --- Users (Supabase Auth for login, users table for profiles) ---
export async function externalLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new TRPCError({ code: "UNAUTHORIZED", message: error.message });

  const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single();
  const { data: wallet } = await supabase.from("wallets").select("balance_myr").eq("user_id", data.user.id).maybeSingle();
  const balanceMyr = parseFloat(profile?.balance_myr || wallet?.balance_myr || 0);

  const mappedUser: ExternalApiUser = {
    id: data.user.id,
    name: profile?.username || profile?.name || email.split("@")[0],
    email: email,
    phone: profile?.phone || "",
    telegramId: profile?.telegram_id ? String(profile.telegram_id) : undefined,
    avatar: profile?.avatar || "",
    accountBalance: balanceMyr,
    balanceMyr: balanceMyr,
    balanceIdr: convertMyrToIdr(balanceMyr),
    roles: [profile?.role || "customer"],
    isActive: profile?.status !== "blocked",
    createdAt: data.user.created_at,
    updatedAt: new Date().toISOString(),
  };

  return { user: mappedUser, token: data.session.access_token, expiresIn: 86400 };
}

export async function externalRegister(data: { name: string; email: string; password: string }) {
  const { data: authData, error } = await supabase.auth.signUp({ email: data.email, password: data.password });
  if (error) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });

  if (authData.user) {
    await supabase.from("users").upsert({
      id: authData.user.id,
      username: data.name,
      email: data.email,
      role: "customer",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    await supabase.from("wallets").upsert({
      user_id: authData.user.id,
      balance_myr: 0,
      balance_idr: 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  }

  return {
    user: { id: authData.user?.id || "", name: data.name, email: data.email, roles: ["customer"], isActive: true, accountBalance: 0, balanceMyr: 0, balanceIdr: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as ExternalApiUser,
    token: authData.session?.access_token || "",
    expiresIn: 86400,
  };
}

export async function externalRefreshToken(jwtToken: string) {
  return { token: jwtToken, expiresIn: 86400 };
}

export async function externalGetMe(jwtToken: string) {
  const { data: { user }, error } = await supabase.auth.getUser(jwtToken);
  if (error || !user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
  const { data: wallet } = await supabase.from("wallets").select("balance_myr").eq("user_id", user.id).maybeSingle();
  const balanceMyr = parseFloat(wallet?.balance_myr || profile?.balance_myr || 0);

  return {
    id: user.id,
    name: profile?.username || profile?.name || user.email?.split("@")[0] || "User",
    email: user.email || profile?.email || "",
    phone: profile?.phone || "",
    telegramId: profile?.telegram_id ? String(profile.telegram_id) : undefined,
    avatar: profile?.avatar || "",
    accountBalance: balanceMyr,
    balanceMyr: balanceMyr,
    balanceIdr: convertMyrToIdr(balanceMyr),
    roles: [profile?.role || "customer"],
    isActive: profile?.status !== "blocked",
    createdAt: user.created_at || profile?.created_at,
    updatedAt: new Date().toISOString(),
  } as ExternalApiUser;
}

// --- Admin Users (from users table) ---
export async function externalGetUsers(jwtToken: string, params?: { page?: number; limit?: number; search?: string }) {
  let query = supabase.from("users").select("*", { count: "exact" });
  if (params?.search) {
    const s = `%${params.search}%`;
    query = query.or(`username.ilike.${s},email.ilike.${s},phone.ilike.${s}`);
  }
  const { data, count, error } = await query;
  if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

  const mapped = (data || []).map(async (u) => {
    const { data: wallet } = await supabase.from("wallets").select("balance_myr").eq("user_id", u.id).maybeSingle();
    const bal = parseFloat(wallet?.balance_myr || u.balance_myr || 0);
    return {
      id: u.id,
      name: u.username || u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      accountBalance: bal,
      balanceMyr: bal,
      balanceIdr: convertMyrToIdr(bal),
      roles: [u.role || "customer"],
      isActive: u.status !== "blocked",
      totalSpent: 0,
      totalOrders: 0,
      createdAt: u.created_at || new Date().toISOString(),
      updatedAt: u.updated_at || new Date().toISOString(),
    };
  });
  const resolved = await Promise.all(mapped);

  return { data: resolved, meta: { total: count || resolved.length, page: params?.page || 1, limit: params?.limit || 100, pages: 1 } };
}

export async function externalGetUser(jwtToken: string, userId: string) {
  const { data: u } = await supabase.from("users").select("*").eq("id", userId).single();
  if (!u) throw new Error("User not found");
  const { data: wallet } = await supabase.from("wallets").select("balance_myr").eq("user_id", userId).maybeSingle();
  const bal = parseFloat(wallet?.balance_myr || u.balance_myr || 0);
  return {
    id: u.id, name: u.username || u.name || "", email: u.email || "", phone: u.phone || "",
    accountBalance: bal, balanceMyr: bal, balanceIdr: convertMyrToIdr(bal),
    roles: [u.role || "customer"], isActive: u.status !== "blocked",
    totalSpent: 0, totalOrders: 0,
    createdAt: u.created_at || new Date().toISOString(), updatedAt: u.updated_at || new Date().toISOString(),
  } as any as ExternalApiUser;
}

export async function externalUpdateUser(jwtToken: string, userId: string, data: Record<string, unknown>) {
  await supabase.from("users").update(data).eq("id", userId);
  return { success: true, message: "User updated successfully" };
}

export async function externalDeleteUser(jwtToken: string, userId: string) {
  await supabase.from("users").delete().eq("id", userId);
  return { success: true, message: "" };
}

export async function externalAdjustBalance(jwtToken: string, userId: string, amount: number, reason?: string) {
  await supabase.rpc("increment_balance", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason || "Admin adjustment",
  });
  const { data: wallet } = await supabase.from("wallets").select("balance_myr").eq("user_id", userId).maybeSingle();
  return { success: true, new_balance: parseFloat(wallet?.balance_myr || 0) };
}

export async function externalBlockUser(jwtToken: string, userId: string, isBlocked: boolean) {
  await supabase.from("users").update({ status: isBlocked ? "blocked" : "active", updated_at: new Date().toISOString() }).eq("id", userId);
  return { success: true, message: "" };
}

export async function externalUploadAvatar(jwtToken: string, userId: string, file: File) { return { avatar: "" }; }

// --- Products Catalog (Kryz-Net V2) ---
export async function externalGetProducts(params?: { page?: number; limit?: number; search?: string; minPrice?: number; maxPrice?: number; inStock?: boolean; category?: string }) {
  try {
    const { games } = await fetchV2<{ success: boolean; games: any[] }>("/games");
    let products = (games || []).map((g: any) => ({
      id: g.slug,
      slug: g.slug,
      name: g.name,
      category: g.type || "game",
      images: [g.icon || ""],
      icon: g.icon || "",
      price: 0,
      stock: g.total_services || 9999,
      denominationsCount: g.total_services || 0,
      isActive: true,
      description: g.description || "",
      fulfillment_type: g.fulfillment_type || "auto",
      input_schema: g.input_schema || null,
      provider_slug: g.provider_slug || null,
    }));

    if (params?.search) {
      const s = params.search.toLowerCase();
      products = products.filter((p: any) => p.name.toLowerCase().includes(s));
    }

    if (params?.category && params.category !== "all") {
      products = products.filter((p: any) => p.category === params.category);
    }

    return { data: products, meta: { total: products.length, page: 1, limit: 100, pages: 1 } };
  } catch {
    return { data: [], meta: { total: 0, page: 1, limit: 100, pages: 1 } };
  }
}

export async function externalGetProduct(productId: string) {
  try {
    const { games } = await fetchV2<{ success: boolean; games: any[] }>("/games");
    const game = (games || []).find((g: any) => g.slug === productId);
    if (!game) throw new Error("Game not found");

    return {
      id: game.slug,
      name: game.name,
      category: game.type || "game",
      images: [game.icon || ""],
      icon: game.icon || "",
      description: game.description || "",
      isActive: true,
      fulfillment_type: game.fulfillment_type || "auto",
      input_schema: game.input_schema || null,
      provider_slug: game.provider_slug || null,
    };
  } catch (err) {
    const result = await externalGetProducts();
    const game = result.data.find((p: any) => p.id === productId);
    if (!game) throw new Error("Game not found");
    return {
      id: game.slug, name: game.name, category: game.category || "game",
      images: [game.icon || ""], description: game.description || "", isActive: true,
    };
  }
}

export async function externalGetDenominations(productId: string, jwtToken?: string) {
  try {
    const { denominations, game } = await fetchV2<{ success: boolean; game: string; denominations: any[] }>(`/denominations?game=${encodeURIComponent(productId)}`);
    if (!denominations) return { success: true, data: [] };

    const mapped = (denominations || []).map((d: any) => ({
      id: d.id,
      productId: productId,
      name: d.name,
      price: d.price_myr,
      price_myr: d.price_myr,
      priceIdr: d.price_idr,
      price_idr: d.price_idr,
      originalPrice: d.price_myr,
      stock: 9999,
      category: game || "Standard",
      description: d.description || "",
      fulfillment_type: d.fulfillment_type || "auto",
      input_schema: d.input_schema || null,
      isActive: true,
      createdAt: new Date().toISOString(),
    }));
    return { success: true, data: mapped };
  } catch {
    return { success: true, data: [] };
  }
}

export async function externalGetPricelist(productId?: string) {
  try {
    const { products } = await fetchV2<{ products: any[] }>("/products");
    const mapped = (products || []).map((p: any) => ({
      id: p.id,
      productId: p.game_slug || p.brand,
      name: p.name,
      brand: p.brand,
      price: p.price_myr,
      price_myr: p.price_myr,
      priceIdr: p.price_idr,
      price_idr: p.price_idr,
      stock: 9999,
      category: p.brand || "Standard",
      description: p.description || "",
    }));
    return { success: true, data: mapped };
  } catch {
    return { success: true, data: [] };
  }
}

// --- Orders (Kryz-Net V2 + local transactions) ---
export async function externalCreateOrder(
  jwtToken: string,
  data: {
    items?: Array<{ productId: string; quantity: number }>;
    shippingAddress?: Record<string, string>;
    notes?: string;
    voucher_code?: string;
    service_id?: string;
    game_id?: string;
    zone_id?: string;
    phone?: string;
    amount_myr?: number;
    amount_idr?: number;
  }
) {
  let productId = data.items?.[0]?.productId || data.service_id || "";
  let playerId = data.game_id || "";
  let serverId = data.zone_id || "";

  // Parse notes for legacy format: "User ID: xxx, Zone ID: yyy, DenominationId: zzz"
  if (data.notes) {
    const userIdMatch = data.notes.match(/User ID:\s*([^,]+)/i);
    const zoneIdMatch = data.notes.match(/Zone ID:\s*([^,]+)/i);
    const denomIdMatch = data.notes.match(/DenominationId:\s*([^,]+)/i);
    if (userIdMatch) playerId = userIdMatch[1].trim();
    if (zoneIdMatch) serverId = zoneIdMatch[1].trim();
    if (denomIdMatch) productId = denomIdMatch[1].trim();
  }

  if (!productId || !playerId) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Product ID and Player ID are required" });
  }

  const idempotencyKey = `NS-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  try {
    const v2Res = await fetchV2<any>("/order", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ product_id: productId, player_id: playerId, server_id: serverId || "" }),
    });

    const orderId = v2Res.order_id || `ORD-${Date.now()}`;
    const amountMyr = v2Res.amount_myr || data.amount_myr || 0;
    const amountIdr = v2Res.amount_idr || data.amount_idr || 0;

    // Save to local transactions
    const user = await externalGetMe(jwtToken).catch(() => null);
    try { await supabase.from("transactions").insert({
      reference_id: orderId,
      user_id: user?.id || null,
      product_id: productId,
      amount: amountMyr,
      status: v2Res.status === "Processing" ? "Processing" : "Pending",
      game_user_id: playerId,
      zone_id: serverId || "",
      note: data.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }); } catch {}

    return {
      success: true,
      id: orderId,
      orderId: orderId,
      invoice_number: orderId,
      amount_myr: amountMyr,
      amount_idr: amountIdr,
      status: v2Res.status,
      message: v2Res.message,
      qr_url: "",
      checkout_url: "",
    };
  } catch (err: any) {
    // If insufficient balance, try creating a deposit for the order amount
    if (err.message?.includes("Insufficient balance") || err.message?.includes("INSUFFICIENT_BALANCE")) {
      try {
        const depRes = await fetchV2<any>("/deposit", {
          method: "POST",
          body: JSON.stringify({ amount: data.amount_myr || 10, method: "qris" }),
        });

        const depId = depRes.deposit_id || "";
        const qrCode = depRes.qr_string || "";
        const checkoutUrl = depRes.checkout_url || "";

        const user = await externalGetMe(jwtToken).catch(() => null);
        try { await supabase.from("deposits").insert({
          user_id: user?.id || null,
          kryznet_deposit_id: depId,
          amount_myr: data.amount_myr || depRes.amount_myr || 10,
          amount_idr: data.amount_idr || depRes.amount_idr || 0,
          payment_method: "qris",
          qr_string: qrCode,
          checkout_url: checkoutUrl,
          status: "Pending",
          expired_at: depRes.expired_at || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          credited: false,
        }); } catch {}

        // Also save a pending transaction record
        const orderId = depId;
        try { await supabase.from("transactions").insert({
          reference_id: orderId,
          user_id: user?.id || null,
          product_id: productId,
          amount: data.amount_myr || 10,
          status: "Pending",
          game_user_id: playerId,
          zone_id: serverId || "",
          note: JSON.stringify({
            deposit_invoice: depId,
            qr_url: qrCode,
            checkout_url: checkoutUrl,
            amount_myr: data.amount_myr || depRes.amount_myr || 10,
            amount_idr: data.amount_idr || depRes.amount_idr || 0,
            pending_order: true,
            product_id: productId,
            player_id: playerId,
            server_id: serverId,
          }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }); } catch {}

        return {
          success: true,
          id: depId,
          orderId: depId,
          depositId: depId,
          invoice_number: depId,
          qr_url: qrCode,
          checkout_url: checkoutUrl,
          amount_myr: data.amount_myr || depRes.amount_myr || 10,
          amount_idr: data.amount_idr || depRes.amount_idr || 0,
          status: "Pending",
          note: JSON.stringify({
            deposit_invoice: depId,
            qr_url: qrCode,
            checkout_url: checkoutUrl,
            amount_myr: data.amount_myr || depRes.amount_myr || 10,
            amount_idr: data.amount_idr || depRes.amount_idr || 0,
            pending_order: true,
          }),
        };
      } catch (depErr: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: depErr.message || "Deposit creation failed" });
      }
    }
    throw err;
  }
}

export async function externalCreateQrisOrder(jwtToken: string, data: { service_id: string; game_id: string; zone_id: string; phone: string; voucher_code?: string }) {
  return externalCreateOrder(jwtToken, {
    items: [{ productId: data.service_id, quantity: 1 }],
    notes: `User ID: ${data.game_id}${data.zone_id ? `, Zone ID: ${data.zone_id}` : ""}`,
    service_id: data.service_id,
    game_id: data.game_id,
    zone_id: data.zone_id,
    phone: data.phone,
    voucher_code: data.voucher_code,
  });
}

export async function externalGuestCreateOrder(data: { service_id: string; game_id: string; zone_id: string; phone: string; voucher_code?: string }) {
  return externalCreateOrder("", {
    items: [{ productId: data.service_id, quantity: 1 }],
    notes: `User ID: ${data.game_id}${data.zone_id ? `, Zone ID: ${data.zone_id}` : ""}`,
    service_id: data.service_id,
    game_id: data.game_id,
    zone_id: data.zone_id,
    phone: data.phone,
    voucher_code: data.voucher_code,
  });
}

export async function externalGetOrders(jwtToken: string, params?: { page?: number; limit?: number; status?: string }) {
  const user = await externalGetMe(jwtToken).catch(() => null);
  if (!user) return { data: [], meta: { total: 0, page: 1, limit: 100, pages: 1 } };

  let query = supabase.from("transactions").select("*", { count: "exact" }).eq("user_id", user.id).order("created_at", { ascending: false });
  if (params?.status) query = query.eq("status", params.status);

  const { data: orders, count, error } = await query;
  if (error) return { data: [], meta: { total: 0, page: 1, limit: 100, pages: 1 } };

  const mapped = (orders || []).map((o: any) => ({
    id: o.reference_id || o.id,
    status: o.status || "pending",
    providerStatus: o.status || "",
    keterangan: o.note || "",
    gameUserId: o.game_user_id || "",
    zoneId: o.zone_id || "",
    total: parseFloat(o.amount || 0),
    totalMyr: parseFloat(o.amount || 0),
    totalIdr: convertMyrToIdr(parseFloat(o.amount || 0)),
    createdAt: o.created_at || new Date().toISOString(),
    notes: `${o.product_id || ""}`,
  }));

  return { data: mapped, meta: { total: count || mapped.length, page: params?.page || 1, limit: params?.limit || 100, pages: 1 } };
}

export async function externalGetOrder(jwtToken: string, orderId: string) {
  // Check local transactions first
  const { data: tx } = await supabase.from("transactions").select("*").eq("reference_id", orderId).maybeSingle();

  // Try live status from v2
  let v2Status: any = null;
  try {
    v2Status = await fetchV2<any>(`/order/${orderId}`);
  } catch {}

  // Check deposit status for DEPO-* or invoice-style IDs
  if (orderId.startsWith("DEPO") || orderId.startsWith("PG-") || (tx?.note && tx.note.includes("deposit_invoice"))) {
    try {
      const depId = orderId.startsWith("DEPO") || orderId.startsWith("PG-") ? orderId : "";
      const depLive = depId ? await fetchV2<any>(`/deposit/${depId}`).catch(() => null) : null;
      if (depLive) {
        return {
          id: orderId,
          type: "deposit",
          status: (depLive.status || "pending").toLowerCase(),
          providerStatus: depLive.status || "Pending",
          keterangan: JSON.stringify({
            deposit_invoice: orderId,
            qr_url: depLive.qr_string || "",
            amount_idr: depLive.amount_idr,
            pending_order: tx?.note?.includes("pending_order") || false,
          }),
          gameUserId: tx?.game_user_id || "-",
          zoneId: tx?.zone_id || "-",
          total: depLive.amount_myr || parseFloat(tx?.amount || 0),
          totalMyr: depLive.amount_myr || parseFloat(tx?.amount || 0),
          totalIdr: depLive.amount_idr || 0,
          createdAt: depLive.created_at || tx?.created_at || new Date().toISOString(),
          notes: tx?.product_id || "Deposit Order",
          items: [{ name: tx?.product_id || "Top Up Item", quantity: 1, price: depLive.amount_myr || 10 }],
        };
      }
    } catch {}
  }

  if (v2Status) {
    return {
      id: orderId,
      type: "order",
      status: (v2Status.status || "pending").toLowerCase(),
      providerStatus: v2Status.status || "Pending",
      keterangan: tx?.note || "",
      gameUserId: tx?.game_user_id || v2Status.target_user_id || "-",
      zoneId: tx?.zone_id || "-",
      total: v2Status.amount_myr || parseFloat(tx?.amount || 0),
      totalMyr: v2Status.amount_myr || parseFloat(tx?.amount || 0),
      totalIdr: v2Status.amount_idr || 0,
      createdAt: v2Status.created_at || tx?.created_at || new Date().toISOString(),
      notes: `${tx?.product_id || ""}`,
      items: [{ name: tx?.product_id || "Top Up Item", quantity: 1, price: v2Status.amount_myr || parseFloat(tx?.amount || 0) }],
    };
  }

  if (tx) {
    const noteJson = (() => { try { return JSON.parse(tx.note || "{}"); } catch { return {}; } })();
    return {
      id: tx.reference_id || tx.id,
      type: "order",
      status: tx.status || "pending",
      providerStatus: tx.status || "",
      keterangan: tx.note || "",
      gameUserId: tx.game_user_id || "",
      zoneId: tx.zone_id || "",
      total: parseFloat(tx.amount || 0),
      totalMyr: parseFloat(tx.amount || 0),
      totalIdr: convertMyrToIdr(parseFloat(tx.amount || 0)),
      createdAt: tx.created_at || new Date().toISOString(),
      notes: `${tx.product_id || ""}`,
      items: [{ name: tx.product_id || "Top Up Item", quantity: 1, price: parseFloat(tx.amount || 0) }],
      qr_url: noteJson.qr_url || "",
      checkout_url: noteJson.checkout_url || "",
      deposit_invoice: noteJson.deposit_invoice || "",
    };
  }

  return {
    id: orderId,
    type: "order",
    status: "pending",
    providerStatus: "Pending",
    keterangan: "",
    gameUserId: "-",
    zoneId: "-",
    total: 10,
    totalMyr: 10,
    totalIdr: 43000,
    createdAt: new Date().toISOString(),
    notes: "Order not found",
    items: [],
  };
}

export async function externalGuestGetOrderStatus(orderId: string) {
  return externalGetOrder("", orderId);
}

export async function externalUpdateOrderStatus(jwtToken: string, orderId: string, status: string, providerStatus?: string, note?: string, serialNumber?: string) {
  await supabase.from("transactions").update({
    status: status,
    note: note || undefined,
    updated_at: new Date().toISOString(),
  }).eq("reference_id", orderId);
  return { success: true };
}

export async function externalGetAdminOrders(jwtToken: string, params?: { page?: number; limit?: number; status?: string; search?: string }) {
  let query = supabase.from("transactions").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (params?.status) query = query.eq("status", params.status);
  if (params?.search) {
    const s = `%${params.search}%`;
    query = query.or(`reference_id.ilike.${s},product_id.ilike.${s},game_user_id.ilike.${s}`);
  }

  const { data: orders, count } = await query;

  const mapped = (orders || []).map((o: any) => ({
    id: o.reference_id || o.id,
    status: o.status || "pending",
    providerStatus: o.status || "",
    keterangan: o.note || "",
    gameUserId: o.game_user_id || "",
    zoneId: o.zone_id || "",
    total: parseFloat(o.amount || 0),
    totalMyr: parseFloat(o.amount || 0),
    totalIdr: convertMyrToIdr(parseFloat(o.amount || 0)),
    createdAt: o.created_at || new Date().toISOString(),
    notes: `${o.product_id || ""}`,
    userId: o.user_id || "",
  }));

  return { data: mapped, meta: { total: count || mapped.length, page: params?.page || 1, limit: params?.limit || 100, pages: 1 } };
}

export async function externalGetAdminStats(jwtToken: string, days?: number) {
  const { data: orders } = await supabase.from("transactions").select("status, amount, created_at");
  const total = orders?.length || 0;
  const success = orders?.filter((o: any) => o.status === "Success" || o.status === "delivered").length || 0;
  const pending = orders?.filter((o: any) => o.status === "Pending" || o.status === "Processing").length || 0;
  const failed = orders?.filter((o: any) => o.status === "Failed" || o.status === "cancelled").length || 0;
  const totalRevenue = orders?.reduce((sum: number, o: any) => sum + parseFloat(o.amount || 0), 0) || 0;

  return {
    totalOrders: total,
    successOrders: success,
    pendingOrders: pending,
    failedOrders: failed,
    totalRevenue,
    totalRevenueMyr: totalRevenue,
    totalRevenueIdr: convertMyrToIdr(totalRevenue),
    totalUsers: 0,
    totalProfitMyr: 0,
    processingOrders: pending,
    completedOrders: success,
    refundOrders: 0,
    topProducts: [] as Array<{ name: string; total: number; id: string; slug: string; sold: number; revenue: number }>,
    chartData: [] as Array<{ total: number; berjaya: number; proses: number; gagal: number }>,
  };
}

export async function externalGetLatestTransactions() {
  const { data: txs } = await supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(20);
  return (txs || []).map((tx: any) => ({
    id: tx.reference_id || tx.id,
    status: tx.status || "pending",
    productName: tx.product_id || "Top Up",
    amount: parseFloat(tx.amount || 0),
    createdAt: tx.created_at || new Date().toISOString(),
  }));
}

export async function externalValidateNickname(gameSlug: string, userId: string, zoneId: string) {
  try {
    const result = await fetchV2<any>("/validate-account", {
      method: "POST",
      body: JSON.stringify({ game_slug: gameSlug, player_id: userId, zone_id: zoneId }),
    });
    return { success: true, username: result.nickname || "Valid User" };
  } catch (err: any) {
    return { success: false, username: "", error: err.message };
  }
}

// --- Balance & Wallet ---
export async function externalGetRamsBalance(jwtToken: string) {
  const profile = await externalGetMe(jwtToken).catch(() => null);
  const balanceMyr = profile?.balanceMyr || 0;

  // Also check live v2 balance
  let v2Balance = balanceMyr;
  try {
    const v2Profile = await fetchV2<any>("/profile");
    v2Balance = v2Profile.balance_myr || balanceMyr;
  } catch {}

  return {
    success: true,
    data: {
      ramsBalance: { balance: balanceMyr, balance_myr: balanceMyr, balance_idr: convertMyrToIdr(balanceMyr), username: profile?.name || "User", email: profile?.email || "" },
      localBalance: balanceMyr,
      balance_myr: balanceMyr,
      balance_idr: convertMyrToIdr(balanceMyr),
      providerBalance: v2Balance,
    },
  };
}

export async function externalCreateDeposit(jwtToken: string, amount: number, method = "qris") {
  const user = await externalGetMe(jwtToken).catch(() => null);
  const v2Res = await fetchV2<any>("/deposit", {
    method: "POST",
    body: JSON.stringify({ amount, method }),
  });

  try { await supabase.from("deposits").insert({
    user_id: user?.id || null,
    kryznet_deposit_id: v2Res.deposit_id,
    amount_myr: amount,
    amount_idr: v2Res.amount_idr || convertMyrToIdr(amount),
    payment_method: method,
    qr_string: v2Res.qr_string || "",
    checkout_url: v2Res.checkout_url || "",
    status: "Pending",
    expired_at: v2Res.expired_at || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    credited: false,
  }); } catch {}

  return {
    success: true,
    data: {
      depositId: v2Res.deposit_id,
      qrImage: v2Res.qr_string || "",
      qrString: v2Res.qr_string || "",
      totalAmount: amount,
      creditAmount: amount,
      uniqueCode: 0,
      expiredAt: v2Res.expired_at || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      instructions: "Scan QR code to pay",
      checkoutUrl: v2Res.checkout_url || "",
    },
  };
}

export async function externalGetDepositStatus(jwtToken: string, depositId: string) {
  try {
    const v2Res = await fetchV2<any>(`/deposit/${depositId}`);
    const status = v2Res.status === "Success" ? "success" : v2Res.status === "Expired" ? "expired" : "pending";

    // On success, credit local wallet if not already credited
    if (status === "success") {
      const { data: dep } = await supabase.from("deposits").select("credited, user_id, amount_myr").eq("kryznet_deposit_id", depositId).maybeSingle();
      if (dep && !dep.credited && dep.user_id) {
        try { await supabase.rpc("increment_balance", {
          p_user_id: dep.user_id,
          p_amount: parseFloat(dep.amount_myr || 0),
          p_reason: `Deposit ${depositId} paid`,
        }); } catch {}
        try { await supabase.from("deposits").update({ status: "Success", credited: true, updated_at: new Date().toISOString() }).eq("kryznet_deposit_id", depositId); } catch {}
      }
    }

    return { success: true, data: { status } };
  } catch {
    return { success: true, data: { status: "pending" } };
  }
}

export async function externalGetDepositQR(jwtToken: string, depositId: string) {
  try {
    const v2Res = await fetchV2<any>(`/deposit/${depositId}`);
    return { success: true, data: { qr_string: v2Res.qr_string || "" } };
  } catch {
    return { success: true, data: { qr_string: "" } };
  }
}

export async function externalGetRamsHistory(jwtToken: string) {
  const user = await externalGetMe(jwtToken).catch(() => null);
  if (!user) return { success: true, data: { localDeposits: [] } };

  const { data: txs } = await supabase.from("wallet_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  const { data: deps } = await supabase.from("deposits").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);

  const localDeposits = (deps || []).map((d: any) => ({
    depositId: d.kryznet_deposit_id,
    amount: parseFloat(d.amount_myr || 0),
    creditAmount: parseFloat(d.amount_myr || 0),
    status: d.status === "Success" ? "success" : d.status === "Expired" ? "expired" : "pending",
    completed: d.status === "Success",
    createdAt: d.created_at,
  }));

  return { success: true, data: { localDeposits } };
}

export async function externalProcessPayment(jwtToken: string, amount: number, description?: string) {
  return { success: true, data: { newBalance: 0 } };
}

export async function externalGetUserDeposits(jwtToken: string, userId: string) {
  const { data: deps } = await supabase.from("deposits").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return { success: true, data: (deps || []).map((d: any) => ({
    depositId: d.kryznet_deposit_id,
    amount: parseFloat(d.amount_myr || 0),
    status: d.status,
    createdAt: d.created_at,
  })) };
}

// --- Leaderboard (from transactions) ---
export async function externalGetLeaderboard(filter?: string) {
  try {
    const { data: txns } = await supabase.from("transactions").select("user_id, amount, status").eq("status", "Success");
    const byUser: Record<string, { totalMyr: number; orders: number }> = {};
    (txns || []).forEach((t: any) => {
      if (!t.user_id) return;
      if (!byUser[t.user_id]) byUser[t.user_id] = { totalMyr: 0, orders: 0 };
      byUser[t.user_id].totalMyr += parseFloat(t.amount || 0);
      byUser[t.user_id].orders += 1;
    });

    const leaderboard = Object.entries(byUser)
      .sort((a, b) => b[1].totalMyr - a[1].totalMyr)
      .slice(0, 50)
      .map(([userId, stats], i) => ({
        rank: i + 1,
        id: userId,
        name: userId.substring(0, 8),
        totalMyr: stats.totalMyr,
        totalIdr: convertMyrToIdr(stats.totalMyr),
        orders: stats.orders,
        favorite: "Mobile Legends",
      }));

    return { data: leaderboard };
  } catch {
    return { data: [] };
  }
}

// --- Health ---
export async function externalGetHealth() {
  try {
    const profile = await fetchV2<any>("/profile");
    return { status: "ok", providerBalance: profile.balance_myr || 0 };
  } catch {
    return { status: "degraded" };
  }
}

// --- Settings ---
export async function externalGetAdminSettings(jwtToken: string) {
  const apiKey = getKryzNetApiKey();
  return { data: { provider_api_key: apiKey, markups: { customer: 5, gold: 3, platinum: 2, business: 1 }, role_settings: { autoUpgrade: false, minimumSpend: { gold: 500, platinum: 2000, business: 10000 } }, admin_emails: [] as string[], provider_secret_key: "" } };
}

export async function externalUpdateAdminSettings(jwtToken: string, settings: any) {
  return { success: true };
}

export async function externalGetProviderBalance(jwtToken: string) {
  try {
    const profile = await fetchV2<any>("/profile");
    return { balance: profile.balance_myr || 0, membership: "customer", name: profile.username || "Provider", email: "" };
  } catch {
    return { balance: 0, membership: "customer", name: "Provider", email: "" };
  }
}

export async function externalCreateProviderDeposit(jwtToken: string, amount: number, method: string) {
  return externalCreateDeposit(jwtToken, amount, method);
}

// --- Stubs (features not yet connected to v2 + auth) ---
export async function externalGetTransactions(jwtToken: string, params?: { page?: number; limit?: number; type?: string }) {
  return { data: [], meta: { total: 0, page: 1, limit: 100, pages: 1 } };
}

export async function externalGetAdminTransactions(jwtToken: string, p: any) {
  return { data: [], meta: { total: 0, page: 1, limit: 10, pages: 1 } };
}

export async function externalGetNotifications(jwtToken: string, params?: any) {
  return { data: [], meta: { total: 0, page: 1, limit: 10, pages: 1 } };
}

export async function externalMarkNotificationRead(jwtToken: string, notificationId: string) {
  return {};
}

export async function externalMarkAllNotificationsRead(jwtToken: string) {
  return { message: "Notifications read" };
}

export async function externalGetVouchers(params?: any) {
  return { success: true, data: [] };
}

export async function externalGetVoucher(id: string) {
  return { success: true, data: {} };
}

export async function externalValidateVoucher(code: string, orderAmount?: number) {
  return { success: true, data: { code, type: "fixed", value: 0, discountAmount: 0, maxDiscount: 0, minOrder: 0 } };
}

export async function externalCreateVoucher(jwtToken: string, data: any) {
  return { success: true, data: {} };
}

export async function externalUpdateVoucher(jwtToken: string, voucherId: string, data: any) {
  return { success: true, data: {} };
}

export async function externalDeleteVoucher(jwtToken: string, voucherId: string) {
  return { success: true, message: "Deleted" };
}

export async function externalCreateProduct(jwtToken: string, data: Record<string, unknown>) {
  return {};
}

export async function externalUpdateProduct(jwtToken: string, productId: string, data: Record<string, unknown>) {
  return {};
}

export async function externalDeleteProduct(jwtToken: string, productId: string) {
  return { message: "Product deleted" };
}

export async function externalUploadProductImage(jwtToken: string, productId: string, file: File) {
  return { images: [] };
}

export async function externalUploadGameImage(jwtToken: string, slug: string, base64Image: string, filename: string) {
  return {};
}

export async function externalCreateDenomination(jwtToken: string, data: any) {
  return { success: true, data: {} };
}

export async function externalUpdateDenomination(jwtToken: string, denominationId: string, data: any) {
  return { success: true, data: {} };
}

export async function externalDeleteDenomination(jwtToken: string, denominationId: string) {
  return { success: true, message: "Deleted" };
}

export async function externalUpdateMe(jwtToken: string, username: string, phone?: string, email?: string) {
  return { success: true, message: "Updated" };
}

export async function externalForgotPassword(email: string) {
  return { success: true };
}

export async function externalUpdatePassword(token: string, newPass: string) {
  return { success: true };
}

export async function externalTelegramWebAppAuth(initData: any) {
  return { user: {} as any, token: "", expiresIn: 0 };
}

export async function externalGetApiKey(jwt: string) {
  return { api_key: { key_prefix: "", last_used_at: null } };
}

export async function externalGenerateApiKey(jwt: string) {
  return { success: true, api_key: "", message: "API key generated" };
}

export async function externalRequestPhoneOtp(phone: string, jwtToken?: string) {
  return { success: true };
}

export async function externalVerifyPhoneOtp(phone: string, otp: string, jwtToken?: string) {
  return { success: true };
}

export async function externalUnlinkTelegram(jwt: string) {
  return { success: true };
}

export async function externalGetAdminApiKeys(jwt: string) {
  return { keys: [] };
}

export async function externalAdminGenerateApiKey(jwt: string, p: any) {
  return { success: true, api_key: "", message: "API key generated" };
}

export async function externalAdminToggleApiKey(jwt: string, id: string, active: boolean) {
  return { success: true, message: `API key ${active ? 'activated' : 'deactivated'}` };
}

export async function externalAdminDeleteApiKey(jwt: string, id: string) {
  return { success: true };
}

export async function externalGetAdminApiStats(jwt: string) {
  return { stats: { totalRequests: 0, successRate: 100, activeKeys: 0, totalKeys: 0, totalApiOrders: 0, totalApiRevenue: 0, readRateLimit: "60/min", orderRateLimit: "10/min" } };
}

export async function externalGetAdminApiLogs(jwt: string, p: any) {
  return { logs: [], pagination: { page: 1, pages: 1, total: 0, totalPages: 1 } };
}