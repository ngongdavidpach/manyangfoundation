import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { RATE_LIMIT_MESSAGE } from "@/lib/rateLimit.constants";

export { RATE_LIMIT_MESSAGE };

const GRACE_PERIOD_DAYS = 30;
const BAN_DURATION = "720h"; // 30 days
const SITE_ORIGIN = "https://manyangdisabilityfoundation.org";
// Max age of the user's last sign-in to allow destructive actions
// (account deletion). GitHub sudo mode is ~1h; we use 5 min for a
// permanent-destruction flow.
const REAUTH_WINDOW_SECONDS = 300;


// Shared password strength schema — MUST match the client-side rules in
// src/ported/utils/auth.ts getPasswordStrength(). Enforced server-side so
// client validation can't be bypassed.
const StrongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must be at most 128 characters.")
  .regex(/[A-Z]/, "Password must contain an uppercase letter.")
  .regex(/[a-z]/, "Password must contain a lowercase letter.")
  .regex(/[0-9]/, "Password must contain a number.")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain a special character.");

function validateStrength(pw: string): { ok: true } | { ok: false; issues: string[] } {
  const r = StrongPasswordSchema.safeParse(pw);
  if (r.success) return { ok: true };
  return { ok: false, issues: r.error.issues.map((i) => i.message) };
}

function makePublishableClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function generateCancelToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const EmailSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  origin: z.string().url().optional(),
});

/**
 * Public server function: request a password-reset email.
 */
