import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  externalGetProducts,
  externalGetProduct,
  externalCreateProduct,
  externalUpdateProduct,
  externalDeleteProduct,
} from "./lib/external/client";

export const productsRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        inStock: z.boolean().optional(),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return externalGetProducts(input);
    }),

  getById: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return externalGetProduct(input.id);
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.number(),
        stock: z.number().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalCreateProduct(ctx.jwtToken, input as Record<string, unknown>);
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.string(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return externalUpdateProduct(ctx.jwtToken, input.id, input.data as Record<string, unknown>);
    }),



  delete: adminQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return externalDeleteProduct(ctx.jwtToken, input.id);
    }),
});