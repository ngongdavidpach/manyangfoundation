import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "@/integrations/supabase/admin-middleware";

export type AccessLogEntry = {
  id: string;
  user_id: string | null;
  endpoint: string | null;
  role_result: boolean;
  reason: string | null;
  ip: string | null;
  created_at: string;
};

export const listAdminAccessLog = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }): Promise<AccessLogEntry[]> => {
    const ctx = context as { supabase: any };
    const { data, error } = await ctx.supabase
      .from("admin_access_log")
      .select("id, user_id, endpoint, role_result, reason, ip, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []) as AccessLogEntry[];
  });