export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailSchema.parse(input))
  .handler(async ({ data }) => {
    const { enforceRateLimits } = await import("@/lib/rateLimit.server");
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    try {
      await enforceRateLimits([
        { bucket: "password-reset:email", key: data.email, max: 3, windowSeconds: 600 },
        { bucket: "password-reset:ip", max: 10, windowSeconds: 3600 },
      ]);
    } catch {
      setResponseStatus(429);
      return { ok: false as const, reason: "rate_limited" as const, message: RATE_LIMIT_MESSAGE };
    }

    const supabase = makePublishableClient();
    const origin = data.origin || SITE_ORIGIN;
    const redirectTo = `${origin.replace(/\/$/, "")}/auth/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, { redirectTo });
    if (error) console.error("[requestPasswordReset]", error.message);
    return { ok: true as const };
  });

const CompleteResetSchema = z.object({
  accessToken: z.string().min(10).max(4096),
  refreshToken: z.string().min(10).max(4096),
  newPassword: z.string().min(1).max(200),
});

/**
 * Complete a password reset using recovery tokens. Enforces strength and
 * password-history reuse checks server-side.
 */
export const completePasswordReset = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CompleteResetSchema.parse(input))
  .handler(async ({ data }) => {
    const { enforceRateLimit, enforceRateLimits } = await import("@/lib/rateLimit.server");
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    try {
      await enforceRateLimits([
        { bucket: "password-reset-complete:ip", max: 20, windowSeconds: 3600 },
      ]);
    } catch {
      setResponseStatus(429);
      return { ok: false as const, reason: "rate_limited" as const, message: RATE_LIMIT_MESSAGE };
    }

    const strength = validateStrength(data.newPassword);
    if (!strength.ok) {
      return { ok: false as const, reason: "weak_password" as const, issues: strength.issues };
    }

    const supabase = makePublishableClient();
    const { error: sessErr } = await supabase.auth.setSession({
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
    });
    if (sessErr) {
      const msg = sessErr.message?.toLowerCase() ?? "";
      const reason = msg.includes("expired") ? ("expired" as const) : ("invalid" as const);
      return { ok: false as const, reason };
    }

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (userId) {
      try {
        await enforceRateLimit({
          bucket: "password-reset-complete:user",
          key: userId,
          max: 5,
          windowSeconds: 900,
        });
      } catch {
        setResponseStatus(429);
        return { ok: false as const, reason: "rate_limited" as const, message: RATE_LIMIT_MESSAGE };
      }
    }

    // Reject reuse of the last 5 passwords
    if (userId) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: reused } = await supabaseAdmin.rpc("check_password_reuse", {
        _user_id: userId,
        _new_password: data.newPassword,
      });
      if (reused === true) {
        return { ok: false as const, reason: "password_reused" as const };
      }
    }

    const { error: updErr } = await supabase.auth.updateUser({ password: data.newPassword });
    if (updErr) {
      const msg = updErr.message?.toLowerCase() ?? "";
      if (msg.includes("expired")) return { ok: false as const, reason: "expired" as const };
      if (msg.includes("invalid") || msg.includes("token")) {
        return { ok: false as const, reason: "invalid" as const };
      }
      return { ok: false as const, reason: "update_failed" as const, message: updErr.message };
    }

    if (userId) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.rpc("record_password_hash", {
        _user_id: userId,
        _new_password: data.newPassword,
      });
    }

    return { ok: true as const };
  });

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(1).max(200),
});

/**
 * Change the signed-in user's password. Enforces strength, reuse checks,
 * re-authentication.
 */
export const changePassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ChangePasswordSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { enforceRateLimits } = await import("@/lib/rateLimit.server");
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    const userId = context.userId;
    try {
      await enforceRateLimits([
        { bucket: "change-password:user", key: userId, max: 5, windowSeconds: 900 },
        { bucket: "change-password:ip", max: 20, windowSeconds: 3600 },
      ]);
    } catch {
      setResponseStatus(429);
      return { ok: false as const, reason: "rate_limited" as const, message: RATE_LIMIT_MESSAGE };
    }

    if (data.currentPassword === data.newPassword) {
      return { ok: false as const, reason: "same_password" as const };
    }

    const strength = validateStrength(data.newPassword);
    if (!strength.ok) {
      return { ok: false as const, reason: "weak_password" as const, issues: strength.issues };
    }

    const { data: userData, error: userErr } = await context.supabase.auth.getUser();
    const email = userData?.user?.email;
    if (userErr || !email) {
      return { ok: false as const, reason: "unauthenticated" as const };
    }

    // Verify current password with a fresh client
    const verifier = makePublishableClient();
    const { error: signInError } = await verifier.auth.signInWithPassword({
      email,
      password: data.currentPassword,
    });
    if (signInError) {
      return { ok: false as const, reason: "wrong_current" as const };
    }
    try {
      await verifier.auth.signOut();
    } catch {
      /* ignore */
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Reject reuse of the last 5 passwords
    const { data: reused } = await supabaseAdmin.rpc("check_password_reuse", {
      _user_id: userId,
      _new_password: data.newPassword,
    });
    if (reused === true) {
      return { ok: false as const, reason: "password_reused" as const };
    }

    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: data.newPassword,
    });
    if (updErr) {
      return { ok: false as const, reason: "update_failed" as const, message: updErr.message };
    }

    await supabaseAdmin.rpc("record_password_hash", {
      _user_id: userId,
      _new_password: data.newPassword,
    });

    return { ok: true as const };
  });

/**
 * Export all data associated with the signed-in user as a JSON snapshot.
 * Runs under RLS so users only see their own rows.
 */
export const exportMyData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { enforceRateLimit } = await import("@/lib/rateLimit.server");
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    const userId = context.userId;
    try {
      await enforceRateLimit({
        bucket: "export-data:user",
        key: userId,
        max: 5,
        windowSeconds: 3600,
      });
    } catch {
      setResponseStatus(429);
      return { ok: false as const, reason: "rate_limited" as const, message: RATE_LIMIT_MESSAGE };
    }

    const supabase = context.supabase;
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    const email = user?.email ?? null;

    // Gather rows the user owns. Some tables key on user_id, some on email —
    // fetch both when useful. Errors on any individual table are ignored so
    // the export still returns whatever we could read.
    async function safeRows(
      table: string,
      column: "user_id" | "email" | "created_by",
      value: string | null,
    ): Promise<any[]> {
      if (!value) return [];
      try {
        const { data, error } = await supabase.from(table as any).select("*").eq(column, value);
        if (error) return [];
        return (data as any[]) || [];
      } catch {
        return [];
      }
    }

    const [
      profiles,
      userRoles,
      donations,
      donationIntents,
      eventRsvps,
      contactMessages,
      volunteerApps,
      coordinatorRegs,
      fundraiserRegs,
      aidRequests,
      partnerInquiries,
    ] = await Promise.all([
      safeRows("profiles", "user_id", userId).then(async (r) =>
        r.length ? r : safeRows("profiles", "user_id", userId),
      ),
      safeRows("user_roles", "user_id", userId),
      safeRows("donations", "email", email),
      safeRows("donation_intents", "email", email),
      safeRows("event_rsvps", "email", email),
      safeRows("contact_messages", "email", email),
      safeRows("volunteer_applications", "email", email),
      safeRows("coordinator_registrations", "email", email),
      safeRows("fundraiser_registrations", "email", email),
      safeRows("aid_requests", "email", email),
      safeRows("partner_inquiries", "email", email),
    ]);

    // profiles is keyed by `id` in most schemas — try that too
    const profileByIdRes = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    return {
      ok: true as const,
      generatedAt: new Date().toISOString(),
      data: {
        account: {
          id: user?.id,
          email,
          createdAt: user?.created_at,
          lastSignInAt: user?.last_sign_in_at,
          metadata: user?.user_metadata ?? null,
        },
        profile: profileByIdRes.data ?? profiles?.[0] ?? null,
        roles: userRoles,
        donations,
        donationIntents,
        eventRsvps,
        contactMessages,
        volunteerApplications: volunteerApps,
        coordinatorRegistrations: coordinatorRegs,
        fundraiserRegistrations: fundraiserRegs,
        aidRequests,
        partnerInquiries,
      },
    };
  });

const RequestDeletionSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  confirmEmail: z.string().trim().toLowerCase().email().max(255),
});

/**
 * Soft-delete the signed-in user's account: schedule permanent deletion in
 * 30 days, ban sign-in in the meantime, and send a confirmation email with a
 * cancel link. Refuses to delete the last admin.
 */
export const requestAccountDeletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RequestDeletionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { enforceRateLimits } = await import("@/lib/rateLimit.server");
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    const userId = context.userId;
    try {
      await enforceRateLimits([
        { bucket: "delete-account:user", key: userId, max: 5, windowSeconds: 900 },
        { bucket: "delete-account:ip", max: 10, windowSeconds: 3600 },
      ]);
    } catch {
      setResponseStatus(429);
      return { ok: false as const, reason: "rate_limited" as const, message: RATE_LIMIT_MESSAGE };
    }

    const { data: userData, error: userErr } = await context.supabase.auth.getUser();
    const email = userData?.user?.email;
    if (userErr || !email) {
      return { ok: false as const, reason: "unauthenticated" as const };
    }

    // Recent-login (sudo mode) check. Refuses the request when the user's
    // last authentication is older than REAUTH_WINDOW_SECONDS — a stolen or
    // long-idle session can't schedule a permanent deletion without
    // re-entering the password via the reauthenticate flow.
    const lastSignIn = userData?.user?.last_sign_in_at;
    const secondsSinceAuth = lastSignIn
      ? Math.max(0, Math.floor((Date.now() - new Date(lastSignIn).getTime()) / 1000))
      : Number.MAX_SAFE_INTEGER;
    if (secondsSinceAuth > REAUTH_WINDOW_SECONDS) {
      return {
        ok: false as const,
        reason: "reauth_required" as const,
        secondsSinceAuth,
      };
    }

    if (data.confirmEmail !== email.toLowerCase()) {
      return { ok: false as const, reason: "wrong_email" as const };
    }


    const verifier = makePublishableClient();
    const { error: signInError } = await verifier.auth.signInWithPassword({
      email,
      password: data.currentPassword,
    });
    if (signInError) {
      return { ok: false as const, reason: "wrong_password" as const };
    }
    try {
      await verifier.auth.signOut();
    } catch {
      /* ignore */
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Prevent deleting the last remaining admin
    const { data: isAdminRow } = await context.supabase
      .from("user_roles")
      .select("user_id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (isAdminRow) {
      const { count, error: countErr } = await supabaseAdmin
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "admin");
      if (countErr) {
        return {
          ok: false as const,
          reason: "check_failed" as const,
          message: "Could not verify account role. Please try again.",
        };
      }
      if ((count ?? 0) <= 1) {
        return { ok: false as const, reason: "last_admin" as const };
      }
    }

    // Check for existing pending request → return its details instead of creating a duplicate
    const { data: existing } = await supabaseAdmin
      .from("account_deletion_requests")
      .select("purge_after, status")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing && existing.status === "pending") {
      return {
        ok: true as const,
        purgeAfter: existing.purge_after,
        alreadyPending: true as const,
      };
    }

    const cancelToken = generateCancelToken();
    const purgeAfterDate = new Date(Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    const purgeAfter = purgeAfterDate.toISOString();

    const { error: insertErr } = await supabaseAdmin
      .from("account_deletion_requests")
      .upsert(
        {
          user_id: userId,
          email,
          purge_after: purgeAfter,
          cancel_token: cancelToken,
          status: "pending",
          requested_at: new Date().toISOString(),
          cancelled_at: null,
          cancel_token_used_at: null,
          purged_at: null,
        },
        { onConflict: "user_id" },
      );
    if (insertErr) {
      console.error("[requestAccountDeletion] insert failed", insertErr);
      return { ok: false as const, reason: "delete_failed" as const, message: insertErr.message };
    }

    // Ban sign-in for the grace period
    const { error: banErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: BAN_DURATION,
    } as any);
    if (banErr) {
      console.error("[requestAccountDeletion] ban failed", banErr);
    }

    // Send confirmation email with cancel link (fire and forget, log failures)
    try {
      const { enqueueTransactionalEmail } = await import("@/lib/email/enqueue.server");
      const purgeAfterLabel = purgeAfterDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      await enqueueTransactionalEmail({
        templateName: "account-deletion-requested",
        recipientEmail: email,
        idempotencyKey: `deletion-req-${userId}-${purgeAfter}`,
        bypassSuppression: true,
        templateData: {
          email,
          purgeAfter: purgeAfterLabel,
          cancelUrl: `${SITE_ORIGIN}/auth/cancel-deletion?token=${cancelToken}`,
        },
      });
    } catch (e) {
      console.error("[requestAccountDeletion] email enqueue error", e);
    }

    return { ok: true as const, purgeAfter, alreadyPending: false as const };
  });

const CancelDeletionSchema = z.object({
  token: z.string().min(20).max(200),
});

/**
 * Cancel a pending account deletion using the single-use token from the
 * confirmation email. Unbans the user so they can sign in again.
 */
export const cancelAccountDeletionByToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CancelDeletionSchema.parse(input))
  .handler(async ({ data }) => {
    const { enforceRateLimit } = await import("@/lib/rateLimit.server");
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    try {
      await enforceRateLimit({
        bucket: "cancel-deletion:ip",
        max: 20,
        windowSeconds: 3600,
      });
    } catch {
      setResponseStatus(429);
      return { ok: false as const, reason: "rate_limited" as const, message: RATE_LIMIT_MESSAGE };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("account_deletion_requests")
      .select("user_id, status, purge_after, cancel_token_used_at")
      .eq("cancel_token", data.token)
      .maybeSingle();

    if (!row) return { ok: false as const, reason: "invalid" as const };
    if (row.status !== "pending") {
      return { ok: false as const, reason: "not_pending" as const, status: row.status };
    }
    if (row.cancel_token_used_at) {
      return { ok: false as const, reason: "already_used" as const };
    }
    if (new Date(row.purge_after) <= new Date()) {
      return { ok: false as const, reason: "expired" as const };
    }

    const { error: updErr } = await supabaseAdmin
      .from("account_deletion_requests")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancel_token_used_at: new Date().toISOString(),
      })
      .eq("user_id", row.user_id)
      .eq("status", "pending");

    if (updErr) {
      return { ok: false as const, reason: "update_failed" as const, message: updErr.message };
    }

    // Lift the ban so the user can sign in again
    try {
      await supabaseAdmin.auth.admin.updateUserById(row.user_id, {
        ban_duration: "none",
      } as any);
    } catch (e) {
      console.error("[cancelAccountDeletion] unban failed", e);
    }

    return { ok: true as const };
  });

/**
 * Read the current pending deletion request for the signed-in user, if any.
 */
export const getAccountDeletionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("account_deletion_requests")
      .select("status, requested_at, purge_after")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!data || data.status !== "pending") {
      return { pending: false as const };
    }
    return {
      pending: true as const,
      requestedAt: data.requested_at,
      purgeAfter: data.purge_after,
    };
  });

const ReauthenticateSchema = z.object({
  password: z.string().min(1).max(200),
});

/**
 * Re-verify the signed-in user's password and mint a fresh session so
 * subsequent sensitive actions (account deletion) pass the recent-login
 * check. Returns the new access/refresh tokens for the client to install
 * via supabase.auth.setSession(). Rate-limited per user + per IP.
 */
export const reauthenticate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ReauthenticateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { enforceRateLimits } = await import("@/lib/rateLimit.server");
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    const userId = context.userId;
    try {
      await enforceRateLimits([
        { bucket: "reauthenticate:user", key: userId, max: 5, windowSeconds: 900 },
        { bucket: "reauthenticate:ip", max: 20, windowSeconds: 3600 },
      ]);
    } catch {
      setResponseStatus(429);
      return { ok: false as const, reason: "rate_limited" as const, message: RATE_LIMIT_MESSAGE };
    }

    const { data: userData, error: userErr } = await context.supabase.auth.getUser();
    const email = userData?.user?.email;
    if (userErr || !email) {
      return { ok: false as const, reason: "unauthenticated" as const };
    }

    const verifier = makePublishableClient();
    const { data: signInData, error: signInError } = await verifier.auth.signInWithPassword({
      email,
      password: data.password,
    });
    if (signInError || !signInData.session) {
      return { ok: false as const, reason: "wrong_password" as const };
    }

    const session = signInData.session;
    // Do not sign the verifier out — that would revoke the refresh token
    // we're about to hand to the client.
    return {
      ok: true as const,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at ?? null,
    };
  });

