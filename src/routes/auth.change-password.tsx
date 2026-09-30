import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PasswordFields, validateNewPassword } from "@/ported/components/PasswordFields";
import { changePassword, RATE_LIMIT_MESSAGE } from "@/lib/auth.functions";

export const Route = createFileRoute("/auth/change-password")({
  head: () => ({
    meta: [
      { title: "Change Password — Manyang Disability Foundation" },
      { name: "description", content: "Update the password on your MDF staff account." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ChangePasswordRoute,
});

type Status = "checking" | "unauthenticated" | "ready" | "success";

function ChangePasswordRoute() {
  const navigate = useNavigate();
  const changePasswordFn = useServerFn(changePassword);
  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email);
        setStatus("ready");
      } else {
        setStatus("unauthenticated");
      }
    });
  }, []);

  const validation = validateNewPassword(password, confirm);
  const samePassword = password.length > 0 && password === currentPassword;
  const canSubmit = validation.ok && currentPassword.length > 0 && !samePassword && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (!validation.ok) {
      setError(validation.reason || "Please fix the errors above.");
      return;
    }
    if (samePassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setSubmitting(true);

    let result: Awaited<ReturnType<typeof changePasswordFn>>;
    try {
      result = await changePasswordFn({
        data: { currentPassword, newPassword: password },
      });
    } catch {
      setError("Could not update password. Please try again.");
      setSubmitting(false);
      return;
    }

    if (!result.ok) {
      if (result.reason === "wrong_current") {
        setError("Current password is incorrect.");
      } else if (result.reason === "same_password") {
        setError("New password must be different from your current password.");
      } else if (result.reason === "weak_password") {
        setError(result.issues?.[0] || "Password does not meet all requirements.");
      } else if (result.reason === "password_reused") {
        setError("You cannot reuse any of your last 5 passwords. Please choose a different one.");
      } else if (result.reason === "rate_limited") {
        setError(result.message || RATE_LIMIT_MESSAGE);
      } else if (result.reason === "unauthenticated") {
        setStatus("unauthenticated");
      } else {
        setError(("message" in result && result.message) || "Could not update password.");
      }
      setSubmitting(false);
      return;
    }

    setStatus("success");
    setSubmitting(false);
    setTimeout(() => navigate({ to: "/admin" }), 2000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <img src="/images/logo.png" alt="MDF Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Change password</h1>
            <p className="text-xs text-slate-500">
              {email ? `Signed in as ${email}` : "Update your account password."}
            </p>
          </div>
        </div>

        {status === "checking" && (
          <div className="flex items-center justify-center py-8 gap-2 text-slate-500 text-xs">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
            <span>Loading…</span>
          </div>
        )}

        {status === "unauthenticated" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>You need to be signed in to change your password.</span>
            </div>
            <Link
              to="/admin"
              className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition-colors"
            >
              Go to sign in
            </Link>
          </div>
        )}

        {status === "success" && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Password updated. Redirecting…</span>
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-10 pr-10 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                  aria-label={showCurrent ? "Hide password" : "Show password"}
                  aria-pressed={showCurrent}
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <PasswordFields
              password={password}
              confirm={confirm}
              onPasswordChange={setPassword}
              onConfirmChange={setConfirm}
            />

            {samePassword && (
              <p className="text-[11px] text-red-600">
                New password must be different from your current password.
              </p>
            )}

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

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Your current password is required to confirm this change.</span>
            </div>
          </form>
        )}

        {(status === "ready" || status === "success") && (
          <div className="mt-6 pt-5 border-t border-red-100">
            <p className="text-[11px] font-bold uppercase tracking-wide text-red-700 mb-1">
              Danger zone
            </p>
            <p className="text-[11px] text-slate-600 mb-2">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <Link
              to="/auth/delete-account"
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
            >
              Delete my account →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
