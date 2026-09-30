import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server-verified admin check. Returns true only if the calling user has the
 * 'admin' role in public.user_roles. Client code MUST gate the admin UI on
 * this result rather than trusting local AuthContext state.
 */
export const verifyIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isAdmin: boolean }> => {
    const ctx = context as { supabase: any; userId: string };
    const { data, error } = await ctx.supabase.rpc("has_role", {
      _user_id: ctx.userId,
      _role: "admin",
    });
    if (error) return { isAdmin: false };
    return { isAdmin: !!data };
  });

export type DashboardRole = "admin" | "staff" | null;

/**
 * Server-verified dashboard role. Returns 'admin' or 'staff' so the client can
 * render the appropriate subset of the admin dashboard. Restricted sections
 * (Contacts, Team, System, Activity) remain admin-only both client-side and
 * on the server via `requireAdmin`.
 */
export const verifyDashboardAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ role: DashboardRole }> => {
    const ctx = context as { supabase: any; userId: string };
    const [adminRes, staffRes] = await Promise.all([
      ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" }),
      ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "staff" }),
    ]);
    if (adminRes.data) return { role: "admin" };
    if (staffRes.data) return { role: "staff" };
    return { role: null };
  });

