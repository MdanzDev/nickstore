import * as cookie from "cookie";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { externalGetMe, type ExternalApiUser } from "./lib/external/client";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: ExternalApiUser;
  jwtToken?: string;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    const cookies = cookie.parse(opts.req.headers.get("cookie") || "");
    const authHeader = opts.req.headers.get("authorization");
    const jwtToken = cookies["external_jwt"] || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined);
    
    if (jwtToken) {
      ctx.jwtToken = jwtToken;
      ctx.user = await externalGetMe(jwtToken);
    }
  } catch (err: any) {
    console.error("[tRPC Context] externalGetMe error:", err.message);
  }
  return ctx;
}
