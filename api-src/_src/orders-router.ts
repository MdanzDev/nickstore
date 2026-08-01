import { z } from "zod";
import { createRouter, authedQuery, adminQuery, publicQuery } from "./middleware";
import {
  externalCreateOrder,
  externalGetOrders,
  externalGetOrder,
  externalUpdateOrderStatus,
  externalGetAdminOrders,
  externalCreateQrisOrder,
  externalGetAdminStats,
} from "./lib/external/client";

export async function syncAllPendingLogic(jwtToken: string) {
  console.log('[SYNC CRON] Starting order synchronization...');

  const { createClient } = await import("@supabase/supabase-js");
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: pendingOrders } = await supabase.from("transactions").select("*").in("status", ["Pending", "Processing"]).order("created_at", { ascending: false }).limit(100);

  if (!pendingOrders || pendingOrders.length === 0) {
    console.log('[SYNC CRON] No pending/processing orders found.');
    return { success: true, updatedCount: 0, message: "No pending orders to sync" };
  }

  const apiKey = process.env.EXTERNAL_API_KEY || "";
  const apiUrl = process.env.EXTERNAL_API_URL || "https://api.kryz-net.space";

  let updatedCount = 0;
  let creditedDeposits = 0;

  // First: sweep unpaid deposits
  const { data: pendingDeps } = await supabase.from("deposits").select("*").eq("status", "Pending").eq("credited", false).limit(50);
  if (pendingDeps && pendingDeps.length > 0) {
    for (const dep of pendingDeps) {
      try {
        const res = await fetch(`${apiUrl}/api/v2/deposit/${dep.kryznet_deposit_id}`, {
          headers: { "X-API-KEY": apiKey },
        });
        if (res.ok) {
          const data = await res.json() as any;
          if (data.status === "Success") {
            // Credit local wallet
            if (dep.user_id) {
              try { await supabase.rpc("increment_balance", {
                p_user_id: dep.user_id,
                p_amount: parseFloat(dep.amount_myr || 0),
                p_reason: `Deposit ${dep.kryznet_deposit_id} paid`,
              }); } catch {}
            }
            await supabase.from("deposits").update({ status: "Success", credited: true, updated_at: new Date().toISOString() }).eq("id", dep.id);
            creditedDeposits++;

            // Auto-place pending order if this deposit was for an order
            const { data: orderTx } = await supabase.from("transactions").select("*").eq("reference_id", dep.kryznet_deposit_id).maybeSingle();
            if (orderTx && orderTx.note?.includes("pending_order")) {
              const noteJson = (() => { try { return JSON.parse(orderTx.note || "{}"); } catch { return {}; } })();
              if (noteJson.product_id && noteJson.player_id) {
                try {
                  const idempotencyKey = `NS-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
                  const orderRes = await fetch(`${apiUrl}/api/v2/order`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-API-KEY": apiKey, "Idempotency-Key": idempotencyKey },
                    body: JSON.stringify({ product_id: noteJson.product_id, player_id: noteJson.player_id, server_id: noteJson.server_id || "" }),
                  });
                  if (orderRes.ok) {
                    const orderData = await orderRes.json() as any;
                    await supabase.from("transactions").update({
                      reference_id: orderData.order_id,
                      status: orderData.status === "Processing" ? "Processing" : "Pending",
                      note: JSON.stringify({ ...noteJson, order_id: orderData.order_id, status: orderData.status }),
                      updated_at: new Date().toISOString(),
                    }).eq("id", orderTx.id);
                    console.log(`[SYNC CRON] Auto-placed order ${orderData.order_id} from deposit ${dep.kryznet_deposit_id}`);
                  }
                } catch (e: any) {
                  console.error(`[SYNC CRON] Auto-place order failed for ${dep.kryznet_deposit_id}:`, e.message);
                }
              }
            }
          } else if (data.status === "Expired" || data.status === "Failed") {
            await supabase.from("deposits").update({ status: data.status === "Expired" ? "Expired" : "Failed", updated_at: new Date().toISOString() }).eq("id", dep.id);
          }
        }
      } catch (e: any) {
        console.error(`[SYNC CRON] Deposit sweep failed for ${dep.kryznet_deposit_id}:`, e.message);
      }
    }
  }

  // Second: sync order statuses via v2
  for (const order of pendingOrders) {
    const orderId = order.reference_id;
    if (!orderId || orderId.startsWith("PG-") || orderId.startsWith("DEPO") || orderId === order.kryznet_deposit_id) continue;

    try {
      const res = await fetch(`${apiUrl}/api/v2/order/${orderId}`, {
        headers: { "X-API-KEY": apiKey },
      });
      if (!res.ok) continue;
      const data = await res.json() as any;
      const v2Status = data.status;

      const mapStatus = (s: string | undefined) => {
        if (!s) return null;
        const sl = s.toLowerCase();
        if (["sukses", "success", "delivered", "paid", "completed"].includes(sl)) return "Success";
        if (["proses", "processing"].includes(sl)) return "Processing";
        if (["gagal", "failed", "refund", "refunded", "cancelled", "error"].includes(sl)) return "Failed";
        if (["pending", "menunggu"].includes(sl)) return "Pending";
        return null;
      };

      const mapped = mapStatus(v2Status);
      if (mapped && mapped !== order.status) {
        console.log(`[SYNC CRON] Order ${orderId} ${order.status} -> ${mapped}`);

        if (mapped === "Failed" && order.user_id) {
          // Auto-refund local wallet on failure (mirroring kryz-net float refund)
          try { await supabase.rpc("increment_balance", {
            p_user_id: order.user_id,
            p_amount: parseFloat(order.amount || 0),
            p_reason: `Refund: Order ${orderId} failed`,
          }); } catch {}
        }

        await supabase.from("transactions").update({
          status: mapped,
          updated_at: new Date().toISOString(),
        }).eq("id", order.id);

        updatedCount++;
      }
    } catch (e: any) {
      console.error(`[SYNC CRON] Status sync failed for ${orderId}:`, e.message);
    }
  }

  console.log(`[SYNC CRON] Finished: ${updatedCount} orders updated, ${creditedDeposits} deposits credited.`);
  return { success: true, updatedCount, depositsCredited: creditedDeposits };
}

export const ordersRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().min(1),
          })
        ),
        shippingAddress: z.record(z.string(), z.string()).optional(),
        notes: z.string().optional(),
        voucher_code: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalCreateOrder(ctx.jwtToken, input as { items: Array<{ productId: string; quantity: number }>; shippingAddress?: Record<string, string>; notes?: string; voucher_code?: string });
    }),

  createQrisOrder: authedQuery
    .input(
      z.object({
        service_id: z.string(),
        game_id: z.string(),
        zone_id: z.string().optional().default(""),
        phone: z.string(),
        voucher_code: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // @ts-ignore
      return (await import("./lib/external/client")).externalCreateQrisOrder(ctx.jwtToken, input);
    }),

  guestCreate: publicQuery
    .input(
      z.object({
        service_id: z.string(),
        game_id: z.string(),
        zone_id: z.string().optional().default(""),
        phone: z.string(),
        voucher_code: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // @ts-ignore
      return (await import("./lib/external/client")).externalGuestCreateOrder(input);
    }),

  validateNickname: publicQuery
    .input(
      z.object({
        gameSlug: z.string(),
        userId: z.string(),
        zoneId: z.string(),
      })
    )
    .query(async ({ input }) => {
      // @ts-ignore
      return (await import("./lib/external/client")).externalValidateNickname(input.gameSlug, input.userId, input.zoneId);
    }),

  list: authedQuery
    .input(
      z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return externalGetOrders(ctx.jwtToken, input);
    }),

  getById: authedQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return externalGetOrder(ctx.jwtToken, input.id);
    }),

  guestGetStatus: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // @ts-ignore
      return (await import("./lib/external/client")).externalGuestGetOrderStatus(input.id);
    }),

  getLatestPublicTransactions: publicQuery
    .query(async () => {
      // @ts-ignore
      return (await import("./lib/external/client")).externalGetLatestTransactions();
    }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.string(),
        status: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalUpdateOrderStatus(ctx.jwtToken, input.id, input.status);
    }),

  syncAllPending: adminQuery
    .mutation(async ({ ctx }) => {
      return syncAllPendingLogic(ctx.jwtToken);
    }),

  adminList: adminQuery
    .input(
      z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return externalGetAdminOrders(ctx.jwtToken, input);
    }),

  adminStats: adminQuery
    .input(z.object({ days: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return externalGetAdminStats(ctx.jwtToken, input?.days);
    }),
});
