import { externalGetApiKey, externalGenerateApiKey } from './lib/external/client';
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery, adminQuery, publicQuery } from "./middleware";
import {
  externalGetUsers,
  externalGetUser,
  externalUpdateUser,
  externalDeleteUser,
  externalGetUserDeposits,
  externalGetLeaderboard,
  externalAdjustBalance,
  externalBlockUser,
  externalUpdateMe,
  externalRequestPhoneOtp,
  externalVerifyPhoneOtp,
  externalLogin,
  externalUnlinkTelegram,
} from "./lib/external/client";

let cachedLeaderboard: any = null;
let cachedLeaderboardTime = 0;

async function getAdminLeaderboard() {
  const now = Date.now();
  if (cachedLeaderboard && now - cachedLeaderboardTime < 1000 * 60 * 5) {
    return cachedLeaderboard;
  }

  const email = process.env.CRON_ADMIN_EMAIL;
  const password = process.env.CRON_ADMIN_PASSWORD;
  
  if (!email || !password) return null;

  try {
    const loginRes = await externalLogin(email, password);
    if (!loginRes.success) return null;
    
    const usersRes = await externalGetUsers(loginRes.token, { limit: 1000 });
    const users = usersRes.data.filter(u => u.isActive && u.totalSpent > 0);
    users.sort((a, b) => b.totalSpent - a.totalSpent);
    
    const mapped = users.slice(0, 50).map((u, i) => ({
      rank: i + 1,
      id: u.id,
      name: u.name,
      totalMyr: u.totalSpent,
      totalIdr: u.totalSpent * 4111,
      orders: u.totalOrders,
      favorite: "Mobile Legends"
    }));
    
    cachedLeaderboard = { data: mapped };
    cachedLeaderboardTime = now;
    return cachedLeaderboard;
  } catch (e) {
    return null;
  }
}

export const usersRouter = createRouter({
  leaderboard: publicQuery
    .input(
      z.object({
        filter: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return externalGetLeaderboard(input?.filter);
    }),

  list: adminQuery
    .input(
      z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return externalGetUsers(ctx.jwtToken, input);
    }),

  getById: authedQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return externalGetUser(ctx.jwtToken, input.id);
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.string(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalUpdateUser(ctx.jwtToken, input.id, input.data as Record<string, unknown>);
    }),

  delete: adminQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await externalDeleteUser(ctx.jwtToken, input.id);
      } catch (err: any) {
        if (err.message && err.message.includes("violates foreign key constraint")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tidak boleh padam pengguna kerana terdapat rekod transaksi/deposit. Sila padam rekod berkaitan dahulu atau minta admin ubah tetapan DB (ON DELETE CASCADE).",
          });
        }
        throw err;
      }
    }),

  adjustBalance: adminQuery
    .input(
      z.object({
        userId: z.string(),
        amount: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalAdjustBalance(ctx.jwtToken, input.userId, input.amount, input.reason);
    }),

  block: adminQuery
    .input(
      z.object({
        userId: z.string(),
        isBlocked: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalBlockUser(ctx.jwtToken, input.userId, input.isBlocked);
    }),

  deposits: authedQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return externalGetUserDeposits(ctx.jwtToken, input.id);
    }),

  updateMe: authedQuery
    .input(
      z.object({
        name: z.string(),
        phone: z.string().optional(),
        email: z.string().email("Emel tidak sah").optional().or(z.literal("")),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalUpdateMe(ctx.jwtToken, input.name, input.phone, input.email);
    }),

  requestPhoneOtp: publicQuery
    .input(z.object({ phone: z.string(), token: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const jwtToken = input.token || ctx.jwtToken;
      if (!jwtToken) throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
      return externalRequestPhoneOtp(input.phone, jwtToken);
    }),

  verifyPhoneOtp: publicQuery
    .input(z.object({ phone: z.string(), code: z.string(), token: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const jwtToken = input.token || ctx.jwtToken;
      if (!jwtToken) throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
      return externalVerifyPhoneOtp(input.phone, input.code, jwtToken);
    }),

  getApiKey: authedQuery
    .query(async ({ ctx }) => {
      return externalGetApiKey(ctx.jwtToken);
    }),

  generateApiKey: authedQuery
    .mutation(async ({ ctx }) => {
      return externalGenerateApiKey(ctx.jwtToken);
    }),

  unlinkTelegram: authedQuery
    .mutation(async ({ ctx }) => {
      return externalUnlinkTelegram(ctx.jwtToken);
    }),
});
