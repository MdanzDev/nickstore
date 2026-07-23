import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import {
  externalGetAdminApiKeys,
  externalAdminGenerateApiKey,
  externalAdminToggleApiKey,
  externalAdminDeleteApiKey,
  externalGetAdminApiStats,
  externalGetAdminApiLogs,
} from "./lib/external/client";

export const apiManagementRouter = createRouter({
  listKeys: adminQuery
    .query(async ({ ctx }) => {
      return externalGetAdminApiKeys(ctx.jwtToken);
    }),

  generateKey: adminQuery
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return externalAdminGenerateApiKey(ctx.jwtToken, input.userId);
    }),

  toggleKey: adminQuery
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return externalAdminToggleApiKey(ctx.jwtToken, input.id, input.isActive);
    }),

  deleteKey: adminQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return externalAdminDeleteApiKey(ctx.jwtToken, input.id);
    }),

  stats: adminQuery
    .query(async ({ ctx }) => {
      return externalGetAdminApiStats(ctx.jwtToken);
    }),

  logs: adminQuery
    .input(z.object({ page: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return externalGetAdminApiLogs(ctx.jwtToken, input?.page);
    }),
});
