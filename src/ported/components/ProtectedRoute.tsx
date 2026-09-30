import React, { useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";
import type { UserRole } from "../types/auth";
import { Lock, AlertTriangle, LogIn, Mail, Eye, EyeOff } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-500">Restoring secure session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <InlineSignInPrompt />
      </div>
    );
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-red-200 p-8 sm:p-12 text-center max-w-md shadow-xs mx-auto">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Hello {user?.fullName?.split(" ")[0] || "friend"}, you are signed in, but your current
            role does not grant permission to view this section.
          </p>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Required clearance:{" "}
              <strong className="text-slate-700">{requiredRoles.join(" or ")}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const InlineSignInPrompt: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const currentPath = useRouterState({ select: (s) => s.location.href });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setIsProcessing(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || "Authentication failed. Please try again.");
      }
      // On success, AuthContext flips isAuthenticated and the parent
      // ProtectedRoute re-renders the requested page in place.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error signing in.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-6 sm:p-8 shadow-xs space-y-5">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Sign in to continue</h3>
        <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
          This area is for authorized users. Sign in below to access the page you requested.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2"
          >
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
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isProcessing}
              placeholder="you@example.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-10 pr-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isProcessing}
              placeholder="Enter your password"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-10 pr-10 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            navigate({ to: "/admin", search: { redirect: currentPath } as never })
          }
          disabled={isProcessing}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-lg text-xs transition-colors disabled:opacity-60"
        >
          Create an account
        </button>
      </form>
    </div>
  );
};

// Preserved for backwards compatibility with any external imports.
export const AuthenticationGate: React.FC<{
  title?: string;
  description?: string;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}> = () => <InlineSignInPrompt />;
