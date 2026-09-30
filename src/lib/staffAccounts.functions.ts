import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "@/integrations/supabase/admin-middleware";

export type StaffAccount = {
  id: string;
  email: string | null;
  fullName: string | null;
  roles: string[];
  createdAt: string;
  lastSignInAt: string | null;
};

export type AssignableRole = "admin" | "staff" | "none";

export const listStaffAccounts = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }): Promise<StaffAccount[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) throw new Error("Failed to list accounts");

    const ids = list.users.map((u) => u.id);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name").in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]),
      supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]),
    ]);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p.full_name]));
    const rolesMap = new Map<string, string[]>();
    (roles || []).forEach((r: any) => {
      const arr = rolesMap.get(r.user_id) || [];
      arr.push(r.role);
      rolesMap.set(r.user_id, arr);
    });

    return list.users
      .map((u) => ({
        id: u.id,
        email: u.email ?? null,
        fullName: (profileMap.get(u.id) as string | undefined) ?? null,
        roles: rolesMap.get(u.id) || [],
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
      }))
      .sort((a, b) => (a.email || "").localeCompare(b.email || ""));
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: { userId: string; role: AssignableRole }) => {
    if (!d.userId) throw new Error("Invalid input");
    if (!["admin", "staff", "none"].includes(d.role)) throw new Error("Invalid role");
    return d;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Guard: don't drop the last admin
    const { data: currentRows } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.userId);
    const wasAdmin = (currentRows || []).some((r: any) => r.role === "admin");

    if (wasAdmin && data.role !== "admin") {
      const { count } = await supabaseAdmin
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) throw new Error("Cannot remove the last admin");
    }

    // Clear existing admin/staff assignments for this user
    const { error: delErr } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .in("role", ["admin", "staff"]);
    if (delErr) throw new Error("Failed to update role");

    if (data.role !== "none") {
      const { error: insErr } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.userId, role: data.role });
      if (insErr && !String(insErr.message).toLowerCase().includes("duplicate")) {
        throw new Error("Failed to assign role");
      }
    }

    return { ok: true };
  });

export const inviteStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: { email: string; fullName: string; role: AssignableRole }) => {
    if (!d.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) throw new Error("Invalid email");
    if (!d.fullName || d.fullName.length > 200) throw new Error("Full name required");
    if (!["admin", "staff", "none"].includes(d.role)) throw new Error("Invalid role");
    return d;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { full_name: data.fullName },
    });
    if (error || !invited?.user) throw new Error(error?.message || "Failed to invite user");

    if (data.role !== "none") {
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: invited.user.id, role: data.role });
    }
    return { ok: true, userId: invited.user.id };
  });
