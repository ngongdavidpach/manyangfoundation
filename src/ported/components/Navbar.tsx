import React, { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { NAV_ITEM_DEFS, resolveNavOrder } from "../lib/navItems";
import {
  HeartHandshake,
  Menu,
  X,
  Heart,
  HelpCircle,
  Users,
  Layers,
  Newspaper,
  Home,
  Image as GalleryIcon,
  Calendar,
  Mail,
  LayoutDashboard,
} from "lucide-react";
import { useFoundationInfo } from "../hooks/useFoundationInfo";
import { useAuth } from "../contexts/AuthContext";
import { getRoleLabel, getRoleColor } from "../utils/auth";

const PATH_FOR: Record<string, string> = {
  home: "/",
  about: "/about",
  programs: "/programs",
  gallery: "/gallery",
  request: "/request",
  news: "/news",
  "get-involved": "/get-involved",
  events: "/events",
  contact: "/contact",
};

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { content: foundationInfo } = useFoundationInfo();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [navConfig, setNavConfig] = useState<{ order: string[]; flags: Record<string, boolean> }>({
    order: NAV_ITEM_DEFS.map((i) => i.id),
    flags: {},
  });
  const [showDonateButton, setShowDonateButton] = useState(true);

  useEffect(() => {
    supabase
      .from("page_settings")
      .select("content")
      .eq("page_key", "navigation")
      .maybeSingle()
      .then(({ data }) => {
        if (!data?.content) return;
        const c = data.content as any;
        setNavConfig((prev) => ({ order: resolveNavOrder(c.order) || prev.order, flags: c }));
      });
    supabase
      .from("page_settings")
      .select("content")
      .eq("page_key", "donate")
      .maybeSingle()
      .then(({ data }) => {
        const c = data?.content as any;
        if (c && c.showDonateButton === false) setShowDonateButton(false);
      });
  }, []);

  const iconMap: Record<string, any> = {
    home: Home,
    about: Users,
    programs: Layers,
    gallery: GalleryIcon,
    request: HelpCircle,
    news: Newspaper,
    events: Calendar,
    "get-involved": HeartHandshake,
    contact: Mail,
  };
  const navLinks = navConfig.order
    .map((id) => NAV_ITEM_DEFS.find((d) => d.id === id))
    .filter((d): d is (typeof NAV_ITEM_DEFS)[number] => !!d && navConfig.flags[d.flag] !== false)
    .map((d) => ({
      id: d.id,
      label: d.label,
      icon: iconMap[d.id] || Home,
      to: PATH_FOR[d.id] || "/",
    }));

  const handleNavClick = (link: { id: string; to: string }) => {
    navigate({ to: link.to });
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Sign-out is intentionally available only from the user dashboard, not the navbar dropdown.
  void logout;

  const isLinkActive = (link: { id: string; to: string }) => {
    if (link.id === "news") return pathname === "/news" || pathname.startsWith("/news/");
    if (link.to === "/") return pathname === "/";
    return pathname === link.to || pathname.startsWith(link.to + "/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top micro-bar */}
      <div className="bg-blue-900 text-white text-xs py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4" />
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            to="/"
            className="flex items-center gap-3 group text-left focus:outline-hidden"
            aria-label="Manyang Disability Foundation Home"
          >
            <img
              src="/images/logo.png"
              alt="Manyang Disability Foundation Official Logo"
              className="w-14 h-14 object-contain group-hover:scale-105 transition-transform drop-shadow-sm"
            />
          </Link>


          <div className="hidden sm:flex items-center gap-2">
            {showDonateButton && (
              <Link
                to="/donate"
                onClick={() => {
                  setUserMenuOpen(false);
                  setMobileMenuOpen(false);
                }}
                className="relative group overflow-hidden rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 text-sm shadow-sm transition-all hover:shadow-md flex items-center gap-2"
              >
                <Heart className="w-4 h-4 fill-slate-950 text-slate-950 animate-pulse" />
                <span>Donate Now</span>
              </Link>
            )}

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white flex items-center justify-center text-xs font-bold">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="text-left hidden md:block">
                    <span className="block text-xs font-bold text-slate-900 leading-none">
                      {user.fullName.split(" ")[0]}
                    </span>
                    <span
                      className={`block text-[9px] font-bold mt-0.5 px-1.5 py-0.5 rounded ${getRoleColor(user.role)} inline-block`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 z-50 animate-fade-in overflow-hidden">
                      <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => {
                            navigate({ to: "/dashboard" });
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> My Dashboard
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              navigate({ to: "/admin" });
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : null}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>



          <div className="flex items-center gap-2 sm:hidden">
            {showDonateButton && (
              <Link
                to="/donate"
                onClick={() => {
                  setUserMenuOpen(false);
                  setMobileMenuOpen(false);
                }}
                className="bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-md text-xs flex items-center gap-1"
              >
                <Heart className="w-3 h-3 fill-slate-950" />
                Donate
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white animate-fade-in">

          <div className="px-4 pt-2 pb-6 space-y-1">
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold">
                  {user.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getRoleColor(user.role)}`}
                >
                  {getRoleLabel(user.role)}
                </span>
              </div>
            )}

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isLinkActive(link);
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}

            <div className="pt-3 border-t border-slate-100 space-y-1.5 mt-3">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => {
                      navigate({ to: "/dashboard" });
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-semibold"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>My Dashboard</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        navigate({ to: "/admin" });
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-700 hover:bg-red-50 font-semibold"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
