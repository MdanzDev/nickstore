import { z } from "zod";
import { createRouter, authedQuery, adminQuery, publicQuery } from "./middleware";
import {
  externalCreateOrder,
  externalGetOrders,
  externalGetOrder,
  externalUpdateOrderStatus,
  externalGetAdminOrders,
  externalGetAdminSettings,
  externalCreateQrisOrder,
  externalGetAdminStats,
} from "./lib/external/client";

export async function syncAllPendingLogic(jwtToken: string) {
  console.log('[SYNC CRON] Starting order synchronization...');
  
  // Get all pending and processing orders
  const ordersResult = await externalGetAdminOrders(jwtToken, { limit: 1000 });
  const pendingOrders = ordersResult.data.filter((o: any) => 
    o.status === 'pending' || o.status === 'processing' || o.status === 'shipped' || o.status === 'confirmed'
  );
  
  if (pendingOrders.length === 0) {
    console.log('[SYNC CRON] No pending orders found to sync.');
    return { success: true, updatedCount: 0, message: "No pending orders to sync" };
  }
  
  // Get API key
  const settingsResult = await externalGetAdminSettings(jwtToken);
  const apiKey = settingsResult.data?.provider_api_key || process.env.PROVIDER_API_KEY;
  if (!apiKey) throw new Error("Provider API Key not configured in settings");
  
  let updatedCount = 0;
  
  const mapProviderStatus = (status: string) => {
    const s = (status || '').toLowerCase();
    if (['sukses', 'success', 'delivered', 'paid', 'completed'].includes(s)) return 'Success';
    if (['proses', 'processing'].includes(s)) return 'Processing';
    if (['batal', 'gagal', 'failed', 'refund', 'reffund', 'cancelled', 'error'].includes(s)) return 'Failed';
    if (['pending', 'menunggu'].includes(s)) return 'Pending';
    return 'Pending';
  };
  
  for (const order of pendingOrders) {
    // Determine provider TRX ID. For QRIS, it's stored in keterangan as deposit_invoice
    let providerTrxId = order.providerTrxId;
    if (!providerTrxId && order.keterangan) {
      try {
        const ketData = JSON.parse(order.keterangan);
        if (ketData.deposit_invoice) providerTrxId = ketData.deposit_invoice;
      } catch (e) {}
    }
    
    if (!providerTrxId) continue;
    
    try {
      const isDeposit = providerTrxId.startsWith('DEPO') || providerTrxId.startsWith('MTDEPO');
      const endpoint = isDeposit ? "https://api.mytopupku.com/api/v2/check-deposit" : "https://api.mytopupku.com/api/v2/check-status";
      const payload = isDeposit 
        ? { api_key: apiKey, invoice: providerTrxId } 
        : { api_key: apiKey, order_id: providerTrxId };

      console.log(`[SYNC CRON] Checking order ID: ${order.id} | Provider TRX: ${providerTrxId} | Type: ${isDeposit ? 'Deposit' : 'Order'}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        console.log(`[SYNC CRON] Provider API returned ${response.status} for TRX: ${providerTrxId}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data && data.status === true) {
        const providerData = data.data || data;
        // Check both order status field or deposit status field
        const providerStatus = providerData.status || providerData.transaction_status;
        
        if (!providerStatus) continue;
        
        let mappedStatus = mapProviderStatus(providerStatus);
        
        if (mappedStatus !== 'Pending') {
          // Convert mappedStatus to lowercase enum for our TRPC router: pending, confirmed, shipped, delivered, cancelled
          let trpcStatus = 'pending';
          if (mappedStatus === 'Success') trpcStatus = isDeposit ? 'shipped' : 'delivered';
          else if (mappedStatus === 'Failed') trpcStatus = 'cancelled';
          else if (mappedStatus === 'Processing') trpcStatus = 'shipped';
          
          console.log(`[SYNC CRON] Order ${order.id} status changed! Provider: ${providerStatus} -> mapped to: ${trpcStatus}`);
          
          // Call externalUpdateOrderStatus to save
          try {
            const sn = providerData.sn || providerData.serial_number || providerData.vcr || '';
            const note = providerData.message || providerData.note || '';
            await externalUpdateOrderStatus(jwtToken, order.id, trpcStatus, providerStatus, note, sn);
            console.log(`[SYNC CRON] Successfully updated order ${order.id} in local database.`);
            updatedCount++;
          } catch (e: any) {
            console.error(`[SYNC CRON ERROR] Failed to update local DB for order ${order.id}:`, e.message);
          }
        } else {
           console.log(`[SYNC CRON] Order ${order.id} is still ${mappedStatus}. No changes.`);
        }
      }
    } catch (err: any) {
      console.error(`[SYNC CRON ERROR] Fetch failed for order ${order.id}:`, err.message);
    }
  }
  
  console.log(`[SYNC CRON] Finished synchronization. Updated ${updatedCount} orders.`);
  return { success: true, updatedCount };
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
