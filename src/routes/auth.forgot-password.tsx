import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { requestPasswordReset, RATE_LIMIT_MESSAGE } from "@/lib/auth.functions";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Manyang Disability Foundation" },
      { name: "description", content: "Request a password reset link for your MDF staff account." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ForgotPasswordRoute,
});

function ForgotPasswordRoute() {
  const requestReset = useServerFn(requestPasswordReset);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await requestReset({
        data: { email: trimmed, origin: window.location.origin },
      });
      if (!result.ok && result.reason === "rate_limited") {
        setError(result.message || RATE_LIMIT_MESSAGE);
      } else {
        setSent(true);
      }
    } catch {
      // Show generic success anyway to avoid enumeration
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <img src="/images/logo.png" alt="MDF Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Forgot password?</h1>
            <p className="text-xs text-slate-500">We'll email you a link to reset it.</p>
          </div>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                If an account exists for that address, we've sent a password reset link. Check your
                inbox (and spam folder).
              </span>
            </div>
            <Link
              to="/admin"
              className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send reset link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Secure reset flow
              </span>
              <Link to="/admin" className="text-blue-600 hover:text-blue-700 font-semibold">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
