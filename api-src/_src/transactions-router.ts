import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import {
  externalGetTransactions,
  externalGetAdminTransactions,
} from "./lib/external/client";

export const transactionsRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
        type: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return externalGetTransactions(ctx.jwtToken, input);
    }),

  adminList: adminQuery
    .input(
      z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
        type: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return externalGetAdminTransactions(ctx.jwtToken, input);
    }),
});
