import { createMiddleware } from "@tanstack/react-start";
import { getRequestIP, getRequestUrl } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "./auth-middleware";

/**
 * Server-side admin authorization guard.
 *
 * Chains after `requireSupabaseAuth` (which validates the bearer token and
 * populates `context.supabase` + `context.userId`) and then consults the
 * SECURITY DEFINER `public.has_role` RPC. Non-admins are rejected before any
 * handler code runs, so admin server functions cannot be executed by client
 * routing bypasses, direct RPC calls, or tampered local auth state.
 *
 * Denied attempts are recorded in `public.admin_access_log` (user id,
 * endpoint path, reason). Logging is best-effort — failures never mask the
 * 403 response. No request bodies, tokens, or emails are recorded.
 */
async function logDenial(params: {
  userId: string | null;
  reason: string;
}) {
  try {
    let endpoint: string | null = null;
    let ip: string | null = null;
    try {
      endpoint = new URL(getRequestUrl()).pathname;
    } catch {}
    try {
      ip = getRequestIP({ xForwardedFor: true }) ?? null;
    } catch {}
    const { supabaseAdmin } = await import("./client.server");
    await supabaseAdmin.from("admin_access_log").insert({
      user_id: params.userId,
      endpoint,
      role_result: false,
      reason: params.reason,
      ip,
    });
  } catch (err) {
    console.error("[admin-middleware] failed to record denial", err);
  }
}

export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const ctx = context as { supabase: any; userId: string };
    const { data: isAdmin, error } = await ctx.supabase.rpc("has_role", {
      _user_id: ctx.userId,
      _role: "admin",
    });
    if (error) {
      await logDenial({ userId: ctx.userId ?? null, reason: "has_role_rpc_error" });
      throw new Error("Forbidden: authorization check failed");
    }
    if (!isAdmin) {
      await logDenial({ userId: ctx.userId ?? null, reason: "not_admin" });
      throw new Error("Forbidden: admin role required");
    }
    return next({ context: { isAdmin: true as const } });
  });

/**
 * Allows either an `admin` or a `staff` role. Used to gate dashboard sections
 * that staff may operate (donations, expenses, programs, content, media, etc.)
 * while keeping Contacts, Team, System, and Activity strictly admin-only via
 * `requireAdmin`.
 */
export const requireStaffOrAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const ctx = context as { supabase: any; userId: string };
    const [adminRes, staffRes] = await Promise.all([
      ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" }),
      ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "staff" }),
    ]);
    if (adminRes.error || staffRes.error) {
      await logDenial({ userId: ctx.userId ?? null, reason: "has_role_rpc_error" });
      throw new Error("Forbidden: authorization check failed");
    }
    const isAdmin = !!adminRes.data;
    const isStaff = !!staffRes.data;
    if (!isAdmin && !isStaff) {
      await logDenial({ userId: ctx.userId ?? null, reason: "not_staff_or_admin" });
      throw new Error("Forbidden: staff or admin role required");
    }
    return next({ context: { isAdmin, isStaff } });
  });
