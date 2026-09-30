import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listMyActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_activity_log" as any)
      .select("id, event_type, details, created_at, ip, user_agent")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      console.error("listMyActivity failed", error);
      return { rows: [] as Array<any> };
    }
    return { rows: (data ?? []) as Array<any> };
  });
