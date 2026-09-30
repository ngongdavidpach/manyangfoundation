import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle2, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PasswordFields, validateNewPassword } from "@/ported/components/PasswordFields";
import {
  requestPasswordReset,
  completePasswordReset,
  RATE_LIMIT_MESSAGE,
} from "@/lib/auth.functions";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Manyang Disability Foundation" },
      { name: "description", content: "Choose a new password for your MDF staff account." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ResetPasswordRoute,
});

type Status = "checking" | "ready" | "expired" | "invalid" | "success";

const COOLDOWN_KEY = "mdf.recovery.resend.until";
const COOLDOWN_MS = 60_000;

function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}${local.length > 1 ? "***" : ""}@${domain}`;
}

function parseHashError(): { code?: string; description?: string } | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  if (!params.get("error") && !params.get("error_code")) return null;
  return {
    code: params.get("error_code") || params.get("error") || undefined,
    description: params.get("error_description") || undefined,
  };
}

function ResetPasswordRoute() {
  const navigate = useNavigate();
  const requestReset = useServerFn(requestPasswordReset);
  const completeReset = useServerFn(completePasswordReset);
  const [status, setStatus] = useState<Status>("checking");
  const [tokenErrorDescription, setTokenErrorDescription] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Resend UI state
  const [manualEmail, setManualEmail] = useState("");
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resendErr, setResendErr] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(COOLDOWN_KEY);
    if (!raw) return null;
    const ts = Number(raw);
    return Number.isFinite(ts) && ts > Date.now() ? ts : null;
  });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!cooldownUntil) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const cooldownSecs = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0;
  const onCooldown = cooldownSecs > 0;

  useEffect(() => {
    // 1) Check the URL hash for Supabase-reported errors first
    const hashErr = parseHashError();
    if (hashErr) {
      setTokenErrorDescription(hashErr.description || null);
      if (hashErr.code === "otp_expired") {
        setStatus("expired");
      } else {
        setStatus("invalid");
      }
      return;
    }

    let resolved = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        resolved = true;
        setSessionEmail(session?.user?.email ?? null);
        setStatus("ready");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        resolved = true;
        setSessionEmail(data.session.user?.email ?? null);
        setStatus("ready");
      }
    });

    const timeout = setTimeout(() => {
      if (!resolved) setStatus((s) => (s === "checking" ? "invalid" : s));
    }, 2500);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const validation = validateNewPassword(password, confirm);
  const canSubmit = validation.ok && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validation.ok) {
      setError(validation.reason || "Please fix the errors above.");
      return;
    }
    setSubmitting(true);

    // Grab the current recovery session so the server can perform the update
    const { data: sessData } = await supabase.auth.getSession();
    const accessToken = sessData.session?.access_token;
    const refreshToken = sessData.session?.refresh_token;
    if (!accessToken || !refreshToken) {
      setStatus("invalid");
      setSubmitting(false);
      return;
    }

    let result: Awaited<ReturnType<typeof completeReset>>;
    try {
      result = await completeReset({ data: { accessToken, refreshToken, newPassword: password } });
    } catch {
      setError("Could not update password. Please try again.");
      setSubmitting(false);
      return;
    }

    if (!result.ok) {
      if (result.reason === "expired") {
        setStatus("expired");
      } else if (result.reason === "invalid") {
        setStatus("invalid");
      } else if (result.reason === "rate_limited") {
        setError(result.message || RATE_LIMIT_MESSAGE);
      } else if (result.reason === "weak_password") {
        setError(result.issues?.[0] || "Password does not meet all requirements.");
      } else if (result.reason === "password_reused") {
        setError("You cannot reuse any of your last 5 passwords. Please choose a different one.");
      } else {
        setError(("message" in result && result.message) || "Could not update password.");
      }
      setSubmitting(false);
      return;
    }

    // Revoke refresh tokens on ALL devices, not just this tab
    await supabase.auth.signOut({ scope: "global" });
    setStatus("success");
    setSubmitting(false);
    setTimeout(() => navigate({ to: "/admin" }), 2000);
  };

  const startCooldown = () => {
    const until = Date.now() + COOLDOWN_MS;
    setCooldownUntil(until);
    setNow(Date.now());
    try {
      window.sessionStorage.setItem(COOLDOWN_KEY, String(until));
    } catch {
      /* ignore */
    }
  };

  const handleResend = async (rawEmail: string) => {
    setResendErr(null);
    setResendMsg(null);
    const email = rawEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setResendErr("Please enter a valid email address.");
      return;
    }
    if (onCooldown) return;
    setResending(true);
    try {
      const result = await requestReset({ data: { email, origin: window.location.origin } });
      if (!result.ok && result.reason === "rate_limited") {
        setResendErr(result.message || RATE_LIMIT_MESSAGE);
      } else {
        setResendMsg(`A new reset link has been sent to ${redactEmail(email)}.`);
        startCooldown();
      }
    } catch {
      setResendErr("Could not send a new reset link. Please try again in a moment.");
    } finally {
      setResending(false);
    }
  };

  const invalidCopy = useMemo(() => {
    if (status === "expired") {
      return "This reset link has expired. Reset links are valid for a short time and can only be used once.";
    }
    if (tokenErrorDescription) return tokenErrorDescription;
    return "This reset link is invalid or has already been used.";
  }, [status, tokenErrorDescription]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <img src="/images/logo.png" alt="MDF Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Reset your password</h1>
            <p className="text-xs text-slate-500">Choose a strong new password.</p>
          </div>
        </div>

        {status === "checking" && (
          <div className="flex items-center justify-center py-8 gap-2 text-slate-500 text-xs">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
            <span>Verifying reset link…</span>
          </div>
        )}

        {(status === "invalid" || status === "expired") && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{invalidCopy}</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Send a new reset link to:
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {resendErr && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{resendErr}</span>
                </div>
              )}
              {resendMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-2.5 rounded-lg flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{resendMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleResend(manualEmail)}
                disabled={resending || onCooldown}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                {resending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : onCooldown ? (
                  <span>Resend in {cooldownSecs}s</span>
                ) : (
                  <>
                    <RotateCw className="w-4 h-4" />
                    <span>Send new link</span>
                  </>
                )}
              </button>
            </div>

            <Link
              to="/admin"
              className="block text-center text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Back to sign in
            </Link>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Password updated. You've been signed out of all devices — please sign in with your
                new password.
              </span>
            </div>
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <PasswordFields
              password={password}
              confirm={confirm}
              onPasswordChange={setPassword}
              onConfirmChange={setConfirm}
            />

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Update password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>You'll be signed out of all devices after updating.</span>
              </div>

              {resendMsg && (
                <div className="text-[11px] text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{resendMsg}</span>
                </div>
              )}
              {resendErr && (
                <div className="text-[11px] text-red-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{resendErr}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => sessionEmail && handleResend(sessionEmail)}
                disabled={!sessionEmail || resending || onCooldown}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold disabled:text-slate-400 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" />
                {onCooldown
                  ? `Resend link in ${cooldownSecs}s`
                  : resending
                    ? "Sending new link…"
                    : sessionEmail
                      ? `Resend link to ${redactEmail(sessionEmail)}`
                      : "Resend link"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
