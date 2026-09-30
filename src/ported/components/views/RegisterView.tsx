import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  UserPlus,
  ArrowRight,
  Check,
  X,
  User,
  Heart,
  HandHeart,
  Accessibility,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import type { UserRole } from "../../types/auth";
import { getPasswordStrength } from "../../utils/auth";

export const RegisterView: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "member" as UserRole,
    phone: "",
    country: "",
    acceptTerms: false,
    acceptPrivacy: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const passwordStrength = getPasswordStrength(form.password);
  const passwordsMatch =
    form.password && form.confirmPassword && form.password === form.confirmPassword;

  const roles: Array<{ id: UserRole; label: string; description: string; icon: typeof User }> = [
    {
      id: "member",
      label: "General Member",
      description: "Stay updated and support our cause",
      icon: User,
    },
    { id: "donor", label: "Donor", description: "Track your giving and receipts", icon: Heart },
    {
      id: "volunteer",
      label: "Volunteer",
      description: "Join our outreach missions",
      icon: HandHeart,
    },
    {
      id: "beneficiary",
      label: "Beneficiary",
      description: "Request mobility and medical aid",
      icon: Accessibility,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.acceptTerms) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }

    setIsProcessing(true);
    (async () => {
      const result = await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      if (result.success) {
        navigate({ to: "/dashboard" });
      } else {
        setError(result.error || "Registration failed.");
      }
      setIsProcessing(false);
    })();
  };

  const strengthColors: Record<string, string> = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider inline-block">
            Join Our Community
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Create Your MDF Account
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Register in under 2 minutes to track your applications, manage donations, and join our
            global network of advocates.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-start gap-2">
                <X className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Role selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                I am joining as...
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = form.role === role.id;
                  return (
                    <button
                      type="button"
                      key={role.id}
                      onClick={() => setForm({ ...form, role: role.id })}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{role.label}</span>
                        <span className="text-[10px] text-slate-500">{role.description}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personal info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Enter your legal name"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Country (Optional)
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="e.g. Cameroon"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Password with strength indicator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 pr-10 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                {form.password && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            i <= passwordStrength.score
                              ? strengthColors[passwordStrength.color]
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[10px] font-medium text-${passwordStrength.color}-600`}>
                      Strength: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className={`w-full bg-slate-50 border rounded-lg py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 ${
                      form.confirmPassword
                        ? passwordsMatch
                          ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-100"
                          : "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  />
                  {form.confirmPassword && (
                    <span className="absolute right-3 top-2.5">
                      {passwordsMatch ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                    </span>
                  )}
                </div>
                {form.confirmPassword && !passwordsMatch && (
                  <p className="text-[10px] text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            <div>
              <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={form.acceptTerms}
                  onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
                />
                <span>
                  I accept the{" "}
                  <button type="button" className="text-blue-600 hover:underline font-medium">
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button type="button" className="text-blue-600 hover:underline font-medium">
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create My Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};
