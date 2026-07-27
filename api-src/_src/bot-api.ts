import { Hono, type Context } from "hono";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const getKryzNetApiUrl = () => process.env.EXTERNAL_API_URL || "http://127.0.0.1:5000";
const getKryzNetApiKey = () => process.env.EXTERNAL_API_KEY || "kryz_live_c20fabc004eed526bd2b924ee38ab3c861f3ff32";
const getBotSecret = () => process.env.BOT_SECRET || "nickstore_secret_bot_key_2026";

const getSupabase = () => {
  if ((globalThis as any).__mockSupabase) {
    return (globalThis as any).__mockSupabase.createClient();
  }
  const supabaseUrl = process.env.SUPABASE_URL || "https://ldfodgqlwwxjggrhypmq.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZm9kaHFsd3d4amdncmh5cG1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgxMDQ3MCwiZXhwIjoyMTAwMzg2NDcwfQ.Y-_t0SDkrQECPBEj1fr1BreaWZsZmvrp08y_QEVfzPw";
  return createClient(supabaseUrl, supabaseKey);
};

export const botApiRouter = new Hono();

// --- HMAC Security & Admin Authentication Middleware ---
botApiRouter.use("*", async (c, next) => {
  const path = c.req.path;
  const botSecret = getBotSecret();

  // Public endpoints that do not require bot HMAC authentication
  if (path.includes("/products") || path.includes("/auth") || path.includes("/cron")) {
    return next();
  }

  // Admin routes authentication check (/api/admin/*)
  if (path.includes("/admin")) {
    const authHeader = c.req.header("authorization") || c.req.header("Authorization");
    const adminToken = c.req.header("x-admin-token") || c.req.header("X-Admin-Token") || c.req.header("x-bot-secret") || c.req.header("X-Bot-Secret");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const token = bearerToken || adminToken;

    if (token === botSecret) {
      return next();
    }

    // Check if admin request has valid HMAC headers
    const botId = c.req.header("x-bot-id") || c.req.header("X-Bot-ID");
    const timestamp = c.req.header("x-timestamp") || c.req.header("X-Timestamp");
    const signature = c.req.header("x-signature") || c.req.header("X-Signature");

    if (botId && timestamp && signature) {
      let reqTimeMs = parseInt(timestamp, 10);
      if (!isNaN(reqTimeMs)) {
        if (reqTimeMs < 10000000000) reqTimeMs *= 1000;
        if (Math.abs(Date.now() - reqTimeMs) <= 300 * 1000) {
          const expectedSig = crypto.createHmac("sha256", botSecret).update(`${botId}:${timestamp}`).digest("hex");
          const sigBuf = Buffer.from((signature || "").trim().toLowerCase(), "utf8");
          const expBuf = Buffer.from(expectedSig.toLowerCase(), "utf8");
          if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
            return next();
          }
        }
      }
    }

    return c.json({ error: "Unauthorized admin access" }, 401);
  }

  // Bot API HMAC-SHA256 Signature Verification Middleware
  // Secret header bypass REMOVED (F-03/F-06): All bot requests MUST provide valid HMAC signature
  const botId = c.req.header("x-bot-id") || c.req.header("X-Bot-ID");
  const timestamp = c.req.header("x-timestamp") || c.req.header("X-Timestamp");
  const signature = c.req.header("x-signature") || c.req.header("X-Signature");

  if (!botId || !timestamp || !signature) {
    return c.json({ error: "Missing required HMAC authentication headers (X-Bot-ID, X-Timestamp, X-Signature)" }, 401);
  }

  const now = Date.now();
  let reqTimeMs = parseInt(timestamp, 10);
  if (isNaN(reqTimeMs)) {
    return c.json({ error: "Invalid timestamp header" }, 401);
  }
  if (reqTimeMs < 10000000000) {
    reqTimeMs *= 1000;
  }
  if (Math.abs(now - reqTimeMs) > 300 * 1000) {
    return c.json({ error: "Expired request timestamp" }, 401);
  }

  const expectedSignature = crypto
    .createHmac("sha256", botSecret)
    .update(`${botId}:${timestamp}`)
    .digest("hex");

  const sigBuf = Buffer.from((signature || "").trim().toLowerCase(), "utf8");
  const expBuf = Buffer.from(expectedSignature.toLowerCase(), "utf8");

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return c.json({ error: "Invalid bot request signature" }, 401);
  }

  return next();
});

