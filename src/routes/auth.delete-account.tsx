import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import {
  Lock,
  Eye,
  EyeOff,
  Mail,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  Download,
  CalendarClock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  requestAccountDeletion,
  exportMyData,
  reauthenticate,
  RATE_LIMIT_MESSAGE,
} from "@/lib/auth.functions";

// Must match REAUTH_WINDOW_SECONDS in src/lib/auth.functions.ts
const REAUTH_WINDOW_SECONDS = 300;


export const Route = createFileRoute("/auth/delete-account")({
  head: () => ({
    meta: [
      { title: "Delete Account — Manyang Disability Foundation" },
      { name: "description", content: "Permanently delete your MDF staff account." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DeleteAccountRoute,
});

type Status = "checking" | "unauthenticated" | "ready" | "success";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function DeleteAccountRoute() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const requestDeletionFn = useServerFn(requestAccountDeletion);
  const exportFn = useServerFn(exportMyData);
  const reauthenticateFn = useServerFn(reauthenticate);

  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [purgeAfter, setPurgeAfter] = useState<string | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exportErr, setExportErr] = useState<string | null>(null);

  // Re-authentication (recent-login / sudo mode) state
  const [needsReauth, setNeedsReauth] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [showReauthPassword, setShowReauthPassword] = useState(false);
  const [reauthing, setReauthing] = useState(false);
  const [reauthError, setReauthError] = useState("");
  const [reauthMsg, setReauthMsg] = useState("");

  const computeNeedsReauth = (lastSignInAt: string | null | undefined) => {
    if (!lastSignInAt) return true;
    const seconds = Math.floor((Date.now() - new Date(lastSignInAt).getTime()) / 1000);
    return seconds > REAUTH_WINDOW_SECONDS;
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email);
        setNeedsReauth(computeNeedsReauth(data.user.last_sign_in_at));
        setStatus("ready");
      } else {
        setStatus("unauthenticated");
      }
    });
  }, []);



  const emailMatches =
    confirmEmail.trim().length > 0 &&
    confirmEmail.trim().toLowerCase() === email.toLowerCase();
  const canSubmit =
    emailMatches &&
    currentPassword.length > 0 &&
    acknowledged &&
    !submitting &&
    !needsReauth;

  const handleReauth = async (e: React.FormEvent) => {
    e.preventDefault();
    setReauthError("");
    setReauthMsg("");
    if (!reauthPassword) return;
    setReauthing(true);
    try {
      const result = await reauthenticateFn({ data: { password: reauthPassword } });
      if (!result.ok) {
        if (result.reason === "wrong_password") {
          setReauthError("Password is incorrect.");
        } else if (result.reason === "rate_limited") {
          setReauthError(result.message || RATE_LIMIT_MESSAGE);
        } else if (result.reason === "unauthenticated") {
          setStatus("unauthenticated");
        } else {
          setReauthError("Could not verify your identity. Please try again.");
        }
        return;
      }
      const { error: setErr } = await supabase.auth.setSession({
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
      });
      if (setErr) {
        setReauthError("Could not refresh your session. Please sign in again.");
        return;
      }
      setNeedsReauth(false);
      setReauthPassword("");
      setReauthMsg("Identity confirmed. You can now schedule your deletion.");
    } catch {
      setReauthError("Could not verify your identity. Please try again.");
    } finally {
      setReauthing(false);
    }
  };


  const handleExport = async () => {
    setExportErr(null);
    setExportMsg(null);
    setExporting(true);
    try {
      const result = await exportFn({});
      if (!result.ok) {
        setExportErr(
          result.reason === "rate_limited"
            ? result.message || RATE_LIMIT_MESSAGE
            : "Could not export your data. Please try again.",
        );
        return;
      }
      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      a.download = `mdf-account-data-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportMsg("Your data snapshot has been downloaded.");
    } catch {
      setExportErr("Could not export your data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;

    setSubmitting(true);
    let result: Awaited<ReturnType<typeof requestDeletionFn>>;
    try {
      result = await requestDeletionFn({
        data: {
          currentPassword,
          confirmEmail: confirmEmail.trim().toLowerCase(),
        },
      });
    } catch {
      setError("Could not schedule the deletion. Please try again.");
      setSubmitting(false);
      return;
    }

    if (!result.ok) {
      switch (result.reason) {
        case "reauth_required":
          setNeedsReauth(true);
          setError(
            "For your security, please re-enter your password to confirm it's you before deleting your account.",
          );
          break;
        case "wrong_password":
          setError("Current password is incorrect.");
          break;
        case "wrong_email":
          setError("The email you typed doesn't match your account email.");
          break;
        case "rate_limited":
          setError(result.message || RATE_LIMIT_MESSAGE);
          break;
        case "last_admin":
          setError(
            "You are the last administrator on this account. Assign another admin before deleting your account.",
          );
          break;
        case "unauthenticated":
          setStatus("unauthenticated");
          break;
        default:
          setError(
            ("message" in result && result.message) || "Could not delete the account.",
          );
      }
      setSubmitting(false);
      return;
    }


    setPurgeAfter(result.purgeAfter);
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch {
      /* ignore */
    }
    setStatus("success");
    setSubmitting(false);
    setTimeout(() => navigate({ to: "/", replace: true }), 8000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-red-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Delete account</h1>
            <p className="text-xs text-slate-500">
              {email ? `Signed in as ${email}` : "Permanently remove your account."}
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
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>You need to be signed in to delete your account.</span>
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
          <div className="space-y-4">
            <div
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-start gap-2"
              role="status"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold mb-0.5">Deletion scheduled.</p>
                <p>
                  Your account will be permanently deleted on{" "}
                  <strong>{purgeAfter ? formatDate(purgeAfter) : "a later date"}</strong>.
                  Sign-in is disabled until then.
                </p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 text-blue-800 text-[11px] p-3 rounded-lg flex items-start gap-2">
              <CalendarClock className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                We've emailed you a cancellation link — use it any time before the purge date
                to restore your account.
              </span>
            </div>
          </div>
        )}

        {status === "ready" && (
          <div className="space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                Download your data first
              </p>
              <p className="text-[11px] text-slate-600">
                Save a JSON snapshot of your profile, roles, donations, event RSVPs and any
                registrations linked to your email. This is your only copy.
              </p>
              {exportErr && (
                <div className="text-[11px] text-red-700 flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 mt-0.5" aria-hidden="true" />
                  <span>{exportErr}</span>
                </div>
              )}
              {exportMsg && (
                <div className="text-[11px] text-emerald-700 flex items-start gap-1">
                  <CheckCircle2 className="w-3 h-3 mt-0.5" aria-hidden="true" />
                  <span>{exportMsg}</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="w-full bg-white hover:bg-slate-100 border border-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-800 font-semibold py-2 rounded-md text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {exporting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                    <span>Preparing…</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Download my data (JSON)</span>
                  </>
                )}
              </button>
            </div>

            {needsReauth && (
              <section
                role="region"
                aria-labelledby="reauth-heading"
                className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2"
              >
                <p
                  id="reauth-heading"
                  className="text-xs font-bold text-amber-900 flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                  Confirm it's you
                </p>
                <p className="text-[11px] text-amber-800">
                  For your security, please re-enter your password. Account deletion
                  requires a recent sign-in (within the last 5 minutes).
                </p>
                <form onSubmit={handleReauth} className="space-y-2" noValidate>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-2.5 text-slate-500"
                      aria-hidden="true"
                    >
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="reauth-password"
                      type={showReauthPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={reauthPassword}
                      onChange={(e) => setReauthPassword(e.target.value)}
                      placeholder="Enter your password"
                      aria-label="Password to re-verify your identity"
                      className="w-full bg-white border border-amber-300 rounded-lg py-2.5 pl-10 pr-10 text-xs text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowReauthPassword((v) => !v)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                      aria-label={showReauthPassword ? "Hide password" : "Show password"}
                      aria-pressed={showReauthPassword}
                    >
                      {showReauthPassword ? (
                        <EyeOff className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Eye className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <div aria-live="polite" className="min-h-[1rem]">
                    {reauthError && (
                      <p className="text-[11px] text-red-700 flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 mt-0.5" aria-hidden="true" />
                        <span>{reauthError}</span>
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={reauthing || reauthPassword.length === 0}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 disabled:cursor-not-allowed text-white font-bold py-2 rounded-md text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {reauthing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Verifying…</span>
                      </>
                    ) : (
                      <span>Verify identity</span>
                    )}
                  </button>
                </form>
              </section>
            )}
            {!needsReauth && reauthMsg && (
              <div
                aria-live="polite"
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-2.5 rounded-lg flex items-start gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5" aria-hidden="true" />
                <span>{reauthMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              <div
                className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-lg space-y-1"
                role="alert"
              >
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  30-day grace period, then permanent.
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-red-700">
                  <li>Sign-in is disabled immediately for 30 days.</li>
                  <li>You'll receive an email with a cancel link.</li>
                  <li>After 30 days, your account and all data are permanently removed.</li>
                </ul>
              </div>

              {error && (
                <div
                  className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2"
                  role="alert"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="confirm-email"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Type your email to confirm
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500" aria-hidden="true">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="confirm-email"
                    type="email"
                    required
                    autoComplete="off"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder={email}
                    aria-invalid={
                      confirmEmail.length > 0 && !emailMatches ? true : undefined
                    }
                    className={`w-full bg-slate-50 border rounded-lg py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 ${
                      confirmEmail.length > 0 && !emailMatches
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : emailMatches
                          ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100"
                          : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="current-password"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Current password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500" aria-hidden="true">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-10 pr-10 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>
                  I understand my account will be deleted after a 30-day grace period and this
                  cannot be reversed once the grace period ends.
                </span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Scheduling…</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    <span>Schedule account deletion</span>
                  </>
                )}
              </button>
              {needsReauth && (
                <p className="text-[11px] text-amber-700 text-center">
                  Please re-verify your identity above to continue.
                </p>
              )}


              <Link
                to="/auth/change-password"
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="w-3 h-3" aria-hidden="true" />
                Back to account settings
              </Link>
              <p className="text-[11px] text-slate-500">
                See our{" "}
                <Link to="/privacy" className="underline hover:text-slate-700">
                  Privacy Policy
                </Link>{" "}
                for how we handle your data.
              </p>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}
