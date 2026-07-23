import * as cookie from "cookie";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  externalLogin,
  externalRegister,
  externalRefreshToken,
  externalForgotPassword,
  externalUpdatePassword,
  externalTelegramWebAppAuth,
} from "./lib/external/client";
import { z } from "zod";

const EXTERNAL_JWT_COOKIE = "external_jwt";
const COOKIE_MAX_AGE = 86400; // 24 hours

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

export const externalAuthRouter = createRouter({
  login: publicQuery
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const result = await externalLogin(input.email, input.password);
      const cookieValue = cookie.serialize(
        EXTERNAL_JWT_COOKIE,
        result.token,
        getCookieOptions()
      );
      ctx.resHeaders.append("set-cookie", cookieValue);
      return { user: result.user, token: result.token, expiresIn: result.expiresIn };
    }),

  register: publicQuery
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8),
        phone: z.string().optional(),
        socialConnections: z.record(z.string(), z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await externalRegister(input as { name: string; email: string; password: string; phone?: string; socialConnections?: Record<string, string> });
      const cookieValue = cookie.serialize(
        EXTERNAL_JWT_COOKIE,
        result.token,
        getCookieOptions()
      );
      ctx.resHeaders.append("set-cookie", cookieValue);
      return { user: result.user, token: result.token, expiresIn: result.expiresIn };
    }),

  me: authedQuery.query(async ({ ctx }) => {
    return ctx.user;
  }),

  refresh: authedQuery.mutation(async ({ ctx }) => {
    const result = await externalRefreshToken(ctx.jwtToken);
    const cookieValue = cookie.serialize(
      EXTERNAL_JWT_COOKIE,
      result.token,
      getCookieOptions()
    );
    ctx.resHeaders.append("set-cookie", cookieValue);
    return { token: result.token, expiresIn: result.expiresIn };
  }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    const cookieValue = cookie.serialize(EXTERNAL_JWT_COOKIE, "", {
      ...getCookieOptions(),
      maxAge: 0,
    });
    ctx.resHeaders.append("set-cookie", cookieValue);
    return { success: true };
  }),

  forgotPassword: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      return externalForgotPassword(input.email);
    }),

  updatePassword: authedQuery
    .input(z.object({ newPassword: z.string().min(8) }))
    .mutation(async ({ input, ctx }) => {
      return externalUpdatePassword(input.newPassword, ctx.jwtToken);
    }),

  telegramWebApp: publicQuery
    .input(
      z.object({
        telegram_id: z.string(),
        username: z.string().optional(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        initDataRaw: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await externalTelegramWebAppAuth(input);
      const cookieValue = cookie.serialize(
        EXTERNAL_JWT_COOKIE,
        result.token,
        getCookieOptions()
      );
      ctx.resHeaders.append("set-cookie", cookieValue);
      return { user: result.user, token: result.token };
    }),

  setSessionToken: publicQuery
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const cookieValue = cookie.serialize(
        EXTERNAL_JWT_COOKIE,
        input.token,
        getCookieOptions()
      );
      ctx.resHeaders.append("set-cookie", cookieValue);
      return { success: true };
    }),
});
