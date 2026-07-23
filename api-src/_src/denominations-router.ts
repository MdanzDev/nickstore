// api/denominations-router.ts
import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  externalGetDenominations,
  externalCreateDenomination,
  externalUpdateDenomination,
  externalDeleteDenomination,
  externalGetPricelist,
} from "./lib/external/client";

export const denominationsRouter = createRouter({
  pricelist: publicQuery
    .input(z.object({ productId: z.string().optional() }))
    .query(async ({ input }) => {
      return externalGetPricelist(input.productId);
    }),

  // List denominations by product - public
  listByProduct: publicQuery
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return externalGetDenominations(input.productId, ctx.jwtToken);
    }),

  // Create denomination - admin only
  create: adminQuery
    .input(
      z.object({
        productId: z.string(),
        name: z.string().min(1),
        price: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalCreateDenomination(ctx.jwtToken, input);
    }),

  // Update denomination - admin only
  update: adminQuery
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        price: z.number().min(0).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalUpdateDenomination(ctx.jwtToken, input.id, input);
    }),

  // Delete denomination - admin only
  delete: adminQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return externalDeleteDenomination(ctx.jwtToken, input.id);
    }),
});