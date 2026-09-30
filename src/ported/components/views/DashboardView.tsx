import { useNavigate, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  FileText,
  Heart,
  LogOut,
  Edit3,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Download,
  Award,
  Settings as SettingsIcon,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getApplications, getDonations, getRoleLabel, getRoleColor } from "../../utils/auth";

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const onLogout = logout;

  const [activeTab, setActiveTab] = useState<
    "overview" | "applications" | "donations" | "profile" | "settings"
  >("overview");
  const [applications, setApplications] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "", country: "" });

  const defaultSettings = {
    showHeader: true,
    showKpis: true,
    showRecentActivity: true,
    showNextSteps: true,
    density: "comfortable" as "comfortable" | "compact",
    accent: "blue" as "blue" | "emerald" | "amber" | "purple",
    recentActivityLimit: 5,
  };
  type DashSettings = typeof defaultSettings;
  const [settings, setSettings] = useState<DashSettings>(defaultSettings);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mdfaa.dashboard.settings");
      if (raw) setSettings({ ...defaultSettings, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const updateSettings = (patch: Partial<DashSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem("mdfaa.dashboard.settings", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem("mdfaa.dashboard.settings");
    } catch {}
  };

  const accentMap: Record<
    DashSettings["accent"],
    { bg: string; hover: string; text: string; ring: string }
  > = {
    blue: {
      bg: "bg-blue-600",
      hover: "hover:bg-blue-700",
      text: "text-blue-600",
      ring: "ring-blue-500",
    },
    emerald: {
      bg: "bg-emerald-600",
      hover: "hover:bg-emerald-700",
      text: "text-emerald-600",
      ring: "ring-emerald-500",
    },
    amber: {
      bg: "bg-amber-500",
      hover: "hover:bg-amber-600",
      text: "text-amber-600",
      ring: "ring-amber-500",
    },
    purple: {
      bg: "bg-purple-600",
      hover: "hover:bg-purple-700",
      text: "text-purple-600",
      ring: "ring-purple-500",
    },
  };
  const accent = accentMap[settings.accent];
  const pad = settings.density === "compact" ? "p-3 sm:p-4" : "p-6 sm:p-8";
  const gap = settings.density === "compact" ? "gap-2 mb-4" : "gap-4 mb-6";

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName,
        phone: user.phone || "",
        country: user.country || "",
      });
      setApplications(getApplications(user.id));
      // Load real donations from backend for this user
      import("@/integrations/supabase/client").then(({ supabase }) => {
        supabase
          .from("donations")
          .select("*")
          .eq("user_id", user.id)
          .order("received_at", { ascending: false })
          .then(({ data }) => {
            setDonations(
              (data || []).map((d: any) => ({
                id: d.id,
                amount: Number(d.amount_cents) / 100,
                currency: d.currency,
                pillar: d.designation || "General",
                status: d.status,
                date: d.received_at,
                referenceCode: d.receipt_number ? `R-${d.receipt_number}` : d.id.slice(0, 8),
                frequency: d.method === "stripe" ? "monthly" : "one-time",
              })),
            );
          });
      });
    }
  }, [user]);

  if (!user) return null;

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const pendingApps = applications.filter(
    (a) => a.status === "pending" || a.status === "in-review",
  ).length;

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "in-review":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "approved":
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "in-review":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "approved":
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const handleProfileSave = () => {
    updateUser({
      fullName: profileForm.fullName,
      phone: profileForm.phone,
      country: profileForm.country,
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    onLogout();
    navigate({ to: "/" });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Profile header */}
      {settings.showHeader && (
        <div
          className={`bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl ${settings.density === "compact" ? "p-4" : "p-6 sm:p-8"} mb-6 shadow-sm`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-bold">{user.fullName}</h1>
              <div className="flex items-center flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1 text-blue-200">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1 text-blue-200">
                    <Phone className="w-3.5 h-3.5" /> {user.phone}
                  </span>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-2 pt-1">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRoleColor(user.role)}`}
                >
                  {getRoleLabel(user.role)}
                </span>
                {user.isEmailVerified && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
                <span className="text-[11px] text-blue-200 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI tiles */}
      {settings.showKpis && (
        <div className={`grid grid-cols-2 sm:grid-cols-4 ${gap}`}>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Applications</span>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {applications.length}
            </span>
            <span className="text-[10px] text-amber-600 font-semibold">
              {pendingApps} pending review
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Completed</span>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {
                applications.filter((a) => a.status === "completed" || a.status === "approved")
                  .length
              }
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Successful</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-amber-600" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total Giving</span>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 block">${totalDonated}</span>
            <span className="text-[10px] text-slate-500 font-semibold">
              {donations.length} donations
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Impact Score</span>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 block">
              {Math.min(100, applications.length * 10 + donations.length * 5)}
            </span>
            <span className="text-[10px] text-purple-600 font-semibold">Points earned</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-xl flex flex-wrap gap-1 max-w-2xl mb-6">
        {[
          { id: "overview", label: "Overview", icon: User },
          { id: "applications", label: "Applications", icon: FileText },
          { id: "donations", label: "Donations", icon: Heart },
          { id: "profile", label: "Profile", icon: Edit3 },
          { id: "settings", label: "Settings", icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className={`bg-white rounded-2xl border border-slate-200 ${pad} min-h-[300px]`}>
        {activeTab === "overview" && (
          <div className="space-y-6">
            {settings.showRecentActivity && (
              <div>
                <h3 className="font-bold text-base text-slate-900 mb-3">Recent Activity</h3>
                {applications.length === 0 && donations.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-slate-500">
                      No activity yet. Get started by submitting your first request!
                    </p>
                    <button
                      onClick={() => navigate({ to: "/request" })}
                      className={`${accent.bg} ${accent.hover} text-white font-bold text-xs px-5 py-2 rounded-lg`}
                    >
                      Submit Aid Request
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[
                      ...applications.map((a) => ({ ...a, kind: "application" })),
                      ...donations.map((d) => ({ ...d, kind: "donation" })),
                    ]
                      .sort(
                        (a, b) =>
                          new Date(b.submittedAt || b.date).getTime() -
                          new Date(a.submittedAt || a.date).getTime(),
                      )
                      .slice(0, settings.recentActivityLimit)
                      .map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                        >
                          {item.kind === "application" ? (
                            <FileText className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Heart className="w-4 h-4 text-amber-600 fill-amber-600" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-slate-900 block truncate">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {item.kind === "application"
                                ? `Application • ${item.referenceCode}`
                                : `Donation • $${item.amount}`}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-bold border ${item.kind === "application" ? statusColor(item.status) : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}
                          >
                            {(item.status || "completed").toUpperCase()}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {settings.showNextSteps && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 mb-2">Recommended Next Steps</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => navigate({ to: "/request" })}
                    className="p-3 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 text-left"
                  >
                    <span className="text-xs font-bold text-blue-900 block">Request Aid</span>
                    <span className="text-[10px] text-blue-700">
                      Submit a new assistance request
                    </span>
                  </button>
                  <button
                    onClick={() => navigate({ to: "/donate" })}
                    className="p-3 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-100 text-left"
                  >
                    <span className="text-xs font-bold text-amber-900 block">Make a Donation</span>
                    <span className="text-[10px] text-amber-700">
                      Support a humanitarian pillar
                    </span>
                  </button>
                  <button
                    onClick={() => navigate({ to: "/news" })}
                    className="p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-left"
                  >
                    <span className="text-xs font-bold text-emerald-900 block">Latest Events</span>
                    <span className="text-[10px] text-emerald-700">Reserve a volunteer spot</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "applications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">My Applications</h3>
              <button
                onClick={() => navigate({ to: "/request" })}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                New Request
              </button>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-500">No applications submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="border border-slate-200 rounded-xl p-4 hover:shadow-xs transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900">{app.title}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor(app.status)} flex items-center gap-1`}
                          >
                            {statusIcon(app.status)}
                            {app.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{app.summary}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-slate-500">
                          <span className="font-mono">{app.referenceCode}</span>
                          <span>•</span>
                          <span>Submitted {new Date(app.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "donations" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Giving History</h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                Total: ${totalDonated}
              </span>
            </div>

            {donations.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-500">
                  No donations yet. Make your first impact today!
                </p>
                <button
                  onClick={() => navigate({ to: "/donate" })}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-5 py-2 rounded-lg"
                >
                  Donate Now
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {donations.map((don) => (
                  <div
                    key={don.id}
                    className="border border-slate-200 rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Heart className="w-5 h-5 fill-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900">
                        ${don.amount} • {don.frequency}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {don.pillar} • {new Date(don.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {don.referenceCode}
                      </span>
                      <button className="text-[10px] text-blue-600 hover:underline font-bold mt-1 flex items-center gap-1 ml-auto">
                        <Download className="w-3 h-3" /> Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6 max-w-lg">
            <h3 className="font-bold text-base text-slate-900">Account Settings</h3>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleProfileSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Email
                        </span>
                        <span className="text-xs font-medium text-slate-900">{user.email}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">Verified</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Phone
                      </span>
                      <span className="text-xs font-medium text-slate-900">
                        {user.phone || "Not provided"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Country
                      </span>
                      <span className="text-xs font-medium text-slate-900">
                        {user.country || "Not provided"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Role Clearance
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${getRoleColor(user.role)}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-8 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" /> Dashboard Settings
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Customize what shows on your dashboard. Saved to this device.
                </p>
              </div>
              <button
                onClick={resetSettings}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            <section className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Sections</h4>
              {[
                {
                  key: "showHeader",
                  label: "Profile header",
                  desc: "Show the gradient banner with your name and role.",
                },
                {
                  key: "showKpis",
                  label: "KPI tiles",
                  desc: "Applications, completed, total giving, impact score.",
                },
                {
                  key: "showRecentActivity",
                  label: "Recent activity",
                  desc: "Latest applications and donations on Overview.",
                },
                {
                  key: "showNextSteps",
                  label: "Recommended next steps",
                  desc: "Suggested actions on Overview.",
                },
              ].map((item) => {
                const checked = settings[item.key as keyof DashSettings] as boolean;
                return (
                  <label
                    key={item.key}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block">{item.label}</span>
                      <span className="text-[11px] text-slate-500">{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      className={`w-4 h-4 ${accent.text} rounded border-slate-300 focus:ring-2 focus:${accent.ring}`}
                      checked={checked}
                      onChange={(e) =>
                        updateSettings({ [item.key]: e.target.checked } as Partial<DashSettings>)
                      }
                    />
                  </label>
                );
              })}
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Density</h4>
              <div className="grid grid-cols-2 gap-2">
                {(["comfortable", "compact"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => updateSettings({ density: d })}
                    className={`p-3 rounded-lg border text-xs font-bold capitalize ${
                      settings.density === d
                        ? `${accent.bg} text-white border-transparent`
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Accent color
              </h4>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(accentMap) as Array<DashSettings["accent"]>).map((c) => (
                  <button
                    key={c}
                    onClick={() => updateSettings({ accent: c })}
                    aria-label={c}
                    className={`w-8 h-8 rounded-full ${accentMap[c].bg} ring-offset-2 transition ${
                      settings.accent === c
                        ? `ring-2 ${accentMap[c].ring}`
                        : "ring-0 opacity-80 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Recent activity rows
                </h4>
                <span className="text-xs font-bold text-slate-900">
                  {settings.recentActivityLimit}
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={15}
                step={1}
                value={settings.recentActivityLimit}
                onChange={(e) => updateSettings({ recentActivityLimit: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>3</span>
                <span>15</span>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
