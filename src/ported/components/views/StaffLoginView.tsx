import React, { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const StaffLoginView: React.FC = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };
  const { login, hasAdminAccess } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", rememberMe: true });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setIsProcessing(true);
    (async () => {
      const result = await login(form.email, form.password);
      if (result.success) {
        const dest = search.redirect || (hasAdminAccess() ? "/admin" : "/dashboard");
        navigate({ to: dest });
      } else {
        setError(result.error || "Authentication failed.");
      }
      setIsProcessing(false);
    })();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <img src="/images/logo.png" alt="MDF Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              Staff Sign In
            </h1>
            <p className="text-xs text-slate-500">Restricted area · Authorized users only</p>
          </div>
        </div>

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
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-10 pr-10 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember me for 30 days</span>
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>This page is not linked from the public site.</span>
          </div>
        </form>
      </div>
    </div>
  );
};
