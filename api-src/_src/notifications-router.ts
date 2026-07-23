import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  externalGetNotifications,
  externalMarkNotificationRead,
  externalMarkAllNotificationsRead,
} from "./lib/external/client";

export const notificationsRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
        unreadOnly: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return externalGetNotifications(ctx.jwtToken, input);
    }),

  markRead: authedQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return externalMarkNotificationRead(ctx.jwtToken, input.id);
    }),

  markAllRead: authedQuery.mutation(async ({ ctx }) => {
    return externalMarkAllNotificationsRead(ctx.jwtToken);
  }),
});
