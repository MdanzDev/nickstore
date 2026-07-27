import { describe, it, expect, beforeAll } from "vitest";
import crypto from "crypto";

const HONO_URL = "http://127.0.0.1:3001";
const BOT_SECRET = process.env.BOT_SECRET || "nickstore_secret_bot_key_2026";

function generateHmacHeaders(botId: string, timestamp?: string) {
  const ts = timestamp || Math.floor(Date.now() / 1000).toString();
  const secret = process.env.BOT_SECRET || "nickstore_secret_bot_key_2026";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${botId}:${ts}`)
    .digest("hex");

  return {
    "x-bot-id": botId,
    "x-timestamp": ts,
    "x-signature": signature,
    "content-type": "application/json"
  };
}

describe("Bot REST API & Security Middleware Tests", () => {
  beforeAll(async () => {
    // Seed test user into DB via test bridge
    await fetch("http://127.0.0.1:5001/test-db/insert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table: "users",
        data: {
          id: "11111111-2222-3333-4444-555555555555",
          telegram_id: 12345678,
          username: "testuser",
          phone: "60123456789",
          role: "user",
          status: "active"
        }
      })
    }).catch(() => null);

    await fetch("http://127.0.0.1:5001/test-db/insert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table: "wallets",
        data: {
          id: "wallet-1111",
          user_id: "11111111-2222-3333-4444-555555555555",
          balance_myr: 100.00
        }
      })
    }).catch(() => null);
  });

  it("GET /api/products should return product catalog with HTTP 200", async () => {
    const res = await fetch(`${HONO_URL}/api/products`);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.products)).toBe(true);
  });

  describe("HMAC Security Middleware Verification", () => {
    it("should reject requests to protected bot routes without HMAC headers with HTTP 401", async () => {
      const res = await fetch(`${HONO_URL}/api/account/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_slug: "mobile-legends", player_id: "12345678" })
      });
      expect(res.status).toBe(401);
      const body = await res.json() as any;
      expect(body.error).toContain("Missing required HMAC authentication headers");
    });

    it("should reject secret header bypass attempts without valid HMAC signature with HTTP 401", async () => {
      const res = await fetch(`${HONO_URL}/api/account/validate`, {
        method: "POST",
        headers: {
          "X-Bot-Secret": BOT_SECRET,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ game_slug: "mobile-legends", player_id: "12345678" })
      });
      expect(res.status).toBe(401);
      const body = await res.json() as any;
      expect(body.error).toContain("Missing required HMAC authentication headers");
    });

    it("should reject requests with invalid HMAC signature with HTTP 401", async () => {
      const res = await fetch(`${HONO_URL}/api/account/validate`, {
        method: "POST",
        headers: {
          "X-Bot-ID": "test_bot_1",
          "X-Timestamp": Math.floor(Date.now() / 1000).toString(),
          "X-Signature": "invalid_signature_hex",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ game_slug: "mobile-legends", player_id: "12345678" })
      });
      expect(res.status).toBe(401);
      const body = await res.json() as any;
      expect(body.error).toBe("Invalid bot request signature");
    });

    it("should reject requests with expired timestamp (> 300s) with HTTP 401", async () => {
      const oldTimestamp = Math.floor((Date.now() - 400 * 1000) / 1000).toString();
      const headers = generateHmacHeaders("test_bot_1", oldTimestamp);

      const res = await fetch(`${HONO_URL}/api/account/validate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ game_slug: "mobile-legends", player_id: "12345678" })
      });
      expect(res.status).toBe(401);
      const body = await res.json() as any;
      expect(body.error).toBe("Expired request timestamp");
    });

    it("should accept valid HMAC signed requests with HTTP 200", async () => {
      const headers = generateHmacHeaders("test_bot_1");
      const res = await fetch(`${HONO_URL}/api/account/validate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ game_slug: "mobile-legends", player_id: "12345678", zone_id: "1234" })
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
    });
  });

  describe("Account Nickname Validation", () => {
    it("POST /api/account/validate should require game_slug and player_id with HTTP 400", async () => {
      const headers = generateHmacHeaders("test_bot_1");
      const res = await fetch(`${HONO_URL}/api/account/validate`, {
        method: "POST",
        headers,
        body: JSON.stringify({})
      });
      expect(res.status).toBe(400);
      const body = await res.json() as any;
      expect(body.success).toBe(false);
      expect(body.error).toContain("required");
    });

    it("POST /api/v1/validate-account should work with valid HMAC header and HTTP 200", async () => {
      const headers = generateHmacHeaders("test_bot_1");
      const res = await fetch(`${HONO_URL}/api/v1/validate-account`, {
        method: "POST",
        headers,
        body: JSON.stringify({ game_slug: "free-fire", player_id: "99887766" })
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
    });
  });

  describe("Order Creation & Balance Locking", () => {
    it("POST /api/order/create should return HTTP 400 when user is not found", async () => {
      const headers = generateHmacHeaders("test_bot_1");
      const res = await fetch(`${HONO_URL}/api/order/create`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          telegram_id: 999999999,
          product_id: "srv-1",
          player_id: "12345678",
          zone_id: "1234",
          amount: 10
        })
      });
      expect(res.status).toBe(400);
      const body = await res.json() as any;
      expect(body.success).toBe(false);
      expect(body.error).toBe("USER_NOT_FOUND");
    });

    it("POST /api/order/create should create order with HTTP 200 for valid registered user", async () => {
      const headers = generateHmacHeaders("test_bot_1");
      const res = await fetch(`${HONO_URL}/api/order/create`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          telegram_id: 12345678,
          product_id: "srv-1",
          player_id: "12345678",
          zone_id: "1234",
          amount: 10
        })
      });

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
      expect(body.reference_id).toBeDefined();
      expect(body.provider_order_id).toBeDefined();
    });
  });

  describe("OTP Authentication Endpoints", () => {
    it("POST /api/auth/otp/send should send OTP code with HTTP 200", async () => {
      const res = await fetch(`${HONO_URL}/api/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "60123456789", purpose: "REGISTER" })
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
      expect(body.test_code).toBeDefined();

      // Verify OTP code
      const verifyRes = await fetch(`${HONO_URL}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "60123456789", otp_code: body.test_code })
      });
      expect(verifyRes.status).toBe(200);
      const verifyBody = await verifyRes.json() as any;
      expect(verifyBody.success).toBe(true);
    });

    it("POST /api/auth/otp/verify should return HTTP 400 for invalid code", async () => {
      const res = await fetch(`${HONO_URL}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "60123456789", otp_code: "000000" })
      });
      expect(res.status).toBe(400);
      const body = await res.json() as any;
      expect(body.success).toBe(false);
    });
  });

  describe("Admin Routes Authentication & Functionality", () => {
    it("POST /api/admin/refund should return HTTP 401 without admin auth header", async () => {
      const res = await fetch(`${HONO_URL}/api/admin/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference_id: "NON_EXISTENT_TX", reason: "Test refund" })
      });
      expect(res.status).toBe(401);
      const body = await res.json() as any;
      expect(body.error).toBe("Unauthorized admin access");
    });

    it("POST /api/admin/refund should return HTTP 404 for non-existent transaction with valid auth", async () => {
      const res = await fetch(`${HONO_URL}/api/admin/refund`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${BOT_SECRET}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reference_id: "NON_EXISTENT_TX", reason: "Test refund" })
      });
      expect(res.status).toBe(404);
      const body = await res.json() as any;
      expect(body.success).toBe(false);
    });

    it("GET /api/admin/provider/balance should return provider balance with HTTP 200", async () => {
      const res = await fetch(`${HONO_URL}/api/admin/provider/balance`, {
        headers: { "Authorization": `Bearer ${BOT_SECRET}` }
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
      expect(body.provider).toBe("Kryz-Net");
    });
  });

  describe("User Account & History Facades", () => {
    it("GET /api/user/account/:telegram_id should return HTTP 404 for unregistered user", async () => {
      const headers = generateHmacHeaders("test_bot_1");
      const res = await fetch(`${HONO_URL}/api/user/account/99999999`, { headers });
      expect(res.status).toBe(404);
      const body = await res.json() as any;
      expect(body.success).toBe(false);
      expect(body.error).toBe("User not found");
    });

    it("GET /api/user/account/:telegram_id should return HTTP 200 for registered user", async () => {
      const headers = generateHmacHeaders("test_bot_1");
      const res = await fetch(`${HONO_URL}/api/user/account/12345678`, { headers });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
      expect(body.user.telegram_id).toBe(12345678);
    });

    it("POST /api/cron/products-sync should sync products with HTTP 200", async () => {
      const res = await fetch(`${HONO_URL}/api/cron/products-sync`, { method: "POST" });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
    });
  });
});
