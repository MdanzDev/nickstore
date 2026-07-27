import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Load supabase-mock in Vitest main process so getSupabase() in Hono uses mockSupabase
const mock = require("./supabase-mock.cjs");
if (mock) {
  (globalThis as any).__mockSupabase = mock;
}
