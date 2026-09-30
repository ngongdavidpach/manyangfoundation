import { createFileRoute } from "@tanstack/react-router";

const PURGE_BATCH_LIMIT = 50;

export const Route = createFileRoute("/api/public/hooks/purge-deleted-accounts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // apikey-based auth (see schedule-jobs-options doc). Accept either
        // the anon key OR the service-role key so the cron and manual admin
        // triggers both work.
        const providedKey =
          request.headers.get("apikey") ||
          request.headers.get("x-api-key") ||
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
          "";
        const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY || "";
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
        const allowedKeys = [anonKey, serviceKey].filter(Boolean);
        if (!providedKey || !allowedKeys.includes(providedKey)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { enqueueTransactionalEmail } = await import("@/lib/email/enqueue.server");

        const nowIso = new Date().toISOString();
        const { data: due, error: fetchErr } = await supabaseAdmin
          .from("account_deletion_requests")
          .select("user_id, email, purge_after")
          .eq("status", "pending")
          .lte("purge_after", nowIso)
          .limit(PURGE_BATCH_LIMIT);

        if (fetchErr) {
          console.error("[purge-deleted-accounts] fetch error", fetchErr);
          return Response.json({ ok: false, error: fetchErr.message }, { status: 500 });
        }

        const results: Array<{ user_id: string; ok: boolean; error?: string }> = [];

        for (const row of due ?? []) {
          const userId = row.user_id;
          const email = row.email;

          // Enqueue the confirmation email BEFORE deleting the auth user.
          try {
            await enqueueTransactionalEmail({
              templateName: "account-deletion-confirmed",
              recipientEmail: email,
              idempotencyKey: `deletion-confirmed-${userId}`,
              bypassSuppression: true,
              templateData: {
                email,
                deletedAt: new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
              },
            });
          } catch (e) {
            console.error("[purge-deleted-accounts] email enqueue failed", { userId, e });
          }

          // Delete the auth user — FK cascades remove profiles/user_roles/etc.
          const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
          if (delErr) {
            console.error("[purge-deleted-accounts] delete failed", { userId, delErr });
            results.push({ user_id: userId, ok: false, error: delErr.message });
            continue;
          }

          // account_deletion_requests row cascades on auth.users delete, but
          // the ON DELETE CASCADE removes the audit trail. Instead we mark it
          // purged first so the row survives briefly for reporting — but the
          // FK will drop it after delete. That's acceptable: history lives in
          // logs. Skip the UPDATE.
          results.push({ user_id: userId, ok: true });
        }

        return Response.json({ ok: true, purged: results.length, results });
      },
    },
  },
});
