// api/vouchers.ts
import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  externalGetVouchers,
  externalGetVoucher,
  externalValidateVoucher,
  externalCreateVoucher,
  externalUpdateVoucher,
  externalDeleteVoucher,
} from "./lib/external/client";

export const vouchersRouter = createRouter({
  // Get all vouchers - public
  list: publicQuery
    .input(
      z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return externalGetVouchers(input);
    }),

  // Get voucher by ID - public
  getById: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return externalGetVoucher(input.id);
    }),

  // Validate voucher code - public
  validate: publicQuery
    .input(
      z.object({
        code: z.string(),
        orderAmount: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return externalValidateVoucher(input.code, input.orderAmount);
    }),

  // Create voucher - admin only
  create: adminQuery
    .input(
      z.object({
        code: z.string().min(1),
        type: z.enum(["percentage", "fixed"]),
        value: z.number().positive(),
        maxDiscount: z.number().min(0).default(0),
        minOrder: z.number().min(0).default(0),
        expiryDate: z.string(),
        usageLimit: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalCreateVoucher(ctx.jwtToken, input);
    }),

  // Update voucher - admin only
  update: adminQuery
    .input(
      z.object({
        id: z.string(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalUpdateVoucher(ctx.jwtToken, input.id, input.data);
    }),

  // Toggle active - admin only
  toggleActive: adminQuery
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalUpdateVoucher(ctx.jwtToken, input.id, {
        isActive: input.isActive,
      });
    }),

  // Delete voucher - admin only
  delete: adminQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return externalDeleteVoucher(ctx.jwtToken, input.id);
    }),
});