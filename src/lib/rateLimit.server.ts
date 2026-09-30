// Server-only rate-limit helper. Calls the SECURITY DEFINER
// public.check_rate_limit function via the service-role client.
import { getRequestIP } from "@tanstack/react-start/server";
import { RATE_LIMIT_MESSAGE } from "@/lib/rateLimit.constants";

export { RATE_LIMIT_MESSAGE };

export type RateLimitOptions = {
  bucket: string;
  max: number;
  windowSeconds: number;
  /** Optional explicit key (e.g. user id). Falls back to request IP. */
  key?: string | null;
};

async function checkOne(opts: RateLimitOptions): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let key = opts.key;
  if (!key) {
    try {
      key = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    } catch {
      key = "unknown";
    }
  }
  const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
    _key: String(key),
    _bucket: opts.bucket,
    _max: opts.max,
    _window_seconds: opts.windowSeconds,
  });
  if (error) {
    // Fail-open on infra error rather than block legitimate users
    console.error("[rateLimit] check_rate_limit error", error);
    return true;
  }
  return data !== false;
}

export async function enforceRateLimit(opts: RateLimitOptions): Promise<void> {
  const ok = await checkOne(opts);
  if (!ok) throw new Error(RATE_LIMIT_MESSAGE);
}

/**
 * Enforce multiple buckets at once. ALL buckets are incremented
 * (no short-circuit) so an attacker can't probe one axis for free.
 * Throws if any bucket exceeds its limit.
 */
export async function enforceRateLimits(all: RateLimitOptions[]): Promise<void> {
  const results = await Promise.all(all.map((o) => checkOne(o).catch(() => true)));
  if (results.some((ok) => !ok)) {
    throw new Error(RATE_LIMIT_MESSAGE);
  }
}
