import { externalAuthRouter } from "./external-auth-router";
import { usersRouter } from "./users-router";
import { productsRouter } from "./products-router";
import { ordersRouter } from "./orders-router";
import { transactionsRouter } from "./transactions-router";
import { ramsRouter } from "./rams-router";
import { vouchersRouter } from "./vouchers"; 
import { denominationsRouter } from "./denominations-router"; 
import { notificationsRouter } from "./notifications-router";
import { settingsRouter } from "./settings-router";
import { apiManagementRouter } from "./api-management-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: externalAuthRouter,
  users: usersRouter,
  products: productsRouter,
  orders: ordersRouter,
  transactions: transactionsRouter,
  rams: ramsRouter,
  vouchers: vouchersRouter,
  denominations: denominationsRouter, 
  notifications: notificationsRouter,
  settings: settingsRouter,
  apiManagement: apiManagementRouter,
});

export type AppRouter = typeof appRouter;
