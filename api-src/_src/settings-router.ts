import { createRouter, adminQuery } from "./middleware";
import { externalGetAdminSettings, externalUpdateAdminSettings, externalGetProviderBalance, externalCreateProviderDeposit } from "./lib/external/client";
import { z } from "zod";

export const settingsRouter = createRouter({
  get: adminQuery
    .query(async ({ ctx }) => {
      return externalGetAdminSettings(ctx.jwtToken);
    }),

  update: adminQuery
    .input(z.record(z.string(), z.any()))
    .mutation(async ({ ctx, input }) => {
      return externalUpdateAdminSettings(ctx.jwtToken, input);
    }),

  getProviderBalance: adminQuery
    .query(async ({ ctx }) => {
      return externalGetProviderBalance(ctx.jwtToken);
    }),

  createProviderDeposit: adminQuery
    .input(z.object({ amount: z.number(), methodCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return externalCreateProviderDeposit(ctx.jwtToken, input.amount, input.methodCode);
    }),
});
