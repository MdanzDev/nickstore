import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import {
  externalGetRamsBalance,
  externalCreateDeposit,
  externalGetDepositStatus,
  externalGetDepositQR,
  externalGetRamsHistory,
  externalProcessPayment,
} from "./lib/external/client";

export const ramsRouter = createRouter({
  balance: publicQuery.query(async ({ ctx }) => {
    if (!ctx.jwtToken) {
      return {
        success: false,
        data: {
          ramsBalance: { balance: 0, balance_myr: 0, balance_idr: 0, username: 'Guest', email: '' },
          localBalance: 0,
          balance_myr: 0,
          balance_idr: 0
        }
      };
    }
    return externalGetRamsBalance(ctx.jwtToken);
  }),

  deposit: authedQuery
    .input(
      z.object({
        amount: z.number().min(1),
        method: z.string().default("qris"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalCreateDeposit(ctx.jwtToken, input.amount, input.method);
    }),

  depositStatus: authedQuery
    .input(z.object({ depositId: z.string() }))
    .query(async ({ ctx, input }) => {
      return externalGetDepositStatus(ctx.jwtToken, input.depositId);
    }),

  depositQR: authedQuery
    .input(z.object({ depositId: z.string() }))
    .query(async ({ ctx, input }) => {
      return externalGetDepositQR(ctx.jwtToken, input.depositId);
    }),

  history: authedQuery.query(async ({ ctx }) => {
    return externalGetRamsHistory(ctx.jwtToken);
  }),

  payment: authedQuery
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalProcessPayment(ctx.jwtToken, input.amount, input.description);
    }),
});