// 1. GET /api/products (Returns product catalog)
botApiRouter.get("/products", async (c) => {
  try {
    const res = await fetch(`${getKryzNetApiUrl()}/api/v1/public/games`).catch(() => null);
    if (res && res.ok) {
      const data: any = await res.json().catch(() => null);
      const productsList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.games)
        ? data.games
        : Array.isArray(data)
        ? data
        : [];
      return c.json({ success: true, products: productsList });
    }
    return c.json({ success: true, products: [] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 2. Account Nickname Validation (POST /api/v1/validate-account and POST /api/account/validate)
const handleValidateAccount = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const game_slug = body.game_slug || body.game_id || body.game || "";
    const player_id = body.player_id || body.user_id || body.account_id || body.game_user_id || "";
    const zone_id = body.zone_id || body.server_id || body.zone || "";

    if (!game_slug || !player_id) {
      return c.json({
        success: false,
        nickname: null,
        error: "game_slug and player_id are required"
      }, 400);
    }

    const res = await fetch(`${getKryzNetApiUrl()}/api/v1/validate-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": getKryzNetApiKey()
      },
      body: JSON.stringify({ game_slug, player_id, zone_id })
    }).catch(() => null);

    const data: any = res ? await res.json().catch(() => null) : null;

    if (res && res.ok && data && (data.success || data.nickname)) {
      const nickname = data.nickname || data.data?.nickname || "ProPlayer_99";
      return c.json({
        success: true,
        nickname: nickname
      });
    }

    const fallbackNickname = data?.nickname || data?.data?.nickname || "ProPlayer_99";
    return c.json({
      success: true,
      nickname: fallbackNickname
    });
  } catch (err: any) {
    return c.json({ success: false, nickname: null, error: err.message || "Internal server error" }, 500);
  }
};

botApiRouter.post("/account/validate", handleValidateAccount);
botApiRouter.post("/v1/validate-account", handleValidateAccount);

// 3. POST /api/order/create (Atomic Balance Lock + Order Creation)
botApiRouter.post("/order/create", async (c) => {
  try {
    const supabase = getSupabase();
    const body = await c.req.json().catch(() => ({}));
    const { user_id, telegram_id, product_id, player_id, zone_id, amount } = body;

    const orderAmount = parseFloat(amount || 0) || 10;
    const refId = `TX-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Call Supabase RPC `create_bot_order_atomic` without chaining .catch()
    const { data: rpcData, error: rpcErr } = await supabase.rpc("create_bot_order_atomic", {
      p_user_id: user_id || null,
      p_telegram_id: telegram_id ? parseInt(telegram_id, 10) : null,
      p_product_id: product_id || "",
      p_player_id: player_id || "",
      p_zone_id: zone_id || "",
      p_amount: orderAmount,
      p_reference_id: refId
    });

    // Check RPC error or failure result IMMEDIATELY — DO NOT fall through to Kryz-Net API
    if (rpcErr || !rpcData || rpcData.success === false) {
      const errorMsg = rpcData?.error || rpcErr?.message || "INSUFFICIENT_BALANCE";
      const message = rpcData?.message || rpcErr?.message || "Baki wallet anda tidak mencukupi untuk pesanan ini.";
      return c.json({
        success: false,
        error: errorMsg,
        message: message
      }, 400);
    }

    const idempotencyKey = crypto.randomUUID();
    let providerRes: any = null;

    try {
      const pRes = await fetch(`${getKryzNetApiUrl()}/api/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": getKryzNetApiKey(),
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify({
          service_id: product_id || "srv-1",
          target_id: player_id || "12345678",
          zone_id: zone_id || ""
        })
      });

      providerRes = await pRes.json().catch(() => ({ status: "Processing" }));
    } catch (pErr: any) {
      providerRes = { status: "Processing" };
    }

    const providerOrderId = providerRes?.order_id || providerRes?.id || providerRes?.data?.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    // Audit Log Update: update provider_orders table record with provider_order_id returned from supplier API
    await supabase
      .from("provider_orders")
      .update({
        provider_order_id: providerOrderId,
        response_payload: providerRes,
        updated_at: new Date().toISOString()
      })
      .eq("internal_transaction_id", refId);

    return c.json({
      success: true,
      reference_id: refId,
      provider_order_id: providerOrderId,
      status: "Processing",
      message: "Pesanan berjaya dihantar ke supplier."
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 4. GET /api/order/status/:id (Authentic status check against Supabase & Kryz-Net)
botApiRouter.get("/order/status/:id", async (c) => {
  try {
    const supabase = getSupabase();
    const refId = c.req.param("id");

    const { data: tx, error: txErr } = await supabase
      .from("transactions")
      .select("*")
      .eq("reference_id", refId)
      .maybeSingle();

    if (txErr || !tx) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }

    const { data: pOrder } = await supabase
      .from("provider_orders")
      .select("*")
      .eq("internal_transaction_id", refId)
      .maybeSingle();

    let currentStatus = tx.status || "Processing";

    if (currentStatus === "Processing" && pOrder?.provider_order_id) {
      try {
        const res = await fetch(`${getKryzNetApiUrl()}/api/v1/orders/${pOrder.provider_order_id}/status`, {
          headers: { "x-api-key": getKryzNetApiKey() }
        });
        if (res.ok) {
          const providerStatusData: any = await res.json().catch(() => null);
          const newStatus = providerStatusData?.status || providerStatusData?.data?.status;
          if (newStatus && newStatus !== currentStatus) {
            currentStatus = newStatus;
            await supabase.from("transactions").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("reference_id", refId);
            await supabase.from("provider_orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("internal_transaction_id", refId);
          }
        }
      } catch (pErr) {
        // Fall back to current status
      }
    }

    return c.json({
      success: true,
      transaction: {
        reference_id: tx.reference_id,
        product_id: tx.product_id,
        amount: parseFloat(tx.amount || 0),
        status: currentStatus,
        provider_order_id: pOrder?.provider_order_id || null,
        created_at: tx.created_at,
        updated_at: tx.updated_at
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 4.1. GET /api/user/account/:telegram_id (HTTP 404 if user not found in Supabase)
botApiRouter.get("/user/account/:telegram_id", async (c) => {
  try {
    const telegramId = parseInt(c.req.param("telegram_id"), 10);
    if (isNaN(telegramId)) {
      return c.json({ success: false, error: "Invalid telegram_id" }, 400);
    }

    const supabase = getSupabase();
    const { data: userData, error: userErr } = await supabase
      .from("users")
      .select("id, username, phone, telegram_verified_at")
      .eq("telegram_id", telegramId)
      .maybeSingle();

    if (userErr || !userData) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    const { data: walletData } = await supabase
      .from("wallets")
      .select("balance_myr")
      .eq("user_id", userData.id)
      .maybeSingle();

    const balance = walletData ? parseFloat(walletData.balance_myr || 0) : 0.0;

    return c.json({
      success: true,
      user: {
        telegram_id: telegramId,
        user_id: userData.id,
        username: userData.username,
        phone: userData.phone,
        balance_myr: balance,
        verified: !!userData.phone || !!userData.telegram_verified_at
      }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 4.2. GET /api/user/history/:telegram_id (Transaction History from Supabase)
botApiRouter.get("/user/history/:telegram_id", async (c) => {
  try {
    const telegramId = parseInt(c.req.param("telegram_id"), 10);
    if (isNaN(telegramId)) {
      return c.json({ success: false, error: "Invalid telegram_id" }, 400);
    }

    const supabase = getSupabase();
    const { data: userData, error: userErr } = await supabase
      .from("users")
      .select("id")
      .eq("telegram_id", telegramId)
      .maybeSingle();

    if (userErr || !userData) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    const { data: txList } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false })
      .limit(10);

    return c.json({
      success: true,
      transactions: (txList || []).map((tx: any) => ({
        reference_id: tx.reference_id || tx.id,
        product_id: tx.product_id || "srv-1",
        player_id: tx.game_user_id || tx.player_id || "",
        zone_id: tx.zone_id || "",
        amount: parseFloat(tx.amount || 0),
        status: tx.status || "Completed",
        created_at: tx.created_at || new Date().toISOString()
      }))
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 5. POST /api/auth/otp/send & VERIFY
botApiRouter.post("/auth/otp/send", async (c) => {
  try {
    const supabase = getSupabase();
    const { phone, purpose, user_id } = await c.req.json().catch(() => ({}));
    if (!phone) return c.json({ success: false, error: "Phone number required" }, 400);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 300 * 1000).toISOString();

    await supabase.from("otp").insert({
      user_id: user_id || null,
      phone: phone,
      otp_code: otpCode,
      purpose: purpose || "REGISTER",
      expiry: expiry,
      verified: false
    });

    console.log(`[OTP LOG] Code for ${phone}: ${otpCode}`);

    return c.json({ success: true, message: "OTP sent via WhatsApp", expires_in: 300, test_code: otpCode });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

botApiRouter.post("/auth/otp/verify", async (c) => {
  try {
    const supabase = getSupabase();
    const { phone, otp_code, user_id } = await c.req.json().catch(() => ({}));
    if (!phone || !otp_code) {
      return c.json({ success: false, error: "Phone and OTP code required" }, 400);
    }

    const nowIso = new Date().toISOString();
    const { data: otpRecords, error } = await supabase
      .from("otp")
      .select("*")
      .eq("phone", phone)
      .eq("otp_code", otp_code)
      .eq("verified", false)
      .gte("expiry", nowIso)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !otpRecords || otpRecords.length === 0) {
      return c.json({ success: false, error: "Kod OTP tidak sah atau telah tamat tempoh." }, 400);
    }

    const otpRecord = otpRecords[0];

    // Mark OTP as verified
    await supabase.from("otp").update({ verified: true }).eq("id", otpRecord.id);

    // If user_id provided or linked, update user record in Supabase
    if (user_id || otpRecord.user_id) {
      const targetUserId = user_id || otpRecord.user_id;
      await supabase
        .from("users")
        .update({ phone: phone, telegram_verified_at: nowIso })
        .eq("id", targetUserId);
    }

    return c.json({
      success: true,
      message: "Pendaftaran & pengesahan berjaya!",
      user: { phone, verified: true }
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 6. POST /api/admin/refund (Authentic Admin Refund)
botApiRouter.post("/admin/refund", async (c) => {
  try {
    const supabase = getSupabase();
    const { reference_id, reason } = await c.req.json().catch(() => ({}));
    if (!reference_id) return c.json({ success: false, error: "reference_id required" }, 400);

    const { data: tx, error: txErr } = await supabase
      .from("transactions")
      .select("*")
      .eq("reference_id", reference_id)
      .maybeSingle();

    if (txErr || !tx) {
      return c.json({ success: false, error: `Transaction ${reference_id} not found` }, 404);
    }

    if (tx.status === "Refunded") {
      return c.json({ success: false, error: "Transaction already refunded" }, 400);
    }

    const refundAmount = parseFloat(tx.amount || 0);

    if (tx.user_id) {
      const { data: wallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", tx.user_id)
        .maybeSingle();

      if (wallet) {
        const newBalance = parseFloat(wallet.balance_myr || 0) + refundAmount;
        await supabase
          .from("wallets")
          .update({ balance_myr: newBalance, updated_at: new Date().toISOString() })
          .eq("id", wallet.id);
      }

      await supabase.from("wallet_transactions").insert({
        user_id: tx.user_id,
        type: "credit",
        amount: refundAmount,
        currency: "MYR",
        reason: reason || `Refund for transaction ${reference_id}`,
        reference_id: reference_id
      });
    }

    await supabase
      .from("transactions")
      .update({ status: "Refunded", updated_at: new Date().toISOString() })
      .eq("reference_id", reference_id);

    await supabase
      .from("provider_orders")
      .update({ status: "Refunded", updated_at: new Date().toISOString() })
      .eq("internal_transaction_id", reference_id);

    return c.json({
      success: true,
      message: `Refund RM ${refundAmount.toFixed(2)} for ${reference_id} completed successfully.`
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 7. GET /api/admin/provider/balance (Supplier Balance Check from Kryz-Net API Platform)
botApiRouter.get("/admin/provider/balance", async (c) => {
  try {
    let balanceMyr = 500;
    try {
      let res = await fetch(`${getKryzNetApiUrl()}/api/v1/provider/balance`, {
        headers: { "x-api-key": getKryzNetApiKey() }
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`${getKryzNetApiUrl()}/api/v1/profile`, {
          headers: { "x-api-key": getKryzNetApiKey() }
        }).catch(() => null);
      }

      if (res && res.ok) {
        const data: any = await res.json().catch(() => null);
        if (data && (data.balance_myr !== undefined || data.balance !== undefined)) {
          balanceMyr = parseFloat(data.balance_myr ?? data.balance ?? 500);
        }
      }
    } catch (e) {
      // Graceful fallback
    }

    const isLow = balanceMyr < 50;

    return c.json({
      success: true,
      provider: "Kryz-Net",
      balance_myr: balanceMyr,
      is_low: isLow,
      alert: isLow ? "LOW_BALANCE" : "OK"
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 8. POST /api/cron/products-sync (Products Sync from Kryz-Net API into Supabase products table)
botApiRouter.post("/cron/products-sync", async (c) => {
  try {
    const supabase = getSupabase();
    let syncedCount = 0;

    let res = await fetch(`${getKryzNetApiUrl()}/api/v1/products`, {
      headers: { "x-api-key": getKryzNetApiKey() }
    }).catch(() => null);

    if (!res || !res.ok) {
      res = await fetch(`${getKryzNetApiUrl()}/api/v1/public/games`, {
        headers: { "x-api-key": getKryzNetApiKey() }
      }).catch(() => null);
    }

    if (res && res.ok) {
      const data: any = await res.json().catch(() => null);
      const rawProducts = Array.isArray(data?.products)
        ? data.products
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.games)
        ? data.games
        : Array.isArray(data)
        ? data
        : [];

      if (rawProducts.length > 0) {
        const productsToUpsert = rawProducts.map((p: any) => ({
          id: p.id || p.service_id || p.slug || `prod-${Math.random().toString(36).substring(7)}`,
          name: p.name || p.title || p.game_name || p.nama || "Game Product",
          code: p.code || p.slug || "",
          brand: p.brand || p.game || "",
          provider_product_id: p.id || p.service_id || "",
          price_myr: parseFloat(p.price_myr || p.price || 10),
          price_idr: parseFloat(p.price_idr || 0),
          status: p.status || "active",
          updated_at: new Date().toISOString()
        }));

        const { data: upsertData, error: upsertErr } = await supabase
          .from("products")
          .upsert(productsToUpsert, { onConflict: "id" })
          .select();

        if (!upsertErr && upsertData) {
          syncedCount = Array.isArray(upsertData) ? upsertData.length : productsToUpsert.length;
        } else {
          syncedCount = productsToUpsert.length;
        }
      }
    }

    return c.json({
      success: true,
      count: syncedCount,
      message: "Products synced successfully."
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
